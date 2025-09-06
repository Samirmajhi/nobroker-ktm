const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireRole, requireKYC } = require('../middleware/auth');
const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT user_id, full_name, email, phone, role, kyc_status, 
              profile_picture_url, email_verified, phone_verified, created_at
       FROM users WHERE user_id = $1`,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone, profilePictureUrl } = req.body;

    const result = await query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name), 
           phone = COALESCE($2, phone),
           profile_picture_url = COALESCE($3, profile_picture_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4
       RETURNING user_id, full_name, email, phone, role, kyc_status, profile_picture_url`,
      [fullName, phone, profilePictureUrl, req.user.user_id]
    );

    res.json({ 
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user preferences (for tenants)
router.get('/preferences', authenticateToken, requireRole('tenant'), async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [req.user.user_id]
    );

    res.json({ 
      preferences: result.rows[0] || null 
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, requireRole('tenant'), async (req, res) => {
  try {
    const { 
      preferredLocations, 
      minPrice, 
      maxPrice, 
      minBedrooms, 
      maxBedrooms, 
      preferredAmenities 
    } = req.body;

    // Check if preferences exist
    const existingPrefs = await query(
      'SELECT preference_id FROM user_preferences WHERE user_id = $1',
      [req.user.user_id]
    );

    if (existingPrefs.rows.length > 0) {
      // Update existing preferences
      await query(
        `UPDATE user_preferences 
         SET preferred_locations = $1, min_price = $2, max_price = $3,
             min_bedrooms = $4, max_bedrooms = $5, preferred_amenities = $6,
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $7`,
        [preferredLocations, minPrice, maxPrice, minBedrooms, maxBedrooms, preferredAmenities, req.user.user_id]
      );
    } else {
      // Create new preferences
      await query(
        `INSERT INTO user_preferences 
         (user_id, preferred_locations, min_price, max_price, min_bedrooms, max_bedrooms, preferred_amenities)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [req.user.user_id, preferredLocations, minPrice, maxPrice, minBedrooms, maxBedrooms, preferredAmenities]
      );
    }

    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get KYC documents
router.get('/kyc-documents', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM kyc_documents WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.user_id]
    );

    res.json({ documents: result.rows });
  } catch (error) {
    console.error('Get KYC documents error:', error);
    res.status(500).json({ error: 'Failed to fetch KYC documents' });
  }
});

// Upload KYC document
router.post('/kyc-documents', authenticateToken, async (req, res) => {
  try {
    const { documentType, documentUrl } = req.body;

    if (!documentType || !documentUrl) {
      return res.status(400).json({ error: 'Document type and URL are required' });
    }

    const result = await query(
      `INSERT INTO kyc_documents (user_id, document_type, document_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.user_id, documentType, documentUrl]
    );

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Upload KYC document error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Admin: Get all users
router.get('/', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, kycStatus } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }

    if (kycStatus) {
      paramCount++;
      whereClause += ` AND kyc_status = $${paramCount}`;
      params.push(kycStatus);
    }

    const result = await query(
      `SELECT user_id, full_name, email, phone, role, kyc_status, 
              is_active, created_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM users ${whereClause}`,
      params
    );

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Admin: Update user KYC status
router.put('/:userId/kyc-status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { kycStatus, rejectionReason } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(kycStatus)) {
      return res.status(400).json({ error: 'Invalid KYC status' });
    }

    const result = await query(
      `UPDATE users 
       SET kyc_status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING user_id, full_name, email, role, kyc_status`,
      [kycStatus, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If KYC is verified, check if owner should get SafeRent badge
    if (kycStatus === 'verified' && result.rows[0].role === 'owner') {
      await query(
        `UPDATE listings 
         SET safe_rent_verified = true, updated_at = CURRENT_TIMESTAMP
         WHERE owner_id = $1`,
        [userId]
      );
    }

    res.json({
      message: 'KYC status updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update KYC status error:', error);
    res.status(500).json({ error: 'Failed to update KYC status' });
  }
});

// Admin: Toggle user active status
router.put('/:userId/active-status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const result = await query(
      `UPDATE users 
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING user_id, full_name, email, role, is_active`,
      [isActive, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User status updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

module.exports = router;

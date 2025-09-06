const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireRole, requireKYC } = require('../middleware/auth');
const router = express.Router();

// Create rating/review
router.post('/', authenticateToken, requireKYC, async (req, res) => {
  try {
    const { 
      listingId, 
      rating, 
      review, 
      ratingType 
    } = req.body;

    // Validation
    if (!rating || !ratingType || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) and rating type are required' });
    }

    if (!['tenant_to_owner', 'owner_to_tenant', 'tenant_to_property'].includes(ratingType)) {
      return res.status(400).json({ error: 'Invalid rating type' });
    }

    // Check if user has already rated for this type
    let existingRating;
    if (ratingType === 'tenant_to_owner' || ratingType === 'tenant_to_property') {
      existingRating = await query(
        'SELECT rating_id FROM ratings WHERE listing_id = $1 AND tenant_id = $2 AND rating_type = $3',
        [listingId, req.user.user_id, ratingType]
      );
    } else if (ratingType === 'owner_to_tenant') {
      existingRating = await query(
        'SELECT rating_id FROM ratings WHERE listing_id = $1 AND owner_id = $2 AND rating_type = $3',
        [listingId, req.user.user_id, ratingType]
      );
    }

    if (existingRating.rows.length > 0) {
      return res.status(400).json({ error: 'You have already rated for this type' });
    }

    // Verify user has access to rate
    if (ratingType === 'tenant_to_owner' || ratingType === 'tenant_to_property') {
      // Check if tenant has visited or has agreement for this listing
      const accessCheck = await query(
        `SELECT 1 FROM visits WHERE listing_id = $1 AND tenant_id = $2 AND status = 'completed'
         UNION
         SELECT 1 FROM agreements WHERE listing_id = $1 AND tenant_id = $2 AND status = 'active'`,
        [listingId, req.user.user_id]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You can only rate properties you have visited or rented' });
      }
    } else if (ratingType === 'owner_to_tenant') {
      // Check if owner has agreement with this tenant
      const accessCheck = await query(
        'SELECT 1 FROM agreements WHERE listing_id = $1 AND owner_id = $2 AND status = $3',
        [listingId, req.user.user_id, 'active']
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({ error: 'You can only rate tenants you have agreements with' });
      }
    }

    // Create rating
    let result;
    if (ratingType === 'tenant_to_owner' || ratingType === 'tenant_to_property') {
      result = await query(
        `INSERT INTO ratings (listing_id, tenant_id, rating, review, rating_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [listingId, req.user.user_id, rating, review, ratingType]
      );
    } else {
      result = await query(
        `INSERT INTO ratings (listing_id, owner_id, rating, review, rating_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [listingId, req.user.user_id, rating, review, ratingType]
      );
    }

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: result.rows[0]
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// Get ratings for a listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { ratingType, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE listing_id = $1';
    let params = [listingId];
    let paramCount = 1;

    if (ratingType) {
      paramCount++;
      whereClause += ` AND rating_type = $${paramCount}`;
      params.push(ratingType);
    }

    const result = await query(
      `SELECT r.*, 
              u1.full_name as rater_name,
              u2.full_name as rated_name
       FROM ratings r
       LEFT JOIN users u1 ON (r.tenant_id = u1.user_id OR r.owner_id = u1.user_id)
       LEFT JOIN users u2 ON (
         CASE 
           WHEN r.rating_type = 'tenant_to_owner' THEN r.owner_id = u2.user_id
           WHEN r.rating_type = 'owner_to_tenant' THEN r.tenant_id = u2.user_id
           ELSE NULL
         END
       )
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM ratings ${whereClause}`,
      params
    );

    // Get average rating
    const avgResult = await query(
      `SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings
       FROM ratings ${whereClause}`,
      params
    );

    res.json({
      ratings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      },
      summary: avgResult.rows[0]
    });
  } catch (error) {
    console.error('Get listing ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Get ratings for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { ratingType, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [userId];
    let paramCount = 1;

    if (ratingType === 'tenant_to_owner' || ratingType === 'owner_to_tenant') {
      whereClause = `WHERE (tenant_id = $1 OR owner_id = $1) AND rating_type = $2`;
      params.push(ratingType);
      paramCount = 2;
    } else {
      whereClause = 'WHERE (tenant_id = $1 OR owner_id = $1)';
    }

    const result = await query(
      `SELECT r.*, l.title as listing_title, l.location,
              u1.full_name as rater_name,
              u2.full_name as rated_name
       FROM ratings r
       JOIN listings l ON r.listing_id = l.listing_id
       LEFT JOIN users u1 ON (r.tenant_id = u1.user_id OR r.owner_id = u1.user_id)
       LEFT JOIN users u2 ON (
         CASE 
           WHEN r.rating_type = 'tenant_to_owner' THEN r.owner_id = u2.user_id
           WHEN r.rating_type = 'owner_to_tenant' THEN r.tenant_id = u2.user_id
           ELSE NULL
         END
       )
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM ratings ${whereClause}`,
      params
    );

    // Get average rating
    const avgResult = await query(
      `SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings
       FROM ratings ${whereClause}`,
      params
    );

    res.json({
      ratings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      },
      summary: avgResult.rows[0]
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// Update rating
router.put('/:ratingId', authenticateToken, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required' });
    }

    // Get rating details
    const ratingResult = await query(
      'SELECT * FROM ratings WHERE rating_id = $1',
      [ratingId]
    );

    if (ratingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    const existingRating = ratingResult.rows[0];

    // Check if user owns this rating
    if (existingRating.tenant_id !== req.user.user_id && 
        existingRating.owner_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update rating
    const result = await query(
      `UPDATE ratings 
       SET rating = $1, review = $2, updated_at = CURRENT_TIMESTAMP
       WHERE rating_id = $3
       RETURNING *`,
      [rating, review, ratingId]
    );

    res.json({
      message: 'Rating updated successfully',
      rating: result.rows[0]
    });
  } catch (error) {
    console.error('Update rating error:', error);
    res.status(500).json({ error: 'Failed to update rating' });
  }
});

// Delete rating
router.delete('/:ratingId', authenticateToken, async (req, res) => {
  try {
    const { ratingId } = req.params;

    // Get rating details
    const ratingResult = await query(
      'SELECT * FROM ratings WHERE rating_id = $1',
      [ratingId]
    );

    if (ratingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    const existingRating = ratingResult.rows[0];

    // Check if user owns this rating
    if (existingRating.tenant_id !== req.user.user_id && 
        existingRating.owner_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete rating
    await query('DELETE FROM ratings WHERE rating_id = $1', [ratingId]);

    res.json({ message: 'Rating deleted successfully' });
  } catch (error) {
    console.error('Delete rating error:', error);
    res.status(500).json({ error: 'Failed to delete rating' });
  }
});

// Report suspicious/fraudulent rating
router.post('/:ratingId/report', authenticateToken, async (req, res) => {
  try {
    const { ratingId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Report reason is required' });
    }

    // Check if rating exists
    const ratingResult = await query(
      'SELECT * FROM ratings WHERE rating_id = $1',
      [ratingId]
    );

    if (ratingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }

    // Create report (you might want to create a separate reports table)
    // For now, we'll just mark the rating as flagged
    await query(
      'UPDATE ratings SET is_verified = false WHERE rating_id = $1',
      [ratingId]
    );

    res.json({ message: 'Rating reported successfully' });
  } catch (error) {
    console.error('Report rating error:', error);
    res.status(500).json({ error: 'Failed to report rating' });
  }
});

// Get trust score for a user
router.get('/trust-score/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Calculate trust score based on various factors
    const trustFactors = await query(
      `SELECT 
         -- KYC status
         CASE WHEN u.kyc_status = 'verified' THEN 30 ELSE 0 END as kyc_score,
         
         -- Average rating
         COALESCE(AVG(r.rating), 0) * 10 as rating_score,
         
         -- Number of ratings
         CASE 
           WHEN COUNT(r.rating_id) >= 10 THEN 20
           WHEN COUNT(r.rating_id) >= 5 THEN 15
           WHEN COUNT(r.rating_id) >= 1 THEN 10
           ELSE 0
         END as volume_score,
         
         -- Account age
         CASE 
           WHEN EXTRACT(DAYS FROM NOW() - u.created_at) >= 365 THEN 20
           WHEN EXTRACT(DAYS FROM NOW() - u.created_at) >= 180 THEN 15
           WHEN EXTRACT(DAYS FROM NOW() - u.created_at) >= 90 THEN 10
           WHEN EXTRACT(DAYS FROM NOW() - u.created_at) >= 30 THEN 5
           ELSE 0
         END as age_score,
         
         -- SafeRent verified
         CASE WHEN EXISTS(SELECT 1 FROM listings WHERE owner_id = u.user_id AND safe_rent_verified = true) THEN 20 ELSE 0 END as saferent_score
         
       FROM users u
       LEFT JOIN ratings r ON (u.user_id = r.tenant_id OR u.user_id = r.owner_id)
       WHERE u.user_id = $1
       GROUP BY u.user_id, u.kyc_status, u.created_at`,
      [userId]
    );

    if (trustFactors.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const factors = trustFactors.rows[0];
    const totalScore = Math.min(100, 
      factors.kyc_score + 
      factors.rating_score + 
      factors.volume_score + 
      factors.age_score + 
      factors.saferent_score
    );

    res.json({
      trust_score: totalScore,
      factors: {
        kyc_score: factors.kyc_score,
        rating_score: factors.rating_score,
        volume_score: factors.volume_score,
        age_score: factors.age_score,
        saferent_score: factors.saferent_score
      }
    });
  } catch (error) {
    console.error('Get trust score error:', error);
    res.status(500).json({ error: 'Failed to calculate trust score' });
  }
});

// Admin: Get all ratings
router.get('/admin/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { ratingType, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 0;

    if (ratingType) {
      paramCount++;
      whereClause += ` AND r.rating_type = $${paramCount}`;
      params.push(ratingType);
    }

    const result = await query(
      `SELECT r.*, l.title as listing_title, l.location,
              u1.full_name as rater_name,
              u2.full_name as rated_name
       FROM ratings r
       JOIN listings l ON r.listing_id = l.listing_id
       LEFT JOIN users u1 ON (r.tenant_id = u1.user_id OR r.owner_id = u1.user_id)
       LEFT JOIN users u2 ON (
         CASE 
           WHEN r.rating_type = 'tenant_to_owner' THEN r.owner_id = u2.user_id
           WHEN r.rating_type = 'owner_to_tenant' THEN r.tenant_id = u2.user_id
           ELSE NULL
         END
       )
       ${whereClause}
       ORDER BY r.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM ratings r ${whereClause}`,
      params
    );

    res.json({
      ratings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Admin get ratings error:', error);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

module.exports = router;

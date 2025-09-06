const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Get admin statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total users
    const usersResult = await query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(usersResult.rows[0].total);

    // Get total listings
    const listingsResult = await query('SELECT COUNT(*) as total FROM listings');
    const totalListings = parseInt(listingsResult.rows[0].total);

    // Get pending approvals (inactive listings)
    const pendingResult = await query('SELECT COUNT(*) as total FROM listings WHERE is_active = false');
    const pendingApprovals = parseInt(pendingResult.rows[0].total);

    // Get total visits
    const visitsResult = await query('SELECT COUNT(*) as total FROM visits');
    const totalVisits = parseInt(visitsResult.rows[0].total);

    res.json({
      totalUsers,
      totalListings,
      pendingApprovals,
      totalVisits
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Get all users
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        user_id,
        full_name,
        email,
        phone,
        role,
        kyc_status,
        is_active,
        created_at,
        updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get staff users only
router.get('/staff-users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        user_id,
        full_name,
        email,
        phone,
        role,
        kyc_status,
        is_active,
        created_at,
        updated_at
       FROM users
       WHERE role IN ('staff', 'admin')
       ORDER BY created_at DESC`
    );

    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get staff users error:', error);
    res.status(500).json({ error: 'Failed to fetch staff users' });
  }
});

// Approve KYC for a user
router.put('/users/:userId/kyc-approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(
      'UPDATE users SET kyc_status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *',
      ['verified', userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'KYC approved successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Approve KYC error:', error);
    res.status(500).json({ error: 'Failed to approve KYC' });
  }
});

// Reject KYC for a user
router.put('/users/:userId/kyc-reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const result = await query(
      'UPDATE users SET kyc_status = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *',
      ['rejected', userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create notification for user
    await query(
      `INSERT INTO notifications (user_id, title, message, notification_type)
       VALUES ($1, $2, $3, $4)`,
      [
        userId,
        'KYC Verification Failed',
        `Your KYC verification has been rejected${reason ? `: ${reason}` : ''}. Please submit valid documents.`,
        'kyc_rejected'
      ]
    );

    res.json({
      message: 'KYC rejected successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Reject KYC error:', error);
    res.status(500).json({ error: 'Failed to reject KYC' });
  }
});

// Toggle user status (ban/unban)
router.put('/users/:userId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { is_active } = req.body;

    const result = await query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *',
      [is_active, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: `User ${is_active ? 'activated' : 'banned'} successfully`,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete a user
router.delete('/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const userResult = await query('SELECT user_id FROM users WHERE user_id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user (cascade will handle related data)
    await query('DELETE FROM users WHERE user_id = $1', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Approve a listing
router.put('/listings/:listingId/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { listingId } = req.params;

    const result = await query(
      'UPDATE listings SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE listing_id = $2 RETURNING *',
      [true, listingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Get owner info for notification
    const ownerResult = await query(
      'SELECT owner_id FROM listings WHERE listing_id = $1',
      [listingId]
    );

    if (ownerResult.rows.length > 0) {
      // Create notification for owner
      await query(
        `INSERT INTO notifications (user_id, title, message, notification_type, related_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          ownerResult.rows[0].owner_id,
          'Listing Approved',
          'Your property listing has been approved and is now live.',
          'listing_approved',
          listingId
        ]
      );
    }

    res.json({
      message: 'Listing approved successfully',
      listing: result.rows[0]
    });
  } catch (error) {
    console.error('Approve listing error:', error);
    res.status(500).json({ error: 'Failed to approve listing' });
  }
});

// Reject a listing
router.put('/listings/:listingId/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { reason } = req.body;

    const result = await query(
      'UPDATE listings SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE listing_id = $2 RETURNING *',
      [false, listingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Get owner info for notification
    const ownerResult = await query(
      'SELECT owner_id FROM listings WHERE listing_id = $1',
      [listingId]
    );

    if (ownerResult.rows.length > 0) {
      // Create notification for owner
      await query(
        `INSERT INTO notifications (user_id, title, message, notification_type, related_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          ownerResult.rows[0].owner_id,
          'Listing Rejected',
          `Your property listing has been rejected${reason ? `: ${reason}` : ''}. Please review and resubmit.`,
          'listing_rejected',
          listingId
        ]
      );
    }

    res.json({
      message: 'Listing rejected successfully',
      listing: result.rows[0]
    });
  } catch (error) {
    console.error('Reject listing error:', error);
    res.status(500).json({ error: 'Failed to reject listing' });
  }
});

// Delete a listing
router.delete('/listings/:listingId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { listingId } = req.params;

    // Check if listing exists
    const listingResult = await query('SELECT listing_id FROM listings WHERE listing_id = $1', [listingId]);
    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Delete listing (cascade will handle related data)
    await query('DELETE FROM listings WHERE listing_id = $1', [listingId]);

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Get all visits for admin
router.get('/visits', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        v.*,
        l.title as listing_title,
        l.location as listing_location,
        u1.full_name as tenant_name,
        u2.full_name as owner_name
       FROM visits v
       LEFT JOIN listings l ON v.listing_id = l.listing_id
       LEFT JOIN users u1 ON v.tenant_id = u1.user_id
       LEFT JOIN users u2 ON l.owner_id = u2.user_id
       ORDER BY v.created_at DESC`
    );

    res.json({ visits: result.rows });
  } catch (error) {
    console.error('Get admin visits error:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

module.exports = router;

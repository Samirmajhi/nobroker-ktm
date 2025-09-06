const express = require('express');
const router = express.Router();
const { pool, query } = require('../config/database');
const { authenticateToken, requireOwner } = require('../middleware/auth');

// Owner middleware - all routes require owner role
router.use(authenticateToken);
router.use(requireOwner);

// Get owner statistics
router.get('/stats', async (req, res) => {
  try {
    const client = await pool.connect();
    
    // Get total listings for this owner
    const listingsResult = await client.query(
      'SELECT COUNT(*) FROM listings WHERE owner_id = $1',
      [req.user.user_id]
    );
    const totalListings = parseInt(listingsResult.rows[0].count);
    
    // Get active listings for this owner
    const activeResult = await client.query(
      'SELECT COUNT(*) FROM listings WHERE owner_id = $1 AND is_active = true',
      [req.user.user_id]
    );
    const activeListings = parseInt(activeResult.rows[0].count);
    
    // Get pending visits for this owner's properties
    const pendingVisitsResult = await client.query(`
      SELECT COUNT(*) FROM visits v
      JOIN listings l ON v.listing_id = l.listing_id
      WHERE l.owner_id = $1 AND v.status = 'pending'
    `, [req.user.user_id]);
    const pendingVisits = parseInt(pendingVisitsResult.rows[0].count);
    
    // Get total views (placeholder - you can implement view tracking)
    const totalViews = 0; // This would come from a views table
    
    client.release();
    
    res.json({
      totalListings,
      activeListings,
      pendingVisits,
      totalViews
    });
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    res.status(500).json({ error: 'Failed to fetch owner statistics' });
  }
});

// Get owner's listings
router.get('/listings', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT * FROM listings 
      WHERE owner_id = $1 
      ORDER BY created_at DESC
    `, [req.user.user_id]);
    client.release();
    
    res.json({ listings: result.rows });
  } catch (error) {
    console.error('Error fetching owner listings:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get visits for owner's properties
router.get('/visits', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT v.*, 
             l.title as listing_title,
             t.full_name as tenant_name,
             t.email as tenant_email
      FROM visits v
      JOIN listings l ON v.listing_id = l.listing_id
      JOIN users t ON v.tenant_id = t.user_id
      WHERE l.owner_id = $1
      ORDER BY v.created_at DESC
    `, [req.user.user_id]);
    client.release();
    
    res.json({ visits: result.rows });
  } catch (error) {
    console.error('Error fetching owner visits:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// Update visit status (owner can confirm/decline visits)
router.put('/visits/:visitId/status', async (req, res) => {
  try {
    const { visitId } = req.params;
    const { status } = req.body;
    
    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const client = await pool.connect();
    
    // Verify the visit belongs to one of the owner's properties
    const visitCheck = await client.query(`
      SELECT v.visit_id FROM visits v
      JOIN listings l ON v.listing_id = l.listing_id
      WHERE v.visit_id = $1 AND l.owner_id = $2
    `, [visitId, req.user.user_id]);
    
    if (visitCheck.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: 'Visit not found' });
    }
    
    await client.query(
      'UPDATE visits SET status = $1 WHERE visit_id = $2',
      [status, visitId]
    );
    
    client.release();
    res.json({ message: 'Visit status updated successfully' });
  } catch (error) {
    console.error('Error updating visit status:', error);
    res.status(500).json({ error: 'Failed to update visit status' });
  }
});

// Get owner analytics
router.get('/analytics', authenticateToken, requireOwner, async (req, res) => {
  try {
    const ownerId = req.user.user_id;

    // Get monthly views for the last 6 months
    const monthlyViewsResult = await query(
      `SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as views
       FROM listing_views
       WHERE listing_id IN (SELECT listing_id FROM listings WHERE owner_id = $1)
       AND created_at >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month DESC`,
      [ownerId]
    );

    // Get property performance (views per property)
    const propertyPerformanceResult = await query(
      `SELECT 
        l.title,
        l.listing_id,
        COUNT(lv.view_id) as views,
        COUNT(v.visit_id) as visits
       FROM listings l
       LEFT JOIN listing_views lv ON l.listing_id = lv.listing_id
       LEFT JOIN visits v ON l.listing_id = v.listing_id
       WHERE l.owner_id = $1
       GROUP BY l.listing_id, l.title
       ORDER BY views DESC`,
      [ownerId]
    );

    // Get visit trends for the last 3 months
    const visitTrendsResult = await query(
      `SELECT 
        DATE_TRUNC('week', created_at) as week,
        COUNT(*) as visits,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_visits
       FROM visits
       WHERE listing_id IN (SELECT listing_id FROM listings WHERE owner_id = $1)
       AND created_at >= NOW() - INTERVAL '3 months'
       GROUP BY DATE_TRUNC('week', created_at)
       ORDER BY week DESC`,
      [ownerId]
    );

    // Get revenue data (total property value)
    const revenueDataResult = await query(
      `SELECT 
        SUM(price) as total_value,
        AVG(price) as avg_price,
        COUNT(*) as total_properties
       FROM listings
       WHERE owner_id = $1 AND is_active = true`,
      [ownerId]
    );

    res.json({
      monthlyViews: monthlyViewsResult.rows,
      propertyPerformance: propertyPerformanceResult.rows,
      visitTrends: visitTrendsResult.rows,
      revenueData: revenueDataResult.rows[0]
    });

  } catch (error) {
    console.error('Get owner analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;

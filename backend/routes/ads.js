const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Middleware to ensure only staff/admin can manage ads
const requireStaff = (req, res, next) => {
  if (!['staff', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Staff or admin role required.' });
  }
  next();
};

// Get active ads for a specific user type
router.get('/active', authenticateToken, async (req, res) => {
  try {
    const { userType } = req.query;
    
    const result = await query(`
      SELECT 
        ad_id,
        title,
        description,
        image_url,
        video_url,
        click_url,
        duration,
        is_active,
        target_audience,
        priority,
        created_at,
        updated_at
      FROM ads 
      WHERE is_active = true 
        AND (target_audience @> $1 OR target_audience @> '["all"]')
      ORDER BY priority DESC, created_at DESC
    `, [JSON.stringify([userType])]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching active ads:', error);
    res.status(500).json({ error: 'Failed to fetch active ads' });
  }
});

// Get all ads (for management)
router.get('/', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userType } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND is_active = $${paramCount}`;
      params.push(status === 'active');
    }

    if (userType) {
      paramCount++;
      whereClause += ` AND target_audience @> $${paramCount}`;
      params.push(JSON.stringify([userType]));
    }

    const result = await query(`
      SELECT 
        ad_id,
        title,
        description,
        image_url,
        video_url,
        click_url,
        duration,
        is_active,
        target_audience,
        priority,
        views_count,
        clicks_count,
        created_at,
        updated_at
      FROM ads 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total FROM ads ${whereClause}
    `, params);

    res.json({
      ads: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching ads:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

// Create new ad
router.post('/', authenticateToken, requireStaff, async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      videoUrl,
      clickUrl,
      duration = 15,
      targetAudience = ['all'],
      priority = 1
    } = req.body;

    const result = await query(`
      INSERT INTO ads (
        title, description, image_url, video_url, click_url, 
        duration, target_audience, priority, is_active, 
        views_count, clicks_count, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, 0, 0, NOW(), NOW())
      RETURNING *
    `, [title, description, imageUrl, videoUrl, clickUrl, duration, JSON.stringify(targetAudience), priority]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating ad:', error);
    res.status(500).json({ error: 'Failed to create ad' });
  }
});

// Update ad
router.put('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      imageUrl,
      videoUrl,
      clickUrl,
      duration,
      targetAudience,
      priority,
      isActive
    } = req.body;

    const result = await query(`
      UPDATE ads SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        image_url = COALESCE($3, image_url),
        video_url = COALESCE($4, video_url),
        click_url = COALESCE($5, click_url),
        duration = COALESCE($6, duration),
        target_audience = COALESCE($7, target_audience),
        priority = COALESCE($8, priority),
        is_active = COALESCE($9, is_active),
        updated_at = NOW()
      WHERE ad_id = $10
      RETURNING *
    `, [title, description, imageUrl, videoUrl, clickUrl, duration, 
        targetAudience ? JSON.stringify(targetAudience) : null, priority, isActive, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ad:', error);
    res.status(500).json({ error: 'Failed to update ad' });
  }
});

// Delete ad
router.delete('/:id', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      DELETE FROM ads WHERE ad_id = $1 RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Error deleting ad:', error);
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

// Track ad view
router.post('/:id/view', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await query(`
      UPDATE ads SET views_count = views_count + 1 WHERE ad_id = $1
    `, [id]);

    res.json({ message: 'View tracked successfully' });
  } catch (error) {
    console.error('Error tracking ad view:', error);
    res.status(500).json({ error: 'Failed to track ad view' });
  }
});

// Track ad click
router.post('/:id/click', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await query(`
      UPDATE ads SET clicks_count = clicks_count + 1 WHERE ad_id = $1
    `, [id]);

    res.json({ message: 'Click tracked successfully' });
  } catch (error) {
    console.error('Error tracking ad click:', error);
    res.status(500).json({ error: 'Failed to track ad click' });
  }
});

// Get ad analytics
router.get('/analytics', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { dateFrom, dateTo, userType } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (dateFrom) {
      paramCount++;
      whereClause += ` AND DATE(created_at) >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereClause += ` AND DATE(created_at) <= $${paramCount}`;
      params.push(dateTo);
    }

    if (userType) {
      paramCount++;
      whereClause += ` AND target_audience @> $${paramCount}`;
      params.push(JSON.stringify([userType]));
    }

    const result = await query(`
      SELECT 
        ad_id,
        title,
        views_count,
        clicks_count,
        CASE 
          WHEN views_count > 0 THEN ROUND((clicks_count::float / views_count) * 100, 2)
          ELSE 0
        END as click_through_rate,
        created_at
      FROM ads 
      ${whereClause}
      ORDER BY views_count DESC
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ad analytics:', error);
    res.status(500).json({ error: 'Failed to fetch ad analytics' });
  }
});

module.exports = router;
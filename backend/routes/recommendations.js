const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get AI recommendations for tenant
router.get('/tenant', authenticateToken, requireRole('tenant'), async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    // Get user preferences
    const preferencesResult = await query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [req.user.user_id]
    );

    const preferences = preferencesResult.rows[0];

    // Build recommendation query based on preferences
    let whereClause = 'WHERE l.is_active = true';
    let params = [];
    let paramCount = 0;

    if (preferences) {
      if (preferences.min_price) {
        paramCount++;
        whereClause += ` AND l.price >= $${paramCount}`;
        params.push(preferences.min_price);
      }

      if (preferences.max_price) {
        paramCount++;
        whereClause += ` AND l.price <= $${paramCount}`;
        params.push(preferences.max_price);
      }

      if (preferences.min_bedrooms) {
        paramCount++;
        whereClause += ` AND l.bedrooms >= $${paramCount}`;
        params.push(preferences.min_bedrooms);
      }

      if (preferences.max_bedrooms) {
        paramCount++;
        whereClause += ` AND l.bedrooms <= $${paramCount}`;
        params.push(preferences.max_bedrooms);
      }

      if (preferences.preferred_locations && preferences.preferred_locations.length > 0) {
        paramCount++;
        whereClause += ` AND (`;
        const locationConditions = preferences.preferred_locations.map((_, index) => {
          return `l.location ILIKE $${paramCount + index + 1}`;
        });
        whereClause += locationConditions.join(' OR ');
        whereClause += `)`;
        params.push(...preferences.preferred_locations.map(loc => `%${loc}%`));
        paramCount += preferences.preferred_locations.length;
      }
    }

    // Get recommendations with scoring
    const result = await query(
      `SELECT 
         l.*,
         u.full_name as owner_name,
         u.kyc_status as owner_kyc_status,
         -- Calculate recommendation score
         CASE 
           WHEN l.safe_rent_verified = true THEN 20
           ELSE 0
         END +
         CASE 
           WHEN u.kyc_status = 'verified' THEN 15
           ELSE 0
         END +
         CASE 
           WHEN l.created_at >= NOW() - INTERVAL '7 days' THEN 10
           WHEN l.created_at >= NOW() - INTERVAL '30 days' THEN 5
           ELSE 0
         END +
         CASE 
           WHEN l.amenities && $${paramCount + 1} THEN 15
           ELSE 0
         END +
         -- Price proximity score
         CASE 
           WHEN $${paramCount + 2} > 0 THEN
             GREATEST(0, 20 - ABS(l.price - $${paramCount + 2}) / $${paramCount + 2} * 10)
           ELSE 0
         END +
         -- Bedroom proximity score
         CASE 
           WHEN $${paramCount + 3} > 0 THEN
             GREATEST(0, 15 - ABS(l.bedrooms - $${paramCount + 3}) * 3)
           ELSE 0
         END as recommendation_score
       FROM listings l
       JOIN users u ON l.owner_id = u.user_id
       ${whereClause}
       ORDER BY recommendation_score DESC, l.created_at DESC
       LIMIT $${paramCount + 4} OFFSET $${paramCount + 5}`,
      [
        ...params,
        preferences?.preferred_amenities || [],
        preferences?.min_price || 0,
        preferences?.min_bedrooms || 0,
        limit,
        offset
      ]
    );

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) FROM listings l
       JOIN users u ON l.owner_id = u.user_id
       ${whereClause}`,
      params
    );

    // Track recommendation history
    for (const listing of result.rows) {
      await query(
        `INSERT INTO recommendation_history (tenant_id, listing_id, recommendation_score)
         VALUES ($1, $2, $3)
         ON CONFLICT (tenant_id, listing_id) 
         DO UPDATE SET recommendation_score = $3, recommended_on = CURRENT_TIMESTAMP`,
        [req.user.user_id, listing.listing_id, listing.recommendation_score]
      );
    }

    res.json({
      recommendations: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get tenant recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get recommendations based on search history
router.get('/search-based', authenticateToken, requireRole('tenant'), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent search patterns (you might want to create a search_history table)
    // For now, we'll use recent recommendations as a proxy
    const recentRecommendations = await query(
      `SELECT listing_id, recommendation_score, recommended_on
       FROM recommendation_history
       WHERE tenant_id = $1
       ORDER BY recommended_on DESC
       LIMIT 5`,
      [req.user.user_id]
    );

    if (recentRecommendations.rows.length === 0) {
      return res.json({ recommendations: [] });
    }

    // Get similar listings based on recent recommendations
    const listingIds = recentRecommendations.rows.map(r => r.listing_id);
    const result = await query(
      `SELECT 
         l.*,
         u.full_name as owner_name,
         u.kyc_status as owner_kyc_status,
         -- Similarity score based on recent recommendations
         CASE 
           WHEN l.safe_rent_verified = true THEN 20
           ELSE 0
         END +
         CASE 
           WHEN u.kyc_status = 'verified' THEN 15
           ELSE 0
         END +
         -- Price range similarity
         CASE 
           WHEN l.price BETWEEN 
             (SELECT MIN(price) FROM listings WHERE listing_id = ANY($1)) * 0.8 AND
             (SELECT MAX(price) FROM listings WHERE listing_id = ANY($1)) * 1.2
           THEN 15
           ELSE 0
         END +
         -- Location similarity (same area)
         CASE 
           WHEN l.location IN (
             SELECT DISTINCT location FROM listings WHERE listing_id = ANY($1)
           ) THEN 20
           ELSE 0
         END +
         -- Bedroom similarity
         CASE 
           WHEN l.bedrooms IN (
             SELECT DISTINCT bedrooms FROM listings WHERE listing_id = ANY($1)
           ) THEN 10
           ELSE 0
         END as similarity_score
       FROM listings l
       JOIN users u ON l.owner_id = u.user_id
       WHERE l.is_active = true 
         AND l.listing_id != ALL($1)
       ORDER BY similarity_score DESC, l.created_at DESC
       LIMIT $2`,
      [listingIds, limit]
    );

    res.json({ recommendations: result.rows });
  } catch (error) {
    console.error('Get search-based recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get recommendations for similar users
router.get('/collaborative', authenticateToken, requireRole('tenant'), async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Find users with similar preferences
    const similarUsers = await query(
      `SELECT up1.user_id, up1.preferred_locations, up1.min_price, up1.max_price
       FROM user_preferences up1
       JOIN user_preferences up2 ON up1.user_id != up2.user_id
       WHERE up2.user_id = $1
         AND up1.preferred_locations && up2.preferred_locations
         AND ABS(up1.min_price - up2.min_price) / GREATEST(up1.min_price, up2.min_price) < 0.3
         AND ABS(up1.max_price - up2.max_price) / GREATEST(up1.max_price, up2.max_price) < 0.3
       LIMIT 5`,
      [req.user.user_id]
    );

    if (similarUsers.rows.length === 0) {
      return res.json({ recommendations: [] });
    }

    const similarUserIds = similarUsers.rows.map(u => u.user_id);

    // Get listings that similar users have shown interest in
    const result = await query(
      `SELECT 
         l.*,
         u.full_name as owner_name,
         u.kyc_status as owner_kyc_status,
         -- Collaborative filtering score
         CASE 
           WHEN l.safe_rent_verified = true THEN 20
           ELSE 0
         END +
         CASE 
           WHEN u.kyc_status = 'verified' THEN 15
           ELSE 0
         END +
         -- Interest from similar users
         CASE 
           WHEN EXISTS(
             SELECT 1 FROM recommendation_history rh 
             WHERE rh.listing_id = l.listing_id 
               AND rh.tenant_id = ANY($1)
           ) THEN 25
           ELSE 0
         END +
         -- Recent activity
         CASE 
           WHEN l.created_at >= NOW() - INTERVAL '7 days' THEN 10
           WHEN l.created_at >= NOW() - INTERVAL '30 days' THEN 5
           ELSE 0
         END as collaborative_score
       FROM listings l
       JOIN users u ON l.owner_id = u.user_id
       WHERE l.is_active = true
         AND l.owner_id != $2
       ORDER BY collaborative_score DESC, l.created_at DESC
       LIMIT $3`,
      [similarUserIds, req.user.user_id, limit]
    );

    res.json({ recommendations: result.rows });
  } catch (error) {
    console.error('Get collaborative recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// Get trending properties
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10, timeframe = '7' } = req.query;

    // Get trending properties based on views, recommendations, and recent activity
    const result = await query(
      `SELECT 
         l.*,
         u.full_name as owner_name,
         u.kyc_status as owner_kyc_status,
         -- Trending score calculation
         CASE 
           WHEN l.safe_rent_verified = true THEN 20
           ELSE 0
         END +
         CASE 
           WHEN u.kyc_status = 'verified' THEN 15
           ELSE 0
         END +
         -- Recent activity bonus
         CASE 
           WHEN l.created_at >= NOW() - INTERVAL '${timeframe} days' THEN 20
           ELSE 0
         END +
         -- Recommendation popularity
         COALESCE(
           (SELECT COUNT(*) FROM recommendation_history rh 
            WHERE rh.listing_id = l.listing_id 
              AND rh.recommended_on >= NOW() - INTERVAL '${timeframe} days'
           ), 0
         ) * 5 +
         -- Visit requests
         COALESCE(
           (SELECT COUNT(*) FROM visits v 
            WHERE v.listing_id = l.listing_id 
              AND v.created_at >= NOW() - INTERVAL '${timeframe} days'
           ), 0
         ) * 3 as trending_score
       FROM listings l
       JOIN users u ON l.owner_id = u.user_id
       WHERE l.is_active = true
       ORDER BY trending_score DESC, l.created_at DESC
       LIMIT $1`,
      [limit]
    );

    res.json({ trending: result.rows });
  } catch (error) {
    console.error('Get trending properties error:', error);
    res.status(500).json({ error: 'Failed to fetch trending properties' });
  }
});

// Get recommendations for specific listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;
    const { limit = 5 } = req.query;

    // Get the target listing details
    const targetListing = await query(
      'SELECT * FROM listings WHERE listing_id = $1',
      [listingId]
    );

    if (targetListing.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = targetListing.rows[0];

    // Find similar listings
    const result = await query(
      `SELECT 
         l.*,
         u.full_name as owner_name,
         u.kyc_status as owner_kyc_status,
         -- Similarity score
         CASE 
           WHEN l.safe_rent_verified = true THEN 20
           ELSE 0
         END +
         CASE 
           WHEN u.kyc_status = 'verified' THEN 15
           ELSE 0
         END +
         -- Price similarity
         CASE 
           WHEN ABS(l.price - $1) / GREATEST(l.price, $1) < 0.2 THEN 20
           WHEN ABS(l.price - $1) / GREATEST(l.price, $1) < 0.4 THEN 10
           ELSE 0
         END +
         -- Location similarity
         CASE 
           WHEN l.location = $2 THEN 25
           WHEN l.location ILIKE '%' || SPLIT_PART($2, ',', 1) || '%' THEN 15
           ELSE 0
         END +
         -- Bedroom similarity
         CASE 
           WHEN l.bedrooms = $3 THEN 15
           WHEN ABS(l.bedrooms - $3) = 1 THEN 10
           ELSE 0
         END +
         -- Size similarity
         CASE 
           WHEN ABS(l.size - $4) / GREATEST(l.size, $4) < 0.3 THEN 10
           ELSE 0
         END as similarity_score
       FROM listings l
       JOIN users u ON l.owner_id = u.user_id
       WHERE l.is_active = true 
         AND l.listing_id != $5
       ORDER BY similarity_score DESC, l.created_at DESC
       LIMIT $6`,
      [listing.price, listing.location, listing.bedrooms, listing.size, listingId, limit]
    );

    res.json({ similar: result.rows });
  } catch (error) {
    console.error('Get listing recommendations error:', error);
    res.status(500).json({ error: 'Failed to fetch similar listings' });
  }
});

// Update user preferences for better recommendations
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

// Get recommendation history
router.get('/history', authenticateToken, requireRole('tenant'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT rh.*, l.title as listing_title, l.location, l.price,
              u.full_name as owner_name
       FROM recommendation_history rh
       JOIN listings l ON rh.listing_id = l.listing_id
       JOIN users u ON l.owner_id = u.user_id
       WHERE rh.tenant_id = $1
       ORDER BY rh.recommended_on DESC
       LIMIT $2 OFFSET $3`,
      [req.user.user_id, limit, offset]
    );

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) FROM recommendation_history WHERE tenant_id = $1',
      [req.user.user_id]
    );

    res.json({
      history: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get recommendation history error:', error);
    res.status(500).json({ error: 'Failed to fetch recommendation history' });
  }
});

module.exports = router;

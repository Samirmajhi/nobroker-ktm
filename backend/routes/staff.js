const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Middleware to ensure only staff/admin can access
const requireStaff = (req, res, next) => {
  if (!['staff', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Staff or admin role required.' });
  }
  next();
};

// Get comprehensive dashboard statistics
router.get('/dashboard-stats', authenticateToken, requireStaff, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's listings
    const todayListingsResult = await query(
      `SELECT COUNT(*) as count FROM listings WHERE DATE(created_at) = $1`,
      [today]
    );

    // Get today's visits
    const todayVisitsResult = await query(
      `SELECT COUNT(*) as count FROM visits WHERE DATE(visit_datetime) = $1`,
      [today]
    );

    // Get pending visits
    const pendingVisitsResult = await query(
      `SELECT COUNT(*) as count FROM visits WHERE status = 'scheduled'`
    );

    // Get total active listings
    const activeListingsResult = await query(
      `SELECT COUNT(*) as count FROM listings WHERE is_active = true`
    );

    // Get total users by role
    const usersByRoleResult = await query(
      `SELECT role, COUNT(*) as count FROM users WHERE is_active = true GROUP BY role`
    );

    // Get recent activity (last 7 days)
    const recentActivityResult = await query(
      `SELECT 
        'listing' as type, 
        title as description, 
        created_at as timestamp,
        'new_listing' as activity_type
       FROM listings 
       WHERE created_at >= NOW() - INTERVAL '7 days'
       UNION ALL
       SELECT 
        'visit' as type,
        CONCAT('Visit scheduled for ', l.title) as description,
        v.created_at as timestamp,
        'visit_scheduled' as activity_type
       FROM visits v
       LEFT JOIN listings l ON v.listing_id = l.listing_id
       WHERE v.created_at >= NOW() - INTERVAL '7 days'
       ORDER BY timestamp DESC
       LIMIT 20`
    );

    // Get visit statistics
    const visitStatsResult = await query(
      `SELECT 
        COUNT(*) as total_visits,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_visits,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_visits,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_visits,
        COUNT(CASE WHEN tenant_decision = 'interested' THEN 1 END) as interested_tenants,
        COUNT(CASE WHEN owner_decision = 'interested' THEN 1 END) as interested_owners,
        COUNT(CASE WHEN tenant_decision = 'interested' AND owner_decision = 'interested' THEN 1 END) as matches
       FROM visits`
    );

    // Get listing statistics
    const listingStatsResult = await query(
      `SELECT 
        COUNT(*) as total_listings,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_listings,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_listings,
        AVG(price) as avg_price,
        COUNT(CASE WHEN property_type = 'apartment' THEN 1 END) as apartments,
        COUNT(CASE WHEN property_type = 'house' THEN 1 END) as houses,
        COUNT(CASE WHEN property_type = 'room' THEN 1 END) as rooms
       FROM listings`
    );

    // Get user statistics
    const userStatsResult = await query(
      `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'tenant' THEN 1 END) as tenants,
        COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
        COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN kyc_status = 'verified' THEN 1 END) as verified_users,
        COUNT(CASE WHEN kyc_status = 'pending' THEN 1 END) as pending_kyc
       FROM users WHERE is_active = true`
    );

    res.json({
      todayListings: parseInt(todayListingsResult.rows[0].count),
      todayVisits: parseInt(todayVisitsResult.rows[0].count),
      pendingVisits: parseInt(pendingVisitsResult.rows[0].count),
      activeListings: parseInt(activeListingsResult.rows[0].count),
      usersByRole: usersByRoleResult.rows,
      recentActivity: recentActivityResult.rows,
      visitStats: visitStatsResult.rows[0],
      listingStats: listingStatsResult.rows[0],
      userStats: userStatsResult.rows[0]
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get today's listings with details
router.get('/today-listings', authenticateToken, requireStaff, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await query(
      `SELECT 
        l.*,
        u.full_name as owner_name,
        u.phone as owner_phone,
        u.email as owner_email,
        lp.photo_url as primary_photo,
        COUNT(v.visit_id) as visit_count
       FROM listings l
       LEFT JOIN users u ON l.owner_id = u.user_id
       LEFT JOIN listing_photos lp ON l.listing_id = lp.listing_id AND lp.is_primary = true
       LEFT JOIN visits v ON l.listing_id = v.listing_id
       WHERE DATE(l.created_at) = $1
       GROUP BY l.listing_id, u.full_name, u.phone, u.email, lp.photo_url
       ORDER BY l.created_at DESC`,
      [today]
    );

    res.json({ listings: result.rows });

  } catch (error) {
    console.error('Get today listings error:', error);
    res.status(500).json({ error: 'Failed to fetch today listings' });
  }
});

// Get today's visits with details
router.get('/today-visits', authenticateToken, requireStaff, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await query(
      `SELECT 
        v.*,
        l.title as listing_title,
        l.location as listing_location,
        l.price as listing_price,
        u1.full_name as tenant_name,
        u1.phone as tenant_phone,
        u1.email as tenant_email,
        u2.full_name as owner_name,
        u2.phone as owner_phone,
        u2.email as owner_email,
        lp.photo_url as listing_photo
       FROM visits v
       LEFT JOIN listings l ON v.listing_id = l.listing_id
       LEFT JOIN users u1 ON v.tenant_id = u1.user_id
       LEFT JOIN users u2 ON l.owner_id = u2.user_id
       LEFT JOIN listing_photos lp ON l.listing_id = lp.listing_id AND lp.is_primary = true
       WHERE DATE(v.visit_datetime) = $1
       ORDER BY v.visit_datetime ASC`,
      [today]
    );

    res.json({ visits: result.rows });

  } catch (error) {
    console.error('Get today visits error:', error);
    res.status(500).json({ error: 'Failed to fetch today visits' });
  }
});

// Get all visits with comprehensive details
router.get('/all-visits', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, date_from, date_to } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = '1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND v.status = $${paramCount}`;
      params.push(status);
    }

    if (date_from) {
      paramCount++;
      whereClause += ` AND DATE(v.visit_datetime) >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      whereClause += ` AND DATE(v.visit_datetime) <= $${paramCount}`;
      params.push(date_to);
    }

    const result = await query(
      `SELECT 
        v.*,
        l.title as listing_title,
        l.location as listing_location,
        l.price as listing_price,
        u1.full_name as tenant_name,
        u1.phone as tenant_phone,
        u1.email as tenant_email,
        u2.full_name as owner_name,
        u2.phone as owner_phone,
        u2.email as owner_email,
        lp.photo_url as listing_photo
       FROM visits v
       LEFT JOIN listings l ON v.listing_id = l.listing_id
       LEFT JOIN users u1 ON v.tenant_id = u1.user_id
       LEFT JOIN users u2 ON l.owner_id = u2.user_id
       LEFT JOIN listing_photos lp ON l.listing_id = lp.listing_id AND lp.is_primary = true
       WHERE ${whereClause}
       ORDER BY v.visit_datetime DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM visits v WHERE ${whereClause}`,
      params
    );

    res.json({ 
      visits: result.rows,
      total: parseInt(countResult.rows[0].total),
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Get all visits error:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// Get visit history for a specific property
router.get('/property-visit-history/:listingId', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { listingId } = req.params;
    
    const result = await query(
      `SELECT 
        v.*,
        u.full_name as tenant_name,
        u.phone as tenant_phone,
        u.email as tenant_email,
        l.title as listing_title,
        l.location as listing_location
       FROM visits v
       LEFT JOIN users u ON v.tenant_id = u.user_id
       LEFT JOIN listings l ON v.listing_id = l.listing_id
       WHERE v.listing_id = $1
       ORDER BY v.visit_datetime DESC`,
      [listingId]
    );

    res.json({ visits: result.rows });

  } catch (error) {
    console.error('Get property visit history error:', error);
    res.status(500).json({ error: 'Failed to fetch property visit history' });
  }
});

// Get user visit history
router.get('/user-visit-history/:userId', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await query(
      `SELECT 
        v.*,
        l.title as listing_title,
        l.location as listing_location,
        l.price as listing_price,
        u1.full_name as tenant_name,
        u2.full_name as owner_name,
        lp.photo_url as listing_photo
       FROM visits v
       LEFT JOIN listings l ON v.listing_id = l.listing_id
       LEFT JOIN users u1 ON v.tenant_id = u1.user_id
       LEFT JOIN users u2 ON l.owner_id = u2.user_id
       LEFT JOIN listing_photos lp ON l.listing_id = lp.listing_id AND lp.is_primary = true
       WHERE v.tenant_id = $1 OR l.owner_id = $1
       ORDER BY v.visit_datetime DESC`,
      [userId]
    );

    res.json({ visits: result.rows });

  } catch (error) {
    console.error('Get user visit history error:', error);
    res.status(500).json({ error: 'Failed to fetch user visit history' });
  }
});

// Get comprehensive reports
router.get('/reports', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { 
      period = '30',
      date_from,
      date_to,
      status,
      property_type,
      role,
      kyc_status,
      price_range,
      listing_status
    } = req.query; // days
    
    // Build WHERE clauses for visits
    let visitWhereClause = `WHERE visit_datetime >= NOW() - INTERVAL '${period} days'`;
    const visitParams = [];
    let paramCount = 0;

    if (date_from) {
      paramCount++;
      visitWhereClause += ` AND DATE(visit_datetime) >= $${paramCount}`;
      visitParams.push(date_from);
    }
    if (date_to) {
      paramCount++;
      visitWhereClause += ` AND DATE(visit_datetime) <= $${paramCount}`;
      visitParams.push(date_to);
    }
    if (status) {
      paramCount++;
      visitWhereClause += ` AND status = $${paramCount}`;
      visitParams.push(status);
    }

    // Visit trends with filters
    let visitQuery = `
      SELECT 
        DATE(visit_datetime) as date,
        COUNT(*) as total_visits,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_visits,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_visits,
        COUNT(CASE WHEN tenant_decision = 'interested' AND owner_decision = 'interested' THEN 1 END) as matches
       FROM visits v
       LEFT JOIN listings l ON v.listing_id = l.listing_id
       ${visitWhereClause}
    `;

    if (property_type) {
      paramCount++;
      visitQuery += ` AND l.property_type = $${paramCount}`;
      visitParams.push(property_type);
    }

    visitQuery += ` GROUP BY DATE(visit_datetime) ORDER BY date DESC`;

    const visitTrendsResult = await query(visitQuery, visitParams);

    // Build WHERE clauses for listings
    let listingWhereClause = `WHERE l.created_at >= NOW() - INTERVAL '${period} days'`;
    const listingParams = [];
    paramCount = 0;

    if (property_type) {
      paramCount++;
      listingWhereClause += ` AND l.property_type = $${paramCount}`;
      listingParams.push(property_type);
    }
    if (listing_status) {
      paramCount++;
      listingWhereClause += ` AND l.is_active = $${paramCount}`;
      listingParams.push(listing_status === 'active');
    }
    if (price_range) {
      const [min, max] = price_range.split('-');
      if (max && max !== '+') {
        paramCount++;
        listingWhereClause += ` AND l.price BETWEEN $${paramCount} AND $${paramCount + 1}`;
        listingParams.push(parseInt(min), parseInt(max));
        paramCount++;
      } else {
        paramCount++;
        listingWhereClause += ` AND l.price >= $${paramCount}`;
        listingParams.push(parseInt(min));
      }
    }

    // Listing performance with filters
    const listingQuery = `
      SELECT 
        l.listing_id,
        l.title,
        l.location,
        l.price,
        l.created_at,
        COUNT(v.visit_id) as total_visits,
        COUNT(CASE WHEN v.status = 'completed' THEN 1 END) as completed_visits,
        COUNT(CASE WHEN v.tenant_decision = 'interested' THEN 1 END) as interested_tenants,
        COUNT(CASE WHEN v.owner_decision = 'interested' THEN 1 END) as interested_owners,
        COUNT(CASE WHEN v.tenant_decision = 'interested' AND v.owner_decision = 'interested' THEN 1 END) as matches,
        COUNT(f.favorite_id) as favorites
       FROM listings l
       LEFT JOIN visits v ON l.listing_id = v.listing_id
       LEFT JOIN favorites f ON l.listing_id = f.listing_id
       ${listingWhereClause}
       GROUP BY l.listing_id, l.title, l.location, l.price, l.created_at
       ORDER BY total_visits DESC
    `;

    const listingPerformanceResult = await query(listingQuery, listingParams);

    // Build WHERE clauses for users
    let userWhereClause = `WHERE u.created_at >= NOW() - INTERVAL '${period} days'`;
    const userParams = [];
    paramCount = 0;

    if (role) {
      paramCount++;
      userWhereClause += ` AND u.role = $${paramCount}`;
      userParams.push(role);
    }
    if (kyc_status) {
      paramCount++;
      userWhereClause += ` AND u.kyc_status = $${paramCount}`;
      userParams.push(kyc_status);
    }

    // User statistics with filters
    const userQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN kyc_status = 'verified' THEN 1 END) as verified_users,
        COUNT(CASE WHEN kyc_status = 'pending' THEN 1 END) as pending_kyc,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
       FROM users u
       ${userWhereClause}
    `;

    const userStatsResult = await query(userQuery, userParams);

    // User activity with filters
    const userActivityQuery = `
      SELECT 
        u.user_id,
        u.full_name,
        u.role,
        u.created_at,
        COUNT(CASE WHEN u.role = 'tenant' THEN v.visit_id END) as visits_scheduled,
        COUNT(CASE WHEN u.role = 'owner' THEN l.listing_id END) as listings_created
       FROM users u
       LEFT JOIN visits v ON u.user_id = v.tenant_id
       LEFT JOIN listings l ON u.user_id = l.owner_id
       ${userWhereClause}
       GROUP BY u.user_id, u.full_name, u.role, u.created_at
       ORDER BY u.created_at DESC
    `;

    const userActivityResult = await query(userActivityQuery, userParams);

    res.json({
      visitTrends: visitTrendsResult.rows,
      listingPerformance: listingPerformanceResult.rows,
      userActivity: userActivityResult.rows,
      userStats: userStatsResult.rows[0]
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get all visits with filters for management
router.get('/all-visits', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { status, date_from, date_to } = req.query;
    
    let whereClause = '';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` WHERE v.status = $${paramCount}`;
      params.push(status);
    }

    if (date_from) {
      paramCount++;
      const operator = whereClause ? 'AND' : 'WHERE';
      whereClause += ` ${operator} DATE(v.visit_datetime) >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      const operator = whereClause ? 'AND' : 'WHERE';
      whereClause += ` ${operator} DATE(v.visit_datetime) <= $${paramCount}`;
      params.push(date_to);
    }

    const sqlQuery = `
      SELECT 
        v.visit_id,
        v.visit_datetime,
        v.status,
        v.visit_notes,
        v.tenant_decision,
        v.owner_decision,
        v.tenant_decision_notes,
        v.owner_decision_notes,
        l.title as listing_title,
        l.location as listing_location,
        l.price as listing_price,
        l.property_type,
        l.bedrooms,
        l.bathrooms,
        t.full_name as tenant_name,
        t.phone as tenant_phone,
        t.email as tenant_email,
        o.full_name as owner_name,
        o.phone as owner_phone,
        o.email as owner_email
      FROM visits v
      JOIN listings l ON v.listing_id = l.listing_id
      JOIN users t ON v.tenant_id = t.user_id
      JOIN users o ON l.owner_id = o.user_id
      ${whereClause}
      ORDER BY v.visit_datetime DESC
    `;

    const result = await query(sqlQuery, params);
    
    res.json({
      visits: result.rows
    });

  } catch (error) {
    console.error('Get all visits error:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// Get all listings with comprehensive filters
router.get('/all-listings', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { 
      property_type, 
      price_range, 
      status, 
      location, 
      owner 
    } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (property_type) {
      paramCount++;
      whereClause += ` AND l.property_type = $${paramCount}`;
      params.push(property_type);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND l.is_active = $${paramCount}`;
      params.push(status === 'active');
    }

    if (location) {
      paramCount++;
      whereClause += ` AND LOWER(l.location) LIKE LOWER($${paramCount})`;
      params.push(`%${location}%`);
    }

    if (owner) {
      paramCount++;
      whereClause += ` AND LOWER(u.full_name) LIKE LOWER($${paramCount})`;
      params.push(`%${owner}%`);
    }

    if (price_range) {
      const [min, max] = price_range.split('-');
      if (max && max !== '+') {
        paramCount++;
        whereClause += ` AND l.price BETWEEN $${paramCount} AND $${paramCount + 1}`;
        params.push(parseInt(min), parseInt(max));
        paramCount++;
      } else {
        paramCount++;
        whereClause += ` AND l.price >= $${paramCount}`;
        params.push(parseInt(min));
      }
    }

    const sqlQuery = `
      SELECT 
        l.listing_id,
        l.title,
        l.location,
        l.property_type,
        l.price,
        l.bedrooms,
        l.bathrooms,
        l.size,
        l.description,
        l.is_active,
        l.created_at,
        l.updated_at,
        u.full_name as owner_name,
        u.phone as owner_phone,
        u.email as owner_email,
        u.kyc_status as owner_kyc_status,
        COUNT(DISTINCT v.visit_id) as total_visits,
        COUNT(DISTINCT f.favorite_id) as favorites,
        COUNT(CASE WHEN v.tenant_decision = 'interested' THEN 1 END) as interested_tenants,
        COUNT(CASE WHEN v.owner_decision = 'interested' THEN 1 END) as interested_owners,
        COUNT(CASE WHEN v.tenant_decision = 'interested' AND v.owner_decision = 'interested' THEN 1 END) as matches
      FROM listings l
      LEFT JOIN users u ON l.owner_id = u.user_id
      LEFT JOIN visits v ON l.listing_id = v.listing_id
      LEFT JOIN favorites f ON l.listing_id = f.listing_id
      ${whereClause}
      GROUP BY l.listing_id, l.title, l.location, l.property_type, l.price, 
               l.bedrooms, l.bathrooms, l.size, l.description, l.is_active, 
               l.created_at, l.updated_at, u.full_name, u.phone, u.email, u.kyc_status
      ORDER BY l.created_at DESC
    `;

    const result = await query(sqlQuery, params);
    
    res.json({
      listings: result.rows
    });

  } catch (error) {
    console.error('Get all listings error:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get user registrations report
router.get('/reports/user-registrations', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { dateFrom, dateTo, role } = req.query;
    
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

    if (role) {
      paramCount++;
      whereClause += ` AND role = $${paramCount}`;
      params.push(role);
    }

    const result = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        COUNT(CASE WHEN role = 'tenant' THEN 1 END) as tenants,
        COUNT(CASE WHEN role = 'owner' THEN 1 END) as owners,
        COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff,
        COUNT(*) as total
      FROM users 
      ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user registrations report:', error);
    res.status(500).json({ error: 'Failed to fetch user registrations report' });
  }
});

// Get user activity report
router.get('/reports/user-activity', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { role, isActive, lastLoginDays } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (role) {
      paramCount++;
      whereClause += ` AND u.role = $${paramCount}`;
      params.push(role);
    }

    if (isActive !== undefined) {
      paramCount++;
      whereClause += ` AND u.is_active = $${paramCount}`;
      params.push(isActive === 'true');
    }

    if (lastLoginDays) {
      paramCount++;
      whereClause += ` AND u.last_login >= NOW() - INTERVAL '${lastLoginDays} days'`;
    }

    const result = await query(`
      SELECT 
        u.user_id,
        u.full_name as name,
        u.email,
        u.role,
        u.last_login,
        u.is_active,
        COALESCE(uv.view_count, 0) as properties_viewed,
        COALESCE(f.favorites_count, 0) as favorites_count
      FROM users u
      LEFT JOIN (
        SELECT user_id, COUNT(*) as view_count
        FROM listing_views
        GROUP BY user_id
      ) uv ON u.user_id = uv.user_id
      LEFT JOIN (
        SELECT user_id, COUNT(*) as favorites_count
        FROM favorites
        GROUP BY user_id
      ) f ON u.user_id = f.user_id
      ${whereClause}
      ORDER BY u.last_login DESC
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user activity report:', error);
    res.status(500).json({ error: 'Failed to fetch user activity report' });
  }
});

// Get price preferences report
router.get('/reports/price-preferences', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (dateFrom) {
      paramCount++;
      whereClause += ` AND DATE(f.created_at) >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereClause += ` AND DATE(f.created_at) <= $${paramCount}`;
      params.push(dateTo);
    }

    const result = await query(`
      SELECT 
        CASE 
          WHEN l.price < 50000 THEN 'Under 50,000'
          WHEN l.price < 100000 THEN '50,000 - 100,000'
          WHEN l.price < 200000 THEN '100,000 - 200,000'
          WHEN l.price < 500000 THEN '200,000 - 500,000'
          ELSE 'Over 500,000'
        END as price_range,
        COUNT(DISTINCT f.user_id) as users_interested,
        COUNT(DISTINCT l.listing_id) as properties_available,
        ROUND(
          (COUNT(DISTINCT f.user_id)::float / NULLIF(COUNT(DISTINCT l.listing_id), 0)) * 100, 
          2
        ) as match_rate
      FROM favorites f
      JOIN listings l ON f.listing_id = l.listing_id
      ${whereClause}
      GROUP BY 
        CASE 
          WHEN l.price < 50000 THEN 'Under 50,000'
          WHEN l.price < 100000 THEN '50,000 - 100,000'
          WHEN l.price < 200000 THEN '100,000 - 200,000'
          WHEN l.price < 500000 THEN '200,000 - 500,000'
          ELSE 'Over 500,000'
        END
      ORDER BY MIN(l.price)
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching price preferences report:', error);
    res.status(500).json({ error: 'Failed to fetch price preferences report' });
  }
});

// Get user favorites report
router.get('/reports/user-favorites', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { dateFrom, dateTo, userId, listingId } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (dateFrom) {
      paramCount++;
      whereClause += ` AND DATE(f.created_at) >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereClause += ` AND DATE(f.created_at) <= $${paramCount}`;
      params.push(dateTo);
    }

    if (userId) {
      paramCount++;
      whereClause += ` AND f.user_id = $${paramCount}`;
      params.push(userId);
    }

    if (listingId) {
      paramCount++;
      whereClause += ` AND f.listing_id = $${paramCount}`;
      params.push(listingId);
    }

    const result = await query(`
      SELECT 
        f.favorite_id,
        u.full_name as user_name,
        u.email as user_email,
        u.role as user_role,
        l.title as property_title,
        l.property_type,
        l.location as property_location,
        l.price as property_price,
        f.created_at as favorited_date
      FROM favorites f
      JOIN users u ON f.user_id = u.user_id
      JOIN listings l ON f.listing_id = l.listing_id
      ${whereClause}
      ORDER BY f.created_at DESC
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user favorites report:', error);
    res.status(500).json({ error: 'Failed to fetch user favorites report' });
  }
});

// Get favorites by tenant report
router.get('/reports/favorites-by-tenant', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { dateFrom, dateTo, tenantId } = req.query;
    
    let whereClause = 'WHERE u.role = \'tenant\'';
    const params = [];
    let paramCount = 0;

    if (dateFrom) {
      paramCount++;
      whereClause += ` AND DATE(f.created_at) >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereClause += ` AND DATE(f.created_at) <= $${paramCount}`;
      params.push(dateTo);
    }

    if (tenantId) {
      paramCount++;
      whereClause += ` AND f.user_id = $${paramCount}`;
      params.push(tenantId);
    }

    const result = await query(`
      SELECT 
        f.favorite_id,
        u.full_name as tenant_name,
        u.email as tenant_email,
        u.phone as tenant_phone,
        l.title as property_title,
        l.property_type,
        l.location as property_location,
        l.price as property_price,
        f.created_at as favorited_date
      FROM favorites f
      JOIN users u ON f.user_id = u.user_id
      JOIN listings l ON f.listing_id = l.listing_id
      ${whereClause}
      ORDER BY f.created_at DESC
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching favorites by tenant report:', error);
    res.status(500).json({ error: 'Failed to fetch favorites by tenant report' });
  }
});

// Get matches report
router.get('/reports/matches', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { dateFrom, dateTo, status } = req.query;
    
    let whereClause = 'WHERE v.tenant_decision = \'interested\' AND v.owner_decision = \'interested\'';
    const params = [];
    let paramCount = 0;

    if (dateFrom) {
      paramCount++;
      whereClause += ` AND DATE(v.visit_datetime) >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      whereClause += ` AND DATE(v.visit_datetime) <= $${paramCount}`;
      params.push(dateTo);
    }

    if (status) {
      paramCount++;
      whereClause += ` AND v.status = $${paramCount}`;
      params.push(status);
    }

    const result = await query(`
      SELECT 
        v.visit_id,
        l.title as property_title,
        l.location as property_location,
        l.price as property_price,
        t.full_name as tenant_name,
        t.email as tenant_email,
        o.full_name as owner_name,
        o.email as owner_email,
        v.visit_datetime as match_date,
        v.status
      FROM visits v
      JOIN listings l ON v.listing_id = l.listing_id
      JOIN users t ON v.tenant_id = t.user_id
      JOIN users o ON l.owner_id = o.user_id
      ${whereClause}
      ORDER BY v.visit_datetime DESC
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching matches report:', error);
    res.status(500).json({ error: 'Failed to fetch matches report' });
  }
});

// Get revenue report
router.get('/reports/revenue', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
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

    // Mock revenue data - replace with actual payment/subscription queries
    const result = await query(`
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(amount), 0) as revenue,
        COUNT(*) as transactions,
        COUNT(CASE WHEN plan_type = 'premium' THEN 1 END) as premium_users,
        ROUND(
          (COUNT(*) - LAG(COUNT(*)) OVER (ORDER BY DATE(created_at)))::float / 
          NULLIF(LAG(COUNT(*)) OVER (ORDER BY DATE(created_at)), 0) * 100, 
          2
        ) as growth
      FROM (
        SELECT 
          created_at,
          CASE 
            WHEN user_id % 3 = 0 THEN 999
            WHEN user_id % 3 = 1 THEN 1999
            ELSE 2999
          END as amount,
          CASE 
            WHEN user_id % 2 = 0 THEN 'premium'
            ELSE 'basic'
          END as plan_type
        FROM users
        WHERE created_at >= NOW() - INTERVAL '30 days'
      ) mock_payments
      ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching revenue report:', error);
    res.status(500).json({ error: 'Failed to fetch revenue report' });
  }
});

// Get subscriptions report
router.get('/reports/subscriptions', authenticateToken, requireStaff, async (req, res) => {
  try {
    const { status, planType } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND s.status = $${paramCount}`;
      params.push(status);
    }

    if (planType) {
      paramCount++;
      whereClause += ` AND s.plan_type = $${paramCount}`;
      params.push(planType);
    }

    // Mock subscription data - replace with actual subscription queries
    const result = await query(`
      SELECT 
        s.subscription_id,
        u.full_name as user_name,
        u.email as user_email,
        u.role as user_role,
        s.plan_name,
        s.start_date,
        s.end_date,
        s.amount,
        s.status
      FROM (
        SELECT 
          user_id,
          'subscription_' || user_id as subscription_id,
          CASE 
            WHEN user_id % 3 = 0 THEN 'Basic Plan'
            WHEN user_id % 3 = 1 THEN 'Premium Plan'
            ELSE 'Pro Plan'
          END as plan_name,
          created_at as start_date,
          created_at + INTERVAL '1 month' as end_date,
          CASE 
            WHEN user_id % 3 = 0 THEN 999
            WHEN user_id % 3 = 1 THEN 1999
            ELSE 2999
          END as amount,
          CASE 
            WHEN created_at > NOW() - INTERVAL '7 days' THEN 'active'
            WHEN created_at > NOW() - INTERVAL '30 days' THEN 'expired'
            ELSE 'pending'
          END as status
        FROM users
        WHERE role IN ('tenant', 'owner')
        LIMIT 50
      ) s
      JOIN users u ON s.user_id = u.user_id
      ${whereClause}
      ORDER BY s.start_date DESC
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching subscriptions report:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions report' });
  }
});

module.exports = router;

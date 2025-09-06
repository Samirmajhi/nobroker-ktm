const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const result = await query(
      'SELECT user_id, full_name, email, role, kyc_status, is_active FROM users WHERE user_id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = result.rows[0];
    
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user has required role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (Array.isArray(roles)) {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    } else {
      if (req.user.role !== roles) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
    }

    next();
  };
};

// Middleware to check if user is owner of listing
const requireListingOwnership = async (req, res, next) => {
  try {
    const { listingId } = req.params;
    
    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID required' });
    }

    const result = await query(
      'SELECT owner_id FROM listings WHERE listing_id = $1',
      [listingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = result.rows[0];
    
    if (listing.owner_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (error) {
    console.error('Listing ownership check error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Middleware to check if user has completed KYC
const requireKYC = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.kyc_status !== 'verified') {
    return res.status(403).json({ 
      error: 'KYC verification required',
      kyc_status: req.user.kyc_status 
    });
  }

  next();
};

// Middleware to check if user is admin
const requireAdmin = requireRole('admin');

// Middleware to check if user is owner
const requireOwner = requireRole('owner');

// Middleware to check if user is tenant
const requireTenant = requireRole('tenant');

// Middleware to check if user is staff or admin
const requireStaff = requireRole(['staff', 'admin']);

module.exports = {
  authenticateToken,
  requireRole,
  requireListingOwnership,
  requireKYC,
  requireAdmin,
  requireOwner,
  requireTenant,
  requireStaff
};

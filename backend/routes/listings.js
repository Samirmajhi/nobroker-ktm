const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/database');
const { authenticateToken, requireOwner, requireKYC, requireListingOwnership } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = path.join(__dirname, '..', 'uploads', 'listings');
    try {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      cb(null, dest);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'listing-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const isImage = (file.mimetype || '').startsWith('image/');
    if (isImage) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Create new listing
router.post('/', authenticateToken, requireOwner, requireKYC, async (req, res) => {
  try {
    const {
      title, description, price, deposit, size, bedrooms, bathrooms,
      location, latitude, longitude, amenities, availabilityDate,
      propertyType, furnishingStatus, parkingAvailable, petFriendly
    } = req.body;

    // Validation
    if (!title || !price || !deposit || !size || !bedrooms || !bathrooms || !location || !propertyType) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Insert listing
    const result = await query(
      `INSERT INTO listings (
        owner_id, title, description, price, deposit, size, bedrooms, bathrooms,
        location, latitude, longitude, amenities, availability_date,
        property_type, furnishing_status, parking_available, pet_friendly
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        req.user.user_id, title, description, price, deposit, size, bedrooms, bathrooms,
        location, latitude || null, longitude || null, amenities || [], availabilityDate || null,
        propertyType, furnishingStatus || 'unfurnished', parkingAvailable || false, petFriendly || false
      ]
    );

    res.status(201).json({
      message: 'Listing created successfully',
      listing: result.rows[0]
    });

  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Get all listings with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      location,
      propertyType,
      furnishingStatus,
      amenities,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Build WHERE clause
    let whereClause = 'WHERE l.is_active = true';
    const params = [];
    let paramCount = 0;

    if (minPrice) {
      paramCount++;
      whereClause += ` AND l.price >= $${paramCount}`;
      params.push(minPrice);
    }

    if (maxPrice) {
      paramCount++;
      whereClause += ` AND l.price <= $${paramCount}`;
      params.push(maxPrice);
    }

    if (minBedrooms) {
      paramCount++;
      whereClause += ` AND l.bedrooms >= $${paramCount}`;
      params.push(minBedrooms);
    }

    if (maxBedrooms) {
      paramCount++;
      whereClause += ` AND l.bedrooms <= $${paramCount}`;
      params.push(maxBedrooms);
    }

    if (location) {
      paramCount++;
      whereClause += ` AND l.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    if (propertyType) {
      paramCount++;
      whereClause += ` AND l.property_type = $${paramCount}`;
      params.push(propertyType);
    }

    if (furnishingStatus) {
      paramCount++;
      whereClause += ` AND l.furnishing_status = $${paramCount}`;
      params.push(furnishingStatus);
    }

    if (amenities) {
      // Handle amenities as comma-separated string or array
      let amenitiesArray = [];
      if (typeof amenities === 'string') {
        amenitiesArray = amenities.split(',').map(a => a.trim()).filter(a => a);
      } else if (Array.isArray(amenities)) {
        amenitiesArray = amenities.filter(a => a);
      }
      
      if (amenitiesArray.length > 0) {
        paramCount++;
        whereClause += ` AND l.amenities && $${paramCount}`;
        params.push(amenitiesArray);
      }
    }

    // Validate sort parameters
    const allowedSortFields = ['price', 'size', 'bedrooms', 'created_at', 'updated_at'];
    const allowedSortOrders = ['ASC', 'DESC'];
    
    if (!allowedSortFields.includes(sortBy)) sortBy = 'created_at';
    if (!allowedSortOrders.includes(sortOrder.toUpperCase())) sortOrder = 'DESC';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get listings with owner info and primary photo
    const listingsQuery = `
      SELECT 
        l.*,
        u.full_name as owner_name,
        u.kyc_status as owner_kyc_status,
        lp.photo_url as primary_photo
      FROM listings l
      LEFT JOIN users u ON l.owner_id = u.user_id
      LEFT JOIN listing_photos lp ON l.listing_id = lp.listing_id AND lp.is_primary = true
      ${whereClause}
      ORDER BY l.${sortBy} ${sortOrder}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    const listingsResult = await query(listingsQuery, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM listings l
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      listings: listingsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get user's listings (for owners)
router.get('/my-listings', authenticateToken, requireOwner, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        l.*, 
        COUNT(lp.photo_id) as photo_count,
        COUNT(v.visit_id) as visit_count
       FROM listings l
       LEFT JOIN listing_photos lp ON l.listing_id = lp.listing_id
       LEFT JOIN visits v ON l.listing_id = v.listing_id
       WHERE l.owner_id = $1
       GROUP BY l.listing_id
       ORDER BY l.created_at DESC`,
      [req.user.user_id]
    );

    res.json({ listings: result.rows });

  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ error: 'Failed to fetch user listings' });
  }
});

// Get single listing by ID
router.get('/:listingId', async (req, res) => {
  try {
    const { listingId } = req.params;

    // Get listing details with owner info
    const listingResult = await query(
      `SELECT 
        l.*,
        u.full_name as owner_name,
        u.phone as owner_phone,
        u.kyc_status as owner_kyc_status,
        u.profile_picture_url as owner_profile_picture
       FROM listings l
       LEFT JOIN users u ON l.owner_id = u.user_id
       WHERE l.listing_id = $1 AND l.is_active = true`,
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingResult.rows[0];

    // Get listing photos
    const photosResult = await query(
      'SELECT * FROM listing_photos WHERE listing_id = $1 ORDER BY is_primary DESC, created_at ASC',
      [listingId]
    );

    // Get ratings
    const ratingsResult = await query(
      `SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings
       FROM ratings 
       WHERE listing_id = $1 AND rating_type = 'tenant_to_property'`,
      [listingId]
    );

    listing.photos = photosResult.rows;
    listing.ratings = {
      average: parseFloat(ratingsResult.rows[0].average_rating) || 0,
      total: parseInt(ratingsResult.rows[0].total_ratings) || 0
    };

    res.json({ listing });

  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Update listing
router.put('/:listingId', authenticateToken, requireListingOwnership, async (req, res) => {
  try {
    const { listingId } = req.params;
    const updateFields = req.body;

    // Remove non-updatable fields
    delete updateFields.owner_id;
    delete updateFields.created_at;
    delete updateFields.updated_at;

    // Build dynamic update query
    const setClause = Object.keys(updateFields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [listingId, ...Object.values(updateFields)];

    const result = await query(
      `UPDATE listings 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE listing_id = $1
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({
      message: 'Listing updated successfully',
      listing: result.rows[0]
    });

  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing
router.delete('/:listingId', authenticateToken, requireListingOwnership, async (req, res) => {
  try {
    const { listingId } = req.params;

    // Soft delete - mark as inactive
    const result = await query(
      'UPDATE listings SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE listing_id = $1 RETURNING listing_id',
      [listingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ message: 'Listing deleted successfully' });

  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Upload listing photos
router.post('/:listingId/photos', authenticateToken, requireListingOwnership, upload.any(), async (req, res) => {
  try {
    const { listingId } = req.params;
    const { isPrimary } = req.body;

    const files = Array.isArray(req.files) ? req.files : [];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No photos uploaded' });
    }

    // If setting a photo as primary, unset other primary photos
    if (isPrimary === 'true') {
      await query(
        'UPDATE listing_photos SET is_primary = false WHERE listing_id = $1',
        [listingId]
      );
    }

    // Insert photo records
    const photoPromises = files.map((file, index) => {
      const isPrimaryPhoto = (isPrimary === 'true' && index === 0) || false;
      return query(
        `INSERT INTO listing_photos (listing_id, photo_url, is_primary)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [listingId, `/uploads/listings/${file.filename}`, isPrimaryPhoto]
      );
    });

    const photoResults = await Promise.all(photoPromises);
    const photos = photoResults.map(result => result.rows[0]);

    res.status(201).json({
      message: 'Photos uploaded successfully',
      photos
    });

  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({ error: 'Failed to upload photos' });
  }
});

// Delete listing photo
router.delete('/:listingId/photos/:photoId', authenticateToken, requireListingOwnership, async (req, res) => {
  try {
    const { listingId, photoId } = req.params;

    const result = await query(
      'DELETE FROM listing_photos WHERE photo_id = $1 AND listing_id = $2 RETURNING *',
      [photoId, listingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json({ message: 'Photo deleted successfully' });

  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// Set primary photo
router.put('/:listingId/photos/:photoId/primary', authenticateToken, requireListingOwnership, async (req, res) => {
  try {
    const { listingId, photoId } = req.params;

    // Unset all primary photos for this listing
    await query(
      'UPDATE listing_photos SET is_primary = false WHERE listing_id = $1',
      [listingId]
    );

    // Set the selected photo as primary
    const result = await query(
      'UPDATE listing_photos SET is_primary = true WHERE photo_id = $1 AND listing_id = $2 RETURNING *',
      [photoId, listingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json({
      message: 'Primary photo updated successfully',
      photo: result.rows[0]
    });

  } catch (error) {
    console.error('Set primary photo error:', error);
    res.status(500).json({ error: 'Failed to update primary photo' });
  }
});

module.exports = router;

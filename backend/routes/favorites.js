const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireTenant } = require('../middleware/auth');
const router = express.Router();

// Get user's favorite listings
router.get('/', authenticateToken, requireTenant, async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        f.favorite_id,
        f.user_id,
        f.listing_id,
        f.created_at,
        l.title,
        l.location,
        l.price,
        l.bedrooms,
        l.bathrooms,
        lp.photo_url as primary_photo
       FROM favorites f
       LEFT JOIN listings l ON f.listing_id = l.listing_id
       LEFT JOIN listing_photos lp ON l.listing_id = lp.listing_id AND lp.is_primary = true
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [req.user.user_id]
    );

    const favorites = result.rows.map(row => ({
      favorite_id: row.favorite_id,
      user_id: row.user_id,
      listing_id: row.listing_id,
      created_at: row.created_at,
      listing: {
        listing_id: row.listing_id,
        title: row.title,
        location: row.location,
        price: row.price,
        primary_photo: row.primary_photo,
        bedrooms: row.bedrooms,
        bathrooms: row.bathrooms,
      }
    }));

    res.json({ favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add listing to favorites
router.post('/', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    // Check if listing exists and is active
    const listingResult = await query(
      'SELECT listing_id, is_active FROM listings WHERE listing_id = $1',
      [listing_id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (!listingResult.rows[0].is_active) {
      return res.status(400).json({ error: 'Listing is not available' });
    }

    // Check if already in favorites
    const existingFavorite = await query(
      'SELECT favorite_id FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.user.user_id, listing_id]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(400).json({ error: 'Listing is already in your favorites' });
    }

    // Add to favorites
    const result = await query(
      `INSERT INTO favorites (user_id, listing_id)
       VALUES ($1, $2)
       RETURNING *`,
      [req.user.user_id, listing_id]
    );

    const favorite = result.rows[0];

    // Get listing details for response
    const listingDetails = await query(
      `SELECT 
        l.title,
        l.location,
        l.price,
        l.bedrooms,
        l.bathrooms,
        lp.photo_url as primary_photo
       FROM listings l
       LEFT JOIN listing_photos lp ON l.listing_id = lp.listing_id AND lp.is_primary = true
       WHERE l.listing_id = $1`,
      [listing_id]
    );

    const favoriteWithListing = {
      favorite_id: favorite.favorite_id,
      user_id: favorite.user_id,
      listing_id: favorite.listing_id,
      created_at: favorite.created_at,
      listing: {
        listing_id: favorite.listing_id,
        title: listingDetails.rows[0].title,
        location: listingDetails.rows[0].location,
        price: listingDetails.rows[0].price,
        primary_photo: listingDetails.rows[0].primary_photo,
        bedrooms: listingDetails.rows[0].bedrooms,
        bathrooms: listingDetails.rows[0].bathrooms,
      }
    };

    res.status(201).json({
      message: 'Added to favorites successfully',
      favorite: favoriteWithListing
    });

  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove listing from favorites
router.delete('/:listingId', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { listingId } = req.params;

    const result = await query(
      'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2 RETURNING *',
      [req.user.user_id, listingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites successfully' });

  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Check if listing is in favorites
router.get('/check/:listingId', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { listingId } = req.params;

    const result = await query(
      'SELECT favorite_id FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.user.user_id, listingId]
    );

    res.json({ isFavorite: result.rows.length > 0 });

  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite status' });
  }
});

module.exports = router;

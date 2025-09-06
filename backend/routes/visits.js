const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireTenant, requireOwner, requireListingOwnership } = require('../middleware/auth');
const router = express.Router();

// Submit tenant/owner decision after a visit
router.post('/:visitId/decision', authenticateToken, async (req, res) => {
  try {
    const { visitId } = req.params;
    const { decision, notes } = req.body; // decision: interested | not_interested | undecided

    if (!decision || !['interested', 'not_interested', 'undecided'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid decision' });
    }

    // Fetch visit with owner and tenant
    const visitResult = await query(
      `SELECT v.*, l.owner_id, l.title as listing_title
       FROM visits v
       LEFT JOIN listings l ON v.listing_id = l.listing_id
       WHERE v.visit_id = $1`,
      [visitId]
    );

    if (visitResult.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    const visit = visitResult.rows[0];

    // Only tenant, owner, staff, or admin can submit on behalf
    const isTenant = req.user.user_id === visit.tenant_id;
    const isOwner = req.user.user_id === visit.owner_id;
    const isStaff = ['staff', 'admin'].includes(req.user.role);
    if (!isTenant && !isOwner && !isStaff) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const now = new Date();
    let updateSql = 'UPDATE visits SET ';
    const updates = [];
    const params = [visitId];

    if (isTenant || (isStaff && !isOwner)) {
      updates.push('tenant_decision = $' + (params.length + 1));
      params.push(decision);
      if (notes) {
        updates.push('tenant_decision_notes = $' + (params.length + 1));
        params.push(notes);
      }
      updates.push('tenant_decision_at = $' + (params.length + 1));
      params.push(now);
    }

    if (isOwner || (isStaff && !isTenant)) {
      updates.push('owner_decision = $' + (params.length + 1));
      params.push(decision);
      if (notes) {
        updates.push('owner_decision_notes = $' + (params.length + 1));
        params.push(notes);
      }
      updates.push('owner_decision_at = $' + (params.length + 1));
      params.push(now);
    }

    updates.push('updated_at = $' + (params.length + 1));
    params.push(now);

    updateSql += updates.join(', ') + ' WHERE visit_id = $1 RETURNING *';

    const updateResult = await query(updateSql, params);
    const updated = updateResult.rows[0];

    // If tenant marked interested and owner hasn't decided yet, alert owner immediately
    if (
      (isTenant || (isStaff && !isOwner)) &&
      decision === 'interested' &&
      (!updated.owner_decision || updated.owner_decision === 'undecided')
    ) {
      await query(
        `INSERT INTO notifications (user_id, title, message, notification_type, related_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          visit.owner_id,
          'Tenant Interested',
          `A tenant is interested in ${visit.listing_title}. Tap to submit your decision.`,
          'tenant_interested',
          visitId,
        ]
      );
    }

    // Check mutual interest to notify both parties
    if (updated.tenant_decision === 'interested' && updated.owner_decision === 'interested') {
      // Mark listing as occupied to prevent further bookings
      try {
        await query('UPDATE listings SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE listing_id = $1', [updated.listing_id]);
      } catch (e) {
        console.error('Failed to mark listing occupied:', e);
      }

      await query(
        `INSERT INTO notifications (user_id, title, message, notification_type, related_id)
         VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)`,
        [
          updated.tenant_id,
          'Match Found',
          `You and the owner are both interested in ${visit.listing_title}. Proceed to finalize.`,
          'visit_match',
          visitId,
          visit.owner_id,
          'Match Found',
          `You and the tenant are both interested in ${visit.listing_title}. Proceed to finalize.`,
          'visit_match',
          visitId,
        ]
      );
    }

    res.json({ message: 'Decision recorded', visit: updated });
  } catch (error) {
    console.error('Submit decision error:', error);
    res.status(500).json({ error: 'Failed to record decision' });
  }
});

// Schedule a property visit
router.post('/', authenticateToken, requireTenant, async (req, res) => {
  try {
    const { listing_id, visit_datetime, visit_notes } = req.body;

    // Validation
    if (!listing_id || !visit_datetime) {
      return res.status(400).json({ error: 'Listing ID and visit datetime are required' });
    }

    // Check if listing exists and is active
    const listingResult = await query(
      'SELECT owner_id, is_active FROM listings WHERE listing_id = $1',
      [listing_id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (!listingResult.rows[0].is_active) {
      return res.status(400).json({ error: 'Listing is not available' });
    }

    // Check if visit datetime is in the future
    const visitDate = new Date(visit_datetime);
    if (visitDate <= new Date()) {
      return res.status(400).json({ error: 'Visit datetime must be in the future' });
    }

    // Check if tenant already has a scheduled visit for this listing
    const existingVisit = await query(
      'SELECT visit_id FROM visits WHERE listing_id = $1 AND tenant_id = $2 AND status = $3',
      [listing_id, req.user.user_id, 'scheduled']
    );

    if (existingVisit.rows.length > 0) {
      return res.status(400).json({ error: 'You already have a scheduled visit for this property' });
    }

    // Insert visit record
    const result = await query(
      `INSERT INTO visits (listing_id, tenant_id, visit_datetime, visit_notes, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [listing_id, req.user.user_id, visit_datetime, visit_notes || null, 'scheduled']
    );

    const visit = result.rows[0];

    // Create notification for owner
    await query(
      `INSERT INTO notifications (user_id, title, message, notification_type, related_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        listingResult.rows[0].owner_id,
        'New Visit Request',
        `A tenant has requested to visit your property on ${new Date(visit_datetime).toLocaleDateString()}`,
        'visit_request',
        visit.visit_id
      ]
    );

    res.status(201).json({
      message: 'Visit scheduled successfully',
      visit
    });

  } catch (error) {
    console.error('Schedule visit error:', error);
    res.status(500).json({ error: 'Failed to schedule visit' });
  }
});

// Get all visits for a user
router.get('/user', authenticateToken, async (req, res) => {
  try {
    let queryText, params;

    if (req.user.role === 'tenant') {
      // Get visits where user is the tenant with comprehensive property details
      queryText = `
        SELECT 
          v.*,
          l.title as listing_title,
          l.location as listing_location,
          l.price as listing_price,
          l.bedrooms,
          l.bathrooms,
          l.property_type,
          l.size,
          u.full_name as owner_name,
          u.phone as owner_phone,
          u.email as owner_email,
          lp.photo_url as listing_photo,
          COUNT(v2.visit_id) as total_visits_for_property
        FROM visits v
        LEFT JOIN listings l ON v.listing_id = l.listing_id
        LEFT JOIN users u ON l.owner_id = u.user_id
        LEFT JOIN listing_photos lp ON l.listing_id = lp.listing_id AND lp.is_primary = true
        LEFT JOIN visits v2 ON l.listing_id = v2.listing_id
        WHERE v.tenant_id = $1
        GROUP BY v.visit_id, l.listing_id, u.user_id, lp.photo_url
        ORDER BY v.visit_datetime DESC
      `;
      params = [req.user.user_id];
    } else if (req.user.role === 'owner') {
      // Get visits for properties owned by the user with comprehensive tenant details
      queryText = `
        SELECT 
          v.*,
          l.title as listing_title,
          l.location as listing_location,
          l.price as listing_price,
          l.bedrooms,
          l.bathrooms,
          l.property_type,
          l.size,
          u.full_name as tenant_name,
          u.phone as tenant_phone,
          u.email as tenant_email,
          u.kyc_status as tenant_kyc_status,
          lp.photo_url as listing_photo,
          COUNT(v2.visit_id) as total_visits_for_property
        FROM visits v
        LEFT JOIN listings l ON v.listing_id = l.listing_id
        LEFT JOIN users u ON v.tenant_id = u.user_id
        LEFT JOIN listing_photos lp ON l.listing_id = lp.listing_id AND lp.is_primary = true
        LEFT JOIN visits v2 ON l.listing_id = v2.listing_id
        WHERE l.owner_id = $1
        GROUP BY v.visit_id, l.listing_id, u.user_id, lp.photo_url
        ORDER BY v.visit_datetime DESC
      `;
      params = [req.user.user_id];
    } else {
      // Staff/Admin can see all visits with comprehensive details
      queryText = `
        SELECT 
          v.*,
          l.title as listing_title,
          l.location as listing_location,
          l.price as listing_price,
          l.bedrooms,
          l.bathrooms,
          l.property_type,
          l.size,
          u1.full_name as tenant_name,
          u1.phone as tenant_phone,
          u1.email as tenant_email,
          u1.kyc_status as tenant_kyc_status,
          u2.full_name as owner_name,
          u2.phone as owner_phone,
          u2.email as owner_email,
          u2.kyc_status as owner_kyc_status,
          lp.photo_url as listing_photo,
          COUNT(v2.visit_id) as total_visits_for_property
        FROM visits v
        LEFT JOIN listings l ON v.listing_id = l.listing_id
        LEFT JOIN users u1 ON v.tenant_id = u1.user_id
        LEFT JOIN users u2 ON l.owner_id = u2.user_id
        LEFT JOIN listing_photos lp ON l.listing_id = lp.listing_id AND lp.is_primary = true
        LEFT JOIN visits v2 ON l.listing_id = v2.listing_id
        GROUP BY v.visit_id, l.listing_id, u1.user_id, u2.user_id, lp.photo_url
        ORDER BY v.visit_datetime DESC
      `;
      params = [];
    }

    const result = await query(queryText, params);

    res.json({ visits: result.rows });

  } catch (error) {
    console.error('Get user visits error:', error);
    res.status(500).json({ error: 'Failed to fetch visits' });
  }
});

// Get visits for a specific listing
router.get('/listing/:listingId', authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.params;

    // Check if user has access to this listing
    const listingResult = await query(
      'SELECT owner_id FROM listings WHERE listing_id = $1',
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingResult.rows[0];
    
    // Only owner, staff, or admin can see visits for a listing
    if (listing.owner_id !== req.user.user_id && !['staff', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(
      `SELECT 
        v.*,
        u.full_name as tenant_name,
        u.phone as tenant_phone,
        u.email as tenant_email
       FROM visits v
       LEFT JOIN users u ON v.tenant_id = u.user_id
       WHERE v.listing_id = $1
       ORDER BY v.visit_datetime DESC`,
      [listingId]
    );

    res.json({ visits: result.rows });

  } catch (error) {
    console.error('Get listing visits error:', error);
    res.status(500).json({ error: 'Failed to fetch listing visits' });
  }
});

// Update visit status
router.put('/:visitId/status', authenticateToken, async (req, res) => {
  try {
    const { visitId } = req.params;
    const { status, repId, visitNotes, tenantFeedback, repFeedback } = req.body;

    // Validation
    if (!status || !['scheduled', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    // Get visit details
    const visitResult = await query(
      `SELECT v.*, l.owner_id, l.title as listing_title
       FROM visits v
       LEFT JOIN listings l ON v.listing_id = l.listing_id
       WHERE v.visit_id = $1`,
      [visitId]
    );

    if (visitResult.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    const visit = visitResult.rows[0];

    // Check permissions
    const canUpdate = 
      req.user.user_id === visit.tenant_id || // Tenant can update their own visit
      req.user.user_id === visit.owner_id || // Owner can update visits for their property
      ['staff', 'admin'].includes(req.user.role); // Staff/Admin can update any visit

    if (!canUpdate) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update visit
    const updateFields = { status };
    if (repId) updateFields.rep_id = repId;
    if (visitNotes) updateFields.visit_notes = visitNotes;
    if (tenantFeedback) updateFields.tenant_feedback = tenantFeedback;
    if (repFeedback) updateFields.rep_feedback = repFeedback;

    const setClause = Object.keys(updateFields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = [visitId, ...Object.values(updateFields)];

    const result = await query(
      `UPDATE visits 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE visit_id = $1
       RETURNING *`,
      values
    );

    const updatedVisit = result.rows[0];

    // Create notifications based on status change
    if (status === 'completed') {
      // Notify tenant
      await query(
        `INSERT INTO notifications (user_id, title, message, notification_type, related_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          visit.tenant_id,
          'Visit Completed',
          `Your visit to ${visit.listing_title} has been marked as completed`,
          'visit_completed',
          visitId
        ]
      );
    } else if (status === 'cancelled') {
      // Notify both parties
      await query(
        `INSERT INTO notifications (user_id, title, message, notification_type, related_id)
         VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)`,
        [
          visit.tenant_id,
          'Visit Cancelled',
          `Your visit to ${visit.listing_title} has been cancelled`,
          'visit_cancelled',
          visitId,
          visit.owner_id,
          'Visit Cancelled',
          `A visit to ${visit.listing_title} has been cancelled`,
          'visit_cancelled',
          visitId
        ]
      );
    }

    res.json({
      message: 'Visit status updated successfully',
      visit: updatedVisit
    });

  } catch (error) {
    console.error('Update visit status error:', error);
    res.status(500).json({ error: 'Failed to update visit status' });
  }
});

// Cancel a visit
router.post('/:visitId/cancel', authenticateToken, async (req, res) => {
  try {
    const { visitId } = req.params;
    const { reason } = req.body;

    // Get visit details
    const visitResult = await query(
      `SELECT v.*, l.owner_id, l.title as listing_title
       FROM visits v
       LEFT JOIN listings l ON v.listing_id = l.listing_id
       WHERE v.visit_id = $1`,
      [visitId]
    );

    if (visitResult.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    const visit = visitResult.rows[0];

    // Check permissions
    const canCancel = 
      req.user.user_id === visit.tenant_id || // Tenant can cancel their own visit
      req.user.user_id === visit.owner_id || // Owner can cancel visits for their property
      ['staff', 'admin'].includes(req.user.role); // Staff/Admin can cancel any visit

    if (!canCancel) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if visit can be cancelled
    if (visit.status !== 'scheduled') {
      return res.status(400).json({ error: 'Only scheduled visits can be cancelled' });
    }

    // Update visit status
    await query(
      'UPDATE visits SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE visit_id = $2',
      ['cancelled', visitId]
    );

    // Create notifications
    await query(
      `INSERT INTO notifications (user_id, title, message, notification_type, related_id)
       VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)`,
      [
        visit.tenant_id,
        'Visit Cancelled',
        `Your visit to ${visit.listing_title} has been cancelled${reason ? `: ${reason}` : ''}`,
        'visit_cancelled',
        visitId,
        visit.owner_id,
        'Visit Cancelled',
        `A visit to ${visit.listing_title} has been cancelled${reason ? `: ${reason}` : ''}`,
        'visit_cancelled',
        visitId
      ]
    );

    res.json({ message: 'Visit cancelled successfully' });

  } catch (error) {
    console.error('Cancel visit error:', error);
    res.status(500).json({ error: 'Failed to cancel visit' });
  }
});

// Assign staff/representative to a visit
router.put('/:visitId/assign-rep', authenticateToken, requireOwner, async (req, res) => {
  try {
    const { visitId } = req.params;
    const { repId } = req.body;

    if (!repId) {
      return res.status(400).json({ error: 'Representative ID is required' });
    }

    // Check if rep exists and is staff
    const repResult = await query(
      'SELECT user_id, role FROM users WHERE user_id = $1',
      [repId]
    );

    if (repResult.rows.length === 0) {
      return res.status(404).json({ error: 'Representative not found' });
    }

    if (!['staff', 'owner'].includes(repResult.rows[0].role)) {
      return res.status(400).json({ error: 'Representative must be staff or owner' });
    }

    // Check if visit exists and belongs to user's property
    const visitResult = await query(
      `SELECT v.*, l.owner_id
       FROM visits v
       LEFT JOIN listings l ON v.listing_id = l.listing_id
       WHERE v.visit_id = $1`,
      [visitId]
    );

    if (visitResult.rows.length === 0) {
      return res.status(404).json({ error: 'Visit not found' });
    }

    if (visitResult.rows[0].owner_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update visit with rep assignment
    const result = await query(
      `UPDATE visits 
       SET rep_id = $1, updated_at = CURRENT_TIMESTAMP
       WHERE visit_id = $2
       RETURNING *`,
      [repId, visitId]
    );

    // Notify the representative
    await query(
      `INSERT INTO notifications (user_id, title, message, notification_type, related_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        repId,
        'Visit Assignment',
        'You have been assigned to show a property visit',
        'visit_assignment',
        visitId
      ]
    );

    res.json({
      message: 'Representative assigned successfully',
      visit: result.rows[0]
    });

  } catch (error) {
    console.error('Assign rep error:', error);
    res.status(500).json({ error: 'Failed to assign representative' });
  }
});

// Get visit statistics for a listing
router.get('/listing/:listingId/stats', authenticateToken, requireListingOwnership, async (req, res) => {
  try {
    const { listingId } = req.params;

    const result = await query(
      `SELECT 
        COUNT(*) as total_visits,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_visits,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_visits,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_visits,
        AVG(CASE WHEN status = 'completed' THEN EXTRACT(EPOCH FROM (updated_at - created_at))/3600 END) as avg_visit_duration_hours
       FROM visits 
       WHERE listing_id = $1`,
      [listingId]
    );

    res.json({ stats: result.rows[0] });

  } catch (error) {
    console.error('Get visit stats error:', error);
    res.status(500).json({ error: 'Failed to fetch visit statistics' });
  }
});

module.exports = router;

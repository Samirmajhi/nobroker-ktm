const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireRole, requireKYC } = require('../middleware/auth');
const router = express.Router();

// Create new agreement
router.post('/', authenticateToken, requireKYC, async (req, res) => {
  try {
    const { 
      listingId, 
      tenantId, 
      rent, 
      deposit, 
      startDate, 
      endDate, 
      termsConditions,
      escrowEnabled 
    } = req.body;

    // Validation
    if (!listingId || !tenantId || !rent || !deposit || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user is owner of the listing
    const listingResult = await query(
      'SELECT owner_id FROM listings WHERE listing_id = $1',
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listingResult.rows[0].owner_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only listing owner can create agreements' });
    }

    // Check if agreement already exists
    const existingAgreement = await query(
      'SELECT agreement_id FROM agreements WHERE listing_id = $1 AND tenant_id = $2 AND status = $3',
      [listingId, tenantId, 'active']
    );

    if (existingAgreement.rows.length > 0) {
      return res.status(400).json({ error: 'Active agreement already exists for this tenant and listing' });
    }

    // Create agreement
    const result = await query(
      `INSERT INTO agreements 
       (listing_id, tenant_id, owner_id, signed_date, rent, deposit, 
        escrow_enabled, platform_fee, start_date, end_date, terms_conditions, status)
       VALUES ($1, $2, $3, CURRENT_DATE, $4, $5, $6, $7, $8, $9, $10, 'draft')
       RETURNING *`,
      [
        listingId, tenantId, req.user.user_id, rent, deposit, 
        escrowEnabled || false, 250.00, startDate, endDate, termsConditions
      ]
    );

    // Create platform fee payment record
    await query(
      `INSERT INTO payments 
       (tenant_id, owner_id, listing_id, agreement_id, amount, payment_type, status)
       VALUES ($1, $2, $3, $4, $5, 'platform_fee', 'pending')`,
      [tenantId, req.user.user_id, listingId, result.rows[0].agreement_id, 250.00]
    );

    res.status(201).json({
      message: 'Agreement created successfully',
      agreement: result.rows[0]
    });
  } catch (error) {
    console.error('Create agreement error:', error);
    res.status(500).json({ error: 'Failed to create agreement' });
  }
});

// Get agreements for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [req.user.user_id];
    let paramCount = 1;

    if (req.user.role === 'owner') {
      whereClause = 'WHERE owner_id = $1';
    } else if (req.user.role === 'tenant') {
      whereClause = 'WHERE tenant_id = $1';
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (status) {
      paramCount++;
      whereClause += ` AND status = $${paramCount}`;
      params.push(status);
    }

    const result = await query(
      `SELECT a.*, l.title as listing_title, l.location,
              u1.full_name as tenant_name, u2.full_name as owner_name
       FROM agreements a
       JOIN listings l ON a.listing_id = l.listing_id
       JOIN users u1 ON a.tenant_id = u1.user_id
       JOIN users u2 ON a.owner_id = u2.user_id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM agreements ${whereClause}`,
      params
    );

    res.json({
      agreements: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get agreements error:', error);
    res.status(500).json({ error: 'Failed to fetch agreements' });
  }
});

// Get agreement by ID
router.get('/:agreementId', authenticateToken, async (req, res) => {
  try {
    const { agreementId } = req.params;

    const result = await query(
      `SELECT a.*, l.title as listing_title, l.location, l.description,
              u1.full_name as tenant_name, u1.email as tenant_email, u1.phone as tenant_phone,
              u2.full_name as owner_name, u2.email as owner_email, u2.phone as owner_phone
       FROM agreements a
       JOIN listings l ON a.listing_id = l.listing_id
       JOIN users u1 ON a.tenant_id = u1.user_id
       JOIN users u2 ON a.owner_id = u2.user_id
       WHERE a.agreement_id = $1`,
      [agreementId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    const agreement = result.rows[0];

    // Check if user has access to this agreement
    if (agreement.tenant_id !== req.user.user_id && 
        agreement.owner_id !== req.user.user_id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ agreement });
  } catch (error) {
    console.error('Get agreement error:', error);
    res.status(500).json({ error: 'Failed to fetch agreement' });
  }
});

// Update agreement status
router.put('/:agreementId/status', authenticateToken, async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { status, agreementPdfUrl } = req.body;

    if (!['draft', 'active', 'expired', 'terminated'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get agreement details
    const agreementResult = await query(
      'SELECT * FROM agreements WHERE agreement_id = $1',
      [agreementId]
    );

    if (agreementResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    const agreement = agreementResult.rows[0];

    // Check if user has permission to update
    if (agreement.owner_id !== req.user.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update agreement
    const result = await query(
      `UPDATE agreements 
       SET status = $1, 
           agreement_pdf_url = COALESCE($2, agreement_pdf_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE agreement_id = $3
       RETURNING *`,
      [status, agreementPdfUrl, agreementId]
    );

    // If agreement is activated, create initial rent payment record
    if (status === 'active') {
      await query(
        `INSERT INTO payments 
         (tenant_id, owner_id, listing_id, agreement_id, amount, payment_type, status)
         VALUES ($1, $2, $3, $4, $5, 'rent', 'pending')`,
        [agreement.tenant_id, agreement.owner_id, agreement.listing_id, agreementId, agreement.rent]
      );

      // Create deposit payment record
      await query(
        `INSERT INTO payments 
         (tenant_id, owner_id, listing_id, agreement_id, amount, payment_type, status)
         VALUES ($1, $2, $3, $4, $5, 'deposit', 'pending')`,
        [agreement.tenant_id, agreement.owner_id, agreement.listing_id, agreementId, agreement.deposit]
      );
    }

    res.json({
      message: 'Agreement status updated successfully',
      agreement: result.rows[0]
    });
  } catch (error) {
    console.error('Update agreement status error:', error);
    res.status(500).json({ error: 'Failed to update agreement status' });
  }
});

// Sign agreement (tenant)
router.post('/:agreementId/sign', authenticateToken, requireRole('tenant'), async (req, res) => {
  try {
    const { agreementId } = req.params;
    const { digitalSignature } = req.body;

    if (!digitalSignature) {
      return res.status(400).json({ error: 'Digital signature is required' });
    }

    // Get agreement details
    const agreementResult = await query(
      'SELECT * FROM agreements WHERE agreement_id = $1',
      [agreementId]
    );

    if (agreementResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agreement not found' });
    }

    const agreement = agreementResult.rows[0];

    // Check if user is the tenant
    if (agreement.tenant_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if agreement is in draft status
    if (agreement.status !== 'draft') {
      return res.status(400).json({ error: 'Agreement is not in draft status' });
    }

    // Update agreement with tenant signature
    const result = await query(
      `UPDATE agreements 
       SET tenant_signed = true, tenant_signed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE agreement_id = $1
       RETURNING *`,
      [agreementId]
    );

    res.json({
      message: 'Agreement signed successfully',
      agreement: result.rows[0]
    });
  } catch (error) {
    console.error('Sign agreement error:', error);
    res.status(500).json({ error: 'Failed to sign agreement' });
  }
});

// Admin: Get all agreements
router.get('/admin/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    const result = await query(
      `SELECT a.*, l.title as listing_title, l.location,
              u1.full_name as tenant_name, u2.full_name as owner_name
       FROM agreements a
       JOIN listings l ON a.listing_id = l.listing_id
       JOIN users u1 ON a.tenant_id = u1.user_id
       JOIN users u2 ON a.owner_id = u2.user_id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM agreements a ${whereClause}`,
      params
    );

    res.json({
      agreements: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Admin get agreements error:', error);
    res.status(500).json({ error: 'Failed to fetch agreements' });
  }
});

module.exports = router;

const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireRole, requireKYC } = require('../middleware/auth');
const router = express.Router();

// Get payments for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, paymentType, page = 1, limit = 20 } = req.query;
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

    if (paymentType) {
      paramCount++;
      whereClause += ` AND payment_type = $${paramCount}`;
      params.push(paymentType);
    }

    const result = await query(
      `SELECT p.*, l.title as listing_title, l.location,
              u1.full_name as tenant_name, u2.full_name as owner_name
       FROM payments p
       JOIN listings l ON p.listing_id = l.listing_id
       JOIN users u1 ON p.tenant_id = u1.user_id
       JOIN users u2 ON p.owner_id = u2.user_id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM payments p ${whereClause}`,
      params
    );

    res.json({
      payments: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payment by ID
router.get('/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const result = await query(
      `SELECT p.*, l.title as listing_title, l.location,
              u1.full_name as tenant_name, u1.email as tenant_email,
              u2.full_name as owner_name, u2.email as owner_email
       FROM payments p
       JOIN listings l ON p.listing_id = l.listing_id
       JOIN users u1 ON p.tenant_id = u1.user_id
       JOIN users u2 ON p.owner_id = u2.user_id
       WHERE p.payment_id = $1`,
      [paymentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = result.rows[0];

    // Check if user has access to this payment
    if (payment.tenant_id !== req.user.user_id && 
        payment.owner_id !== req.user.user_id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Process payment (tenant initiates payment)
router.post('/:paymentId/process', authenticateToken, requireRole('tenant'), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod, transactionId } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    // Get payment details
    const paymentResult = await query(
      'SELECT * FROM payments WHERE payment_id = $1',
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Check if user is the tenant
    if (payment.tenant_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if payment is pending
    if (payment.status !== 'pending') {
      return res.status(400).json({ error: 'Payment is not in pending status' });
    }

    // Update payment status
    const result = await query(
      `UPDATE payments 
       SET status = 'completed', 
           payment_date = CURRENT_TIMESTAMP,
           payment_method = $1,
           transaction_id = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE payment_id = $3
       RETURNING *`,
      [paymentMethod, transactionId, paymentId]
    );

    // If this is a rent payment and escrow is enabled, schedule escrow release
    if (payment.payment_type === 'rent' && payment.escrow) {
      const escrowReleaseDate = new Date();
      escrowReleaseDate.setDate(escrowReleaseDate.getDate() + 7); // Release after 7 days

      await query(
        `UPDATE payments 
         SET escrow_release_date = $1, updated_at = CURRENT_TIMESTAMP
         WHERE payment_id = $1`,
        [escrowReleaseDate, paymentId]
      );
    }

    res.json({
      message: 'Payment processed successfully',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Release escrow (owner can release after agreement period)
router.post('/:paymentId/release-escrow', authenticateToken, requireRole('owner'), async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Get payment details
    const paymentResult = await query(
      'SELECT * FROM payments WHERE payment_id = $1',
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Check if user is the owner
    if (payment.owner_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if payment is in escrow
    if (!payment.escrow || payment.status !== 'completed') {
      return res.status(400).json({ error: 'Payment is not in escrow' });
    }

    // Check if escrow release date has passed
    if (payment.escrow_release_date && new Date() < new Date(payment.escrow_release_date)) {
      return res.status(400).json({ error: 'Escrow release date has not passed yet' });
    }

    // Release escrow
    const result = await query(
      `UPDATE payments 
       SET escrow = false, updated_at = CURRENT_TIMESTAMP
       WHERE payment_id = $1
       RETURNING *`,
      [paymentId]
    );

    res.json({
      message: 'Escrow released successfully',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Release escrow error:', error);
    res.status(500).json({ error: 'Failed to release escrow' });
  }
});

// Request refund (tenant can request refund for failed payments)
router.post('/:paymentId/refund', authenticateToken, requireRole('tenant'), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ error: 'Refund reason is required' });
    }

    // Get payment details
    const paymentResult = await query(
      'SELECT * FROM payments WHERE payment_id = $1',
      [paymentId]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Check if user is the tenant
    if (payment.tenant_id !== req.user.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if payment can be refunded
    if (payment.status !== 'completed' && payment.status !== 'failed') {
      return res.status(400).json({ error: 'Payment cannot be refunded' });
    }

    // Update payment status to refunded
    const result = await query(
      `UPDATE payments 
       SET status = 'refunded', updated_at = CURRENT_TIMESTAMP
       WHERE payment_id = $1
       RETURNING *`,
      [paymentId]
    );

    res.json({
      message: 'Refund requested successfully',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({ error: 'Failed to request refund' });
  }
});

// Admin: Get all payments
router.get('/admin/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { status, paymentType, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND p.status = $${paramCount}`;
      params.push(status);
    }

    if (paymentType) {
      paramCount++;
      whereClause += ` AND p.payment_type = $${paramCount}`;
      params.push(paymentType);
    }

    const result = await query(
      `SELECT p.*, l.title as listing_title, l.location,
              u1.full_name as tenant_name, u2.full_name as owner_name
       FROM payments p
       JOIN listings l ON p.listing_id = l.listing_id
       JOIN users u1 ON p.tenant_id = u1.user_id
       JOIN users u2 ON p.owner_id = u2.user_id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM payments p ${whereClause}`,
      params
    );

    res.json({
      payments: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Admin get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Admin: Update payment status
router.put('/:paymentId/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'completed', 'failed', 'refunded'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await query(
      `UPDATE payments 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE payment_id = $2
       RETURNING *`,
      [status, paymentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      message: 'Payment status updated successfully',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

// Get payment statistics for dashboard
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    let whereClause = '';
    let params = [req.user.user_id];

    if (req.user.role === 'owner') {
      whereClause = 'WHERE owner_id = $1';
    } else if (req.user.role === 'tenant') {
      whereClause = 'WHERE tenant_id = $1';
    } else {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get payment statistics
    const statsResult = await query(
      `SELECT 
         COUNT(*) as total_payments,
         COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_payments,
         COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_payments,
         COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_payments,
         SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
         SUM(CASE WHEN payment_type = 'rent' AND status = 'completed' THEN amount ELSE 0 END) as total_rent,
         SUM(CASE WHEN payment_type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END) as total_deposits
       FROM payments ${whereClause}`,
      params
    );

    res.json({ stats: statsResult.rows[0] });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

module.exports = router;

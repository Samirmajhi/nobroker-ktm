const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { readStatus, notificationType, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = $1';
    let params = [req.user.user_id];
    let paramCount = 1;

    if (readStatus !== undefined) {
      paramCount++;
      whereClause += ` AND read_status = $${paramCount}`;
      params.push(readStatus === 'true');
    }

    if (notificationType) {
      paramCount++;
      whereClause += ` AND notification_type = $${paramCount}`;
      params.push(notificationType);
    }

    const result = await query(
      `SELECT * FROM notifications 
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM notifications ${whereClause}`,
      params
    );

    // Get unread count
    const unreadResult = await query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_status = false',
      [req.user.user_id]
    );

    res.json({
      notifications: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      },
      unreadCount: parseInt(unreadResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await query(
      `UPDATE notifications 
       SET read_status = true, updated_at = CURRENT_TIMESTAMP
       WHERE notification_id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      message: 'Notification marked as read',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await query(
      `UPDATE notifications 
       SET read_status = true, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND read_status = false`,
      [req.user.user_id]
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Delete notification
router.delete('/:notificationId', authenticateToken, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await query(
      'DELETE FROM notifications WHERE notification_id = $1 AND user_id = $2 RETURNING *',
      [notificationId, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Create notification (internal use)
router.post('/create', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { userId, title, message, notificationType, relatedId } = req.body;

    if (!userId || !title || !message || !notificationType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await query(
      `INSERT INTO notifications (user_id, title, message, notification_type, related_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, title, message, notificationType, relatedId]
    );

    res.status(201).json({
      message: 'Notification created successfully',
      notification: result.rows[0]
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Bulk create notifications
router.post('/bulk-create', authenticateToken, requireRole(['admin', 'staff']), async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({ error: 'Notifications array is required' });
    }

    const createdNotifications = [];

    for (const notification of notifications) {
      const { userId, title, message, notificationType, relatedId } = notification;

      if (!userId || !title || !message || !notificationType) {
        continue; // Skip invalid notifications
      }

      const result = await query(
        `INSERT INTO notifications (user_id, title, message, notification_type, related_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [userId, title, message, notificationType, relatedId]
      );

      createdNotifications.push(result.rows[0]);
    }

    res.status(201).json({
      message: `${createdNotifications.length} notifications created successfully`,
      notifications: createdNotifications
    });
  } catch (error) {
    console.error('Bulk create notifications error:', error);
    res.status(500).json({ error: 'Failed to create notifications' });
  }
});

// Get notification preferences (if you want to implement notification preferences)
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    // For now, return default preferences
    // You can implement a user_preferences table for this
    res.json({
      preferences: {
        email: true,
        push: true,
        sms: false,
        types: {
          listing: true,
          visit: true,
          agreement: true,
          payment: true,
          system: true
        }
      }
    });
  } catch (error) {
    console.error('Get notification preferences error:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// Update notification preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body;

    // For now, just return success
    // You can implement a user_preferences table for this
    res.json({
      message: 'Preferences updated successfully',
      preferences
    });
  } catch (error) {
    console.error('Update notification preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Admin: Get all notifications
router.get('/admin/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { userId, notificationType, readStatus, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramCount = 0;

    if (userId) {
      paramCount++;
      whereClause += ` AND user_id = $${paramCount}`;
      params.push(userId);
    }

    if (notificationType) {
      paramCount++;
      whereClause += ` AND notification_type = $${paramCount}`;
      params.push(notificationType);
    }

    if (readStatus !== undefined) {
      paramCount++;
      whereClause += ` AND read_status = $${paramCount}`;
      params.push(readStatus === 'true');
    }

    const result = await query(
      `SELECT n.*, u.full_name as user_name, u.email as user_email
       FROM notifications n
       JOIN users u ON n.user_id = u.user_id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM notifications n ${whereClause}`,
      params
    );

    res.json({
      notifications: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Admin get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Admin: Delete notification
router.delete('/admin/:notificationId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { notificationId } = req.params;

    const result = await query(
      'DELETE FROM notifications WHERE notification_id = $1 RETURNING *',
      [notificationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Admin delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get notification statistics for dashboard
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    let whereClause = '';
    let params = [];

    if (req.user.role !== 'admin') {
      whereClause = 'WHERE user_id = $1';
      params = [req.user.user_id];
    }

    // Get notification statistics
    const statsResult = await query(
      `SELECT 
         COUNT(*) as total_notifications,
         COUNT(CASE WHEN read_status = false THEN 1 END) as unread_notifications,
         COUNT(CASE WHEN read_status = true THEN 1 END) as read_notifications,
         COUNT(CASE WHEN notification_type = 'listing' THEN 1 END) as listing_notifications,
         COUNT(CASE WHEN notification_type = 'visit' THEN 1 END) as visit_notifications,
         COUNT(CASE WHEN notification_type = 'agreement' THEN 1 END) as agreement_notifications,
         COUNT(CASE WHEN notification_type = 'payment' THEN 1 END) as payment_notifications
       FROM notifications ${whereClause}`,
      params
    );

    res.json({ stats: statsResult.rows[0] });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Failed to fetch notification statistics' });
  }
});

module.exports = router;

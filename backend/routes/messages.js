const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's conversations
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const result = await query(`
      SELECT 
        c.conversation_id,
        c.listing_id,
        c.last_message_at,
        l.title as listing_title,
        l.price as listing_price,
        l.owner_id,
        CASE 
          WHEN c.participant1_id = $1 THEN u2.full_name
          ELSE u1.full_name
        END as other_participant_name,
        CASE 
          WHEN c.participant1_id = $1 THEN u2.user_id
          ELSE u1.user_id
        END as other_participant_id,
        CASE 
          WHEN c.participant1_id = $1 THEN u2.profile_picture_url
          ELSE u1.profile_picture_url
        END as other_participant_avatar,
        CASE 
          WHEN c.participant1_id = $1 THEN u2.role
          ELSE u1.role
        END as other_participant_role,
        m.message_text as last_message,
        m.created_at as last_message_time,
        m.sender_id as last_message_sender_id,
        COUNT(CASE WHEN m.is_read = false AND m.sender_id != $1 THEN 1 END) as unread_count
      FROM conversations c
      LEFT JOIN users u1 ON c.participant1_id = u1.user_id
      LEFT JOIN users u2 ON c.participant2_id = u2.user_id
      LEFT JOIN listings l ON c.listing_id = l.listing_id
      LEFT JOIN LATERAL (
        SELECT message_text, created_at, sender_id, is_read
        FROM messages 
        WHERE conversation_id = c.conversation_id 
        ORDER BY created_at DESC
        LIMIT 1
      ) m ON true
      WHERE c.participant1_id = $1 OR c.participant2_id = $1
      GROUP BY c.conversation_id, c.listing_id, c.last_message_at, l.title, l.price, l.owner_id,
               u1.full_name, u1.user_id, u1.profile_picture_url, u1.role,
               u2.full_name, u2.user_id, u2.profile_picture_url, u2.role,
               m.message_text, m.created_at, m.sender_id, m.is_read
      ORDER BY c.last_message_at DESC
    `, [userId]);

    res.json({ conversations: result.rows });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.user_id;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is participant in conversation
    const conversationCheck = await query(`
      SELECT conversation_id FROM conversations 
      WHERE conversation_id = $1 AND (participant1_id = $2 OR participant2_id = $2)
    `, [conversationId, userId]);

    if (conversationCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    const offset = (page - 1) * limit;

    const result = await query(`
      SELECT 
        m.*,
        u.full_name as sender_name,
        u.profile_picture_url as sender_avatar,
        u.role as sender_role
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `, [conversationId, limit, offset]);

    // Mark messages as read
    await query(`
      UPDATE messages 
      SET is_read = true, read_at = CURRENT_TIMESTAMP 
      WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false
    `, [conversationId, userId]);

    res.json({ 
      messages: result.rows.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: result.rows.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageText, messageType = 'text' } = req.body;
    const userId = req.user.user_id;

    if (!messageText || messageText.trim().length === 0) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Verify user is participant in conversation
    const conversationCheck = await query(`
      SELECT c.*, l.owner_id, l.title as listing_title
      FROM conversations c
      JOIN listings l ON c.listing_id = l.listing_id
      WHERE c.conversation_id = $1 AND (c.participant1_id = $2 OR c.participant2_id = $2)
    `, [conversationId, userId]);

    if (conversationCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    const conversation = conversationCheck.rows[0];
    const otherParticipantId = conversation.participant1_id === userId 
      ? conversation.participant2_id 
      : conversation.participant1_id;

    // Insert message
    const messageResult = await query(`
      INSERT INTO messages (conversation_id, sender_id, message_text, message_type)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [conversationId, userId, messageText.trim(), messageType]);

    // Update conversation last_message_at
    await query(`
      UPDATE conversations 
      SET last_message_at = CURRENT_TIMESTAMP 
      WHERE conversation_id = $1
    `, [conversationId]);

    const message = messageResult.rows[0];

    // Get sender info
    const senderResult = await query(`
      SELECT full_name, profile_picture_url, role FROM users WHERE user_id = $1
    `, [userId]);

    // Create notification for the other participant
    const notificationTitle = 'New Message';
    const notificationMessage = `You have a new message from ${senderResult.rows[0].full_name} about ${conversation.listing_title}`;
    
    await query(`
      INSERT INTO notifications (user_id, title, message, notification_type, related_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [otherParticipantId, notificationTitle, notificationMessage, 'message', conversationId]);

    // Get the complete message with sender info
    const completeMessage = {
      ...message,
      sender_name: senderResult.rows[0].full_name,
      sender_avatar: senderResult.rows[0].profile_picture_url,
      sender_role: senderResult.rows[0].role
    };

    res.status(201).json({
      message: completeMessage,
      notification: {
        title: notificationTitle,
        message: notificationMessage,
        type: 'message',
        relatedId: conversationId
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Start a conversation
router.post('/conversations', async (req, res) => {
  try {
    const { listingId, otherUserId } = req.body;
    const userId = req.user.user_id;

    if (!listingId || !otherUserId) {
      return res.status(400).json({ error: 'Listing ID and other user ID are required' });
    }

    if (userId === otherUserId) {
      return res.status(400).json({ error: 'Cannot start conversation with yourself' });
    }

    // Verify the listing exists and get owner info
    const listingCheck = await query(`
      SELECT l.*, u.full_name as owner_name 
      FROM listings l 
      JOIN users u ON l.owner_id = u.user_id 
      WHERE l.listing_id = $1
    `, [listingId]);

    if (listingCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const listing = listingCheck.rows[0];

    // Check if conversation already exists
    const existingConversation = await query(`
      SELECT conversation_id FROM conversations 
      WHERE listing_id = $1 AND (
        (participant1_id = $2 AND participant2_id = $3) OR
        (participant1_id = $3 AND participant2_id = $2)
      )
    `, [listingId, userId, otherUserId]);

    if (existingConversation.rows.length > 0) {
      return res.json({ 
        conversation_id: existingConversation.rows[0].conversation_id,
        message: 'Conversation already exists'
      });
    }

    // Create new conversation
    const conversationResult = await query(`
      INSERT INTO conversations (listing_id, participant1_id, participant2_id)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [listingId, userId, otherUserId]);

    // Create notification for the other participant
    const notificationTitle = 'New Conversation Started';
    const notificationMessage = `Someone started a conversation about your property: ${listing.title}`;
    
    await query(`
      INSERT INTO notifications (user_id, title, message, notification_type, related_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [otherUserId, notificationTitle, notificationMessage, 'conversation', conversationResult.rows[0].conversation_id]);

    res.status(201).json({
      conversation: conversationResult.rows[0],
      message: 'Conversation started successfully',
      notification: {
        title: notificationTitle,
        message: notificationMessage,
        type: 'conversation',
        relatedId: conversationResult.rows[0].conversation_id
      }
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({ error: 'Failed to start conversation' });
  }
});

// Get unread message count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const result = await query(`
      SELECT COUNT(*) as unread_count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.conversation_id
      WHERE (c.participant1_id = $1 OR c.participant2_id = $1)
      AND m.sender_id != $1
      AND m.is_read = false
    `, [userId]);

    res.json({ unreadCount: parseInt(result.rows[0].unread_count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark conversation as read
router.put('/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.user_id;

    // Verify user is participant in conversation
    const conversationCheck = await query(`
      SELECT conversation_id FROM conversations 
      WHERE conversation_id = $1 AND (participant1_id = $2 OR participant2_id = $2)
    `, [conversationId, userId]);

    if (conversationCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Mark all messages as read
    await query(`
      UPDATE messages 
      SET is_read = true, read_at = CURRENT_TIMESTAMP 
      WHERE conversation_id = $1 AND sender_id != $2 AND is_read = false
    `, [conversationId, userId]);

    res.json({ message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Mark conversation read error:', error);
    res.status(500).json({ error: 'Failed to mark conversation as read' });
  }
});

// Get conversation participants
router.get('/conversations/:conversationId/participants', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.user_id;

    // Verify user is participant in conversation
    const conversationCheck = await query(`
      SELECT conversation_id FROM conversations 
      WHERE conversation_id = $1 AND (participant1_id = $2 OR participant2_id = $2)
    `, [conversationId, userId]);

    if (conversationCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    const result = await query(`
      SELECT 
        u.user_id,
        u.full_name,
        u.profile_picture_url,
        u.role,
        u.kyc_status,
        CASE 
          WHEN u.user_id = $2 THEN true
          ELSE false
        END as is_current_user
      FROM conversations c
      JOIN users u ON (c.participant1_id = u.user_id OR c.participant2_id = u.user_id)
      WHERE c.conversation_id = $1
      ORDER BY is_current_user DESC
    `, [conversationId, userId]);

    res.json({ participants: result.rows });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

module.exports = router;

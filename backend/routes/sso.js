const express = require('express');
const passport = require('../config/sso');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login?error=sso_failed' }),
  (req, res) => {
    // Generate JWT token for the authenticated user
    const token = jwt.sign(
      { userId: req.user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${token}&provider=google`);
  }
);


// SSO user info endpoint
router.get('/user-info', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({
    user: {
      user_id: req.user.user_id,
      full_name: req.user.full_name,
      email: req.user.email,
      role: req.user.role,
      kyc_status: req.user.kyc_status
    }
  });
});

// Get linked Google account
router.get('/linked-accounts', passport.authenticate('jwt', { session: false }), async (req, res) => {
  try {
    const { query } = require('../config/database');

    const result = await query(
      'SELECT provider, provider_id, created_at FROM sso_accounts WHERE user_id = $1 AND provider = $2',
      [req.user.user_id, 'google']
    );

    res.json({ linkedAccounts: result.rows });
  } catch (error) {
    console.error('Get linked accounts error:', error);
    res.status(500).json({ error: 'Failed to get linked accounts' });
  }
});

module.exports = router;

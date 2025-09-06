const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Prevent staff registration through normal registration
    if (role === 'staff' || role === 'admin') {
      return res.status(403).json({ error: 'Staff and admin accounts cannot be created through public registration' });
    }

    if (!['tenant', 'owner'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT user_id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, kyc_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, full_name, email, role, kyc_status, created_at`,
      [fullName, email, phone, passwordHash, role, role === 'owner' ? 'pending' : 'verified']
    );

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.user_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        kyc_status: newUser.kyc_status
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await query(
      'SELECT user_id, full_name, email, phone, password_hash, role, kyc_status, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        kyc_status: user.kyc_status
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT user_id, full_name, email, phone, role, kyc_status, 
              profile_picture_url, email_verified, phone_verified, created_at
       FROM users WHERE user_id = $1`,
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, phone, profilePictureUrl } = req.body;

    const result = await query(
      `UPDATE users 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           profile_picture_url = COALESCE($3, profile_picture_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4
       RETURNING user_id, full_name, email, phone, role, kyc_status, profile_picture_url`,
      [fullName, phone, profilePictureUrl, req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    // Get current password hash
    const result = await query(
      'SELECT password_hash FROM users WHERE user_id = $1',
      [req.user.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newPasswordHash, req.user.user_id]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Password change failed' });
  }
});

// Forgot password (send reset email)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const result = await query(
      'SELECT user_id, full_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token (in production, send email with reset link)
    const resetToken = jwt.sign(
      { userId: result.rows[0].user_id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // For now, just return success message
    res.json({ 
      message: 'Password reset instructions sent to your email',
      resetToken // Remove this in production
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Password reset request failed' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }

    // Verify reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [newPasswordHash, decoded.userId]
    );

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: 'Reset token expired' });
    }
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Password reset failed' });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Staff Login (Separate from normal login)
router.post('/staff-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await query(
      'SELECT user_id, full_name, email, phone, password_hash, role, kyc_status, is_active, profile_picture_url, email_verified, phone_verified, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if account is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Check if user is staff or admin
    if (!['staff', 'admin'].includes(user.role)) {
      return res.status(403).json({ error: 'Access denied. This login is only for staff and admin users.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Staff login successful',
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        kyc_status: user.kyc_status,
        profile_picture_url: user.profile_picture_url || null,
        email_verified: user.email_verified || false,
        phone_verified: user.phone_verified || false,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Staff login error:', error);
    res.status(500).json({ error: 'Staff login failed' });
  }
});

// Staff Creation (Admin Only)
router.post('/create-staff', authenticateToken, async (req, res) => {
  try {
    // Only admins can create staff accounts
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create staff accounts' });
    }

    const { fullName, email, phone, password, role } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['staff', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT user_id FROM users WHERE email = $1 OR phone = $2',
      [email, phone]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new staff/admin user
    const result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, kyc_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING user_id, full_name, email, role, kyc_status, created_at`,
      [fullName, email, phone, passwordHash, role, 'verified']
    );

    const newUser = result.rows[0];

    res.status(201).json({
      message: 'Staff account created successfully',
      user: {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        kyc_status: newUser.kyc_status
      }
    });

  } catch (error) {
    console.error('Staff creation error:', error);
    res.status(500).json({ error: 'Staff account creation failed' });
  }
});

module.exports = router;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { query } = require('./database');

// JWT Strategy for API authentication
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const result = await query(
      'SELECT user_id, full_name, email, role, kyc_status, is_active FROM users WHERE user_id = $1',
      [payload.userId]
    );

    if (result.rows.length === 0) {
      return done(null, false);
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let result = await query(
      'SELECT user_id, full_name, email, role, kyc_status FROM users WHERE email = $1',
      [profile.emails[0].value]
    );

    if (result.rows.length > 0) {
      // User exists, update profile picture if available
      const user = result.rows[0];
      if (profile.photos && profile.photos.length > 0) {
        await query(
          'UPDATE users SET profile_picture_url = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
          [profile.photos[0].value, user.user_id]
        );
      }
      return done(null, user);
    }

    // Create new user
    const newUser = {
      full_name: profile.displayName,
      email: profile.emails[0].value,
      phone: '', // Will need to be filled later
      password_hash: '', // No password for SSO users
      role: 'tenant', // Default role, can be changed later
      kyc_status: 'verified', // SSO users are pre-verified
      profile_picture_url: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
      email_verified: true,
      phone_verified: false
    };

    result = await query(
      `INSERT INTO users (full_name, email, phone, password_hash, role, kyc_status, profile_picture_url, email_verified, phone_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING user_id, full_name, email, role, kyc_status`,
      [newUser.full_name, newUser.email, newUser.phone, newUser.password_hash, newUser.role, 
       newUser.kyc_status, newUser.profile_picture_url, newUser.email_verified, newUser.phone_verified]
    );

    return done(null, result.rows[0]);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));


// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

// Deserialize user from session
passport.deserializeUser(async (userId, done) => {
  try {
    const result = await query(
      'SELECT user_id, full_name, email, role, kyc_status FROM users WHERE user_id = $1',
      [userId]
    );
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

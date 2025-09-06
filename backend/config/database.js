const { Pool } = require('pg');
require('dotenv').config();

// Database connection pool - PRODUCTION OPTIMIZED
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'no_broker_kathmandu',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'anish',
  max: parseInt(process.env.DB_POOL_MAX) || 100, // Increased for production
  min: parseInt(process.env.DB_POOL_MIN) || 10, // Minimum connections
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Increased timeout for production
  acquireTimeoutMillis: 10000, // Time to acquire connection
  createTimeoutMillis: 10000, // Time to create connection
  destroyTimeoutMillis: 5000, // Time to destroy connection
  reapIntervalMillis: 1000, // Check for idle connections every second
  createRetryIntervalMillis: 200, // Retry connection creation
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
  process.exit(-1);
});

// Force immediate connection test
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection test successful');
    client.release();
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    process.exit(-1);
  }
};

// Test connection immediately
testConnection();

// Helper function to run queries
const query = (text, params) => pool.query(text, params);

// Helper function to get a client from the pool
const getClient = () => pool.connect();

module.exports = {
  pool,
  query,
  getClient
};

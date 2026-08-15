const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Log connection events in development
if (config.NODE_ENV === 'development') {
  pool.on('connect', () => {
    console.log('📦 Database connection established');
  });

  pool.on('error', (err) => {
    console.error('❌ Unexpected database error:', err);
  });
}

// Helper for single queries
const query = (text, params) => pool.query(text, params);

// Helper for transactions
const getClient = () => pool.connect();

module.exports = { pool, query, getClient };

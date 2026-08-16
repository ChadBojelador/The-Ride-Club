const { Pool } = require('pg');
const config = require('../config');

const isLocal = !config.DATABASE_URL || config.DATABASE_URL.includes('localhost') || config.DATABASE_URL.includes('127.0.0.1');

const pool = new Pool({
  connectionString: config.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
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

const config = require('../config');

/**
 * Global error handler middleware.
 * Catches all errors and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error:', err.message);

  if (config.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details || err.message,
    });
  }

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Resource already exists',
    });
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Referenced resource not found',
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    error: config.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
};

module.exports = { errorHandler };

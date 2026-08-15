/**
 * Simple request body validation middleware.
 * Takes a schema object where keys are field names and values are config objects.
 *
 * Usage:
 *   validate({
 *     title: { type: 'string', required: true, maxLength: 200 },
 *     latitude: { type: 'number', required: true },
 *   })
 */
const validate = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];

    // Required check
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation if not provided and not required
    if (value === undefined || value === null) continue;

    // Type check
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    } else if (rules.type === 'number' && typeof value !== 'number') {
      errors.push(`${field} must be a number`);
    } else if (rules.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    } else if (rules.type === 'array' && !Array.isArray(value)) {
      errors.push(`${field} must be an array`);
    }

    // String length
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push(`${field} must be at most ${rules.maxLength} characters`);
    }

    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }

    // Number range
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }

    if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
      errors.push(`${field} must be at most ${rules.max}`);
    }

    // Enum
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  next();
};

module.exports = { validate };

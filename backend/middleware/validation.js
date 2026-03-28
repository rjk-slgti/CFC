const VALID_SCOPES = ['scope_1', 'scope_2', 'scope_3'];
const VALID_UNITS = {
  scope_1: ['liters', 'kg', 'cubic_meters', 'kwh'],
  scope_2: ['kwh', 'mwh', 'gj'],
  scope_3: ['kg', 'km', 'ream', 'usd', 'tonnes', 'cubic_meters'],
};
const MAX_QUANTITY = 1000000;
const MIN_QUANTITY = 0;

const sanitizeString = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[<>]/g, '');
};

const validateCalculationInput = (req, res, next) => {
  const errors = [];
  const { scope, sourceType, quantity, unit, dateFrom, dateTo } = req.body;

  // Scope validation
  if (!scope || !VALID_SCOPES.includes(scope)) {
    errors.push(`Scope must be one of: ${VALID_SCOPES.join(', ')}`);
  }

  // Source type validation
  if (!sourceType || typeof sourceType !== 'string' || sourceType.trim().length === 0) {
    errors.push('Source type is required and must be a non-empty string');
  } else if (sourceType.trim().length > 100) {
    errors.push('Source type cannot exceed 100 characters');
  }

  // Quantity validation
  if (quantity === undefined || quantity === null) {
    errors.push('Quantity is required');
  } else {
    const numQuantity = Number(quantity);
    if (isNaN(numQuantity)) {
      errors.push('Quantity must be a valid number');
    } else if (numQuantity < MIN_QUANTITY) {
      errors.push(`Quantity cannot be negative (minimum: ${MIN_QUANTITY})`);
    } else if (numQuantity > MAX_QUANTITY) {
      errors.push(`Quantity exceeds maximum allowed value (${MAX_QUANTITY})`);
    } else if (!isFinite(numQuantity)) {
      errors.push('Quantity must be a finite number');
    }
  }

  // Unit validation
  if (!unit || typeof unit !== 'string' || unit.trim().length === 0) {
    errors.push('Unit is required');
  }

  // Date validation
  if (!dateFrom) {
    errors.push('Start date (dateFrom) is required');
  } else if (isNaN(new Date(dateFrom).getTime())) {
    errors.push('Start date has invalid format (use ISO 8601: YYYY-MM-DD)');
  }

  if (!dateTo) {
    errors.push('End date (dateTo) is required');
  } else if (isNaN(new Date(dateTo).getTime())) {
    errors.push('End date has invalid format (use ISO 8601: YYYY-MM-DD)');
  }

  if (dateFrom && dateTo && !isNaN(new Date(dateFrom).getTime()) && !isNaN(new Date(dateTo).getTime())) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    if (from > to) {
      errors.push('Start date cannot be after end date');
    }
    const daysDiff = (to - from) / (1000 * 60 * 60 * 24);
    if (daysDiff > 366) {
      errors.push('Date range cannot exceed 365 days');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Sanitize inputs
  req.body.sourceType = sanitizeString(sourceType).toLowerCase().replace(/\s+/g, '_');
  req.body.unit = sanitizeString(unit).toLowerCase();
  if (req.body.notes) {
    req.body.notes = sanitizeString(req.body.notes);
  }

  next();
};

const validateQueryParams = (req, res, next) => {
  const errors = [];
  const { page, limit, scope, status } = req.query;

  if (page !== undefined) {
    const pageNum = parseInt(page, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('Page must be a positive integer');
    }
  }

  if (limit !== undefined) {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Limit must be between 1 and 100');
    }
  }

  if (scope !== undefined && !VALID_SCOPES.includes(scope)) {
    errors.push(`Scope must be one of: ${VALID_SCOPES.join(', ')}`);
  }

  if (status !== undefined && !['pending', 'approved', 'rejected'].includes(status)) {
    errors.push('Status must be pending, approved, or rejected');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      errors,
    });
  }

  next();
};

const validateIdParam = (req, res, next) => {
  const { id } = req.params;
  const mongoose = require('mongoose');

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }

  next();
};

module.exports = {
  validateCalculationInput,
  validateQueryParams,
  validateIdParam,
  VALID_SCOPES,
};

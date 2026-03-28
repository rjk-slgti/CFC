const AuditLog = require('../models/AuditLog');

const logAudit = async ({ userId, action, collection, recordId, oldValue, newValue, req, metadata = {} }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      collection,
      recordId,
      oldValue: oldValue || null,
      newValue: newValue || null,
      ipAddress: req?.ip || req?.connection?.remoteAddress || '',
      userAgent: req?.headers?.['user-agent'] || '',
      metadata,
    });
  } catch (error) {
    console.error('Audit log write failed:', error.message);
  }
};

const auditMiddleware = (action, collection) => {
  return async (req, res, next) => {
    req.auditContext = { action, collection };
    next();
  };
};

module.exports = { logAudit, auditMiddleware };

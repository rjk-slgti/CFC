const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'VALIDATE', 'CALCULATE', 'LOGIN', 'EXPORT'],
    required: [true, 'Action is required'],
  },
  collection: {
    type: String,
    required: [true, 'Collection name is required'],
    trim: true,
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Record ID is required'],
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  ipAddress: {
    type: String,
    default: '',
  },
  userAgent: {
    type: String,
    default: '',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ collection: 1, recordId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1 });

// Auto-delete logs older than 7 years (ISO compliance retention)
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 220752000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

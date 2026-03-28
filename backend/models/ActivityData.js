const mongoose = require('mongoose');

const activityDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  scope: {
    type: String,
    enum: {
      values: ['scope_1', 'scope_2', 'scope_3'],
      message: 'Scope must be scope_1, scope_2, or scope_3',
    },
    required: [true, 'Scope is required'],
  },
  sourceType: {
    type: String,
    required: [true, 'Source type is required'],
    trim: true,
    lowercase: true,
  },
  category: {
    type: String,
    trim: true,
    default: '',
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    max: [1000000, 'Quantity exceeds maximum allowed value'],
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
  },
  dateFrom: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  dateTo: {
    type: Date,
    required: [true, 'End date is required'],
  },
  measurementMethod: {
    type: String,
    enum: ['meter_reading', 'invoice', 'estimate', 'unknown'],
    default: 'unknown',
  },
  notes: {
    type: String,
    default: '',
    maxlength: [2000, 'Notes cannot exceed 2000 characters'],
  },
  attachments: [{
    filename: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  validatedAt: {
    type: Date,
    default: null,
  },
  rejectionReason: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

activityDataSchema.virtual('calculation', {
  ref: 'Calculation',
  localField: '_id',
  foreignField: 'activityId',
  justOne: true,
});

activityDataSchema.index({ scope: 1, dateFrom: 1 });
activityDataSchema.index({ userId: 1, createdAt: -1 });
activityDataSchema.index({ status: 1 });
activityDataSchema.index({ sourceType: 1 });
activityDataSchema.index({ scope: 1, dateFrom: 1, status: 1 });

activityDataSchema.pre('validate', function (next) {
  if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
    return next(new Error('Start date cannot be after end date'));
  }
  next();
});

module.exports = mongoose.model('ActivityData', activityDataSchema);

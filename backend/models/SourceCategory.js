/**
 * SourceCategory Model
 * Intelligent classification of emission sources
 * Supports hierarchical categorization and auto-selection
 */
const mongoose = require('mongoose');

const sourceCategorySchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  categoryName: {
    type: String,
    required: true,
    trim: true,
  },
  scope: {
    type: String,
    enum: ['scope_1', 'scope_2', 'scope_3'],
    required: true,
  },
  parentCategory: {
    type: String,
    default: null,
  },
  sourceTypes: [{
    sourceTypeId: String,
    sourceTypeName: String,
    unit: String,
    defaultEmissionFactorId: mongoose.Schema.Types.ObjectId,
    description: String,
  }],
  description: {
    type: String,
    trim: true,
  },
  ghgProtocolCategory: {
    type: String,
    trim: true,
    default: '',
  },
  ipccCategory: {
    type: String,
    trim: true,
    default: '',
  },
  materialityThreshold: {
    type: Number,
    description: 'Threshold % for materiality assessment',
    default: 5,
  },
  dataQualitySuggestion: {
    methodTier1: String,
    methodTier2: String,
    methodTier3: String,
  },
  estimationMethod: {
    type: String,
    enum: ['activity_data', 'spend_based', 'average_based', 'calculation_tool'],
    default: 'activity_data',
  },
  applicableRegions: {
    type: [String],
    default: ['global'],
  },
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validTo: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

sourceCategorySchema.index({ scope: 1, categoryId: 1 });
sourceCategorySchema.index({ scope: 1, 'sourceTypes.sourceTypeId': 1 });

module.exports = mongoose.model('SourceCategory', sourceCategorySchema);

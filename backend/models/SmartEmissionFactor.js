/**
 * SmartEmissionFactor Model
 * Enhanced emission factors with intelligence features
 * Supports automatic selection, uncertainty tracking, and multi-standard compliance
 */
const mongoose = require('mongoose');

const smartEmissionFactorSchema = new mongoose.Schema({
  factorCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  scope: {
    type: String,
    enum: ['scope_1', 'scope_2', 'scope_3'],
    required: true,
  },
  sourceType: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true,
  },
  sourceTypeCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SourceCategory',
  },
  gasType: {
    type: String,
    enum: ['CO2', 'CH4', 'N2O', 'SF6', 'CF4', 'C2F6', 'HFC', 'PFC'],
    required: true,
  },
  // Core Factor
  factorValue: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
    trim: true,
  },
  // Uncertainty Quantification
  uncertainty: {
    type: {
      type: String,
      enum: ['percentage', 'absolute'],
      default: 'percentage',
    },
    lowerBound: Number,
    upperBound: Number,
    rationale: String,
  },
  // QA/QC
  dataQualityTier: {
    type: String,
    enum: ['tier1', 'tier2', 'tier3'],
    description: 'Tier 1: High accuracy; Tier 3: Estimate-based',
    default: 'tier2',
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 75,
    description: 'Expert confidence in this factor (0-100)',
  },
  // Standards Compliance
  standards: [{
    standardId: String,
    standardName: String,
    compliant: Boolean,
    notes: String,
  }],
  // Region & Applicability
  applicableRegions: {
    type: [String],
    default: ['global'],
  },
  applicableCountries: {
    type: [String],
    default: [],
  },
  applicableConditions: {
    type: String,
    description: 'Special conditions (e.g., grid type, technology)',
    default: '',
  },
  // Metadata
  source: {
    type: String,
    required: true,
    trim: true,
  },
  sourceReference: {
    type: String,
    description: 'DOI or URL to original source',
    trim: true,
  },
  year: {
    type: Number,
    required: true,
  },
  validFrom: {
    type: Date,
    default: Date.now,
  },
  validTo: {
    type: Date,
    default: null,
  },
  // Relationships & Equivalence
  equivalentFactors: [{
    factorId: mongoose.Schema.Types.ObjectId,
    reason: String,
  }],
  parentFactor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmartEmissionFactor',
    description: 'Reference factor if this is derived',
  },
  // Special Cases
  gwp: {
    type: Number,
    description: 'Direct GWP value for special cases (e.g., refrigerants)',
    default: null,
  },
  isDefault: {
    type: Boolean,
    default: false,
    description: 'Flag for smart auto-selection',
  },
  preferenceRank: {
    type: Number,
    description: 'Priority for auto-selection (1=highest)',
    default: 999,
  },
  // Methodology
  calculationMethod: {
    type: String,
    enum: ['direct_measurement', 'calculation_tool', 'literature', 'estimation'],
    default: 'literature',
  },
  temperture: String, // e.g., for electricity mix variations
  fuelMix: String, // e.g., coal%, gas%, renewable%
  
  // Activity Level Adjustments
  activityModifiers: [{
    condition: String,
    modifier: Number,
    description: String,
  }],

  // Metadata
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  lastVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  lastVerifiedAt: Date,
  notes: {
    type: String,
    maxlength: 5000,
  },
}, {
  timestamps: true,
});

// Indexes for performance
smartEmissionFactorSchema.index({ scope: 1, sourceType: 1, gasType: 1, year: -1 });
smartEmissionFactorSchema.index({ sourceType: 1, applicableRegions: 1 });
smartEmissionFactorSchema.index({ isActive: 1, isDefault: 1 });
smartEmissionFactorSchema.index({ dataQualityTier: 1 });
smartEmissionFactorSchema.index({ year: -1 });

module.exports = mongoose.model('SmartEmissionFactor', smartEmissionFactorSchema);

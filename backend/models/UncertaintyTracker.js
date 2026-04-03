/**
 * UncertaintyTracker Model
 * Tracks data quality and uncertainty for each calculation
 * Supports ISO 14064-2 and IPCC uncertainty guidelines
 */
const mongoose = require('mongoose');

const uncertaintyTrackerSchema = new mongoose.Schema({
  calculationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Calculation',
    required: true,
    unique: true,
  },
  activityDataId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityData',
    required: true,
  },
  // Data Quality Indicators (DQI)
  dqi: {
    completenes: {
      type: Number,
      min: 0,
      max: 100,
      description: '% of required data available',
    },
    consistency: {
      type: Number,
      min: 0,
      max: 100,
      description: 'Consistency with historical data',
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      description: 'Measurement accuracy level',
    },
    temporalCoverage: {
      type: Number,
      min: 0,
      max: 100,
      description: '% temporal period covered',
    },
    geographicalCoverage: {
      type: Number,
      min: 0,
      max: 100,
      description: '% of operations/sites covered',
    },
  },
  // Uncertainty Quantification
  uncertaintyAnalysis: {
    activityDataUncertainty: {
      type: Number,
      description: 'Uncertainty in activity data (%)',
    },
    emissionFactorUncertainty: {
      type: Number,
      description: 'Uncertainty in emission factor (%)',
    },
    combinedUncertainty: {
      type: Number,
      description: 'Combined uncertainty (%)',
    },
    methodologyNote: String,
  },
  // Confidence Intervals
  confidenceInterval: {
    lower: Number,
    upper: Number,
    confidenceLevel: {
      type: String,
      enum: ['68%', '95%', '99%'],
      default: '95%',
    },
  },
  // Impact Assessment
  impactOnTotal: {
    percentageOfTotal: {
      type: Number,
      description: '% contribution to total emissions',
    },
    materiality: {
      type: Boolean,
      description: 'Is this material (>5% of total)?',
    },
  },
  // Measurement Method Quality
  measurementMethodQuality: {
    methodUsed: {
      type: String,
      enum: ['meter_reading', 'invoice', 'estimate', 'calculation', 'monitoring'],
      default: 'invoice',
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    rationale: String,
  },
  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['not_verified', 'self_declared', 'tier1_verified', 'tier2_verified', 'third_party_audited'],
    default: 'not_verified',
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verifiedAt: Date,
  verificationNotes: String,

  // Sensitivity Analysis
  sensitivityAnalysis: {
    factorVariation: {
      low: Number,
      high: Number,
    },
    impactIfFactorChanges: {
      percentChange: Number,
      description: String,
    },
  },

  // Recommendations
  recommendations: {
    dataImprovementPriority: {
      type: String,
      enum: ['low', 'medium', 'high'],
    },
    suggestedMeasurements: [String],
    suggestedFactorUpgrade: String,
  },

  status: {
    type: String,
    enum: ['pending', 'reviewed', 'approved', 'flagged'],
    default: 'pending',
  },
}, {
  timestamps: true,
});

uncertaintyTrackerSchema.index({ calculationId: 1 });
uncertaintyTrackerSchema.index({ activityDataId: 1 });
uncertaintyTrackerSchema.index({ 'dqi.completenes': 1 });
uncertaintyTrackerSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('UncertaintyTracker', uncertaintyTrackerSchema);

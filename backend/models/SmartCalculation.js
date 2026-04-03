/**
 * SmartCalculation Model
 * Enhanced calculation with intelligent metadata and ISO 14064 compliance tracking
 */
const mongoose = require('mongoose');

const smartCalculationSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityData',
    required: true,
    index: true,
  },
  scope: {
    type: String,
    enum: ['scope_1', 'scope_2', 'scope_3'],
    required: true,
  },
  sourceType: {
    type: String,
    required: true,
  },

  // Multi-Gas Emissions
  emissions: {
    co2: {
      value: Number,
      unit: String,
      factorId: mongoose.Schema.Types.ObjectId,
      factorUsed: Number,
    },
    ch4: {
      value: Number,
      unit: String,
      factorId: mongoose.Schema.Types.ObjectId,
      factorUsed: Number,
    },
    n2o: {
      value: Number,
      unit: String,
      factorId: mongoose.Schema.Types.ObjectId,
      factorUsed: Number,
    },
  },

  // CO2e Calculation with GWP Tracking
  co2e: {
    total: Number,
    gwpUsed: {
      co2: { type: Number, default: 1 },
      ch4: { type: Number, default: 28 },
      n2o: { type: Number, default: 265 },
    },
    gwpStandard: {
      type: String,
      enum: ['IPCC_AR5', 'IPCC_AR6', 'GHG_PROTOCOL'],
      default: 'IPCC_AR5',
    },
  },

  // Calculation Metadata
  calculationMethod: {
    type: {
      type: String,
      enum: ['direct_calculation', 'tool_assisted', 'simplified', 'estimation'],
      default: 'direct_calculation',
    },
    formula: String,
    adjustmentFactors: [
      {
        name: String,
        value: Number,
        rationale: String,
      },
    ],
  },

  // Factors Used
  factorsUsed: [{
    factorId: mongoose.Schema.Types.ObjectId,
    gasType: String,
    factorValue: Number,
    source: String,
    year: Number,
    region: String,
    dataQualityTier: String,
    confidenceScore: Number,
  }],

  // Standards Compliance
  standardsApplied: {
    primary: {
      standardId: String,
      standardName: String,
      compliant: Boolean,
    },
    secondary: [
      {
        standardId: String,
        standardName: String,
        compliant: Boolean,
      },
    ],
  },

  // Quality Metrics
  qualityMetrics: {
    dataCompleteness: Number,
    factorRelevance: Number,
    methodologyAppropriateness: Number,
    overallQualityScore: Number,
  },

  // Uncertainty & Confidence
  uncertainty: {
    combinedUncertainty: Number,
    lowerBound: Number,
    upperBound: Number,
    confidenceLevel: String,
  },

  // Materiality Assessment
  materiality: {
    percentOfTotal: Number,
    isMaterial: Boolean,
    assessmentDate: Date,
  },

  // Verification & Approval
  approval: {
    approvedBy: mongoose.Schema.Types.ObjectId,
    approvedAt: Date,
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revision_requested'],
      default: 'pending',
    },
    approvalNotes: String,
  },

  // Audit Trail
  calculatedAt: {
    type: Date,
    default: Date.now,
  },
  calculatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  recalculatedAt: Date,
  recalculationReason: String,

  // References & Traceability
  references: {
    ipccMethod: String,
    ghgProtocolMethod: String,
    iso14064Reference: String,
  },

  // ISO 14064 Compliance Fields
  iso14064Compliance: {
    boundaryInclusion: Boolean,
    baselineYear: Number,
    baselineEmissions: Number,
    reductionTarget: Number,
    targetYear: Number,
  },

  status: {
    type: String,
    enum: ['draft', 'calculated', 'verified', 'approved', 'archived'],
    default: 'calculated',
  },

  notes: {
    type: String,
    maxlength: 5000,
  },
}, {
  timestamps: true,
});

smartCalculationSchema.index({ activityId: 1 });
smartCalculationSchema.index({ scope: 1, calculatedAt: -1 });
smartCalculationSchema.index({ sourceType: 1 });
smartCalculationSchema.index({ 'approval.approvalStatus': 1 });
smartCalculationSchema.index({ 'materiality.isMaterial': 1 });

module.exports = mongoose.model('SmartCalculation', smartCalculationSchema);

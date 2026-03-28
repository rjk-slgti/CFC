const mongoose = require('mongoose');

const calculationSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityData',
    required: [true, 'Activity ID is required'],
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
  co2: {
    type: Number,
    required: [true, 'CO2 emission is required'],
    min: 0,
  },
  ch4: {
    type: Number,
    required: [true, 'CH4 emission is required'],
    min: 0,
  },
  n2o: {
    type: Number,
    required: [true, 'N2O emission is required'],
    min: 0,
  },
  co2e: {
    type: Number,
    required: [true, 'CO2e is required'],
    min: 0,
  },
  factorUsed: {
    co2Factor: { type: Number, required: true },
    ch4Factor: { type: Number, default: 0 },
    n2oFactor: { type: Number, default: 0 },
    source: { type: String, required: true },
    year: { type: Number, required: true },
    region: { type: String, default: 'global' },
  },
  gwpValues: {
    co2: { type: Number, default: 1 },
    ch4: { type: Number, default: 28 },
    n2o: { type: Number, default: 265 },
  },
  qualityScore: {
    type: Number,
    default: null,
    min: 0,
    max: 100,
  },
  calculatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

calculationSchema.index({ scope: 1, calculatedAt: -1 });
calculationSchema.index({ sourceType: 1 });
calculationSchema.index({ calculatedAt: -1 });
calculationSchema.index({ 'factorUsed.source': 1 });

module.exports = mongoose.model('Calculation', calculationSchema);

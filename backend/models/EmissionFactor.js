const mongoose = require('mongoose');

const emissionFactorSchema = new mongoose.Schema({
  scope: {
    type: String,
    enum: ['scope_1', 'scope_2', 'scope_3'],
    required: [true, 'Scope is required'],
  },
  sourceType: {
    type: String,
    required: [true, 'Source type is required'],
    trim: true,
    lowercase: true,
  },
  gasType: {
    type: String,
    enum: ['CO2', 'CH4', 'N2O'],
    required: [true, 'Gas type is required'],
  },
  factorValue: {
    type: Number,
    required: [true, 'Factor value is required'],
    min: [0, 'Factor value cannot be negative'],
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
  },
  source: {
    type: String,
    required: [true, 'Source is required'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2000, 'Year must be 2000 or later'],
    max: [2100, 'Year must be 2100 or earlier'],
  },
  region: {
    type: String,
    default: 'global',
    trim: true,
  },
  gwp: {
    type: Number,
    default: null,
    description: 'Direct GWP value for special cases like refrigerants',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

emissionFactorSchema.index(
  { scope: 1, sourceType: 1, gasType: 1, year: 1, region: 1 },
  { unique: true }
);
emissionFactorSchema.index({ source: 1 });
emissionFactorSchema.index({ year: -1 });
emissionFactorSchema.index({ isActive: 1 });

module.exports = mongoose.model('EmissionFactor', emissionFactorSchema);

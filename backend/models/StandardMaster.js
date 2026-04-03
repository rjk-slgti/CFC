/**
 * StandardMaster Model
 * Tracks international standards and their requirements
 * Supports IPCC AR5, GHG Protocol, ISO 14064-1:2018
 */
const mongoose = require('mongoose');

const standardMasterSchema = new mongoose.Schema({
  standardId: {
    type: String,
    required: true,
    unique: true,
    enum: [
      'IPCC_AR5_2019_REFINEMENT',
      'GHG_PROTOCOL_CORPORATE',
      'ISO_14064_1_2018',
      'DEFRA_2024',
      'IVL_SCI',
    ],
  },
  standardName: {
    type: String,
    required: true,
    trim: true,
  },
  version: {
    type: String,
    required: true,
  },
  publishedYear: {
    type: Number,
    required: true,
  },
  applicableScopes: {
    type: [String],
    enum: ['scope_1', 'scope_2', 'scope_3'],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  sourceUrl: {
    type: String,
    trim: true,
  },
  gwpValues: {
    co2: { type: Number, default: 1 },
    ch4: { type: Number, default: 28 },
    n2o: { type: Number, default: 265 },
  },
  uncertaintyTier: {
    tier1: { min: Number, max: Number }, // ±25%
    tier2: { min: Number, max: Number }, // ±50%
    tier3: { min: Number, max: Number }, // ±100%
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('StandardMaster', standardMasterSchema);

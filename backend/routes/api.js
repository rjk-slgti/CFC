const express = require('express');
const router = express.Router();
const {
  calculateEmissions,
  getEmissions,
  getEmissionById,
  getSummary,
  validateEmission,
  deleteEmission,
  getQualityScore,
  getPredictions,
  getTargetFeasibility,
  getBenchmark,
} = require('../controllers/calculationController');
const { validateCalculationInput, validateQueryParams, validateIdParam } = require('../middleware/validation');

// Calculation
router.post('/calculate', validateCalculationInput, calculateEmissions);

// Emissions CRUD
router.get('/emissions', validateQueryParams, getEmissions);
router.get('/emissions/:id', validateIdParam, getEmissionById);
router.patch('/emissions/:id/validate', validateIdParam, validateEmission);
router.delete('/emissions/:id', validateIdParam, deleteEmission);

// Aggregation
router.get('/summary', getSummary);

// Data Quality
router.get('/quality/:calculationId', validateIdParam, getQualityScore);

// Predictive Analytics
router.get('/predictions', getPredictions);
router.get('/target-feasibility', getTargetFeasibility);

// Benchmarking
router.get('/benchmark', getBenchmark);

module.exports = router;

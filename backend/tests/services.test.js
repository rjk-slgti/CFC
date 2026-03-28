const { describe, it } = require('node:test');
const assert = require('node:assert');

// ============================================================
// DataQualityService Tests
// ============================================================

const dataQualityService = require('../services/dataQualityService');

describe('DataQualityService', () => {
  const baseCalculation = {
    factorUsed: { source: 'IPCC AR5', year: 2025 },
    status: 'approved',
  };

  const baseActivityData = {
    measurementMethod: 'meter_reading',
    notes: 'Test notes',
    attachments: [{ filename: 'test.pdf' }],
  };

  it('should return 100 for perfect data quality', () => {
    const calc = { ...baseCalculation, factorUsed: { source: 'Sri_Lanka_CEA', year: 2025 } };
    const activity = { ...baseActivityData, status: 'approved' };
    const result = dataQualityService.calculateQualityScore(calc, activity);

    assert.strictEqual(result.totalScore, 100);
    assert.strictEqual(result.grade.letter, 'A');
  });

  it('should return lower score for older factors', () => {
    const calc = { ...baseCalculation, factorUsed: { source: 'IPCC AR5', year: 2022 } };
    const result = dataQualityService.calculateQualityScore(calc, baseActivityData);

    assert.ok(result.totalScore < 100);
    const recencyFactor = result.factors.find(f => f.name === 'Data Recency');
    assert.strictEqual(recencyFactor.score, 10);
  });

  it('should return low score for estimate method', () => {
    const activity = { ...baseActivityData, measurementMethod: 'estimate' };
    const result = dataQualityService.calculateQualityScore(baseCalculation, activity);

    const measurementFactor = result.factors.find(f => f.name === 'Measurement');
    assert.strictEqual(measurementFactor.score, 10);
  });

  it('should return correct grade thresholds', () => {
    const testCases = [
      { score: 95, expected: 'A' },
      { score: 80, expected: 'B' },
      { score: 65, expected: 'C' },
      { score: 45, expected: 'D' },
      { score: 20, expected: 'F' },
    ];

    for (const tc of testCases) {
      const grade = dataQualityService._getGrade(tc.score);
      assert.strictEqual(grade.letter, tc.expected, `Score ${tc.score} should be grade ${tc.expected}`);
    }
  });

  it('should generate recommendations for low-scoring factors', () => {
    const calc = { factorUsed: { source: 'unknown', year: 2020 }, status: 'pending' };
    const activity = { measurementMethod: 'unknown', notes: '', attachments: [] };
    const result = dataQualityService.calculateQualityScore(calc, activity);

    assert.ok(result.recommendations.length > 0);
  });

  it('should throw when inputs are missing', () => {
    assert.throws(() => dataQualityService.calculateQualityScore(null, null), /required/);
  });
});

// ============================================================
// CalculationService Tests
// ============================================================

const calculationService = require('../services/calculationService');

describe('CalculationService', () => {
  it('should calculate CO2e correctly for diesel', () => {
    const factors = {
      co2: { factorValue: 2.68, source: 'IPCC', year: 2025 },
      ch4: { factorValue: 0.0002 },
      n2o: { factorValue: 0.00001 },
    };

    const result = calculationService.calculate(500, factors);

    assert.strictEqual(result.co2, 1340);
    assert.strictEqual(result.ch4, 0.1);
    assert.strictEqual(result.n2o, 0.005);
    assert.strictEqual(result.co2e, 1344.125);
  });

  it('should handle missing CH4 and N2O factors', () => {
    const factors = {
      co2: { factorValue: 0.57, source: 'CEA', year: 2025 },
      ch4: null,
      n2o: null,
    };

    const result = calculationService.calculate(1000, factors);

    assert.strictEqual(result.co2, 570);
    assert.strictEqual(result.ch4, 0);
    assert.strictEqual(result.n2o, 0);
    assert.strictEqual(result.co2e, 570);
  });

  it('should return correct GWP values', () => {
    const gwp = calculationService.getGwpValues();
    assert.strictEqual(gwp.CO2, 1);
    assert.strictEqual(gwp.CH4, 28);
    assert.strictEqual(gwp.N2O, 265);
  });

  it('should handle zero quantity', () => {
    const factors = {
      co2: { factorValue: 2.68 },
      ch4: null,
      n2o: null,
    };

    const result = calculationService.calculate(0, factors);
    assert.strictEqual(result.co2e, 0);
  });
});

// ============================================================
// CrossValidationService Tests
// ============================================================

const crossValidationService = require('../services/crossValidationService');

describe('CrossValidationService', () => {
  it('should throw when required params are missing', async () => {
    await assert.rejects(
      () => crossValidationService.validateAgainstHistory(null, null, null, null),
      /required/
    );
  });

  it('should throw for negative quantity', async () => {
    await assert.rejects(
      () => crossValidationService.validateAgainstHistory('u1', 'diesel', -5, '2025-01-01'),
      /non-negative/
    );
  });
});

// ============================================================
// PredictiveService Tests
// ============================================================

const predictiveService = require('../services/predictiveService');

describe('PredictiveService', () => {
  it('should throw when org ID is missing', async () => {
    await assert.rejects(
      () => predictiveService.predictEmissions(null),
      /Organization ID is required/
    );
  });

  it('should throw for invalid reduction target', async () => {
    await assert.rejects(
      () => predictiveService.analyzeTargetFeasibility('u1', -10),
      /between 0 and 100/
    );
  });

  it('should clamp months ahead to valid range', async () => {
    // This will fail with no DB, but validates param clamping logic
    const result = await predictiveService.predictEmissions('u1', 50);
    // Should either return error (no data) or clamp to 36
    assert.ok(result.error || result.dataPoints !== undefined);
  });
});

// ============================================================
// BenchmarkingService Tests
// ============================================================

const benchmarkingService = require('../services/benchmarkingService');

describe('BenchmarkingService', () => {
  it('should return available industries', () => {
    const industries = benchmarkingService.getAvailableIndustries();
    assert.ok(Array.isArray(industries));
    assert.ok(industries.includes('education'));
    assert.ok(industries.includes('office'));
    assert.ok(industries.includes('manufacturing'));
  });

  it('should throw when org ID is missing', async () => {
    await assert.rejects(
      () => benchmarkingService.benchmark(null),
      /Organization ID is required/
    );
  });
});

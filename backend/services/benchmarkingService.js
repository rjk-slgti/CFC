/**
 * BenchmarkingService - Compares organizational emissions against industry standards
 *
 * Provides context for emission figures by comparing against:
 *   - Industry averages
 *   - Top/bottom quartile benchmarks
 *   - Per-employee and per-area metrics
 */

const Calculation = require('../models/Calculation');
const ActivityData = require('../models/ActivityData');

// Industry benchmark database (in production, this would be an external data source)
const INDUSTRY_BENCHMARKS = Object.freeze({
  education: {
    global: { average: 150, topQuartile: 80, bottomQuartile: 250, perEmployee: 2.5, perSqMeter: 0.08 },
    'Sri Lanka': { average: 120, topQuartile: 65, bottomQuartile: 200, perEmployee: 2.0, perSqMeter: 0.06 },
  },
  manufacturing: {
    global: { average: 500, topQuartile: 250, bottomQuartile: 800, perEmployee: 8.0, perSqMeter: 0.25 },
    'Sri Lanka': { average: 400, topQuartile: 200, bottomQuartile: 650, perEmployee: 6.5, perSqMeter: 0.20 },
  },
  office: {
    global: { average: 100, topQuartile: 50, bottomQuartile: 180, perEmployee: 1.5, perSqMeter: 0.05 },
    'Sri Lanka': { average: 80, topQuartile: 40, bottomQuartile: 140, perEmployee: 1.2, perSqMeter: 0.04 },
  },
  retail: {
    global: { average: 200, topQuartile: 100, bottomQuartile: 350, perEmployee: 3.0, perSqMeter: 0.10 },
    'Sri Lanka': { average: 160, topQuartile: 80, bottomQuartile: 280, perEmployee: 2.5, perSqMeter: 0.08 },
  },
  healthcare: {
    global: { average: 350, topQuartile: 180, bottomQuartile: 550, perEmployee: 5.0, perSqMeter: 0.15 },
    'Sri Lanka': { average: 280, topQuartile: 140, bottomQuartile: 440, perEmployee: 4.0, perSqMeter: 0.12 },
  },
  hospitality: {
    global: { average: 300, topQuartile: 150, bottomQuartile: 500, perEmployee: 4.5, perSqMeter: 0.18 },
    'Sri Lanka': { average: 240, topQuartile: 120, bottomQuartile: 400, perEmployee: 3.5, perSqMeter: 0.14 },
  },
});

const DEFAULT_BENCHMARK = { average: 200, topQuartile: 100, bottomQuartile: 350, perEmployee: 3.0, perSqMeter: 0.10 };

class BenchmarkingService {
  /**
   * Benchmark an organization's emissions against industry standards.
   *
   * @param {string} organizationId - User/organization ID
   * @param {object} orgProfile - { industry, country, employeeCount, floorArea }
   * @returns {object} Benchmark results with rating and comparison
   */
  async benchmark(organizationId, orgProfile = {}) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const {
      industry = 'office',
      country = 'global',
      employeeCount = 1,
      floorArea = 1,
    } = orgProfile;

    const emissions = await this._getAnnualEmissions(organizationId);

    if (emissions.total === 0) {
      return {
        message: 'No emission data available for benchmarking',
        totalEmissions: 0,
      };
    }

    const benchmarks = this._getBenchmarks(industry, country);

    const perEmployee = employeeCount > 0 ? emissions.total / employeeCount : 0;
    const perSqMeter = floorArea > 0 ? emissions.total / floorArea : 0;

    const comparison = {
      totalVsAverage: this._percentDiff(emissions.total, benchmarks.average),
      perEmployeeVsAverage: this._percentDiff(perEmployee, benchmarks.perEmployee),
      perSqMeterVsAverage: this._percentDiff(perSqMeter, benchmarks.perSqMeter),
      performance: this._classifyPerformance(emissions.total, benchmarks),
    };

    const rating = this._calculateRating(comparison);

    return {
      organization: {
        total: Number(emissions.total.toFixed(4)),
        perEmployee: Number(perEmployee.toFixed(4)),
        perSqMeter: Number(perSqMeter.toFixed(4)),
        byScope: emissions.byScope,
      },
      industry: {
        name: industry,
        region: country,
        average: benchmarks.average,
        topQuartile: benchmarks.topQuartile,
        bottomQuartile: benchmarks.bottomQuartile,
        perEmployee: benchmarks.perEmployee,
        perSqMeter: benchmarks.perSqMeter,
      },
      comparison,
      rating,
      dataPoints: emissions.dataPoints,
    };
  }

  /**
   * Get available benchmark industries.
   */
  getAvailableIndustries() {
    return Object.keys(INDUSTRY_BENCHMARKS);
  }

  /**
   * Calculate annual emissions from approved calculations.
   */
  async _getAnnualEmissions(organizationId) {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const activities = await ActivityData.find({
      userId: organizationId,
      status: 'approved',
      dateFrom: { $gte: yearStart },
      dateTo: { $lte: yearEnd },
    }).lean();

    const activityIds = activities.map((a) => a._id);

    const calculations = await Calculation.find({
      activityId: { $in: activityIds },
    }).lean();

    const byScope = { scope_1: 0, scope_2: 0, scope_3: 0 };
    let total = 0;

    for (const calc of calculations) {
      total += calc.co2e;
      if (byScope[calc.scope] !== undefined) {
        byScope[calc.scope] += calc.co2e;
      }
    }

    return { total, byScope, dataPoints: calculations.length };
  }

  /**
   * Lookup benchmark data, falling back to global if regional not found.
   */
  _getBenchmarks(industry, country) {
    const industryData = INDUSTRY_BENCHMARKS[industry.toLowerCase()];
    if (!industryData) return DEFAULT_BENCHMARK;

    return industryData[country] || industryData.global || DEFAULT_BENCHMARK;
  }

  /**
   * Calculate percentage difference from benchmark average.
   */
  _percentDiff(value, benchmark) {
    if (benchmark === 0) return 0;
    return Number(((value - benchmark) / benchmark * 100).toFixed(2));
  }

  /**
   * Classify performance relative to quartile benchmarks.
   */
  _classifyPerformance(total, benchmarks) {
    if (total < benchmarks.topQuartile) return 'excellent';
    if (total < benchmarks.average) return 'good';
    if (total < benchmarks.bottomQuartile) return 'average';
    return 'poor';
  }

  /**
   * Assign a star rating based on performance classification.
   */
  _calculateRating(comparison) {
    const ratings = {
      excellent: { stars: 5, label: 'Industry Leader', color: 'green' },
      good: { stars: 4, label: 'Above Average', color: 'blue' },
      average: { stars: 3, label: 'Average', color: 'yellow' },
      poor: { stars: 2, label: 'Needs Improvement', color: 'red' },
    };
    return ratings[comparison.performance] || ratings.poor;
  }
}

module.exports = new BenchmarkingService();

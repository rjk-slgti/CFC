/**
 * PredictiveService - Forecasts future emissions based on historical data
 *
 * Implements:
 *   1. Linear regression for trend detection
 *   2. Seasonal decomposition for monthly patterns
 *   3. Confidence intervals based on data availability
 *   4. Reduction target feasibility analysis
 *
 * Time Complexity: O(n) for all operations where n = number of historical records
 * Space Complexity: O(m) where m = number of months in the dataset
 */

const Calculation = require('../models/Calculation');
const ActivityData = require('../models/ActivityData');

class PredictiveService {
  /**
   * Predict future emissions based on historical trends.
   *
   * @param {string} organizationId - User/organization ID
   * @param {number} monthsAhead - Number of months to forecast (default: 12)
   * @returns {object} Predictions, trend analysis, and seasonal factors
   */
  async predictEmissions(organizationId, monthsAhead = 12) {
    if (!organizationId) {
      throw new Error('Organization ID is required');
    }

    const clampedMonths = Math.min(Math.max(monthsAhead, 1), 36);

    const calculations = await Calculation.find({})
      .populate({
        path: 'activityId',
        match: { userId: organizationId },
        select: 'dateFrom dateTo quantity',
      })
      .sort({ calculatedAt: 1 })
      .lean();

    const validCalculations = calculations.filter((c) => c.activityId !== null);

    if (validCalculations.length < 6) {
      return {
        error: 'Insufficient data for predictions',
        message: 'Need at least 6 months of data for reliable forecasting',
        dataPoints: validCalculations.length,
        required: 6,
      };
    }

    const monthlyData = this._groupByMonth(validCalculations);

    if (monthlyData.length < 3) {
      return {
        error: 'Insufficient monthly data',
        message: 'Need at least 3 distinct months of data',
        monthsAvailable: monthlyData.length,
      };
    }

    const trend = this._calculateTrend(monthlyData);
    const seasonal = this._calculateSeasonality(monthlyData);
    const predictions = this._generatePredictions(monthlyData, trend, seasonal, clampedMonths);

    const currentAnnual = monthlyData.reduce((sum, m) => sum + m.total, 0);
    const predictedAnnual = predictions.slice(0, 12).reduce((sum, p) => sum + p.predicted, 0);

    return {
      predictions,
      trend: {
        direction: trend.slope >= 0 ? 'increasing' : 'decreasing',
        monthlyChange: Number(trend.slope.toFixed(4)),
        annualChange: Number((trend.slope * 12).toFixed(4)),
        rSquared: Number(trend.rSquared.toFixed(4)),
      },
      seasonal,
      currentAnnual: Number(currentAnnual.toFixed(4)),
      predictedAnnual: Number(predictedAnnual.toFixed(4)),
      dataPoints: validCalculations.length,
      monthsAnalyzed: monthlyData.length,
    };
  }

  /**
   * Analyze whether a reduction target is feasible given current trends.
   *
   * @param {string} organizationId - User/organization ID
   * @param {number} targetReduction - Percentage reduction target (e.g., 20 for 20%)
   * @returns {object} Feasibility analysis with recommendations
   */
  async analyzeTargetFeasibility(organizationId, targetReduction) {
    if (targetReduction <= 0 || targetReduction > 100) {
      throw new Error('Target reduction must be between 0 and 100 percent');
    }

    const predictions = await this.predictEmissions(organizationId, 24);

    if (predictions.error) {
      return { error: predictions.error, message: predictions.message };
    }

    const currentEmissions = predictions.currentAnnual;
    const targetEmissions = currentEmissions * (1 - targetReduction / 100);
    const reductionNeeded = currentEmissions - targetEmissions;
    const monthlyReduction = reductionNeeded / 12;

    const scopeAnalysis = await this._analyzeScopeDistribution(organizationId);
    const feasibility = this._assessFeasibility(reductionNeeded, scopeAnalysis, predictions.trend);
    const recommendations = this._generateReductionRecommendations(scopeAnalysis, reductionNeeded);

    return {
      currentEmissions: Number(currentEmissions.toFixed(4)),
      targetEmissions: Number(targetEmissions.toFixed(4)),
      reductionNeeded: Number(reductionNeeded.toFixed(4)),
      requiredMonthlyReduction: Number(monthlyReduction.toFixed(4)),
      feasibility,
      scopeAnalysis,
      recommendations,
      trend: predictions.trend,
    };
  }

  /**
   * Group calculations by month and sum CO2e values.
   */
  _groupByMonth(calculations) {
    const monthMap = new Map();

    for (const calc of calculations) {
      const date = new Date(calc.activityId.dateFrom);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, { date: new Date(date.getFullYear(), date.getMonth(), 1), total: 0, count: 0 });
      }

      const entry = monthMap.get(key);
      entry.total += calc.co2e;
      entry.count += 1;
    }

    return Array.from(monthMap.values()).sort((a, b) => a.date - b.date);
  }

  /**
   * Simple linear regression (least squares) on monthly totals.
   * Returns slope, intercept, and R-squared for fit quality.
   */
  _calculateTrend(monthlyData) {
    const n = monthlyData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += monthlyData[i].total;
      sumXY += i * monthlyData[i].total;
      sumX2 += i * i;
      sumY2 += monthlyData[i].total * monthlyData[i].total;
    }

    const denominator = n * sumX2 - sumX * sumX;
    const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
    const intercept = (sumY - slope * sumX) / n;

    // R-squared calculation
    const meanY = sumY / n;
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < n; i++) {
      const predicted = slope * i + intercept;
      ssRes += Math.pow(monthlyData[i].total - predicted, 2);
      ssTot += Math.pow(monthlyData[i].total - meanY, 2);
    }
    const rSquared = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;

    return { slope, intercept, rSquared };
  }

  /**
   * Calculate seasonal adjustment factors per month (0-11).
   * A factor > 1 means above-average emissions, < 1 means below.
   */
  _calculateSeasonality(monthlyData) {
    const monthTotals = new Array(12).fill(null).map(() => ({ sum: 0, count: 0 }));

    for (const entry of monthlyData) {
      const month = entry.date.getMonth();
      monthTotals[month].sum += entry.total;
      monthTotals[month].count += 1;
    }

    const overallMean = monthlyData.reduce((sum, m) => sum + m.total, 0) / monthlyData.length;
    const factors = {};

    for (let m = 0; m < 12; m++) {
      if (monthTotals[m].count > 0) {
        const monthMean = monthTotals[m].sum / monthTotals[m].count;
        factors[m] = overallMean > 0 ? monthMean / overallMean : 1;
      } else {
        factors[m] = 1;
      }
    }

    return factors;
  }

  /**
   * Generate predictions by combining trend extrapolation with seasonal adjustment.
   */
  _generatePredictions(monthlyData, trend, seasonal, monthsAhead) {
    const predictions = [];
    const lastEntry = monthlyData[monthlyData.length - 1];
    const n = monthlyData.length;

    for (let i = 1; i <= monthsAhead; i++) {
      const futureDate = new Date(lastEntry.date);
      futureDate.setMonth(futureDate.getMonth() + i);

      const trendValue = trend.intercept + trend.slope * (n - 1 + i);
      const seasonalFactor = seasonal[futureDate.getMonth()] || 1;
      const predicted = Math.max(0, trendValue * seasonalFactor);

      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        month: futureDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        predicted: Number(predicted.toFixed(4)),
        confidence: this._calculateConfidence(n, i, trend.rSquared),
        trend: trend.slope >= 0 ? 'increasing' : 'decreasing',
        seasonalFactor: Number(seasonalFactor.toFixed(4)),
      });
    }

    return predictions;
  }

  /**
   * Confidence decreases with more data points (higher n) but decreases
   * with longer forecast horizons (higher monthsAhead).
   */
  _calculateConfidence(dataPoints, monthsAhead, rSquared) {
    const dataFactor = Math.min(dataPoints / 24, 1);
    const horizonFactor = Math.max(0, 1 - monthsAhead / 24);
    const fitFactor = rSquared;

    const confidence = (dataFactor * 0.3 + horizonFactor * 0.4 + fitFactor * 0.3) * 100;
    return Math.round(Math.min(Math.max(confidence, 0), 100));
  }

  /**
   * Analyze emissions distribution across scopes.
   */
  async _analyzeScopeDistribution(organizationId) {
    const calculations = await Calculation.find({})
      .populate({
        path: 'activityId',
        match: { userId: organizationId },
        select: 'scope sourceType',
      })
      .lean();

    const valid = calculations.filter((c) => c.activityId !== null);
    const total = valid.reduce((sum, c) => sum + c.co2e, 0);

    const scopeData = {
      scope_1: { total: 0, percentage: 0, sources: {} },
      scope_2: { total: 0, percentage: 0, sources: {} },
      scope_3: { total: 0, percentage: 0, sources: {} },
    };

    for (const calc of valid) {
      const scope = calc.scope;
      if (scopeData[scope]) {
        scopeData[scope].total += calc.co2e;
        const sourceType = calc.sourceType;
        scopeData[scope].sources[sourceType] = (scopeData[scope].sources[sourceType] || 0) + calc.co2e;
      }
    }

    for (const scope of Object.keys(scopeData)) {
      scopeData[scope].percentage = total > 0 ? Number(((scopeData[scope].total / total) * 100).toFixed(2)) : 0;
    }

    return scopeData;
  }

  /**
   * Assess feasibility of a reduction based on trends and scope distribution.
   */
  _assessFeasibility(reductionNeeded, scopeAnalysis, trend) {
    const totalEmissions = scopeAnalysis.scope_1.total + scopeAnalysis.scope_2.total + scopeAnalysis.scope_3.total;
    const reductionPercent = totalEmissions > 0 ? (reductionNeeded / totalEmissions) * 100 : 0;

    if (trend.direction === 'decreasing' && reductionPercent < 20) {
      return { level: 'feasible', label: 'Achievable with current trajectory', confidence: 'high' };
    }
    if (reductionPercent < 30) {
      return { level: 'moderate', label: 'Achievable with targeted interventions', confidence: 'medium' };
    }
    if (reductionPercent < 50) {
      return { level: 'challenging', label: 'Requires significant operational changes', confidence: 'low' };
    }
    return { level: 'ambitious', label: 'May require fundamental changes to operations', confidence: 'very_low' };
  }

  /**
   * Generate prioritized reduction recommendations based on scope analysis.
   */
  _generateReductionRecommendations(scopeAnalysis, reductionNeeded) {
    const recommendations = [];

    if (scopeAnalysis.scope_2.percentage > 30) {
      recommendations.push({
        scope: 'scope_2',
        action: 'Switch to renewable energy sources',
        potentialReduction: Number((scopeAnalysis.scope_2.total * 0.5).toFixed(4)),
        difficulty: 'medium',
        timeframe: '6-12 months',
        priority: 'high',
      });
    }

    if (scopeAnalysis.scope_1.sources.diesel_generator > 0) {
      recommendations.push({
        scope: 'scope_1',
        action: 'Upgrade to fuel-efficient or hybrid generators',
        potentialReduction: Number((scopeAnalysis.scope_1.sources.diesel_generator * 0.2).toFixed(4)),
        difficulty: 'high',
        timeframe: '12-24 months',
        priority: 'medium',
      });
    }

    if (scopeAnalysis.scope_3.sources.waste_landfill > 0) {
      recommendations.push({
        scope: 'scope_3',
        action: 'Implement recycling and waste reduction program',
        potentialReduction: Number((scopeAnalysis.scope_3.sources.waste_landfill * 0.6).toFixed(4)),
        difficulty: 'low',
        timeframe: '1-3 months',
        priority: 'high',
      });
    }

    if (scopeAnalysis.scope_3.sources.employee_commuting > 0) {
      recommendations.push({
        scope: 'scope_3',
        action: 'Promote remote work and carpooling programs',
        potentialReduction: Number((scopeAnalysis.scope_3.sources.employee_commuting * 0.3).toFixed(4)),
        difficulty: 'low',
        timeframe: '1-6 months',
        priority: 'medium',
      });
    }

    return recommendations.sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return (order[a.priority] || 2) - (order[b.priority] || 2);
    });
  }
}

module.exports = new PredictiveService();

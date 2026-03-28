/**
 * CrossValidationService - Validates new data against historical patterns
 *
 * Uses statistical methods (z-score, seasonal decomposition) to detect
 * anomalous values that may indicate data entry errors.
 *
 * Algorithm:
 *   1. Fetch last 12 entries for the same activity type
 *   2. Compute mean and standard deviation
 *   3. Calculate z-score of new value
 *   4. Flag if |z| > 3 (error) or |z| > 2 (warning)
 *   5. Check seasonal patterns by matching month
 */

const ActivityData = require('../models/ActivityData');

class CrossValidationService {
  /**
   * Validate a new quantity against historical data for the same activity type.
   *
   * @param {string} organizationId - Organization or user ID
   * @param {string} activityType - Source type (e.g., 'diesel_generator')
   * @param {number} quantity - The new quantity to validate
   * @param {string|Date} date - Date of the new entry
   * @returns {object} Validation result with warnings and statistics
   */
  async validateAgainstHistory(organizationId, activityType, quantity, date) {
    if (!organizationId || !activityType || quantity == null || !date) {
      throw new Error('All parameters are required: organizationId, activityType, quantity, date');
    }

    const numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity < 0) {
      throw new Error('Quantity must be a non-negative number');
    }

    const historical = await ActivityData.find({
      userId: organizationId,
      sourceType: activityType.toLowerCase(),
      status: { $ne: 'rejected' },
    })
      .sort({ dateTo: -1 })
      .limit(12)
      .lean();

    if (historical.length < 3) {
      return {
        valid: true,
        warnings: [],
        message: 'Insufficient historical data for validation (need at least 3 entries)',
        dataPoints: historical.length,
      };
    }

    const warnings = [];

    // Calculate statistical measures
    const quantities = historical.map((h) => h.quantity);
    const n = quantities.length;
    const mean = quantities.reduce((sum, val) => sum + val, 0) / n;
    const variance = quantities.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Avoid division by zero when all values are identical
    const zScore = stdDev > 0 ? Math.abs((numericQuantity - mean) / stdDev) : 0;

    // Flag outliers based on z-score thresholds
    if (zScore > 3) {
      warnings.push({
        level: 'error',
        message: `Quantity ${numericQuantity} is a significant outlier (z-score: ${zScore.toFixed(2)}). Historical average: ${mean.toFixed(2)} ± ${stdDev.toFixed(2)}`,
        suggestion: 'Please verify this value is correct before proceeding',
        zScore: Number(zScore.toFixed(4)),
      });
    } else if (zScore > 2) {
      warnings.push({
        level: 'warning',
        message: `Quantity ${numericQuantity} is unusually high/low (z-score: ${zScore.toFixed(2)}). Historical average: ${mean.toFixed(2)}`,
        suggestion: 'Double-check this measurement against source documents',
        zScore: Number(zScore.toFixed(4)),
      });
    }

    // Seasonal pattern analysis
    const entryMonth = new Date(date).getMonth();
    const sameMonthData = historical.filter((h) => new Date(h.dateFrom).getMonth() === entryMonth);

    if (sameMonthData.length >= 2) {
      const monthMean = sameMonthData.reduce((sum, h) => sum + h.quantity, 0) / sameMonthData.length;
      if (monthMean > 0) {
        const deviation = Math.abs(numericQuantity - monthMean) / monthMean;
        if (deviation > 0.5) {
          warnings.push({
            level: 'info',
            message: `This month's value deviates by ${(deviation * 100).toFixed(0)}% from the seasonal average (${monthMean.toFixed(2)})`,
            suggestion: 'Consider if seasonal variations explain this difference',
          });
        }
      }
    }

    // Check for negative trend (sudden drops)
    if (historical.length >= 6) {
      const recent3 = quantities.slice(0, 3);
      const previous3 = quantities.slice(3, 6);
      const recentMean = recent3.reduce((a, b) => a + b, 0) / recent3.length;
      const previousMean = previous3.reduce((a, b) => a + b, 0) / previous3.length;

      if (previousMean > 0 && recentMean / previousMean < 0.5) {
        warnings.push({
          level: 'info',
          message: 'Recent entries show a declining trend compared to earlier data',
          suggestion: 'Verify if this reduction is intentional (e.g., efficiency improvement)',
        });
      }
    }

    const hasErrors = warnings.some((w) => w.level === 'error');

    return {
      valid: !hasErrors,
      warnings,
      statistics: {
        mean: Number(mean.toFixed(4)),
        stdDev: Number(stdDev.toFixed(4)),
        zScore: Number(zScore.toFixed(4)),
        dataPoints: n,
        range: {
          min: Math.min(...quantities),
          max: Math.max(...quantities),
        },
      },
    };
  }
}

module.exports = new CrossValidationService();

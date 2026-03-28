/**
 * DataQualityService - Assesses the reliability of emission data
 *
 * Scoring dimensions (total: 100 points):
 *   1. Data Source (30 pts) - How authoritative the emission factor source is
 *   2. Data Recency (20 pts) - How recent the emission factor is
 *   3. Measurement Method (25 pts) - How the activity data was collected
 *   4. Validation Status (15 pts) - Whether data has been peer-reviewed
 *   5. Completeness (10 pts) - Supporting documentation
 */

const SOURCE_SCORES = Object.freeze({
  'Sri_Lanka_CEA': { score: 30, note: 'Local primary data' },
  'DEFRA': { score: 25, note: 'International standard (UK)' },
  'NGER': { score: 25, note: 'International standard (Australia)' },
  'IPCC': { score: 20, note: 'Global scientific consensus' },
  'EPA': { score: 22, note: 'US Environmental Protection Agency' },
  'EEIO': { score: 18, note: 'Economic input-output model' },
});

const DEFAULT_SOURCE_SCORE = { score: 15, note: 'Generic default' };

const MEASUREMENT_SCORES = Object.freeze({
  meter_reading: { score: 25, note: 'Direct meter reading' },
  invoice: { score: 20, note: 'Utility invoice' },
  estimate: { score: 10, note: 'Estimated value' },
  unknown: { score: 5, note: 'Unknown method' },
});

const VALIDATION_SCORES = Object.freeze({
  approved: 15,
  pending: 5,
  rejected: 0,
});

const GRADES = [
  { min: 90, letter: 'A', label: 'Excellent', color: 'green' },
  { min: 75, letter: 'B', label: 'Good', color: 'blue' },
  { min: 60, letter: 'C', label: 'Acceptable', color: 'yellow' },
  { min: 40, letter: 'D', label: 'Poor', color: 'orange' },
  { min: 0, letter: 'F', label: 'Unacceptable', color: 'red' },
];

class DataQualityService {
  /**
   * Calculate a comprehensive data quality score (0-100) for a calculation.
   *
   * @param {object} calculation - Calculation document with factorUsed, status
   * @param {object} activityData - ActivityData document with measurementMethod, notes, attachments
   * @returns {object} Quality assessment with score, grade, factors, and recommendations
   */
  calculateQualityScore(calculation, activityData) {
    if (!calculation || !activityData) {
      throw new Error('Both calculation and activityData are required');
    }

    let totalScore = 0;
    const factors = [];

    // Dimension 1: Data Source (30 points)
    const sourceFactor = calculation.factorUsed?.source || 'unknown';
    const sourceInfo = SOURCE_SCORES[sourceFactor] || DEFAULT_SOURCE_SCORE;
    totalScore += sourceInfo.score;
    factors.push({
      name: 'Data Source',
      score: sourceInfo.score,
      max: 30,
      note: sourceInfo.note,
    });

    // Dimension 2: Data Recency (20 points)
    const currentYear = new Date().getFullYear();
    const factorYear = calculation.factorUsed?.year || currentYear;
    const age = currentYear - factorYear;
    const recencyScore = age === 0 ? 20 : age === 1 ? 15 : age <= 3 ? 10 : 5;
    const recencyNote = age === 0 ? 'Current year' : age === 1 ? '1 year old' : `${age} years old`;
    totalScore += recencyScore;
    factors.push({
      name: 'Data Recency',
      score: recencyScore,
      max: 20,
      note: recencyNote,
    });

    // Dimension 3: Measurement Method (25 points)
    const method = activityData.measurementMethod || 'unknown';
    const methodInfo = MEASUREMENT_SCORES[method] || MEASUREMENT_SCORES.unknown;
    totalScore += methodInfo.score;
    factors.push({
      name: 'Measurement',
      score: methodInfo.score,
      max: 25,
      note: methodInfo.note,
    });

    // Dimension 4: Validation Status (15 points)
    const status = activityData.status || 'pending';
    const validationScore = VALIDATION_SCORES[status] ?? 0;
    totalScore += validationScore;
    factors.push({
      name: 'Validation',
      score: validationScore,
      max: 15,
      note: status === 'approved' ? 'Approved by trainer' : status === 'rejected' ? 'Rejected' : 'Pending validation',
    });

    // Dimension 5: Completeness (10 points)
    const hasNotes = !!(activityData.notes && activityData.notes.length > 0);
    const hasAttachment = !!(activityData.attachments && activityData.attachments.length > 0);
    let completenessScore = 0;
    let completenessNote = 'No documentation';
    if (hasNotes && hasAttachment) {
      completenessScore = 10;
      completenessNote = 'Notes + attachments';
    } else if (hasNotes || hasAttachment) {
      completenessScore = 5;
      completenessNote = 'Partial documentation';
    }
    totalScore += completenessScore;
    factors.push({
      name: 'Completeness',
      score: completenessScore,
      max: 10,
      note: completenessNote,
    });

    return {
      totalScore,
      maxScore: 100,
      percentage: totalScore,
      grade: this._getGrade(totalScore),
      factors,
      recommendations: this._getRecommendations(factors),
    };
  }

  /**
   * Assign a letter grade based on score thresholds.
   */
  _getGrade(score) {
    return GRADES.find((g) => score >= g.min) || GRADES[GRADES.length - 1];
  }

  /**
   * Generate improvement recommendations for factors scoring below 70% of their max.
   */
  _getRecommendations(factors) {
    const recommendations = [];
    const threshold = 0.7;

    for (const factor of factors) {
      if (factor.score < factor.max * threshold) {
        switch (factor.name) {
          case 'Data Source':
            recommendations.push('Consider using local (Sri Lanka CEA) or DEFRA emission factors for higher accuracy');
            break;
          case 'Data Recency':
            recommendations.push('Update to the most recent emission factor year');
            break;
          case 'Measurement':
            recommendations.push('Use direct meter readings or utility invoices instead of estimates');
            break;
          case 'Validation':
            recommendations.push('Submit data for trainer validation to improve reliability');
            break;
          case 'Completeness':
            recommendations.push('Add notes and supporting documents to improve traceability');
            break;
        }
      }
    }

    return recommendations;
  }
}

module.exports = new DataQualityService();

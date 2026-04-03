/**
 * Smart Calculation Engine Service
 * Intelligent emission calculations with:
 * - Auto-selection of best-fit emission factors
 * - Uncertainty quantification (IPCC Tier approach)
 * - Data quality assessment (ISO 14064 compliant)
 * - Multi-standard compliance tracking
 * - Regional customization
 */

const SmartEmissionFactor = require('../models/SmartEmissionFactor');
const SourceCategory = require('../models/SourceCategory');
const SmartCalculation = require('../models/SmartCalculation');
const UncertaintyTracker = require('../models/UncertaintyTracker');

class SmartCalculationEngine {
  /**
   * Intelligently select the best emission factor
   * Hierarchy: Region-specific -> Country-specific -> Global default
   */
  async selectOptimalFactor(scope, sourceType, gasType, region = 'global', country = null) {
    let factor = null;

    // Try 1: Country-specific factor (highest priority)
    if (country) {
      factor = await SmartEmissionFactor.findOne({
        scope,
        sourceType: sourceType.toLowerCase(),
        gasType,
        applicableCountries: country,
        isActive: true,
        isDefault: true,
      }).sort({ preferenceRank: 1 });
    }

    // Try 2: Region-specific factor
    if (!factor && region && region !== 'global') {
      factor = await SmartEmissionFactor.findOne({
        scope,
        sourceType: sourceType.toLowerCase(),
        gasType,
        applicableRegions: region,
        isActive: true,
        isDefault: true,
      }).sort({ preferenceRank: 1 });
    }

    // Try 3: Global default
    if (!factor) {
      factor = await SmartEmissionFactor.findOne({
        scope,
        sourceType: sourceType.toLowerCase(),
        gasType,
        applicableRegions: 'global',
        isActive: true,
        isDefault: true,
      }).sort({ preferenceRank: 1 });
    }

    // Try 4: Any available factor (last resort)
    if (!factor) {
      factor = await SmartEmissionFactor.findOne({
        scope,
        sourceType: sourceType.toLowerCase(),
        gasType,
        isActive: true,
      }).sort({ confidenceScore: -1 });
    }

    return factor;
  }

  /**
   * Calculate emissions with intelligent factor selection
   * Returns: { co2, ch4, n2o, co2e, factorsUsed, uncertainty, dataQuality }
   */
  async calculateWithIntelligence(activity, region = 'global', country = null) {
    const { scope, sourceType, quantity, unit } = activity;
    const gwpValues = { co2: 1, ch4: 28, n2o: 265 }; // IPCC AR5

    try {
      // Select optimal factors for each gas
      const co2Factor = await this.selectOptimalFactor(scope, sourceType, 'CO2', region, country);
      const ch4Factor = await this.selectOptimalFactor(scope, sourceType, 'CH4', region, country);
      const n2oFactor = await this.selectOptimalFactor(scope, sourceType, 'N2O', region, country);

      if (!co2Factor) {
        throw new Error(
          `No emission factors found for ${sourceType} in scope ${scope}. Please verify source type and add factors if needed.`
        );
      }

      // Perform calculations
      const emissions = {
        co2: {
          value: quantity * co2Factor.factorValue,
          factorId: co2Factor._id,
          factorUsed: co2Factor.factorValue,
        },
        ch4: {
          value: ch4Factor ? quantity * ch4Factor.factorValue : 0,
          factorId: ch4Factor ? ch4Factor._id : null,
          factorUsed: ch4Factor ? ch4Factor.factorValue : 0,
        },
        n2o: {
          value: n2oFactor ? quantity * n2oFactor.factorValue : 0,
          factorId: n2oFactor ? n2oFactor._id : null,
          factorUsed: n2oFactor ? n2oFactor.factorValue : 0,
        },
      };

      // CO2e Calculation
      const co2e = {
        total:
          emissions.co2.value * gwpValues.co2 +
          emissions.ch4.value * gwpValues.ch4 +
          emissions.n2o.value * gwpValues.n2o,
        gwpUsed: gwpValues,
        gwpStandard: 'IPCC_AR5',
      };

      // Uncertainty analysis (combined uncertainty)
      const combinedUncertainty = this.calculateCombinedUncertainty(
        co2Factor.uncertainty,
        ch4Factor ? ch4Factor.uncertainty : null,
        n2oFactor ? n2oFactor.uncertainty : null,
        emissions
      );

      // Quality metrics
      const qualityMetrics = {
        dataCompleteness: this.assessDataCompleteness(activity),
        factorRelevance: this.assessFactorRelevance([co2Factor, ch4Factor, n2oFactor]),
        methodologyAppropriateness: this.assessMethodologyQuality(co2Factor),
        overallQualityScore: Math.round(
          (this.assessDataCompleteness(activity) +
            this.assessFactorRelevance([co2Factor, ch4Factor, n2oFactor]) +
            this.assessMethodologyQuality(co2Factor)) /
            3
        ),
      };

      return {
        success: true,
        emissions,
        co2e,
        factorsUsed: [co2Factor, ch4Factor, n2oFactor].filter(f => f),
        uncertainty: combinedUncertainty,
        qualityMetrics,
        standards: {
          primary: {
            standardId: 'IPCC_AR5_2019_REFINEMENT',
            standardName: 'IPCC 2019 Refinement',
            compliant: true,
          },
        },
        factorSelectionNotes: `Selected ${co2Factor.dataQualityTier} tier factors with ${combinedUncertainty.combinedUncertainty}% combined uncertainty`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calculate combined uncertainty using IPCC error propagation
   * Formula: sqrt((ΔA/A)² + (ΔF/F)² + ... )
   */
  calculateCombinedUncertainty(
    factorUncertainty1,
    factorUncertainty2,
    factorUncertainty3,
    emissions
  ) {
    // Assume 5% activity data uncertainty (ISO 14064 default)
    const activityDataUncertainty = 5;

    let emissionFactorUncertainty = 0;

    if (factorUncertainty1) {
      const avgBound1 = Math.abs(
        (factorUncertainty1.lowerBound + factorUncertainty1.upperBound) / 2
      );
      // Weight by contribution to CO2e
      const weight1 = emissions.co2.value / (emissions.co2.value + emissions.ch4.value + emissions.n2o.value);
      emissionFactorUncertainty += avgBound1 * avgBound1 * weight1;
    }

    if (factorUncertainty2) {
      const avgBound2 = Math.abs(
        (factorUncertainty2.lowerBound + factorUncertainty2.upperBound) / 2
      );
      const weight2 = emissions.ch4.value / (emissions.co2.value + emissions.ch4.value + emissions.n2o.value);
      emissionFactorUncertainty += avgBound2 * avgBound2 * weight2;
    }

    if (factorUncertainty3) {
      const avgBound3 = Math.abs(
        (factorUncertainty3.lowerBound + factorUncertainty3.upperBound) / 2
      );
      const weight3 = emissions.n2o.value / (emissions.co2.value + emissions.ch4.value + emissions.n2o.value);
      emissionFactorUncertainty += avgBound3 * avgBound3 * weight3;
    }

    emissionFactorUncertainty = Math.sqrt(emissionFactorUncertainty);

    // Combined uncertainty (IPCC error propagation)
    const combinedUncertainty = Math.sqrt(
      activityDataUncertainty ** 2 + emissionFactorUncertainty ** 2
    );

    return {
      activityDataUncertainty,
      emissionFactorUncertainty: Math.round(emissionFactorUncertainty),
      combinedUncertainty: Math.round(combinedUncertainty),
      confidenceLevel: '95%',
      methodology: 'IPCC Error Propagation (Tier 2)',
    };
  }

  /**
   * Assess data completeness (0-100)
   */
  assessDataCompleteness(activity) {
    let score = 100;

    if (!activity.quantity) score -= 20;
    if (!activity.dateFrom || !activity.dateTo) score -= 15;
    if (!activity.unit) score -= 10;
    if (!activity.measurementMethod || activity.measurementMethod === 'unknown') score -= 15;
    if (!activity.notes) score -= 5;

    return Math.max(0, score);
  }

  /**
   * Assess factor relevance (0-100)
   * Based on data quality tier and confidence score
   */
  assessFactorRelevance(factors) {
    if (!factors || factors.length === 0) return 0;

    const activeFactors = factors.filter(f => f);
    const avgTierScore = activeFactors.reduce((sum, f) => {
      const tierScore = {
        tier1: 100,
        tier2: 75,
        tier3: 40,
      }[f.dataQualityTier] || 50;
      return sum + tierScore;
    }, 0);

    const avgConfidenceScore = activeFactors.reduce((sum, f) => sum + (f.confidenceScore || 0), 0) /
      activeFactors.length;

    return Math.round((avgTierScore / activeFactors.length + avgConfidenceScore) / 2);
  }

  /**
   * Assess methodology quality (0-100)
   */
  assessMethodologyQuality(factor) {
    if (!factor) return 0;

    const methodScores = {
      direct_measurement: 100,
      calculation_tool: 90,
      literature: 75,
      estimation: 50,
    };

    return methodScores[factor.calculationMethod] || 50;
  }

  /**
   * Get source category for smart UI recommendations
   */
  async getSourceCategoryInfo(sourceType) {
    return SourceCategory.findOne({ 'sourceTypes.sourceTypeId': sourceType.toLowerCase() });
  }

  /**
   * Generate smart recommendations for data improvement
   */
  async generateImprovementRecommendations(calculation, activity) {
    const recommendations = {
      dataImprovementPriority: 'low',
      suggestedMeasurements: [],
      suggestedFactorUpgrade: null,
    };

    // If data completeness < 80%, recommend improvements
    if (calculation.qualityMetrics.dataCompleteness < 80) {
      recommendations.dataImprovementPriority = 'high';
      recommendations.suggestedMeasurements.push('Obtain actual meter readings instead of estimates');
      recommendations.suggestedMeasurements.push('Document measurement method (invoice, meter, etc.)');
    }

    // If using tier 3 factor, recommend tier 1 or 2
    const worstTier = Math.max(
      ...(calculation.factorsUsed || []).map(f =>
        f.dataQualityTier === 'tier1' ? 1 : f.dataQualityTier === 'tier2' ? 2 : 3
      )
    );

    if (worstTier === 3) {
      recommendations.dataImprovementPriority =
        recommendations.dataImprovementPriority === 'low' ? 'medium' : 'high';
      recommendations.suggestedFactorUpgrade = 'Upgrade to Tier 1 or Tier 2 factor with better data';
    }

    return recommendations;
  }
}

module.exports = new SmartCalculationEngine();

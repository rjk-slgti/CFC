const GWP = Object.freeze({
  CO2: 1,
  CH4: 28,
  N2O: 265,
});

const EmissionFactor = require('../models/EmissionFactor');

class CalculationService {
  /**
   * Look up emission factors for a given scope and source type.
   * Returns the most recent active factors for CO2, CH4, and N2O.
   * Falls back to global factors if regional factors are unavailable.
   */
  async getFactors(scope, sourceType, region = 'global') {
    const query = {
      scope,
      sourceType: sourceType.toLowerCase(),
      isActive: true,
    };

    // Try regional factors first, then fall back to global
    const factors = await EmissionFactor.find({ ...query, region }).sort({ year: -1 });

    if (factors.length === 0 && region !== 'global') {
      const globalFactors = await EmissionFactor.find({ ...query, region: 'global' }).sort({ year: -1 });
      if (globalFactors.length === 0) {
        return null;
      }
      return this._organizeFactors(globalFactors);
    }

    if (factors.length === 0) {
      return null;
    }

    return this._organizeFactors(factors);
  }

  /**
   * Organize flat factor list into structured object by gas type.
   * Takes the most recent factor for each gas type.
   */
  _organizeFactors(factors) {
    const organized = {};
    const seen = new Set();

    for (const factor of factors) {
      if (!seen.has(factor.gasType)) {
        seen.add(factor.gasType);
        organized[factor.gasType] = factor;
      }
    }

    if (!organized.CO2) return null;

    return {
      co2: organized.CO2,
      ch4: organized.CH4 || null,
      n2o: organized.N2O || null,
    };
  }

  /**
   * Calculate GHG emissions from activity data and emission factors.
   *
   * Formula:
   *   gas_emission = activity_quantity × emission_factor
   *   CO2e = (CO2 × GWP_CO2) + (CH4 × GWP_CH4) + (N2O × GWP_N2O)
   *
   * @param {number} quantity - Activity data quantity
   * @param {object} factors - Organized emission factors { co2, ch4, n2o }
   * @returns {object} Emission results for each gas and total CO2e
   */
  calculate(quantity, factors) {
    const co2Emission = quantity * factors.co2.factorValue;
    const ch4Emission = factors.ch4 ? quantity * factors.ch4.factorValue : 0;
    const n2oEmission = factors.n2o ? quantity * factors.n2o.factorValue : 0;

    // Check for special direct-GWP cases (e.g., refrigerants)
    if (factors.co2.gwp != null) {
      const directGwp = quantity * factors.co2.factorValue * factors.co2.gwp;
      return {
        co2: 0,
        ch4: 0,
        n2o: 0,
        co2e: directGwp,
      };
    }

    const co2e =
      co2Emission * GWP.CO2 +
      ch4Emission * GWP.CH4 +
      n2oEmission * GWP.N2O;

    return {
      co2: this._round(co2Emission, 6),
      ch4: this._round(ch4Emission, 8),
      n2o: this._round(n2oEmission, 10),
      co2e: this._round(co2e, 4),
    };
  }

  /**
   * Get the GWP values used for calculations.
   */
  getGwpValues() {
    return { ...GWP };
  }

  _round(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}

module.exports = new CalculationService();

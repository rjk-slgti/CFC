/**
 * Pure functions for GHG emission calculations
 * All functions are isolated and testable, following functional programming principles
 * Uses IPCC AR5 Global Warming Potentials (GWP) by default
 */

// Default IPCC AR5 GWP values (100-year horizon)
const DEFAULT_GWP = {
  CO2: 1,
  CH4: 28,
  N2O: 265
};

/**
 * Converts individual gas emissions to CO2 equivalent
 * @param {number} co2 - CO2 emissions in kg
 * @param {number} ch4 - CH4 emissions in kg
 * @param {number} n2o - N2O emissions in kg
 * @param {Object} gwp - Global Warming Potentials (optional, defaults to IPCC AR5)
 * @returns {number} CO2e in kg
 */
export function convertToCO2e(co2 = 0, ch4 = 0, n2o = 0, gwp = DEFAULT_GWP) {
  if (typeof co2 !== 'number' || typeof ch4 !== 'number' || typeof n2o !== 'number') {
    throw new Error('All gas emissions must be numbers');
  }
  if (co2 < 0 || ch4 < 0 || n2o < 0) {
    throw new Error('Emission values cannot be negative');
  }

  return (co2 * gwp.CO2) + (ch4 * gwp.CH4) + (n2o * gwp.N2O);
}

/**
 * Normalizes units for consistent calculations
 * @param {number} value - The value to normalize
 * @param {string} fromUnit - Current unit
 * @param {string} toUnit - Target unit
 * @returns {number} Normalized value
 */
export function normalizeUnit(value, fromUnit, toUnit) {
  if (typeof value !== 'number' || value < 0) {
    throw new Error('Value must be a non-negative number');
  }

  // Energy units
  const energyConversions = {
    'kwh': 1,
    'mwh': 1000,
    'gj': 277.778, // 1 GJ = 277.778 kWh
    'mj': 0.277778  // 1 MJ = 0.277778 kWh
  };

  // Mass units
  const massConversions = {
    'kg': 1,
    'tonne': 1000,
    'tonnes': 1000,
    'mt': 1000000, // metric ton
    'g': 0.001,
    'lb': 0.453592, // pounds to kg
    'lbs': 0.453592
  };

  // Volume units (for fuels)
  const volumeConversions = {
    'liters': 1,
    'l': 1,
    'litres': 1,
    'm3': 1000, // cubic meters to liters
    'cubic_meters': 1000,
    'gallons': 3.78541, // US gallons to liters
    'us_gallons': 3.78541
  };

  // Distance units
  const distanceConversions = {
    'km': 1,
    'kilometers': 1,
    'miles': 1.60934,
    'mi': 1.60934
  };

  if (fromUnit === toUnit) {
    return value;
  }

  // Handle energy conversions
  if (energyConversions[fromUnit] && energyConversions[toUnit]) {
    return value * (energyConversions[fromUnit] / energyConversions[toUnit]);
  }

  // Handle mass conversions
  if (massConversions[fromUnit] && massConversions[toUnit]) {
    return value * (massConversions[fromUnit] / massConversions[toUnit]);
  }

  // Handle volume conversions
  if (volumeConversions[fromUnit] && volumeConversions[toUnit]) {
    return value * (volumeConversions[fromUnit] / volumeConversions[toUnit]);
  }

  // Handle distance conversions
  if (distanceConversions[fromUnit] && distanceConversions[toUnit]) {
    return value * (distanceConversions[fromUnit] / distanceConversions[toUnit]);
  }

  throw new Error(`Unsupported unit conversion: ${fromUnit} to ${toUnit}`);
}

/**
 * Calculates Scope 1 emissions from mobile combustion (vehicles)
 * @param {number} fuelConsumed - Amount of fuel consumed
 * @param {string} fuelUnit - Unit of fuel (liters, gallons, etc.)
 * @param {number} emissionFactor - Emission factor in kg CO2e per unit of fuel
 * @param {Object} gwp - Global Warming Potentials (optional)
 * @returns {Object} Emission breakdown {co2e, co2, ch4, n2o}
 */
export function calculateScope1MobileCombustion(fuelConsumed, fuelUnit, emissionFactor, gwp = DEFAULT_GWP) {
  if (typeof fuelConsumed !== 'number' || fuelConsumed < 0) {
    throw new Error('Fuel consumed must be a non-negative number');
  }
  if (typeof emissionFactor !== 'number' || emissionFactor < 0) {
    throw new Error('Emission factor must be a non-negative number');
  }

  // Normalize fuel to liters for consistency
  const fuelLiters = normalizeUnit(fuelConsumed, fuelUnit, 'liters');

  // Calculate total CO2e (assuming emission factor is already in CO2e per liter)
  const co2e = fuelLiters * emissionFactor;

  // For simplicity, assume all emissions are CO2 (most vehicle fuels)
  // In reality, this would be broken down by gas type based on fuel composition
  return {
    co2e: Math.round(co2e * 100) / 100, // Round to 2 decimal places
    co2: Math.round(co2e * 100) / 100,
    ch4: 0,
    n2o: 0
  };
}

/**
 * Calculates Scope 2 emissions from purchased electricity
 * @param {number} electricityConsumed - Amount of electricity consumed
 * @param {string} electricityUnit - Unit of electricity (kwh, mwh, etc.)
 * @param {number} gridEmissionFactor - Grid emission factor in kg CO2e per kWh
 * @param {Object} gwp - Global Warming Potentials (optional)
 * @returns {Object} Emission breakdown {co2e, co2, ch4, n2o}
 */
export function calculateScope2PurchasedElectricity(electricityConsumed, electricityUnit, gridEmissionFactor, gwp = DEFAULT_GWP) {
  if (typeof electricityConsumed !== 'number' || electricityConsumed < 0) {
    throw new Error('Electricity consumed must be a non-negative number');
  }
  if (typeof gridEmissionFactor !== 'number' || gridEmissionFactor < 0) {
    throw new Error('Grid emission factor must be a non-negative number');
  }

  // Normalize electricity to kWh
  const electricityKwh = normalizeUnit(electricityConsumed, electricityUnit, 'kwh');

  // Calculate CO2e
  const co2e = electricityKwh * gridEmissionFactor;

  // Grid electricity emissions are typically reported as CO2e
  // Breakdown would depend on the specific grid mix
  return {
    co2e: Math.round(co2e * 100) / 100,
    co2: Math.round(co2e * 100) / 100, // Simplified assumption
    ch4: 0,
    n2o: 0
  };
}

/**
 * Validates calculation inputs
 * @param {Object} inputs - Input parameters
 * @returns {Object} Validation result {isValid, errors}
 */
export function validateCalculationInputs(inputs) {
  const errors = [];

  if (!inputs || typeof inputs !== 'object') {
    errors.push('Inputs must be an object');
    return { isValid: false, errors };
  }

  // Common validations
  if ('value' in inputs && (typeof inputs.value !== 'number' || inputs.value < 0)) {
    errors.push('Value must be a non-negative number');
  }

  if ('factor' in inputs && (typeof inputs.factor !== 'number' || inputs.factor < 0)) {
    errors.push('Emission factor must be a non-negative number');
  }

  if ('unit' in inputs && typeof inputs.unit !== 'string') {
    errors.push('Unit must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
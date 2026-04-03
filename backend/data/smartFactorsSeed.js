/**
 * Comprehensive Smart Emission Factors
 * Based on IPCC 2019 Refinement, GHG Protocol, and ISO 14064
 * Includes uncertainty quantification and regional variations
 */

module.exports = [
  // ============================================
  // SCOPE 1: STATIONARY COMBUSTION
  // ============================================

  // Diesel Generator - CO2
  {
    factorCode: 'DIESEL_GEN_CO2_IPCC2019_GLOBAL',
    scope: 'scope_1',
    sourceType: 'diesel_generator',
    gasType: 'CO2',
    factorValue: 2.68,
    unit: 'kgCO2/liter',
    uncertainty: {
      type: 'percentage',
      lowerBound: -5,
      upperBound: 5,
      rationale: 'Well-documented fossil fuel combustion emission',
    },
    dataQualityTier: 'tier1',
    confidenceScore: 95,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
      { standardId: 'GHG_PROTOCOL_CORPORATE', standardName: 'GHG Protocol', compliant: true },
      { standardId: 'ISO_14064_1_2018', standardName: 'ISO 14064-1', compliant: true },
    ],
    applicableRegions: ['global'],
    applicableCountries: [],
    applicableConditions: 'Diesel #2D (most common for generators)',
    source: 'IPCC 2019 Refinement Guidelines',
    sourceReference: 'https://www.ipcc.ch/report/2019-refinement/',
    year: 2019,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
    notes: 'IPCC default for non-specified diesel consumption',
  },

  // Diesel Generator - CH4
  {
    factorCode: 'DIESEL_GEN_CH4_IPCC2019_GLOBAL',
    scope: 'scope_1',
    sourceType: 'diesel_generator',
    gasType: 'CH4',
    factorValue: 0.0002,
    unit: 'kgCH4/liter',
    uncertainty: {
      type: 'percentage',
      lowerBound: -50,
      upperBound: 50,
      rationale: 'CH4 from diesel combustion is highly variable',
    },
    dataQualityTier: 'tier2',
    confidenceScore: 60,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
      { standardId: 'GHG_PROTOCOL_CORPORATE', standardName: 'GHG Protocol', compliant: true },
    ],
    applicableRegions: ['global'],
    source: 'IPCC 2019 Refinement Guidelines',
    year: 2019,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
  },

  // Diesel Generator - N2O
  {
    factorCode: 'DIESEL_GEN_N2O_IPCC2019_GLOBAL',
    scope: 'scope_1',
    sourceType: 'diesel_generator',
    gasType: 'N2O',
    factorValue: 0.00001,
    unit: 'kgN2O/liter',
    uncertainty: {
      type: 'percentage',
      lowerBound: -60,
      upperBound: 60,
      rationale: 'N2O emissions are very low and uncertain',
    },
    dataQualityTier: 'tier3',
    confidenceScore: 40,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
    ],
    applicableRegions: ['global'],
    source: 'IPCC 2019 Refinement Guidelines',
    year: 2019,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
  },

  // Diesel Vehicle - CO2
  {
    factorCode: 'DIESEL_VEH_CO2_IPCC2019_GLOBAL',
    scope: 'scope_1',
    sourceType: 'diesel_vehicle',
    gasType: 'CO2',
    factorValue: 2.68,
    unit: 'kgCO2/liter',
    uncertainty: {
      type: 'percentage',
      lowerBound: -3,
      upperBound: 3,
      rationale: 'Well-documented fossil fuel combustion',
    },
    dataQualityTier: 'tier1',
    confidenceScore: 97,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
      { standardId: 'GHG_PROTOCOL_CORPORATE', standardName: 'GHG Protocol', compliant: true },
      { standardId: 'ISO_14064_1_2018', standardName: 'ISO 14064-1', compliant: true },
    ],
    applicableRegions: ['global'],
    source: 'IPCC 2019 Refinement Guidelines',
    sourceReference: 'Table 3.4.2 - Default CO2 Emission Factors for Fossil Fuels',
    year: 2019,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
  },

  // Petrol Vehicle - CO2
  {
    factorCode: 'PETROL_VEH_CO2_IPCC2019_GLOBAL',
    scope: 'scope_1',
    sourceType: 'petrol_vehicle',
    gasType: 'CO2',
    factorValue: 2.31,
    unit: 'kgCO2/liter',
    uncertainty: {
      type: 'percentage',
      lowerBound: -3,
      upperBound: 3,
      rationale: 'Well-documented fossil fuel combustion',
    },
    dataQualityTier: 'tier1',
    confidenceScore: 97,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
      { standardId: 'GHG_PROTOCOL_CORPORATE', standardName: 'GHG Protocol', compliant: true },
      { standardId: 'ISO_14064_1_2018', standardName: 'ISO 14064-1', compliant: true },
    ],
    applicableRegions: ['global'],
    source: 'IPCC 2019 Refinement Guidelines',
    year: 2019,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
  },

  // LPG Combustion - CO2
  {
    factorCode: 'LPG_COMB_CO2_IPCC2019_GLOBAL',
    scope: 'scope_1',
    sourceType: 'lpg_combustion',
    gasType: 'CO2',
    factorValue: 1.51,
    unit: 'kgCO2/kg',
    uncertainty: {
      type: 'percentage',
      lowerBound: -5,
      upperBound: 5,
      rationale: 'Well-characterized fossil fuel',
    },
    dataQualityTier: 'tier1',
    confidenceScore: 95,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
      { standardId: 'GHG_PROTOCOL_CORPORATE', standardName: 'GHG Protocol', compliant: true },
    ],
    applicableRegions: ['global'],
    source: 'IPCC 2019 Refinement Guidelines',
    year: 2019,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
  },

  // Natural Gas - CO2
  {
    factorCode: 'NAT_GAS_CO2_IPCC2019_GLOBAL',
    scope: 'scope_1',
    sourceType: 'natural_gas',
    gasType: 'CO2',
    factorValue: 2.02,
    unit: 'kgCO2/m3',
    uncertainty: {
      type: 'percentage',
      lowerBound: -5,
      upperBound: 5,
      rationale: 'Well-documented hydrocarbon combustion',
    },
    dataQualityTier: 'tier1',
    confidenceScore: 95,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
      { standardId: 'GHG_PROTOCOL_CORPORATE', standardName: 'GHG Protocol', compliant: true },
    ],
    applicableRegions: ['global'],
    source: 'IPCC 2019 Refinement Guidelines',
    year: 2019,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
  },

  // ============================================
  // SCOPE 1: REFRIGERANTS
  // ============================================

  // Refrigerant R-134a
  {
    factorCode: 'REFRIGERANT_R134A_GWP_IPCC2019',
    scope: 'scope_1',
    sourceType: 'refrigerant_r134a',
    gasType: 'CO2',
    factorValue: 1,
    unit: 'kg/kg',
    gwp: 1430,
    uncertainty: {
      type: 'percentage',
      lowerBound: -5,
      upperBound: 5,
      rationale: 'Well-characterized refrigerant with documented GWP',
    },
    dataQualityTier: 'tier1',
    confidenceScore: 98,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
      { standardId: 'ISO_14064_1_2018', standardName: 'ISO 14064-1', compliant: true },
    ],
    applicableRegions: ['global'],
    applicableConditions: 'Refrigerant leakage from cooling systems',
    source: 'IPCC AR5 - 100-year GWP',
    sourceReference: 'https://www.ipcc.ch/assessment-report/ar5/',
    year: 2019,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
    notes: 'GWP of 1430 already accounts for 100-year horizon. Use quantity (kg) and multiply by GWP.',
  },

  // ============================================
  // SCOPE 2: ELECTRICITY
  // ============================================

  // Grid Electricity - Sri Lanka (Regional)
  {
    factorCode: 'ELECTRICITY_GRID_CO2_SL_2025',
    scope: 'scope_2',
    sourceType: 'electricity_grid',
    gasType: 'CO2',
    factorValue: 0.57,
    unit: 'kgCO2/kWh',
    uncertainty: {
      type: 'percentage',
      lowerBound: -15,
      upperBound: 15,
      rationale: 'Regional grid factors vary by fuel mix and renewables penetration',
    },
    dataQualityTier: 'tier1',
    confidenceScore: 85,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
      { standardId: 'GHG_PROTOCOL_CORPORATE', standardName: 'GHG Protocol', compliant: true },
    ],
    applicableRegions: ['Sri Lanka'],
    applicableCountries: ['LK'],
    applicableConditions: 'For electricity consumed in Sri Lanka (2025 mix estimate)',
    source: 'Central Electricity Board of Sri Lanka / IPCC Regional Factors',
    sourceReference: 'https://www.ceb.lk/',
    year: 2025,
    calculationMethod: 'calculation',
    isDefault: true,
    preferenceRank: 1,
    notes: 'Sri Lanka has ~40% renewable energy (hydro). Factor reflects 2025 projected mix.',
  },

  // Grid Electricity - Global Average
  {
    factorCode: 'ELECTRICITY_GRID_CO2_GLOBAL_2019',
    scope: 'scope_2',
    sourceType: 'electricity_grid',
    gasType: 'CO2',
    factorValue: 0.48,
    unit: 'kgCO2/kWh',
    uncertainty: {
      type: 'percentage',
      lowerBound: -20,
      upperBound: 20,
      rationale: 'Global average highly variable by region and year',
    },
    dataQualityTier: 'tier2',
    confidenceScore: 70,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
      { standardId: 'GHG_PROTOCOL_CORPORATE', standardName: 'GHG Protocol', compliant: true },
    ],
    applicableRegions: ['global'],
    applicableConditions: 'Use only if country-specific factor not available',
    source: 'IPCC 2019 Refinement Guidelines',
    year: 2019,
    calculationMethod: 'literature',
    isDefault: false,
    preferenceRank: 2,
    notes: 'Fallback to this if Sri Lanka-specific factor unavailable. Prefers country-specific.',
  },

  // Purchased Heat
  {
    factorCode: 'PURCHASED_HEAT_CO2_IPCC2019_GLOBAL',
    scope: 'scope_2',
    sourceType: 'purchased_heat',
    gasType: 'CO2',
    factorValue: 0.20,
    unit: 'kgCO2/kWh',
    uncertainty: {
      type: 'percentage',
      lowerBound: -20,
      upperBound: 20,
      rationale: 'Depends on heat generation technology (natural gas vs. biomass)',
    },
    dataQualityTier: 'tier2',
    confidenceScore: 75,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
    ],
    applicableRegions: ['global'],
    applicableConditions: 'District heating or centralized steam supply',
    source: 'IPCC 2019 Refinement Guidelines',
    year: 2019,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
    notes: 'Represents typical natural gas-based district heating. Get supplier-specific factor if possible.',
  },

  // ============================================
  // SCOPE 3: WASTE
  // ============================================

  // Waste to Landfill - CO2e
  {
    factorCode: 'WASTE_LANDFILL_CO2_IPCC2019_GLOBAL',
    scope: 'scope_3',
    sourceType: 'waste_landfill',
    gasType: 'CO2',
    factorValue: 0.58,
    unit: 'kgCO2/kg',
    uncertainty: {
      type: 'percentage',
      lowerBound: -30,
      upperBound: 40,
      rationale: 'Depends on waste composition and landfill conditions',
    },
    dataQualityTier: 'tier2',
    confidenceScore: 65,
    standards: [
      { standardId: 'IPCC_AR5_2019_REFINEMENT', standardName: 'IPCC 2019', compliant: true },
      { standardId: 'ISO_14064_1_2018', standardName: 'ISO 14064-1', compliant: true },
    ],
    applicableRegions: ['global'],
    applicableConditions: 'Mixed waste composition, anaerobic landfill',
    source: 'IPCC 2019 Refinement - Waste Chapter (Chapter 5)',
    sourceReference: 'https://www.ipcc.ch/report/2019-refinement/',
    year: 2019,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
    notes: 'Includes biogenic and fossil carbon. For mixed waste streams.',
  },

  // Waste Recycled - CO2
  {
    factorCode: 'WASTE_RECYCLED_CO2_EPA_GLOBAL',
    scope: 'scope_3',
    sourceType: 'waste_recycled',
    gasType: 'CO2',
    factorValue: 0.1,
    unit: 'kgCO2/kg',
    uncertainty: {
      type: 'percentage',
      lowerBound: -25,
      upperBound: 25,
      rationale: 'Avoided emissions from recycling are uncertain',
    },
    dataQualityTier: 'tier2',
    confidenceScore: 70,
    standards: [
      { standardId: 'ISO_14064_1_2018', standardName: 'ISO 14064-1', compliant: true },
    ],
    applicableRegions: ['global'],
    applicableConditions: 'Mixed recyclables (paper, plastic, metal)',
    source: 'EPA Waste Carbon Footprint Study',
    year: 2019,
    calculationMethod: 'calculation',
    isDefault: true,
    preferenceRank: 1,
    notes: 'Represents emissions from recycling collection and processing.',
  },

  // ============================================
  // SCOPE 3: TRANSPORTATION
  // ============================================

  // Business Travel - Air
  {
    factorCode: 'BUSINESS_TRAVEL_AIR_CO2_DEFRA_2024',
    scope: 'scope_3',
    sourceType: 'business_travel_air',
    gasType: 'CO2',
    factorValue: 0.195,
    unit: 'kgCO2/km',
    uncertainty: {
      type: 'percentage',
      lowerBound: -20,
      upperBound: 20,
      rationale: 'Depends on aircraft type, load factor, and distance',
    },
    dataQualityTier: 'tier2',
    confidenceScore: 75,
    standards: [
      { standardId: 'ISO_14064_1_2018', standardName: 'ISO 14064-1', compliant: true },
    ],
    applicableRegions: ['global'],
    applicableConditions: 'Domestic and international flight average',
    source: 'DEFRA 2024 Reporting Guidelines',
    sourceReference: 'https://www.gov.uk/government/publications/2024-environmental-reporting-guidelines',
    year: 2024,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
    notes: 'Includes radiative forcing index (RFI) of 1.0 per DEFRA guidance.',
  },

  // Employee Commuting
  {
    factorCode: 'EMPLOYEE_COMMUTE_CO2_DEFRA_2024',
    scope: 'scope_3',
    sourceType: 'employee_commuting',
    gasType: 'CO2',
    factorValue: 0.21,
    unit: 'kgCO2/km',
    uncertainty: {
      type: 'percentage',
      lowerBound: -25,
      upperBound: 25,
      rationale: 'Depends on vehicle type mix, occupancy, and region',
    },
    dataQualityTier: 'tier2',
    confidenceScore: 70,
    standards: [
      { standardId: 'GHG_PROTOCOL_CORPORATE', standardName: 'GHG Protocol', compliant: true },
      { standardId: 'ISO_14064_1_2018', standardName: 'ISO 14064-1', compliant: true },
    ],
    applicableRegions: ['global'],
    applicableConditions: 'Average car-based commute per vehicle-km',
    source: 'DEFRA 2024 Reporting Guidelines',
    year: 2024,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
    notes: 'Average car. Use public transport factors (lower) if known.',
  },

  // ============================================
  // SCOPE 3: CONSUMABLES & WATER
  // ============================================

  // Office Paper
  {
    factorCode: 'OFFICE_PAPER_CO2_EPA_2024',
    scope: 'scope_3',
    sourceType: 'office_paper',
    gasType: 'CO2',
    factorValue: 1.09,
    unit: 'kgCO2/ream',
    uncertainty: {
      type: 'percentage',
      lowerBound: -20,
      upperBound: 20,
      rationale: 'Depends on paper type, bleaching, and transportation',
    },
    dataQualityTier: 'tier2',
    confidenceScore: 75,
    standards: [
      { standardId: 'ISO_14064_1_2018', standardName: 'ISO 14064-1', compliant: true },
    ],
    applicableRegions: ['global'],
    applicableConditions: '500-sheet ream of standard copy paper',
    source: 'EPA Lifecycle Assessment Database',
    year: 2024,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
    notes: '1 ream = 500 sheets A4/Letter size, 80 gsm',
  },

  // Water Supply
  {
    factorCode: 'WATER_SUPPLY_CO2_DEFRA_2024',
    scope: 'scope_3',
    sourceType: 'water_supply',
    gasType: 'CO2',
    factorValue: 0.344,
    unit: 'kgCO2/m3',
    uncertainty: {
      type: 'percentage',
      lowerBound: -30,
      upperBound: 30,
      rationale: 'Varies significantly by region (treatment intensity, distance)',
    },
    dataQualityTier: 'tier2',
    confidenceScore: 65,
    standards: [
      { standardId: 'ISO_14064_1_2018', standardName: 'ISO 14064-1', compliant: true },
    ],
    applicableRegions: ['global'],
    applicableConditions: 'Treated potable water supply',
    source: 'DEFRA 2024 Water & Waste Guidelines',
    year: 2024,
    calculationMethod: 'literature',
    isDefault: true,
    preferenceRank: 1,
    notes: 'Includes treatment and distribution. Check local water provider for specific factor.',
  },

  // ============================================
  // SCOPE 3: OFFICE SUPPLIES (Spend-based)
  // ============================================

  // Office Supplies (General) - Spend-based
  {
    factorCode: 'OFFICE_SUPPLIES_SPEND_CO2_IPCC_GLOBAL',
    scope: 'scope_3',
    sourceType: 'office_supplies',
    gasType: 'CO2',
    factorValue: 1.5,
    unit: 'kgCO2/USD',
    uncertainty: {
      type: 'percentage',
      lowerBound: -40,
      upperBound: 60,
      rationale: 'High uncertainty for spend-based approach; depends on product mix',
    },
    dataQualityTier: 'tier3',
    confidenceScore: 45,
    standards: [
      { standardId: 'GHG_PROTOCOL_CORPORATE', standardName: 'GHG Protocol', compliant: true },
    ],
    applicableRegions: ['global'],
    applicableConditions: 'Generic office supplies where activity data unavailable',
    source: 'GHG Protocol Scope 3 Guidance',
    year: 2019,
    calculationMethod: 'estimation',
    estimationMethod: 'spend_based',
    isDefault: false,
    preferenceRank: 3,
    notes: 'Use activity-based factors (office_paper, etc.) whenever possible. Spend-based is fallback.',
  },
];

/**
 * Comprehensive seed data for intelligent international standards
 * Includes IPCC AR5 2019 Refinement, GHG Protocol, and ISO 14064-1:2018
 */

const standardDefs = [
  {
    standardId: 'IPCC_AR5_2019_REFINEMENT',
    standardName: 'IPCC 2019 Refinement to the 2006 IPCC Guidelines for GHG Inventories',
    version: '2019',
    publishedYear: 2019,
    applicableScopes: ['scope_1', 'scope_2', 'scope_3'],
    description: 'Most recognized international standard for GHG calculations',
    sourceUrl: 'https://www.ipcc.ch/report/2019-refinement-to-the-2006-ipcc-guidelines/',
    gwpValues: {
      co2: 1,
      ch4: 28,
      n2o: 265,
    },
  },
  {
    standardId: 'GHG_PROTOCOL_CORPORATE',
    standardName: 'GHG Protocol Corporate Standard',
    version: '2004',
    publishedYear: 2004,
    applicableScopes: ['scope_1', 'scope_2', 'scope_3'],
    description: 'Global standard for corporate greenhouse gas emissions accounting and reporting',
    sourceUrl: 'https://ghgprotocol.org/corporate-standard',
    gwpValues: {
      co2: 1,
      ch4: 28,
      n2o: 265,
    },
  },
  {
    standardId: 'ISO_14064_1_2018',
    standardName: 'ISO 14064-1:2018 - Greenhouse gases - Part 1: Specification with guidance at the organization level',
    version: '2018',
    publishedYear: 2018,
    applicableScopes: ['scope_1', 'scope_2', 'scope_3'],
    description: 'International standard for quantification and reporting of GHG at organizational level',
    sourceUrl: 'https://www.iso.org/standard/66453.html',
    gwpValues: {
      co2: 1,
      ch4: 28,
      n2o: 265,
    },
  },
];

const sourceCategories = [
  // SCOPE 1 CATEGORIES
  {
    categoryId: 'scope1_stationary_combustion',
    categoryName: 'Stationary Combustion',
    scope: 'scope_1',
    parentCategory: null,
    sourceTypes: [
      {
        sourceTypeId: 'diesel_generator',
        sourceTypeName: 'Diesel Generator',
        unit: 'liters',
        description: 'Diesel-fueled backup generators and power generation',
      },
      {
        sourceTypeId: 'lpg_combustion',
        sourceTypeName: 'LPG Combustion',
        unit: 'kg',
        description: 'Liquefied petroleum gas for heating and cooking',
      },
      {
        sourceTypeId: 'natural_gas',
        sourceTypeName: 'Natural Gas',
        unit: 'm3',
        description: 'Natural gas for heating and industrial processes',
      },
    ],
    ghgProtocolCategory: '1.1 - Direct Fuel Combustion (Stationary)',
    ipccCategory: '1.A.1 - Energy Industries / 1.A.2 - Manufacturing Industries and Construction',
    materialityThreshold: 5,
    dataQualitySuggestion: {
      methodTier1: 'Meter readings and utility bills',
      methodTier2: 'Invoices and fuel purchase records',
      methodTier3: 'Engineering estimates',
    },
    estimationMethod: 'activity_data',
    applicableRegions: ['global'],
  },
  {
    categoryId: 'scope1_mobile_combustion',
    categoryName: 'Mobile Combustion',
    scope: 'scope_1',
    parentCategory: null,
    sourceTypes: [
      {
        sourceTypeId: 'diesel_vehicle',
        sourceTypeName: 'Diesel Vehicle',
        unit: 'liters',
        description: 'Diesel-powered vehicles and machinery',
      },
      {
        sourceTypeId: 'petrol_vehicle',
        sourceTypeName: 'Petrol Vehicle',
        unit: 'liters',
        description: 'Unleaded petrol-powered vehicles',
      },
      {
        sourceTypeId: 'cng_vehicle',
        sourceTypeName: 'CNG Vehicle',
        unit: 'kg',
        description: 'Compressed natural gas vehicles',
      },
    ],
    ghgProtocolCategory: '1.2 - Direct Fuel Combustion (Mobile)',
    ipccCategory: '1.A.3 - Transport',
    materialityThreshold: 5,
    dataQualitySuggestion: {
      methodTier1: 'Fuel consumption records and GPS tracking',
      methodTier2: 'Fuel purchase receipts',
      methodTier3: 'Average consumption estimates',
    },
    estimationMethod: 'activity_data',
    applicableRegions: ['global'],
  },
  {
    categoryId: 'scope1_fugitive',
    categoryName: 'Fugitive Emissions',
    scope: 'scope_1',
    parentCategory: null,
    sourceTypes: [
      {
        sourceTypeId: 'refrigerant_r134a',
        sourceTypeName: 'Refrigerant R-134a Leakage',
        unit: 'kg',
        description: 'Refrigerant leakage from cooling systems (GWP: 1430)',
      },
      {
        sourceTypeId: 'refrigerant_r22',
        sourceTypeName: 'Refrigerant R-22 Leakage',
        unit: 'kg',
        description: 'CFC refrigerant leakage (GWP: 1810)',
      },
    ],
    ghgProtocolCategory: '1.5 - Fugitive Emissions',
    ipccCategory: '2.F - Product Uses as Substitutes for Ozone-Depleting Substances',
    materialityThreshold: 3,
    dataQualitySuggestion: {
      methodTier1: 'Equipment maintenance logs and refill records',
      methodTier2: 'Annual refrigerant service audits',
      methodTier3: 'Engineering estimates based on equipment age',
    },
    estimationMethod: 'activity_data',
    applicableRegions: ['global'],
  },

  // SCOPE 2 CATEGORIES
  {
    categoryId: 'scope2_purchased_electricity',
    categoryName: 'Purchased Electricity',
    scope: 'scope_2',
    parentCategory: null,
    sourceTypes: [
      {
        sourceTypeId: 'electricity_grid',
        sourceTypeName: 'Grid Electricity',
        unit: 'kWh',
        description: 'Electricity purchased from national grid',
      },
      {
        sourceTypeId: 'renewable_energy_ppas',
        sourceTypeName: 'Renewable Energy PPA',
        unit: 'kWh',
        description: 'Electricity from Power Purchase Agreements (renewable)',
      },
    ],
    ghgProtocolCategory: '2.1 - Purchased Electricity',
    ipccCategory: '2.C.2 - Indirect CO2 Emissions from Imported Electricity',
    materialityThreshold: 5,
    dataQualitySuggestion: {
      methodTier1: 'Utility bills with precise kWh readings',
      methodTier2: 'Monthly meter readings with grid factor',
      methodTier3: 'Estimated based on equipment capacity',
    },
    estimationMethod: 'activity_data',
    applicableRegions: ['global', 'Sri Lanka', 'India', 'USA', 'EU'],
  },
  {
    categoryId: 'scope2_purchased_heat',
    categoryName: 'Purchased Heat & Steam',
    scope: 'scope_2',
    parentCategory: null,
    sourceTypes: [
      {
        sourceTypeId: 'purchased_heat',
        sourceTypeName: 'Purchased Heat',
        unit: 'kWh',
        description: 'District heat or steam purchased for building heating',
      },
      {
        sourceTypeId: 'purchased_steam',
        sourceTypeName: 'Purchased Steam',
        unit: 'tonnes',
        description: 'Industrial steam for processes',
      },
    ],
    ghgProtocolCategory: '2.2 - Purchased Heat/Steam',
    ipccCategory: '2.C - Indirect Emissions',
    materialityThreshold: 5,
    dataQualitySuggestion: {
      methodTier1: 'Supplier invoices with consumption data',
      methodTier2: 'Estimated from provider default factors',
    },
    estimationMethod: 'activity_data',
    applicableRegions: ['global'],
  },

  // SCOPE 3 CATEGORIES
  {
    categoryId: 'scope3_purchased_goods',
    categoryName: 'Purchased Goods & Services',
    scope: 'scope_3',
    parentCategory: null,
    sourceTypes: [
      {
        sourceTypeId: 'office_paper',
        sourceTypeName: 'Office Paper',
        unit: 'ream',
        description: '500-sheet reams of copy paper',
      },
      {
        sourceTypeId: 'office_supplies',
        sourceTypeName: 'Office Supplies (General)',
        unit: 'USD',
        description: 'Pens, stationery, consumables (spend-based)',
      },
      {
        sourceTypeId: 'cleaning_supplies',
        sourceTypeName: 'Cleaning Supplies',
        unit: 'kg',
        description: 'Chemicals for campus cleaning',
      },
    ],
    ghgProtocolCategory: '3.1 - Purchased Goods & Services',
    ipccCategory: '5 - Waste',
    materialityThreshold: 5,
    dataQualitySuggestion: {
      methodTier1: 'Procurement receipts and usage tracking',
      methodTier2: 'Spend-based calculations with activity data',
      methodTier3: 'Average consumption estimates',
    },
    estimationMethod: 'activity_data',
    applicableRegions: ['global'],
  },
  {
    categoryId: 'scope3_waste',
    categoryName: 'Waste Generated in Operations',
    scope: 'scope_3',
    parentCategory: null,
    sourceTypes: [
      {
        sourceTypeId: 'waste_landfill',
        sourceTypeName: 'Waste to Landfill',
        unit: 'kg',
        description: 'Organic and non-hazardous waste to landfill',
      },
      {
        sourceTypeId: 'waste_recycled',
        sourceTypeName: 'Waste Recycled',
        unit: 'kg',
        description: 'Paper, plastic, metal recycled',
      },
      {
        sourceTypeId: 'waste_composted',
        sourceTypeName: 'Waste Composted',
        unit: 'kg',
        description: 'Organic waste to composting facilities',
      },
    ],
    ghgProtocolCategory: '3.5 - Waste Generated in Operations',
    ipccCategory: '5 - Waste / 5.C - Composting',
    materialityThreshold: 3,
    dataQualitySuggestion: {
      methodTier1: 'Waste audit with weight records',
      methodTier2: 'Disposal invoices with weight estimates',
      methodTier3: 'Average waste generation per person/unit',
    },
    estimationMethod: 'activity_data',
    applicableRegions: ['global'],
  },
  {
    categoryId: 'scope3_transportation',
    categoryName: 'Transportation & Distribution',
    scope: 'scope_3',
    parentCategory: null,
    sourceTypes: [
      {
        sourceTypeId: 'business_travel_air',
        sourceTypeName: 'Business Travel - Air',
        unit: 'km',
        description: 'Flights for business purposes',
      },
      {
        sourceTypeId: 'business_travel_rail',
        sourceTypeName: 'Business Travel - Rail',
        unit: 'km',
        description: 'Train travel for business',
      },
      {
        sourceTypeId: 'employee_commuting',
        sourceTypeName: 'Employee Commuting',
        unit: 'km',
        description: 'Employee travel to/from workplace',
      },
    ],
    ghgProtocolCategory: '3.6 - Business Travel / 3.7 - Employee Commuting',
    ipccCategory: '1.A.3 - Transport',
    materialityThreshold: 5,
    dataQualitySuggestion: {
      methodTier1: 'Travel records and expense reports',
      methodTier2: 'Employee surveys and average commute distance',
      methodTier3: 'Industry averages per headcount',
    },
    estimationMethod: 'activity_data',
    applicableRegions: ['global'],
  },
  {
    categoryId: 'scope3_water',
    categoryName: 'Water Supply & Treatment',
    scope: 'scope_3',
    parentCategory: null,
    sourceTypes: [
      {
        sourceTypeId: 'water_supply',
        sourceTypeName: 'Water Supply',
        unit: 'm3',
        description: 'Fresh water supplied for operations',
      },
      {
        sourceTypeId: 'wastewater_treatment',
        sourceTypeName: 'Wastewater Treatment',
        unit: 'm3',
        description: 'Wastewater processing and disposal',
      },
    ],
    ghgProtocolCategory: '3.13 - Downstream Water-Related Activities (Water Usage)',
    ipccCategory: '4.A - Wastewater Treatment and Discharge',
    materialityThreshold: 2,
    dataQualitySuggestion: {
      methodTier1: 'Utility bills with precise m3 readings',
      methodTier2: 'Meter readings with regional factors',
      methodTier3: 'Estimated from occupancy and standards',
    },
    estimationMethod: 'activity_data',
    applicableRegions: ['global'],
  },
];

module.exports = {
  standardDefs,
  sourceCategories,
};

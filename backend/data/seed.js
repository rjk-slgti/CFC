const mongoose = require('mongoose');
const dotenv = require('dotenv');
const EmissionFactor = require('../models/EmissionFactor');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const emissionFactors = [
  // Scope 1 - Direct Emissions
  // Diesel Generator
  { scope: 'scope_1', sourceType: 'diesel_generator', gasType: 'CO2', factorValue: 2.68, unit: 'kgCO2/liter', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_1', sourceType: 'diesel_generator', gasType: 'CH4', factorValue: 0.0002, unit: 'kgCH4/liter', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_1', sourceType: 'diesel_generator', gasType: 'N2O', factorValue: 0.00001, unit: 'kgN2O/liter', source: 'IPCC AR5', year: 2025, region: 'global' },

  // Diesel Vehicle
  { scope: 'scope_1', sourceType: 'diesel_vehicle', gasType: 'CO2', factorValue: 2.68, unit: 'kgCO2/liter', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_1', sourceType: 'diesel_vehicle', gasType: 'CH4', factorValue: 0.0002, unit: 'kgCH4/liter', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_1', sourceType: 'diesel_vehicle', gasType: 'N2O', factorValue: 0.00001, unit: 'kgN2O/liter', source: 'IPCC AR5', year: 2025, region: 'global' },

  // Petrol Vehicle
  { scope: 'scope_1', sourceType: 'petrol_vehicle', gasType: 'CO2', factorValue: 2.31, unit: 'kgCO2/liter', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_1', sourceType: 'petrol_vehicle', gasType: 'CH4', factorValue: 0.0003, unit: 'kgCH4/liter', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_1', sourceType: 'petrol_vehicle', gasType: 'N2O', factorValue: 0.00002, unit: 'kgN2O/liter', source: 'IPCC AR5', year: 2025, region: 'global' },

  // LPG Combustion
  { scope: 'scope_1', sourceType: 'lpg_combustion', gasType: 'CO2', factorValue: 1.51, unit: 'kgCO2/kg', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_1', sourceType: 'lpg_combustion', gasType: 'CH4', factorValue: 0.0001, unit: 'kgCH4/kg', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_1', sourceType: 'lpg_combustion', gasType: 'N2O', factorValue: 0.00001, unit: 'kgN2O/kg', source: 'IPCC AR5', year: 2025, region: 'global' },

  // Natural Gas
  { scope: 'scope_1', sourceType: 'natural_gas', gasType: 'CO2', factorValue: 2.02, unit: 'kgCO2/m3', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_1', sourceType: 'natural_gas', gasType: 'CH4', factorValue: 0.0003, unit: 'kgCH4/m3', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_1', sourceType: 'natural_gas', gasType: 'N2O', factorValue: 0.00001, unit: 'kgN2O/m3', source: 'IPCC AR5', year: 2025, region: 'global' },

  // Refrigerant R-134a (direct GWP)
  { scope: 'scope_1', sourceType: 'refrigerant_r134a', gasType: 'CO2', factorValue: 1, unit: 'kg/kg', source: 'IPCC AR5', year: 2025, region: 'global', gwp: 1430 },

  // Scope 2 - Electricity
  // Grid Electricity - Sri Lanka
  { scope: 'scope_2', sourceType: 'electricity_grid', gasType: 'CO2', factorValue: 0.57, unit: 'kgCO2/kWh', source: 'Sri_Lanka_CEA', year: 2025, region: 'Sri Lanka' },
  { scope: 'scope_2', sourceType: 'electricity_grid', gasType: 'CH4', factorValue: 0.00001, unit: 'kgCH4/kWh', source: 'Sri_Lanka_CEA', year: 2025, region: 'Sri Lanka' },
  { scope: 'scope_2', sourceType: 'electricity_grid', gasType: 'N2O', factorValue: 0.000005, unit: 'kgN2O/kWh', source: 'Sri_Lanka_CEA', year: 2025, region: 'Sri Lanka' },

  // Grid Electricity - Global
  { scope: 'scope_2', sourceType: 'electricity_grid', gasType: 'CO2', factorValue: 0.48, unit: 'kgCO2/kWh', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_2', sourceType: 'electricity_grid', gasType: 'CH4', factorValue: 0.00001, unit: 'kgCH4/kWh', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_2', sourceType: 'electricity_grid', gasType: 'N2O', factorValue: 0.000005, unit: 'kgN2O/kWh', source: 'IPCC AR5', year: 2025, region: 'global' },

  // Purchased Heat
  { scope: 'scope_2', sourceType: 'purchased_heat', gasType: 'CO2', factorValue: 0.20, unit: 'kgCO2/kWh', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_2', sourceType: 'purchased_heat', gasType: 'CH4', factorValue: 0.00001, unit: 'kgCH4/kWh', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_2', sourceType: 'purchased_heat', gasType: 'N2O', factorValue: 0.000001, unit: 'kgN2O/kWh', source: 'IPCC AR5', year: 2025, region: 'global' },

  // Scope 3 - Indirect Emissions
  // Office Paper
  { scope: 'scope_3', sourceType: 'office_paper', gasType: 'CO2', factorValue: 1.09, unit: 'kgCO2/ream', source: 'EPA', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'office_paper', gasType: 'CH4', factorValue: 0.0001, unit: 'kgCH4/ream', source: 'EPA', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'office_paper', gasType: 'N2O', factorValue: 0.00001, unit: 'kgN2O/ream', source: 'EPA', year: 2025, region: 'global' },

  // Waste to Landfill
  { scope: 'scope_3', sourceType: 'waste_landfill', gasType: 'CO2', factorValue: 0.58, unit: 'kgCO2/kg', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'waste_landfill', gasType: 'CH4', factorValue: 0.0005, unit: 'kgCH4/kg', source: 'IPCC AR5', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'waste_landfill', gasType: 'N2O', factorValue: 0.00001, unit: 'kgN2O/kg', source: 'IPCC AR5', year: 2025, region: 'global' },

  // Waste Recycled
  { scope: 'scope_3', sourceType: 'waste_recycled', gasType: 'CO2', factorValue: 0.1, unit: 'kgCO2/kg', source: 'EPA', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'waste_recycled', gasType: 'CH4', factorValue: 0.00001, unit: 'kgCH4/kg', source: 'EPA', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'waste_recycled', gasType: 'N2O', factorValue: 0.000001, unit: 'kgN2O/kg', source: 'EPA', year: 2025, region: 'global' },

  // Employee Commuting
  { scope: 'scope_3', sourceType: 'employee_commuting', gasType: 'CO2', factorValue: 0.21, unit: 'kgCO2/km', source: 'DEFRA', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'employee_commuting', gasType: 'CH4', factorValue: 0.00001, unit: 'kgCH4/km', source: 'DEFRA', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'employee_commuting', gasType: 'N2O', factorValue: 0.000001, unit: 'kgN2O/km', source: 'DEFRA', year: 2025, region: 'global' },

  // Business Travel (Air)
  { scope: 'scope_3', sourceType: 'business_travel_air', gasType: 'CO2', factorValue: 0.195, unit: 'kgCO2/km', source: 'DEFRA', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'business_travel_air', gasType: 'CH4', factorValue: 0.00001, unit: 'kgCH4/km', source: 'DEFRA', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'business_travel_air', gasType: 'N2O', factorValue: 0.000005, unit: 'kgN2O/km', source: 'DEFRA', year: 2025, region: 'global' },

  // Water Supply
  { scope: 'scope_3', sourceType: 'water_supply', gasType: 'CO2', factorValue: 0.344, unit: 'kgCO2/m3', source: 'DEFRA', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'water_supply', gasType: 'CH4', factorValue: 0.00002, unit: 'kgCH4/m3', source: 'DEFRA', year: 2025, region: 'global' },
  { scope: 'scope_3', sourceType: 'water_supply', gasType: 'N2O', factorValue: 0.000002, unit: 'kgN2O/m3', source: 'DEFRA', year: 2025, region: 'global' },
];

const seed = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI not set in .env file');
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Clear existing factors
    await EmissionFactor.deleteMany({});
    console.log('Cleared existing emission factors');

    // Insert new factors
    const result = await EmissionFactor.insertMany(emissionFactors);
    console.log(`Seeded ${result.length} emission factors`);

    // Print summary by scope
    const summary = {};
    for (const factor of result) {
      summary[factor.scope] = (summary[factor.scope] || 0) + 1;
    }
    console.log('Summary:', summary);

    await mongoose.disconnect();
    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seed();

/**
 * Smart Database Seeding
 * Populates StandardMaster, SourceCategory, and SmartEmissionFactor
 * Enables intelligent calculations with international standards compliance
 */

const StandardMaster = require('../models/StandardMaster');
const SourceCategory = require('../models/SourceCategory');
const SmartEmissionFactor = require('../models/SmartEmissionFactor');
const { standardDefs, sourceCategories } = require('./seedStandards');
const smartFactors = require('./smartFactorsSeed');

const seedSmartDatabase = async () => {
  try {
    // Seed Standards
    const existingStandards = await StandardMaster.countDocuments();
    if (existingStandards === 0) {
      const standardsToSeed = standardDefs.map(std => ({
        standardId: std.standardId,
        standardName: std.standardName,
        version: std.version,
        publishedYear: std.publishedYear,
        applicableScopes: std.applicableScopes,
        description: std.description,
        sourceUrl: std.sourceUrl,
        gwpValues: std.gwpValues,
      }));
      await StandardMaster.insertMany(standardsToSeed);
      console.log(`✓ Seeded ${standardsToSeed.length} international standards (IPCC, GHG Protocol, ISO 14064)`);
    }

    // Seed Source Categories
    const existingCategories = await SourceCategory.countDocuments();
    if (existingCategories === 0) {
      const categoriesToSeed = sourceCategories.map(cat => ({
        categoryId: cat.categoryId,
        categoryName: cat.categoryName,
        scope: cat.scope,
        parentCategory: cat.parentCategory,
        sourceTypes: cat.sourceTypes,
        description: cat.description,
        ghgProtocolCategory: cat.ghgProtocolCategory,
        ipccCategory: cat.ipccCategory,
        materialityThreshold: cat.materialityThreshold,
        dataQualitySuggestion: cat.dataQualitySuggestion,
        estimationMethod: cat.estimationMethod,
        applicableRegions: cat.applicableRegions,
      }));
      await SourceCategory.insertMany(categoriesToSeed);
      console.log(`✓ Seeded ${categoriesToSeed.length} intelligent source categories with hierarchies`);
    }

    // Seed Smart Emission Factors
    const existingFactors = await SmartEmissionFactor.countDocuments();
    if (existingFactors === 0) {
      const factorsToSeed = smartFactors.map(factor => ({
        factorCode: factor.factorCode,
        scope: factor.scope,
        sourceType: factor.sourceType,
        gasType: factor.gasType,
        factorValue: factor.factorValue,
        unit: factor.unit,
        uncertainty: factor.uncertainty,
        dataQualityTier: factor.dataQualityTier,
        confidenceScore: factor.confidenceScore,
        standards: factor.standards,
        applicableRegions: factor.applicableRegions,
        applicableCountries: factor.applicableCountries || [],
        applicableConditions: factor.applicableConditions,
        source: factor.source,
        sourceReference: factor.sourceReference,
        year: factor.year,
        calculationMethod: factor.calculationMethod,
        gwp: factor.gwp,
        isDefault: factor.isDefault || false,
        preferenceRank: factor.preferenceRank || 999,
        estimationMethod: factor.estimationMethod,
        notes: factor.notes,
      }));
      await SmartEmissionFactor.insertMany(factorsToSeed);
      console.log(`✓ Seeded ${factorsToSeed.length} intelligent emission factors with uncertainty quantification`);
      console.log('   - IPCC 2019 Refinement guidelines');
      console.log('   - GHG Protocol standards');
      console.log('   - ISO 14064-1:2018 compliance');
      console.log('   - Regional variations (Sri Lanka, Global averages)');
      console.log('   - Data quality tiers & confidence scores');
      console.log('   - Uncertainty ranges for QA/QC');
    }

    return {
      standards: existingStandards === 0,
      categories: existingCategories === 0,
      factors: existingFactors === 0,
    };
  } catch (error) {
    console.error('Error seeding smart database:', error.message);
    throw error;
  }
};

module.exports = seedSmartDatabase;

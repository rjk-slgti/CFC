const ActivityData = require('../models/ActivityData');
const Calculation = require('../models/Calculation');
const calculationService = require('../services/calculationService');
const dataQualityService = require('../services/dataQualityService');
const crossValidationService = require('../services/crossValidationService');
const predictiveService = require('../services/predictiveService');
const benchmarkingService = require('../services/benchmarkingService');
const { logAudit } = require('../middleware/audit');

/**
 * POST /api/calculate
 * Core GHG calculation endpoint.
 * Accepts activity data, validates, calculates emissions, and persists results.
 */
const calculateEmissions = async (req, res, next) => {
  try {
    const { scope, sourceType, quantity, unit, dateFrom, dateTo, notes, measurementMethod } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required (set userId in body or authenticate)',
      });
    }

    // Cross-validate against historical data
    const validation = await crossValidationService.validateAgainstHistory(
      userId, sourceType, quantity, dateFrom
    );

    // Look up emission factors
    const factors = await calculationService.getFactors(scope, sourceType);
    if (!factors) {
      return res.status(404).json({
        success: false,
        message: `No emission factors found for "${sourceType}" in "${scope}"`,
        suggestion: 'Check the source type spelling or add emission factors for this source',
      });
    }

    // Perform calculation
    const emissions = calculationService.calculate(quantity, factors);

    // Save activity data
    const activityData = await ActivityData.create({
      userId,
      scope,
      sourceType: sourceType.toLowerCase(),
      quantity,
      unit,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      notes: notes || '',
      measurementMethod: measurementMethod || 'unknown',
    });

    // Save calculation result
    const calculation = await Calculation.create({
      activityId: activityData._id,
      scope,
      sourceType: sourceType.toLowerCase(),
      co2: emissions.co2,
      ch4: emissions.ch4,
      n2o: emissions.n2o,
      co2e: emissions.co2e,
      factorUsed: {
        co2Factor: factors.co2.factorValue,
        ch4Factor: factors.ch4?.factorValue || 0,
        n2oFactor: factors.n2o?.factorValue || 0,
        source: factors.co2.source,
        year: factors.co2.year,
        region: factors.co2.region || 'global',
      },
      gwpValues: calculationService.getGwpValues(),
      calculatedAt: new Date(),
    });

    // Calculate data quality score
    const qualityScore = dataQualityService.calculateQualityScore(calculation, activityData);
    calculation.qualityScore = qualityScore.totalScore;
    await calculation.save();

    // Audit log
    await logAudit({
      userId,
      action: 'CALCULATE',
      collection: 'Calculation',
      recordId: calculation._id,
      newValue: { activityId: activityData._id, scope, sourceType, co2e: emissions.co2e },
      req,
    });

    res.status(201).json({
      success: true,
      message: 'Calculation completed successfully',
      data: {
        activityId: activityData._id,
        calculationId: calculation._id,
        scope,
        sourceType: sourceType.toLowerCase(),
        quantity,
        unit,
        emissions,
        factorsUsed: {
          co2: factors.co2.factorValue,
          ch4: factors.ch4?.factorValue || 0,
          n2o: factors.n2o?.factorValue || 0,
          source: factors.co2.source,
          year: factors.co2.year,
          gwp: calculationService.getGwpValues(),
        },
        qualityScore,
        validation: {
          valid: validation.valid,
          warnings: validation.warnings,
          statistics: validation.statistics,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/emissions
 * Retrieve all emissions with pagination, filtering, and sorting.
 */
const getEmissions = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      scope,
      status,
      sourceType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter = {};
    if (scope) filter.scope = scope;
    if (status) filter.status = status;
    if (sourceType) filter.sourceType = sourceType.toLowerCase();

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [activities, total] = await Promise.all([
      ActivityData.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      ActivityData.countDocuments(filter),
    ]);

    // Attach calculation data
    const activityIds = activities.map((a) => a._id);
    const calculations = await Calculation.find({ activityId: { $in: activityIds } }).lean();
    const calcMap = new Map(calculations.map((c) => [c.activityId.toString(), c]));

    const data = activities.map((activity) => ({
      ...activity,
      calculation: calcMap.get(activity._id.toString()) || null,
    }));

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/emissions/:id
 * Retrieve a single emission entry with its calculation.
 */
const getEmissionById = async (req, res, next) => {
  try {
    const activity = await ActivityData.findById(req.params.id).lean();
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Emission entry not found' });
    }

    const calculation = await Calculation.findOne({ activityId: activity._id }).lean();

    res.json({
      success: true,
      data: { ...activity, calculation },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/summary
 * Aggregate emissions summary by scope with totals.
 */
const getSummary = async (req, res, next) => {
  try {
    const { year } = req.query;
    const matchStage = {};

    if (year) {
      const yearStart = new Date(parseInt(year, 10), 0, 1);
      const yearEnd = new Date(parseInt(year, 10), 11, 31, 23, 59, 59);
      matchStage.calculatedAt = { $gte: yearStart, $lte: yearEnd };
    }

    const summary = await Calculation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$scope',
          totalCo2e: { $sum: '$co2e' },
          totalCo2: { $sum: '$co2' },
          totalCh4: { $sum: '$ch4' },
          totalN2o: { $sum: '$n2o' },
          count: { $sum: 1 },
          avgQualityScore: { $avg: '$qualityScore' },
        },
      },
    ]);

    const result = {
      scope_1: { totalCo2e: 0, totalCo2: 0, totalCh4: 0, totalN2o: 0, count: 0, avgQualityScore: 0 },
      scope_2: { totalCo2e: 0, totalCo2: 0, totalCh4: 0, totalN2o: 0, count: 0, avgQualityScore: 0 },
      scope_3: { totalCo2e: 0, totalCo2: 0, totalCh4: 0, totalN2o: 0, count: 0, avgQualityScore: 0 },
      total: { totalCo2e: 0, count: 0 },
    };

    for (const item of summary) {
      if (result[item._id]) {
        result[item._id] = {
          totalCo2e: Number(item.totalCo2e.toFixed(4)),
          totalCo2: Number(item.totalCo2.toFixed(4)),
          totalCh4: Number(item.totalCh4.toFixed(6)),
          totalN2o: Number(item.totalN2o.toFixed(8)),
          count: item.count,
          avgQualityScore: Number((item.avgQualityScore || 0).toFixed(1)),
        };
        result.total.totalCo2e += item.totalCo2e;
        result.total.count += item.count;
      }
    }

    result.total.totalCo2e = Number(result.total.totalCo2e.toFixed(4));

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/emissions/:id/validate
 * Validate (approve/reject) an emission entry (trainer action).
 */
const validateEmission = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const validatorId = req.user?.id || req.body.validatorId;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be approved or rejected' });
    }

    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ success: false, message: 'Rejection reason is required when rejecting' });
    }

    const activity = await ActivityData.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Emission entry not found' });
    }

    const oldValue = { status: activity.status };
    activity.status = status;
    activity.validatedBy = validatorId;
    activity.validatedAt = new Date();
    if (status === 'rejected') {
      activity.rejectionReason = rejectionReason;
    }

    await activity.save();

    await logAudit({
      userId: validatorId,
      action: 'VALIDATE',
      collection: 'ActivityData',
      recordId: activity._id,
      oldValue,
      newValue: { status, rejectionReason },
      req,
    });

    res.json({
      success: true,
      message: `Emission entry ${status}`,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/emissions/:id
 * Soft-delete an emission entry by setting status to rejected.
 */
const deleteEmission = async (req, res, next) => {
  try {
    const activity = await ActivityData.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Emission entry not found' });
    }

    const userId = req.user?.id || req.body.userId;

    await ActivityData.findByIdAndDelete(req.params.id);
    await Calculation.deleteOne({ activityId: activity._id });

    await logAudit({
      userId,
      action: 'DELETE',
      collection: 'ActivityData',
      recordId: activity._id,
      oldValue: activity.toObject(),
      newValue: null,
      req,
    });

    res.json({ success: true, message: 'Emission entry deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/quality/:calculationId
 * Get data quality assessment for a specific calculation.
 */
const getQualityScore = async (req, res, next) => {
  try {
    const calculation = await Calculation.findById(req.params.calculationId).lean();
    if (!calculation) {
      return res.status(404).json({ success: false, message: 'Calculation not found' });
    }

    const activityData = await ActivityData.findById(calculation.activityId).lean();
    if (!activityData) {
      return res.status(404).json({ success: false, message: 'Associated activity data not found' });
    }

    const qualityScore = dataQualityService.calculateQualityScore(calculation, activityData);

    res.json({ success: true, data: qualityScore });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/predictions
 * Get emission predictions and trend analysis.
 */
const getPredictions = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const monthsAhead = parseInt(req.query.months, 10) || 12;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const predictions = await predictiveService.predictEmissions(userId, monthsAhead);
    res.json({ success: true, data: predictions });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/target-feasibility
 * Analyze feasibility of a reduction target.
 */
const getTargetFeasibility = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const target = parseFloat(req.query.target);

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    if (isNaN(target) || target <= 0 || target > 100) {
      return res.status(400).json({ success: false, message: 'Target must be a percentage between 0 and 100' });
    }

    const analysis = await predictiveService.analyzeTargetFeasibility(userId, target);
    res.json({ success: true, data: analysis });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/benchmark
 * Benchmark organizational emissions against industry standards.
 */
const getBenchmark = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.query.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const orgProfile = {
      industry: req.query.industry || 'office',
      country: req.query.country || 'global',
      employeeCount: parseInt(req.query.employees, 10) || 1,
      floorArea: parseFloat(req.query.floorArea) || 1,
    };

    const result = await benchmarkingService.benchmark(userId, orgProfile);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateEmissions,
  getEmissions,
  getEmissionById,
  getSummary,
  validateEmission,
  deleteEmission,
  getQualityScore,
  getPredictions,
  getTargetFeasibility,
  getBenchmark,
};

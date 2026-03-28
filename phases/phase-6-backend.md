# PHASE 6 — BACKEND (GHG CALCULATION ENGINE)

## Explanation (WHY)

The backend is the "brain" of your carbon accounting app. It:
- Receives data from the frontend
- Validates it again (server-side validation)
- Looks up emission factors from the database
- Calculates CO₂, CH₄, N₂O emissions
- Converts to CO₂e using GWP values
- Saves everything with an audit trail

**Why server-side calculation?**
- Emission factors are stored securely in the database
- Calculation logic is consistent (not dependent on browser)
- Audit trail is guaranteed (server logs everything)
- Prevents tampering (users can't modify factors)

---

## Project Structure

```
backend/
├── server.js              # Main entry point
├── package.json           # Dependencies
├── .env                   # Environment variables
├── config/
│   └── db.js              # MongoDB connection
├── models/
│   ├── ActivityData.js    # Activity data schema
│   ├── EmissionFactor.js  # Emission factor schema
│   ├── Calculation.js     # Calculation result schema
│   └── AuditLog.js        # Audit log schema
├── routes/
│   └── api.js             # API routes
├── controllers/
│   └── calculationController.js  # Calculation logic
├── middleware/
│   ├── validation.js      # Input validation
│   └── audit.js           # Audit logging
└── data/
    └── emissionFactors.json  # Default emission factors
```

---

## Step-by-Step Implementation

### Step 1: Initialize Project

```bash
# Create project folder
mkdir carbon-accounting-backend
cd carbon-accounting-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express mongoose dotenv cors
npm install --save-dev nodemon
```

**package.json:**
```json
{
  "name": "carbon-accounting-backend",
  "version": "1.0.0",
  "description": "GHG Calculation Engine for Carbon Accounting",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mongoose": "^7.6.3"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

---

### Step 2: Environment Variables (`.env`)

**WHY:** Never hardcode sensitive data like database URLs.

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/carbonaccounting
NODE_ENV=development
```

---

### Step 3: Database Connection (`config/db.js`)

```javascript
// MongoDB connection setup
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

### Step 4: Emission Factors Data (`data/emissionFactors.json`)

**WHY:** Default emission factors from IPCC AR5. These are loaded into the database on first run.

```json
{
  "scope_1": {
    "diesel_generator": {
      "CO2": 2.68,
      "CH4": 0.0002,
      "N2O": 0.00001,
      "unit": "kg/liter",
      "source": "IPCC AR5"
    },
    "diesel_vehicle": {
      "CO2": 2.68,
      "CH4": 0.0002,
      "N2O": 0.00001,
      "unit": "kg/liter",
      "source": "IPCC AR5"
    },
    "petrol_vehicle": {
      "CO2": 2.31,
      "CH4": 0.0003,
      "N2O": 0.00002,
      "unit": "kg/liter",
      "source": "IPCC AR5"
    },
    "lpg_combustion": {
      "CO2": 1.51,
      "CH4": 0.0001,
      "N2O": 0.00001,
      "unit": "kg/kg",
      "source": "IPCC AR5"
    },
    "refrigerant_leak": {
      "CO2": 0,
      "CH4": 0,
      "N2O": 0,
      "GWP": 1430,
      "unit": "kg/kg",
      "source": "IPCC AR5",
      "note": "R-134a refrigerant, GWP applied directly"
    }
  },
  "scope_2": {
    "electricity_grid": {
      "CO2": 0.57,
      "CH4": 0.00001,
      "N2O": 0.000005,
      "unit": "kg/kWh",
      "source": "Sri Lanka CEA 2023",
      "region": "Sri Lanka"
    },
    "purchased_heat": {
      "CO2": 0.20,
      "CH4": 0.00001,
      "N2O": 0.000001,
      "unit": "kg/kWh",
      "source": "IPCC AR5"
    }
  },
  "scope_3": {
    "office_paper": {
      "CO2": 1.09,
      "CH4": 0.0001,
      "N2O": 0.00001,
      "unit": "kg/ream",
      "source": "EPA"
    },
    "waste_landfill": {
      "CO2": 0.58,
      "CH4": 0.0005,
      "N2O": 0.00001,
      "unit": "kg/kg",
      "source": "IPCC AR5"
    },
    "waste_recycled": {
      "CO2": 0.1,
      "CH4": 0.00001,
      "N2O": 0.000001,
      "unit": "kg/kg",
      "source": "EPA"
    },
    "employee_commuting": {
      "CO2": 0.21,
      "CH4": 0.00001,
      "N2O": 0.000001,
      "unit": "kg/km",
      "source": "DEFRA"
    },
    "equipment_purchase": {
      "CO2": 0.5,
      "CH4": 0.00001,
      "N2O": 0.000001,
      "unit": "kg/USD",
      "source": "EEIO"
    }
  }
}
```

---

### Step 5: Database Models

#### ActivityData Model (`models/ActivityData.js`)

```javascript
const mongoose = require('mongoose');

const activityDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scope: {
    type: String,
    enum: ['scope_1', 'scope_2', 'scope_3'],
    required: true
  },
  sourceType: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  dateFrom: {
    type: Date,
    required: true
  },
  dateTo: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt automatically
});

// Index for faster queries
activityDataSchema.index({ scope: 1, dateFrom: 1 });
activityDataSchema.index({ userId: 1 });

module.exports = mongoose.model('ActivityData', activityDataSchema);
```

#### EmissionFactor Model (`models/EmissionFactor.js`)

```javascript
const mongoose = require('mongoose');

const emissionFactorSchema = new mongoose.Schema({
  scope: {
    type: String,
    enum: ['scope_1', 'scope_2', 'scope_3'],
    required: true
  },
  sourceType: {
    type: String,
    required: true
  },
  gasType: {
    type: String,
    enum: ['CO2', 'CH4', 'N2O'],
    required: true
  },
  factorValue: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  region: {
    type: String,
    default: 'global'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for unique factor lookup
emissionFactorSchema.index(
  { scope: 1, sourceType: 1, gasType: 1, year: 1, region: 1 },
  { unique: true }
);

module.exports = mongoose.model('EmissionFactor', emissionFactorSchema);
```

#### Calculation Model (`models/Calculation.js`)

```javascript
const mongoose = require('mongoose');

const calculationSchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ActivityData',
    required: true
  },
  scope: {
    type: String,
    enum: ['scope_1', 'scope_2', 'scope_3'],
    required: true
  },
  sourceType: {
    type: String,
    required: true
  },
  co2: {
    type: Number,
    required: true
  },
  ch4: {
    type: Number,
    required: true
  },
  n2o: {
    type: Number,
    required: true
  },
  co2e: {
    type: Number,
    required: true
  },
  factorUsed: {
    co2Factor: Number,
    ch4Factor: Number,
    n2oFactor: Number,
    source: String,
    year: Number
  },
  gwpValues: {
    co2: { type: Number, default: 1 },
    ch4: { type: Number, default: 28 },
    n2o: { type: Number, default: 265 }
  }
}, {
  timestamps: true
});

calculationSchema.index({ activityId: 1 });
calculationSchema.index({ scope: 1 });

module.exports = mongoose.model('Calculation', calculationSchema);
```

#### AuditLog Model (`models/AuditLog.js`)

```javascript
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'VALIDATE', 'CALCULATE'],
    required: true
  },
  collection: {
    type: String,
    required: true
  },
  recordId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  oldValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  newValue: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  ipAddress: {
    type: String,
    default: ''
  },
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for audit queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ collection: 1, recordId: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
```

---

### Step 6: Validation Middleware (`middleware/validation.js`)

**WHY:** Server-side validation is the last line of defense. Never trust client-side validation alone.

```javascript
// Server-side validation middleware
const validateCalculationInput = (req, res, next) => {
  const { scope, sourceType, quantity, unit, dateFrom, dateTo } = req.body;
  const errors = [];

  // Validate scope
  const validScopes = ['scope_1', 'scope_2', 'scope_3'];
  if (!scope || !validScopes.includes(scope)) {
    errors.push('Invalid scope. Must be scope_1, scope_2, or scope_3');
  }

  // Validate source type
  if (!sourceType || typeof sourceType !== 'string' || sourceType.trim() === '') {
    errors.push('Source type is required');
  }

  // Validate quantity
  if (quantity === undefined || quantity === null) {
    errors.push('Quantity is required');
  } else if (typeof quantity !== 'number' || isNaN(quantity)) {
    errors.push('Quantity must be a number');
  } else if (quantity < 0) {
    errors.push('Quantity cannot be negative');
  } else if (quantity > 1000000) {
    errors.push('Quantity exceeds maximum allowed value');
  }

  // Validate unit
  if (!unit || typeof unit !== 'string' || unit.trim() === '') {
    errors.push('Unit is required');
  }

  // Validate dates
  if (!dateFrom) {
    errors.push('Start date is required');
  } else if (isNaN(new Date(dateFrom).getTime())) {
    errors.push('Invalid start date format');
  }

  if (!dateTo) {
    errors.push('End date is required');
  } else if (isNaN(new Date(dateTo).getTime())) {
    errors.push('Invalid end date format');
  }

  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    errors.push('Start date cannot be after end date');
  }

  // If errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  // No errors, proceed
  next();
};

module.exports = { validateCalculationInput };
```

---

### Step 7: Audit Middleware (`middleware/audit.js`)

**WHY:** Automatically logs every action for ISO 14064 compliance.

```javascript
// Audit logging middleware
const AuditLog = require('../models/AuditLog');

const logAudit = async (userId, action, collection, recordId, oldValue, newValue, req) => {
  try {
    await AuditLog.create({
      userId,
      action,
      collection,
      recordId,
      oldValue,
      newValue,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || ''
    });
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't fail the request if audit logging fails
  }
};

module.exports = { logAudit };
```

---

### Step 8: Calculation Controller (`controllers/calculationController.js`)

**WHY:** This is the CORE of your carbon accounting app. It performs all calculations.

```javascript
// Calculation controller - the heart of the GHG engine
const ActivityData = require('../models/ActivityData');
const EmissionFactor = require('../models/EmissionFactor');
const Calculation = require('../models/Calculation');
const { logAudit } = require('../middleware/audit');

// GWP values from IPCC AR5
const GWP = {
  CO2: 1,
  CH4: 28,
  N2O: 265
};

// Calculate emissions
const calculateEmissions = async (req, res) => {
  try {
    const { scope, sourceType, quantity, unit, dateFrom, dateTo, notes } = req.body;
    const userId = req.user?.id || '000000000000000000000000'; // Placeholder for now

    // Step 1: Get emission factors from database
    const factors = await EmissionFactor.find({
      scope,
      sourceType,
      isActive: true
    }).sort({ year: -1 }); // Get most recent factors

    if (!factors || factors.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No emission factors found for ${sourceType} in ${scope}`
      });
    }

    // Step 2: Extract individual gas factors
    const co2Factor = factors.find(f => f.gasType === 'CO2');
    const ch4Factor = factors.find(f => f.gasType === 'CH4');
    const n2oFactor = factors.find(f => f.gasType === 'N2O');

    if (!co2Factor) {
      return res.status(404).json({
        success: false,
        message: `CO2 emission factor not found for ${sourceType}`
      });
    }

    // Step 3: Calculate individual gas emissions
    // Formula: Activity Data × Emission Factor
    const co2Emission = quantity * co2Factor.factorValue;
    const ch4Emission = ch4Factor ? quantity * ch4Factor.factorValue : 0;
    const n2oEmission = n2oFactor ? quantity * n2oFactor.factorValue : 0;

    // Step 4: Convert to CO2e using GWP
    // Formula: CO2e = (CO2 × 1) + (CH4 × 28) + (N2O × 265)
    const co2e = (co2Emission * GWP.CO2) +
                 (ch4Emission * GWP.CH4) +
                 (n2oEmission * GWP.N2O);

    // Step 5: Save activity data to database
    const activityData = await ActivityData.create({
      userId,
      scope,
      sourceType,
      quantity,
      unit,
      dateFrom: new Date(dateFrom),
      dateTo: new Date(dateTo),
      notes: notes || ''
    });

    // Step 6: Save calculation result to database
    const calculation = await Calculation.create({
      activityId: activityData._id,
      scope,
      sourceType,
      co2: co2Emission,
      ch4: ch4Emission,
      n2o: n2oEmission,
      co2e: co2e,
      factorUsed: {
        co2Factor: co2Factor.factorValue,
        ch4Factor: ch4Factor?.factorValue || 0,
        n2oFactor: n2oFactor?.factorValue || 0,
        source: co2Factor.source,
        year: co2Factor.year
      },
      gwpValues: GWP
    });

    // Step 7: Log to audit trail
    await logAudit(
      userId,
      'CALCULATE',
      'Calculation',
      calculation._id,
      null,
      {
        activityId: activityData._id,
        scope,
        sourceType,
        quantity,
        co2: co2Emission,
        ch4: ch4Emission,
        n2o: n2oEmission,
        co2e: co2e
      },
      req
    );

    // Step 8: Return result
    res.status(201).json({
      success: true,
      message: 'Calculation completed successfully',
      data: {
        activityId: activityData._id,
        calculationId: calculation._id,
        scope,
        sourceType,
        quantity,
        unit,
        emissions: {
          co2: co2Emission,
          ch4: ch4Emission,
          n2o: n2oEmission,
          co2e: co2e
        },
        factorsUsed: {
          co2: co2Factor.factorValue,
          ch4: ch4Factor?.factorValue || 0,
          n2o: n2oFactor?.factorValue || 0,
          source: co2Factor.source,
          gwp: GWP
        }
      }
    });

  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all emissions
const getEmissions = async (req, res) => {
  try {
    const emissions = await ActivityData.find()
      .populate('calculation')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: emissions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get summary by scope
const getSummary = async (req, res) => {
  try {
    const summary = await Calculation.aggregate([
      {
        $group: {
          _id: '$scope',
          totalCo2e: { $sum: '$co2e' },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      scope1: 0,
      scope2: 0,
      scope3: 0,
      total: 0
    };

    summary.forEach(item => {
      if (item._id === 'scope_1') result.scope1 = item.totalCo2e;
      if (item._id === 'scope_2') result.scope2 = item.totalCo2e;
      if (item._id === 'scope_3') result.scope3 = item.totalCo2e;
      result.total += item.totalCo2e;
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  calculateEmissions,
  getEmissions,
  getSummary
};
```

---

### Step 9: API Routes (`routes/api.js`)

```javascript
const express = require('express');
const router = express.Router();
const {
  calculateEmissions,
  getEmissions,
  getSummary
} = require('../controllers/calculationController');
const { validateCalculationInput } = require('../middleware/validation');

// POST /api/calculate - Calculate emissions
router.post('/calculate', validateCalculationInput, calculateEmissions);

// GET /api/emissions - Get all emissions
router.get('/emissions', getEmissions);

// GET /api/summary - Get summary by scope
router.get('/summary', getSummary);

module.exports = router;
```

---

### Step 10: Main Server (`server.js`)

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(cors());  // Allow cross-origin requests from frontend
app.use(express.json());  // Parse JSON bodies

// Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
```

---

## Calculation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                CALCULATION FLOW                              │
└─────────────────────────────────────────────────────────────┘

Frontend sends: POST /api/calculate
{
  "scope": "scope_1",
  "sourceType": "diesel_generator",
  "quantity": 500,
  "unit": "liters",
  "dateFrom": "2025-01-01",
  "dateTo": "2025-01-31"
}
       │
       ▼
┌─────────────────┐
│  VALIDATION     │
│  middleware.js  │
│                 │
│  ✓ scope valid  │
│  ✓ quantity > 0 │
│  ✓ dates valid  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CONTROLLER     │
│  calculation    │
│  Controller.js  │
│                 │
│  Step 1: Get    │
│  emission       │
│  factors from   │
│  database       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DATABASE       │
│                 │
│  EmissionFactor │
│  .find({        │
│    scope:       │
│    "scope_1",   │
│    sourceType:  │
│    "diesel_gen" │
│  })             │
│                 │
│  Returns:       │
│  CO2: 2.68      │
│  CH4: 0.0002    │
│  N2O: 0.00001   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CALCULATE      │
│                 │
│  CO2 = 500 × 2.68│
│      = 1,340 kg │
│                 │
│  CH4 = 500 × 0.0002│
│      = 0.10 kg  │
│                 │
│  N2O = 500 × 0.00001│
│      = 0.005 kg │
│                 │
│  CO2e = (1340×1)│
│       + (0.1×28)│
│       + (0.005×265)│
│       = 1,344.125│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SAVE TO DB     │
│                 │
│  1. ActivityData│
│  2. Calculation │
│  3. AuditLog    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  RESPONSE       │
│                 │
│  {              │
│    success: true│
│    data: {      │
│      co2: 1340  │
│      ch4: 0.1   │
│      n2o: 0.005 │
│      co2e: 1344 │
│    }            │
│  }              │
└─────────────────┘
```

---

## Common Mistakes

❌ **Mistake 1:** Hardcoding emission factors in the controller
✅ **Solution:** Store factors in the database, fetch them dynamically

❌ **Mistake 2:** Not validating on the server (trusting client validation)
✅ **Solution:** Always validate on the server with `validation.js` middleware

❌ **Mistake 3:** Not logging audit trails
✅ **Solution:** Use `audit.js` middleware to log every calculation

❌ **Mistake 4:** Using floating-point math for money/carbon
✅ **Solution:** Use `toFixed()` for display, store as numbers in DB

❌ **Mistake 5:** No error handling
✅ **Solution:** Use try/catch in every controller function

---

## Next Action

Now that the backend is built, proceed to **Phase 7: Database** to design the MongoDB schema in detail.

---

*Phase 6 Complete ✅*
*Next: Phase 7 — Database (Traceable + Auditable)*

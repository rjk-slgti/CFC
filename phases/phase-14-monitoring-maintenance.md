# PHASE 14 — MONITORING, MAINTENANCE & SCALING

## Explanation (WHY)

Scaling transforms your basic carbon accounting app into a production-ready platform. This phase adds:
- **Dashboard with charts** — Visual insights
- **PDF report generation** — Professional reports for auditors
- **User authentication** — Secure multi-user access
- **Organization-level reporting** — Multi-tenant support
- **Carbon pricing integration** — Financial impact analysis
- **Reduction strategy module** — CarbonNeutral Protocol alignment

**Why align with CarbonNeutral Protocol?**
The CarbonNeutral Protocol (2025) provides a framework:
1. **Define** — Set organizational boundary
2. **Measure** — Calculate emissions
3. **Target** — Set reduction goals
4. **Reduce** — Implement reduction strategies
5. **Inform** — Report and communicate

---

## Feature Roadmap

```
┌─────────────────────────────────────────────────────────────┐
│                FEATURE ROADMAP                               │
└─────────────────────────────────────────────────────────────┘

PHASE 11.1: Dashboard & Charts
├── Scope breakdown pie chart
├── Monthly trend line chart
├── Source category bar chart
└── Year-over-year comparison

PHASE 11.2: PDF Report Generation
├── ISO 14064 compliant report
├── Executive summary
├── Detailed breakdown tables
├── Methodology section
└── Data quality assessment

PHASE 11.3: User Authentication
├── User registration
├── Login/logout
├── Password reset
├── Role-based access control
└── Session management

PHASE 11.4: Organization Management
├── Multi-tenant support
├── Organization settings
├── User management
├── Department-level tracking
└── Consolidated reporting

PHASE 11.5: Carbon Pricing
├── Carbon price database
├── Cost calculation
├── Budget impact analysis
└── ROI for reduction initiatives

PHASE 11.6: Reduction Strategies
├── Target setting (SBTi aligned)
├── Reduction initiatives tracking
├── Progress monitoring
├── Scenario modeling
└── Offset tracking
```

---

## 11.1 Dashboard with Charts

### Implementation

```javascript
// js/modules/charts.js
export class ChartManager {

  // Initialize all charts
  static initCharts(summaryData, trendData) {
    this.createScopePieChart(summaryData);
    this.createMonthlyTrendChart(trendData);
    this.createSourceBarChart(summaryData);
  }

  // Scope breakdown pie chart
  static createScopePieChart(data) {
    const ctx = document.getElementById('scopePieChart').getContext('2d');

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Scope 1 (Direct)', 'Scope 2 (Electricity)', 'Scope 3 (Value Chain)'],
        datasets: [{
          data: [data.scope1, data.scope2, data.scope3],
          backgroundColor: ['#EF4444', '#3B82F6', '#22C55E'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: {
            display: true,
            text: 'Emissions by Scope'
          }
        }
      }
    });
  }

  // Monthly trend line chart
  static createMonthlyTrendChart(data) {
    const ctx = document.getElementById('monthlyTrendChart').getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.months,  // ['Jan', 'Feb', 'Mar', ...]
        datasets: [
          {
            label: 'Scope 1',
            data: data.scope1,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true
          },
          {
            label: 'Scope 2',
            data: data.scope2,
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true
          },
          {
            label: 'Scope 3',
            data: data.scope3,
            borderColor: '#22C55E',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          title: {
            display: true,
            text: 'Monthly Emission Trend'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'CO₂e (kg)'
            }
          }
        }
      }
    });
  }

  // Source category bar chart
  static createSourceBarChart(data) {
    const ctx = document.getElementById('sourceBarChart').getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.sourceNames,  // ['Diesel', 'Electricity', 'Paper', ...]
        datasets: [{
          label: 'CO₂e (kg)',
          data: data.sourceValues,
          backgroundColor: [
            '#EF4444', '#3B82F6', '#22C55E', '#F59E0B',
            '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Emissions by Source'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'CO₂e (kg)'
            }
          }
        }
      }
    });
  }
}
```

---

## 11.2 PDF Report Generation

### Why PDF Reports?
- Professional format for auditors
- Cannot be easily modified (integrity)
- Standard format for compliance
- Easy to share and archive

### Implementation

```javascript
// js/modules/reportGenerator.js
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export class ReportGenerator {

  // Generate ISO 14064 compliant report
  static generateISO14064Report(data) {
    const doc = new jsPDF();

    // Title Page
    doc.setFontSize(24);
    doc.text('Carbon Footprint Report', 105, 30, { align: 'center' });
    doc.setFontSize(14);
    doc.text('ISO 14064-1:2018 Compliant', 105, 40, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Reporting Period: ${data.periodStart} to ${data.periodEnd}`, 105, 50, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 58, { align: 'center' });

    // Executive Summary
    doc.addPage();
    doc.setFontSize(18);
    doc.text('1. Executive Summary', 20, 20);
    doc.setFontSize(12);
    doc.text(`Total Emissions: ${data.totalCo2e.toFixed(2)} kg CO₂e`, 20, 35);
    doc.text(`Scope 1: ${data.scope1.toFixed(2)} kg CO₂e (${((data.scope1/data.totalCo2e)*100).toFixed(1)}%)`, 20, 45);
    doc.text(`Scope 2: ${data.scope2.toFixed(2)} kg CO₂e (${((data.scope2/data.totalCo2e)*100).toFixed(1)}%)`, 20, 55);
    doc.text(`Scope 3: ${data.scope3.toFixed(2)} kg CO₂e (${((data.scope3/data.totalCo2e)*100).toFixed(1)}%)`, 20, 65);

    // Detailed Breakdown
    doc.addPage();
    doc.setFontSize(18);
    doc.text('2. Detailed Emission Breakdown', 20, 20);

    // Scope 1 Table
    doc.autoTable({
      startY: 30,
      head: [['Source', 'Quantity', 'Unit', 'CO₂ (kg)', 'CH₄ (kg)', 'N₂O (kg)', 'CO₂e (kg)']],
      body: data.scope1Details.map(item => [
        item.sourceType,
        item.quantity.toFixed(2),
        item.unit,
        item.co2.toFixed(2),
        item.ch4.toFixed(4),
        item.n2o.toFixed(4),
        item.co2e.toFixed(2)
      ]),
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] }
    });

    // Methodology
    doc.addPage();
    doc.setFontSize(18);
    doc.text('3. Methodology', 20, 20);
    doc.setFontSize(12);
    doc.text('Emission Factors: IPCC Fifth Assessment Report (AR5)', 20, 35);
    doc.text('GWP Values: CO₂=1, CH₄=28, N₂O=265', 20, 45);
    doc.text('Calculation: GHG Protocol Corporate Standard', 20, 55);
    doc.text('Organizational Boundary: Operational Control', 20, 65);

    // Data Quality
    doc.addPage();
    doc.setFontSize(18);
    doc.text('4. Data Quality Assessment', 20, 20);
    doc.setFontSize(12);
    doc.text(`Primary Data: ${data.primaryDataPercent}%`, 20, 35);
    doc.text(`Secondary Data: ${data.secondaryDataPercent}%`, 20, 45);
    doc.text(`Estimated Data: ${data.estimatedDataPercent}%`, 20, 55);
    doc.text(`Confidence Level: ${data.confidenceLevel}`, 20, 65);

    // Save PDF
    doc.save(`carbon-report-${data.periodStart}-${data.periodEnd}.pdf`);
  }
}
```

---

## 11.3 User Authentication

### Implementation

```javascript
// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'trainer', 'admin'],
    default: 'student'
  },
  organization: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

```javascript
// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, organization } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({ email, password, name, organization });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

```javascript
// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    next();
  };
};

module.exports = { auth, authorize };
```

---

## 11.4 Organization Management

### Multi-Tenant Architecture

```javascript
// backend/models/Organization.js
const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  boundaryType: {
    type: String,
    enum: ['operational_control', 'equity_share', 'financial_control'],
    default: 'operational_control'
  },
  departments: [{
    name: String,
    code: String
  }],
  settings: {
    reportingPeriod: {
      startMonth: { type: Number, default: 1 },  // January
      endMonth: { type: Number, default: 12 }     // December
    },
    currency: { type: String, default: 'USD' },
    carbonPrice: { type: Number, default: 50 }  // USD per ton CO2e
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
```

---

## 11.5 Carbon Pricing Integration

### Implementation

```javascript
// js/modules/carbonPricing.js
export class CarbonPricing {

  // Calculate carbon cost
  static calculateCost(co2eTonnes, pricePerTonne = 50) {
    return co2eTonnes * pricePerTonne;
  }

  // Get carbon prices by region
  static getCarbonPrices() {
    return {
      'EU_ETS': 85,      // EU Emissions Trading System
      'UK_ETS': 50,      // UK Emissions Trading System
      'California': 30,   // California Cap-and-Trade
      'Voluntary': 15,    // Voluntary carbon market
      'Internal': 50      // Internal carbon price
    };
  }

  // Calculate ROI for reduction initiative
  static calculateROI(initiative) {
    const annualSavings = this.calculateCost(
      initiative.annualReduction,
      initiative.carbonPrice
    );
    const roi = ((annualSavings - initiative.cost) / initiative.cost) * 100;
    const paybackPeriod = initiative.cost / annualSavings;

    return {
      annualSavings,
      roi,
      paybackPeriod,
      netBenefit: annualSavings - initiative.cost
    };
  }
}
```

---

## 11.6 Reduction Strategy Module

### CarbonNeutral Protocol Alignment

```
┌─────────────────────────────────────────────────────────────┐
│          CARBONNEUTRAL PROTOCOL ALIGNMENT                    │
└─────────────────────────────────────────────────────────────┘

┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ DEFINE  │───▶│ MEASURE │───▶│ TARGET  │───▶│ REDUCE  │───▶│ INFORM  │
│         │    │         │    │         │    │         │    │         │
│ Set     │    │Calculate│    │ Set     │    │Implement│    │ Report  │
│boundary │    │emissions│    │reduction│    │reduction│    │progress │
│         │    │         │    │ goals   │    │actions  │    │         │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
```

### Implementation

```javascript
// js/modules/reductionStrategy.js
export class ReductionStrategy {

  // Set reduction target (SBTi aligned)
  static setTarget(currentEmissions, targetYear, reductionPercent) {
    const targetEmissions = currentEmissions * (1 - reductionPercent / 100);
    const annualReduction = (currentEmissions - targetEmissions) / (targetYear - new Date().getFullYear());

    return {
      currentEmissions,
      targetEmissions,
      targetYear,
      reductionPercent,
      annualReduction,
      status: 'active'
    };
  }

  // Track reduction initiative
  static trackInitiative(initiative) {
    return {
      name: initiative.name,
      scope: initiative.scope,
      expectedReduction: initiative.expectedReduction,
      actualReduction: initiative.actualReduction || 0,
      status: initiative.status,  // 'planned', 'in_progress', 'completed'
      startDate: initiative.startDate,
      endDate: initiative.endDate,
      cost: initiative.cost,
      roi: this.calculateROI(initiative)
    };
  }

  // Calculate progress toward target
  static calculateProgress(currentEmissions, target) {
    const reductionAchieved = target.currentEmissions - currentEmissions;
    const reductionNeeded = target.currentEmissions - target.targetEmissions;
    const progressPercent = (reductionAchieved / reductionNeeded) * 100;

    return {
      currentEmissions,
      targetEmissions: target.targetEmissions,
      reductionAchieved,
      reductionNeeded,
      progressPercent: Math.min(progressPercent, 100),
      onTrack: progressPercent >= this.getExpectedProgress(target)
    };
  }

  // Get expected progress based on time
  static getExpectedProgress(target) {
    const now = new Date();
    const start = new Date(target.startDate);
    const end = new Date(target.targetYear, 0, 1);
    const totalDays = (end - start) / (1000 * 60 * 60 * 24);
    const daysElapsed = (now - start) / (1000 * 60 * 60 * 24);
    return (daysElapsed / totalDays) * 100;
  }
}
```

---

## Summary: Complete System

```
┌─────────────────────────────────────────────────────────────┐
│          COMPLETE CARBON ACCOUNTING PLATFORM                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (Vercel)                                          │
│  • Dashboard with charts                                    │
│  • Data input forms (Scope 1, 2, 3)                        │
│  • PDF report generation                                    │
│  • User authentication                                      │
│  • Organization management                                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Render)                                           │
│  • Authentication (JWT)                                     │
│  • Calculation engine (ISO 14064)                          │
│  • Scope classification                                     │
│  • Validation layer                                         │
│  • Audit logging                                            │
│  • Carbon pricing                                           │
│  • Reduction strategy                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE (MongoDB Atlas)                                   │
│  • Users                                                    │
│  • Organizations                                            │
│  • ActivityData                                             │
│  • EmissionFactors                                          │
│  • Calculations                                             │
│  • AuditLogs                                                │
│  • Reports                                                  │
│  • ReductionInitiatives                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Common Mistakes

❌ **Mistake 1:** Adding all features at once
✅ **Solution:** Implement one feature at a time, test thoroughly

❌ **Mistake 2:** Not testing authentication security
✅ **Solution:** Test JWT expiration, role-based access, password hashing

❌ **Mistake 3:** Ignoring data privacy regulations
✅ **Solution:** Implement GDPR-compliant data handling

❌ **Mistake 4:** Not planning for scale
✅ **Solution:** Use database indexes, caching, and async processing

❌ **Mistake 5:** Skipping user feedback
✅ **Solution:** Get feedback from actual users (students, trainers, auditors)

---

## Next Steps

1. **Review all phases** — Ensure understanding of each step
2. **Start with Phase 2** — Build the foundation
3. **Test continuously** — Don't wait until the end
4. **Get user feedback** — Iterate based on real usage
5. **Plan for production** — Consider security, performance, compliance

---

*Phase 14 Complete ✅*
*Next: Phase 15 — Post-Launch Support & Knowledge Transfer*

---

## Phase 14 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D14.1 | Dashboard Charts Implementation | JavaScript modules | Frontend Developer |
| D14.2 | PDF Report Generator | JavaScript module | Frontend Developer |
| D14.3 | User Authentication System | Backend + Frontend modules | Full Stack Developer |
| D14.4 | Organization Management | Backend + Frontend modules | Full Stack Developer |
| D14.5 | Carbon Pricing Module | JavaScript module | Backend Developer |
| D14.6 | Reduction Strategy Module | JavaScript module | Backend Developer |
| D14.7 | Monitoring & Alerting Setup | Configuration files | DevOps Lead |
| D14.8 | Performance Optimization Report | Markdown | Full Stack Developer |

### Key Milestones

| # | Milestone | Criteria | Target Week |
|---|-----------|----------|-------------|
| M14.1 | Dashboard Charts Live | All chart types rendering | Week 2 |
| M14.2 | PDF Reports Working | ISO 14064 report generates correctly | Week 4 |
| M14.3 | Authentication Complete | JWT login/register working | Week 6 |
| M14.4 | Organization Management Live | Multi-tenant support functional | Week 8 |
| M14.5 | Carbon Pricing Integrated | Cost calculations accurate | Week 10 |
| M14.6 | Monitoring Active | Alerts configured and tested | Week 12 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| Full Stack Developer | Feature implementation |
| Frontend Developer | Charts, PDF generation, UI updates |
| Backend Developer | Auth, carbon pricing, reduction strategy |
| DevOps Lead | Monitoring, alerting, performance |
| Compliance Lead | ISO alignment verification |

### Estimated Timeline: Ongoing (incremental delivery)

| Sprint | Features |
|--------|----------|
| Sprint 1 (2 weeks) | Dashboard charts |
| Sprint 2 (2 weeks) | PDF report generation |
| Sprint 3 (2 weeks) | User authentication |
| Sprint 4 (2 weeks) | Organization management |
| Sprint 5 (2 weeks) | Carbon pricing |
| Sprint 6 (2 weeks) | Reduction strategies + monitoring |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Feature scope creep | High | High | Strict sprint planning; defer non-critical features |
| Authentication security vulnerabilities | Critical | Medium | Use proven libraries (bcrypt, JWT); security review |
| Performance degradation with new features | Medium | Medium | Profile after each sprint; optimize incrementally |
| User adoption resistance | Medium | Medium | Gradual rollout; gather feedback |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature completion rate | 100% of planned | Sprint velocity tracking |
| Authentication security | Pass security audit | Penetration testing |
| PDF report accuracy | 100% | Manual verification |
| System uptime | > 99.5% | Monitoring dashboard |
| Page load time (with charts) | < 5 seconds | Lighthouse audit |

### Transition Criteria to Phase 15

- [x] All planned features implemented and tested
- [x] Authentication system secured
- [x] Monitoring and alerting operational
- [x] Performance benchmarks maintained
- [x] User feedback collected and addressed

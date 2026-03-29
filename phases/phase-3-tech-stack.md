# PHASE 3 — TECH STACK (JUSTIFIED SELECTION)

## Explanation (WHY)

Choosing the right technology stack is like choosing the right tools for building a house. You need tools that:
- Work well together
- Are beginner-friendly
- Can scale as your project grows
- Support your specific requirements (ISO compliance, auditability)

**Why this specific stack for Carbon Accounting?**
- **HTML + Tailwind CSS + JavaScript:** Fast to learn, widely used, great for dashboards
- **Node.js + Express:** Same language (JavaScript) for frontend AND backend — less to learn
- **MongoDB:** Flexible document structure, perfect for varied emission data
- **Vercel + Render:** Free tiers available, easy deployment, beginner-friendly

---

## Tech Stack Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    TECH STACK                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  FRONTEND (What users see)                                  │
│                                                             │
│  ┌─────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  HTML5  │  │Tailwind CSS │  │ JavaScript  │            │
│  │         │  │             │  │ (ES6+)      │            │
│  │Structure│  │  Styling    │  │  Logic      │            │
│  └─────────┘  └─────────────┘  └─────────────┘            │
│                                                             │
│  Deployed on: Vercel (free, fast, auto-deploy)             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND (Server logic)                                     │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │  Node.js    │  │  Express.js │                          │
│  │             │  │             │                          │
│  │ Runtime     │  │ Web         │                          │
│  │ Environment │  │ Framework   │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                             │
│  Deployed on: Render (free tier, auto-deploy from GitHub)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  DATABASE (Data storage)                                    │
│                                                             │
│  ┌─────────────────────────────────┐                       │
│  │          MongoDB                │                       │
│  │                                 │                       │
│  │  • Flexible document structure  │                       │
│  │  • JSON-like documents         │                       │
│  │  • Easy to learn               │                       │
│  │  • Great for varied data       │                       │
│  └─────────────────────────────────┘                       │
│                                                             │
│  Deployed on: MongoDB Atlas (free tier, cloud-hosted)      │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step: Why Each Technology

### 1. Frontend Technologies

#### A. HTML5 (Structure)

**WHY:** HTML is the skeleton of every web page. It defines WHAT content appears.

```html
<!-- Example: Emission input form -->
<form id="emission-form">
  <label for="fuel-type">Fuel Type:</label>
  <select id="fuel-type" name="fuelType" required>
    <option value="diesel">Diesel</option>
    <option value="petrol">Petrol</option>
    <option value="lpg">LPG</option>
  </select>

  <label for="quantity">Quantity:</label>
  <input type="number" id="quantity" name="quantity" min="0" required>

  <button type="submit">Calculate</button>
</form>
```

**Benefits:**
- ✅ Universal — works in every browser
- ✅ Easy to learn — simple tag-based syntax
- ✅ Accessible — screen readers can interpret it
- ✅ SEO-friendly — search engines can index it

**Trade-offs:**
- ❌ No styling (needs CSS)
- ❌ No interactivity (needs JavaScript)

---

#### B. Tailwind CSS (Styling)

**WHY:** Tailwind makes it FAST to style your app without writing custom CSS.

```html
<!-- Without Tailwind (custom CSS needed): -->
<style>
  .card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
</style>
<div class="card">Content</div>

<!-- With Tailwind (utility classes): -->
<div class="bg-white rounded-lg p-4 shadow-md">Content</div>
```

**Benefits:**
- ✅ Fast development — no switching between HTML and CSS files
- ✅ Consistent design — predefined spacing, colors, sizes
- ✅ Responsive — built-in mobile/tablet/desktop support
- ✅ Small file size — only includes CSS you actually use

**Trade-offs:**
- ❌ HTML can look cluttered with many classes
- ❌ Learning curve for utility-first approach

**Alternatives:**
- Bootstrap: More opinionated, includes JavaScript components
- Custom CSS: More control, but slower to write

---

#### C. JavaScript ES6+ (Logic)

**WHY:** JavaScript makes your app interactive. It handles user input, calls APIs, and updates the page.

```javascript
// Example: Handle form submission
document.getElementById('emission-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Get form data
  const formData = {
    fuelType: document.getElementById('fuel-type').value,
    quantity: parseFloat(document.getElementById('quantity').value)
  };

  // Send to backend
  const response = await fetch('https://api.carbonaccount.com/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });

  const result = await response.json();

  // Display result
  document.getElementById('result').textContent =
    `CO₂e: ${result.co2e} kg`;
});
```

**Benefits:**
- ✅ Same language as backend (Node.js) — less to learn
- ✅ Async/await for API calls
- ✅ Modern features (arrow functions, destructuring, modules)
- ✅ Huge ecosystem of libraries

**Trade-offs:**
- ❌ Browser differences (though modern browsers are consistent)
- ❌ Can become messy without good structure

---

### 2. Backend Technologies

#### A. Node.js (Runtime)

**WHY:** Node.js lets you run JavaScript on the server. One language for everything!

```
┌─────────────────────────────────────────────────────────────┐
│                    WHY NODE.JS?                              │
└─────────────────────────────────────────────────────────────┘

Traditional Setup:              Node.js Setup:
┌─────────────┐                ┌─────────────┐
│ Frontend    │                │ Frontend    │
│ (JavaScript)│                │ (JavaScript)│
└──────┬──────┘                └──────┬──────┘
       │                              │
       │ Different                    │ SAME
       │ language                     │ language!
       │                              │
┌──────┴──────┐                ┌──────┴──────┐
│ Backend     │                │ Backend     │
│ (Python/    │                │ (JavaScript)│
│  Java/PHP)  │                │             │
└─────────────┘                └─────────────┘
```

**Benefits:**
- ✅ One language (JavaScript) for frontend AND backend
- ✅ Fast execution (V8 engine)
- ✅ Huge npm ecosystem (over 1 million packages)
- ✅ Great for APIs and real-time applications
- ✅ Non-blocking I/O (handles many requests efficiently)

**Trade-offs:**
- ❌ Not ideal for CPU-intensive calculations (but fine for carbon accounting)
- ❌ Callback hell (mitigated with async/await)

---

#### B. Express.js (Web Framework)

**WHY:** Express makes it easy to create API endpoints. It's the most popular Node.js framework.

```javascript
// Example: Create a calculation endpoint
const express = require('express');
const app = express();

app.use(express.json()); // Parse JSON bodies

// POST /calculate endpoint
app.post('/calculate', (req, res) => {
  const { fuelType, quantity } = req.body;

  // Calculate emissions
  const emissionFactor = getEmissionFactor(fuelType);
  const co2 = quantity * emissionFactor.co2;
  const co2e = co2; // Simplified for example

  res.json({
    success: true,
    data: {
      fuelType,
      quantity,
      co2,
      co2e,
      scope: 'scope_1'
    }
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**Benefits:**
- ✅ Minimal and flexible
- ✅ Easy routing (`app.get()`, `app.post()`)
- ✅ Middleware support (authentication, logging, etc.)
- ✅ Huge community and documentation

**Trade-offs:**
- ❌ Minimal structure (you define your own)
- ❌ Need to add middleware for common tasks

**Alternatives:**
- Fastify: Faster, more structured
- Koa: More modern, uses async/await natively
- NestJS: Full-featured, TypeScript-first (steeper learning curve)

---

### 3. Database

#### MongoDB (Document Database)

**WHY:** Carbon accounting data varies in structure. MongoDB's flexible document model is perfect for this.

```
┌─────────────────────────────────────────────────────────────┐
│              WHY MONGODB FOR CARBON ACCOUNTING?              │
└─────────────────────────────────────────────────────────────┘

Traditional SQL (Rigid):        MongoDB (Flexible):
┌─────────────────────┐        ┌─────────────────────┐
│ activity_data       │        │ {                   │
│ ─────────────────── │        │   _id: "...",       │
│ id        | INT     │        │   scope: "scope_1", │
│ scope     | VARCHAR │        │   sourceType:       │
│ source    | VARCHAR │        │     "diesel_gen",   │
│ quantity  | DECIMAL │        │   quantity: 500,    │
│ unit      | VARCHAR │        │   unit: "liters",   │
│ date      | DATE    │        │   date: ISODate(),  │
│ notes     | TEXT    │        │   notes: "...",     │
│ ...       | ...     │        │   customField:      │
│ (fixed    |         │        │     "any value"     │
│  columns) │         │        │ }                   │
└─────────────────────┘        └─────────────────────┘
  Need to ALTER table            Add any field anytime
  to add new columns             without changing schema
```

**Benefits:**
- ✅ Flexible schema — add fields without migrations
- ✅ JSON-like documents — natural for JavaScript developers
- ✅ Easy to store varied emission data (different sources have different fields)
- ✅ Built-in indexing for fast queries
- ✅ MongoDB Atlas provides free cloud hosting

**Trade-offs:**
- ❌ No strict schema enforcement (need validation in code)
- ❌ No JOIN operations (need to handle relationships in code)
- ❌ Less mature than SQL for complex transactions

**Alternatives:**
- PostgreSQL: Better for strict schema, complex queries, transactions
- MySQL: Popular, mature, good for structured data

**Why MongoDB wins for this project:**
- Emission data varies by source type (diesel has different fields than electricity)
- Beginner-friendly (JSON documents are easy to understand)
- Great integration with Node.js (Mongoose ODM)
- Free tier on MongoDB Atlas

---

### 4. Deployment

#### A. Vercel (Frontend)

**WHY:** Vercel is the easiest way to deploy frontend apps. Free, fast, automatic.

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL DEPLOYMENT                         │
└─────────────────────────────────────────────────────────────┘

  GitHub Push → Vercel detects → Builds → Deploys → Live URL
       │              │            │         │          │
       │              │            │         │          │
  git push      Auto-detects    Compiles   Deploys   https://
  main branch   framework       assets     to CDN    yourapp.vercel.app
```

**Benefits:**
- ✅ Free tier (perfect for learning)
- ✅ Automatic deployments from GitHub
- ✅ Global CDN (fast loading worldwide)
- ✅ Custom domains supported
- ✅ HTTPS included

**Trade-offs:**
- ❌ Static sites only (no server-side code)
- ❌ Limited build minutes on free tier

---

#### B. Render (Backend)

**WHY:** Render makes it easy to deploy Node.js backends. Free tier available.

```
┌─────────────────────────────────────────────────────────────┐
│                    RENDER DEPLOYMENT                         │
└─────────────────────────────────────────────────────────────┘

  GitHub Push → Render detects → Builds → Starts → Live URL
       │              │            │         │          │
       │              │            │         │          │
  git push      Auto-detects    npm install Runs    https://
  main branch   Node.js         dependencies server  yourapi.onrender.com
```

**Benefits:**
- ✅ Free tier for web services
- ✅ Automatic deployments from GitHub
- ✅ Environment variables support
- ✅ Custom domains supported
- ✅ SSL certificates included

**Trade-offs:**
- ❌ Free tier has cold starts (slow first request after inactivity)
- ❌ Limited resources on free tier

**Alternatives:**
- Railway: Similar to Render, slightly different pricing
- Heroku: More established, but no free tier anymore
- AWS/Google Cloud: More powerful, but much more complex

---

#### C. MongoDB Atlas (Database)

**WHY:** MongoDB Atlas is the official cloud database for MongoDB. Free tier available.

```
┌─────────────────────────────────────────────────────────────┐
│                MONGODB ATLAS SETUP                          │
└─────────────────────────────────────────────────────────────┘

  1. Create free cluster (512MB storage)
  2. Set up database user
  3. Whitelist IP addresses
  4. Get connection string
  5. Use in your Node.js app

  Connection String:
  mongodb+srv://username:password@cluster.mongodb.net/carbonaccounting
```

**Benefits:**
- ✅ Free tier (512MB storage, shared cluster)
- ✅ Managed database (no server maintenance)
- ✅ Automatic backups
- ✅ Built-in security
- ✅ Easy scaling when needed

**Trade-offs:**
- ❌ Free tier has limitations
- ❌ Need to manage connection strings

---

## How Technologies Interact

```
┌─────────────────────────────────────────────────────────────┐
│                TECHNOLOGY INTERACTION                        │
└─────────────────────────────────────────────────────────────┘

User's Browser (Frontend)
┌─────────────────────────────────────────┐
│  HTML + Tailwind CSS + JavaScript       │
│                                         │
│  1. User fills form                     │
│  2. JavaScript validates input          │
│  3. JavaScript sends HTTP request       │
│     POST /api/calculate                 │
│     { fuelType: "diesel",              │
│       quantity: 500 }                   │
└──────────────────┬──────────────────────┘
                   │
                   │ HTTP Request (JSON)
                   │
                   ▼
Backend Server (Node.js + Express)
┌─────────────────────────────────────────┐
│  1. Express receives request            │
│  2. Validation middleware checks data   │
│  3. Route handler processes request     │
│  4. Mongoose queries MongoDB            │
│  5. Calculation engine computes CO₂e    │
│  6. Audit log is created                │
│  7. Response sent back                  │
│     { success: true,                   │
│       co2e: 1344.125,                  │
│       scope: "scope_1" }               │
└──────────────────┬──────────────────────┘
                   │
                   │ Mongoose ODM
                   │
                   ▼
Database (MongoDB Atlas)
┌─────────────────────────────────────────┐
│  Collections:                           │
│  • Users                                │
│  • ActivityData                         │
│  • EmissionFactors                      │
│  • Calculations                         │
│  • AuditLogs                            │
│                                         │
│  Data is stored as JSON documents       │
└─────────────────────────────────────────┘
```

---

## ISO Compliance & Auditability Support

| Requirement | How Tech Stack Supports It |
|-------------|---------------------------|
| **Traceability** | MongoDB stores complete documents with timestamps; AuditLogs collection tracks every change |
| **Data Validation** | Express middleware validates input; Mongoose schemas enforce structure |
| **Calculation Accuracy** | Node.js handles decimal math; Emission factors stored in database (not hardcoded) |
| **Audit Trail** | Every API request logged; Database changes tracked in AuditLogs |
| **Reporting** | JavaScript generates reports; PDF/Excel export libraries available |
| **Security** | JWT authentication; HTTPS on Vercel/Render; MongoDB Atlas encryption |

---

## Common Mistakes

❌ **Mistake 1:** Choosing a complex stack because it's "enterprise-grade"
✅ **Solution:** Start simple. You can always upgrade later.

❌ **Mistake 2:** Not using the same language for frontend and backend
✅ **Solution:** JavaScript everywhere reduces learning curve

❌ **Mistake 3:** Hardcoding configuration (database URLs, API keys)
✅ **Solution:** Use environment variables

❌ **Mistake 4:** Not using version control (Git)
✅ **Solution:** Use GitHub from day one

❌ **Mistake 5:** Trying to learn everything at once
✅ **Solution:** Learn in this order: HTML → CSS → JavaScript → Node.js → MongoDB

---

## Next Action

Now that you've selected your tech stack, proceed to **Phase 4: UI/UX Design** to plan how your app will look and feel.

---

*Phase 3 Complete ✅*
*Next: Phase 4 — UI/UX (Data + Reporting Focused)*

---

## Phase 3 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D3.1 | Tech Stack Selection Document | Markdown | Lead Developer |
| D3.2 | Technology Justification Matrix | Table/Spreadsheet | Lead Developer |
| D3.3 | Environment Setup Guide | Markdown | DevOps Lead |
| D3.4 | Development Environment Configuration | .env templates, package.json | DevOps Lead |
| D3.5 | GitHub Repository Structure | Git repo | Lead Developer |

### Key Milestones

| # | Milestone | Criteria | Target Week |
|---|-----------|----------|-------------|
| M3.1 | Tech Stack Finalized | All technologies selected with justification | Day 3 |
| M3.2 | Dev Environment Ready | All developers can run app locally | Day 5 |
| M3.3 | Repository Initialized | Git repo with folder structure and README | Day 5 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| Lead Developer | Technology selection, justification |
| DevOps Lead | Environment setup, deployment tooling |
| Project Manager | Budget alignment (free tier verification) |

### Estimated Timeline: 1 week

| Day | Activities |
|-----|-----------|
| Day 1-2 | Evaluate options, align with architecture requirements |
| Day 3 | Finalize selections, write justification |
| Day 4-5 | Set up dev environment, GitHub repo, verify all tools work |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Free tier limitations discovered | Medium | Medium | Document upgrade path; test limits early |
| Team unfamiliarity with stack | Medium | Medium | Schedule learning sessions in Phase 4 buffer |
| Tool compatibility issues | Low | Low | Verify integration before committing |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dev environment setup time | < 30 min | New developer onboarding test |
| All tools functional | 100% | Checklist verification |
| Documentation completeness | 100% | Setup guide tested by junior dev |

### Transition Criteria to Phase 4

- [x] Tech stack document approved
- [x] All developers have working local environments
- [x] GitHub repo initialized with proper structure
- [x] MongoDB Atlas cluster created and accessible

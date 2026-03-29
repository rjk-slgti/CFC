# PHASE 8 — INTEGRATION (FULL DATA FLOW)

## Explanation (WHY)

Integration connects the frontend and backend so they work together. Without proper integration:
- Frontend can't send data to backend
- Backend can't return results to frontend
- Users see errors instead of calculations

**Why is integration tricky?**
- Frontend and backend run on different ports (e.g., 5500 and 3000)
- Browsers block cross-origin requests by default (CORS)
- API responses must match what frontend expects
- Errors must be handled gracefully

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                INTEGRATION FLOW                              │
└─────────────────────────────────────────────────────────────┘

Frontend (Port 5500)              Backend (Port 3000)
┌─────────────────┐              ┌─────────────────┐
│                 │              │                 │
│  User fills     │              │  Express        │
│  form           │              │  server         │
│       │         │              │       │         │
│       ▼         │              │       ▼         │
│  JavaScript     │   HTTP/JSON  │  Route          │
│  sends POST     │─────────────▶│  handler        │
│  request        │              │       │         │
│       │         │              │       ▼         │
│       │         │              │  Validation     │
│       │         │              │  middleware     │
│       │         │              │       │         │
│       │         │              │       ▼         │
│       │         │              │  Calculation    │
│       │         │              │  controller     │
│       │         │              │       │         │
│       │         │              │       ▼         │
│       │         │              │  MongoDB        │
│       │         │              │  (save data)    │
│       │         │              │       │         │
│       ▼         │◀─────────────│       ▼         │
│  Display        │   Response   │  Return         │
│  results        │   JSON       │  results        │
│                 │              │                 │
└─────────────────┘              └─────────────────┘
```

---

## Step-by-Step Integration

### Step 1: Configure CORS in Backend

**WHY:** Browsers block requests from different origins (ports) by default.

```javascript
// server.js - Add CORS middleware
const cors = require('cors');

// Allow requests from frontend
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

**What is CORS?**
- Cross-Origin Resource Sharing
- Security feature that blocks requests from different domains/ports
- Must be enabled on the backend to allow frontend requests

---

### Step 2: Update Frontend API Module

**WHY:** The API module must point to the correct backend URL.

```javascript
// js/modules/api.js - Updated version
const API_BASE_URL = "http://localhost:3000/api";

export class ApiService {

  // Send emission data to backend for calculation
  static async calculateEmissions(data) {
    try {
      console.log("Sending to backend:", data);  // Debug log

      const response = await fetch(`${API_BASE_URL}/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      console.log("Response status:", response.status);  // Debug log

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Calculation failed");
      }

      const result = await response.json();
      console.log("Received from backend:", result);  // Debug log

      return result;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Get all emissions for dashboard
  static async getEmissions() {
    try {
      const response = await fetch(`${API_BASE_URL}/emissions`);
      if (!response.ok) {
        throw new Error("Failed to fetch emissions");
      }
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Get emission summary by scope
  static async getSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/summary`);
      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }
}
```

---

### Step 3: Handle API Responses in Frontend

**WHY:** Frontend must handle both success and error responses gracefully.

```javascript
// js/modules/formHandler.js - Updated onSubmit method
async onSubmit(e) {
  e.preventDefault();

  // Get form data
  const formData = {
    scope: this.scopeSelect.value,
    sourceType: this.sourceTypeSelect.value,
    quantity: parseFloat(document.getElementById('quantity').value),
    unit: this.unitSelect.value,
    dateFrom: document.getElementById('date-from').value,
    dateTo: document.getElementById('date-to').value,
    notes: document.getElementById('notes').value
  };

  // Validate
  const validation = Validator.validateForm(formData);
  if (!validation.valid) {
    alert("Validation errors:\n" + validation.errors.join("\n"));
    return;
  }

  // Show loading state
  const submitBtn = this.form.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Calculating...";
  submitBtn.disabled = true;

  try {
    // Send to backend
    const result = await ApiService.calculateEmissions(formData);

    // Display result
    this.displayResult(result.data);

    // Refresh dashboard
    this.refreshDashboard();

  } catch (error) {
    // Show user-friendly error message
    this.showError(error.message);
  } finally {
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
}

// Show error message
showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
  errorDiv.innerHTML = `
    <strong class="font-bold">Error!</strong>
    <span class="block sm:inline">${message}</span>
    <button class="float-right font-bold" onclick="this.parentElement.remove()">×</button>
  `;
  this.form.prepend(errorDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => errorDiv.remove(), 5000);
}

// Refresh dashboard after new entry
async refreshDashboard() {
  try {
    const summary = await ApiService.getSummary();
    UIManager.updateSummary(summary.data);
    UIManager.updateScopeChart(summary.data);

    const emissions = await ApiService.getEmissions();
    UIManager.updateRecentActivity(emissions.data);
  } catch (error) {
    console.error("Dashboard refresh error:", error);
  }
}
```

---

### Step 4: Add Loading States

**WHY:** Users need feedback that something is happening.

```javascript
// js/utils/helpers.js
export class UIHelpers {

  // Show loading spinner
  static showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = `
      <div class="flex justify-center items-center p-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span class="ml-2 text-gray-600">Loading...</span>
      </div>
    `;
  }

  // Hide loading spinner
  static hideLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = '';
  }

  // Show success message
  static showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4';
    successDiv.innerHTML = `
      <strong class="font-bold">Success!</strong>
      <span class="block sm:inline">${message}</span>
    `;
    return successDiv;
  }

  // Show error message
  static showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4';
    errorDiv.innerHTML = `
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">${message}</span>
    `;
    return errorDiv;
  }
}
```

---

### Step 5: Handle CORS Issues

**Common CORS Errors and Solutions:**

```
Error: Access to fetch at 'http://localhost:3000/api/calculate'
from origin 'http://localhost:5500' has been blocked by CORS policy
```

**Solution 1: Backend CORS Configuration**
```javascript
// server.js
app.use(cors({
  origin: 'http://localhost:5500',  // Allow specific origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Solution 2: Use Proxy (Development)**
```javascript
// In frontend, use relative URLs
const API_BASE_URL = "/api";  // Proxy will forward to backend

// Configure proxy in package.json (if using Vite/Webpack)
{
  "proxy": "http://localhost:3000"
}
```

**Solution 3: Environment Variables**
```javascript
// js/config.js
const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://yourapi.onrender.com/api'
    : 'http://localhost:3000/api'
};

export default config;
```

---

### Step 6: Handle API Errors

**WHY:** Network requests can fail for many reasons. Handle them gracefully.

```javascript
// js/modules/api.js - Enhanced error handling
static async calculateEmissions(data) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${API_BASE_URL}/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Handle different HTTP status codes
    if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.errors?.join(', ') || 'Invalid input data');
    }

    if (response.status === 404) {
      throw new Error('Emission factors not found for this source type');
    }

    if (response.status === 500) {
      throw new Error('Server error. Please try again later.');
    }

    if (!response.ok) {
      throw new Error('Request failed');
    }

    return await response.json();

  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw error;
  }
}
```

---

### Step 7: Complete Integration Example

**Full data flow from form to database and back:**

```
┌─────────────────────────────────────────────────────────────┐
│                COMPLETE DATA FLOW                            │
└─────────────────────────────────────────────────────────────┘

1. USER FILLS FORM
   ┌─────────────────────────────────────┐
   │ Scope: Scope 1                      │
   │ Source: Diesel Generator            │
   │ Quantity: 500                       │
   │ Unit: Liters                        │
   │ Date: 2025-01-01 to 2025-01-31     │
   └─────────────────────────────────────┘
                    │
                    ▼
2. FRONTEND VALIDATES
   ┌─────────────────────────────────────┐
   │ ✓ Scope is valid                    │
   │ ✓ Quantity is positive number       │
   │ ✓ Dates are valid                   │
   └─────────────────────────────────────┘
                    │
                    ▼
3. FRONTEND SENDS REQUEST
   ┌─────────────────────────────────────┐
   │ POST http://localhost:3000/api/     │
   │ calculate                           │
   │                                     │
   │ Body: {                             │
   │   "scope": "scope_1",              │
   │   "sourceType": "diesel_generator", │
   │   "quantity": 500,                  │
   │   "unit": "liters",                │
   │   "dateFrom": "2025-01-01",        │
   │   "dateTo": "2025-01-31"           │
   │ }                                   │
   └─────────────────────────────────────┘
                    │
                    ▼
4. BACKEND RECEIVES REQUEST
   ┌─────────────────────────────────────┐
   │ Express receives POST request       │
   │ CORS middleware allows request      │
   │ JSON body parsed                    │
   └─────────────────────────────────────┘
                    │
                    ▼
5. BACKEND VALIDATES
   ┌─────────────────────────────────────┐
   │ validation.js middleware checks:    │
   │ ✓ All required fields present       │
   │ ✓ Data types correct                │
   │ ✓ Quantity > 0                      │
   │ ✓ Dates valid                       │
   └─────────────────────────────────────┘
                    │
                    ▼
6. BACKEND LOOKS UP FACTORS
   ┌─────────────────────────────────────┐
   │ EmissionFactor.find({               │
   │   scope: "scope_1",                │
   │   sourceType: "diesel_generator"   │
   │ })                                  │
   │                                     │
   │ Returns:                            │
   │ CO2: 2.68 kg/liter                 │
   │ CH4: 0.0002 kg/liter               │
   │ N2O: 0.00001 kg/liter              │
   └─────────────────────────────────────┘
                    │
                    ▼
7. BACKEND CALCULATES
   ┌─────────────────────────────────────┐
   │ CO2 = 500 × 2.68 = 1,340 kg        │
   │ CH4 = 500 × 0.0002 = 0.10 kg       │
   │ N2O = 500 × 0.00001 = 0.005 kg     │
   │                                     │
   │ CO2e = (1340×1) + (0.1×28)         │
   │      + (0.005×265)                  │
   │      = 1,344.125 kg CO2e            │
   └─────────────────────────────────────┘
                    │
                    ▼
8. BACKEND SAVES TO DATABASE
   ┌─────────────────────────────────────┐
   │ 1. ActivityData.create({...})       │
   │ 2. Calculation.create({...})        │
   │ 3. AuditLog.create({...})           │
   └─────────────────────────────────────┘
                    │
                    ▼
9. BACKEND SENDS RESPONSE
   ┌─────────────────────────────────────┐
   │ {                                   │
   │   "success": true,                  │
   │   "data": {                         │
   │     "activityId": "...",           │
   │     "calculationId": "...",        │
   │     "emissions": {                  │
   │       "co2": 1340,                  │
   │       "ch4": 0.1,                   │
   │       "n2o": 0.005,                 │
   │       "co2e": 1344.125              │
   │     }                               │
   │   }                                 │
   │ }                                   │
   └─────────────────────────────────────┘
                    │
                    ▼
10. FRONTEND DISPLAYS RESULT
    ┌─────────────────────────────────────┐
    │ ✅ Calculation Complete              │
    │                                     │
    │ CO₂: 1,340.00 kg                   │
    │ CH₄: 0.10 kg                       │
    │ N₂O: 0.005 kg                      │
    │ CO₂e: 1,344.125 kg                 │
    │                                     │
    │ [Add Another Entry]                 │
    └─────────────────────────────────────┘
```

---

## Debugging Common Issues

### Issue 1: CORS Error
```
Access to fetch at 'http://localhost:3000/api/calculate'
from origin 'http://localhost:5500' has been blocked by CORS policy
```

**Solution:**
```javascript
// In backend server.js
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5500' }));
```

### Issue 2: Network Error
```
Failed to fetch
```

**Solutions:**
- Check if backend server is running
- Check if URL is correct
- Check firewall settings
- Check if port is correct

### Issue 3: 404 Not Found
```
Cannot POST /api/calculate
```

**Solutions:**
- Check if route is defined in `routes/api.js`
- Check if route is mounted in `server.js`
- Check URL path is correct

### Issue 4: 500 Internal Server Error
```
Internal server error
```

**Solutions:**
- Check backend console for error details
- Check if MongoDB is connected
- Check if emission factors exist in database
- Check validation middleware

---

## Common Mistakes

❌ **Mistake 1:** Not handling CORS
✅ **Solution:** Add `cors` middleware in backend

❌ **Mistake 2:** Not showing loading states
✅ **Solution:** Show "Calculating..." while waiting for response

❌ **Mistake 3:** Not handling errors gracefully
✅ **Solution:** Use try/catch and show user-friendly messages

❌ **Mistake 4:** Hardcoding API URLs
✅ **Solution:** Use environment variables or config file

❌ **Mistake 5:** Not logging API calls
✅ **Solution:** Add `console.log` for debugging (remove in production)

---

## Next Action

Now that frontend and backend are integrated, proceed to **Phase 9: Testing** to verify everything works correctly.

---

*Phase 8 Complete ✅*
*Next: Phase 9 — Testing (Verification Ready)*

---

## Phase 8 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D8.1 | CORS Configuration | server.js update | Backend Lead |
| D8.2 | Frontend API Module (Production-Ready) | JavaScript module | Frontend Lead |
| D8.3 | Error Handling Implementation | JavaScript modules | Full Stack Developers |
| D8.4 | Loading State Components | HTML/CSS/JavaScript | Frontend Developer |
| D8.5 | Integration Test Suite | Test scripts | QA Engineer |
| D8.6 | End-to-End Data Flow Verification | Test report | QA Engineer |

### Key Milestones

| # | Milestone | Criteria | Target Week |
|---|-----------|----------|-------------|
| M8.1 | CORS Configured | Frontend can reach backend without errors | Week 1 Day 2 |
| M8.2 | API Communication Working | Successful round-trip POST/GET | Week 1 Day 4 |
| M8.3 | Error Handling Complete | All error scenarios display user-friendly messages | Week 2 Day 2 |
| M8.4 | Full Data Flow Verified | Form → API → DB → Dashboard round-trip | Week 2 Day 4 |
| M8.5 | Integration Complete | All integration tests pass | Week 2 Day 5 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| Frontend Lead | API module updates, error handling |
| Backend Lead | CORS configuration, response format |
| Full Stack Developer | End-to-end integration |
| QA Engineer | Integration testing |

### Estimated Timeline: 2 weeks

| Week | Activities |
|------|-----------|
| Week 1 | CORS setup, API module update, basic connectivity |
| Week 2 | Error handling, loading states, integration testing |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| CORS blocking requests | High | High | Test CORS config first; use browser dev tools |
| API response format mismatch | High | Medium | Verify contract against Phase 2 API spec |
| Network timeout issues | Medium | Medium | Implement 10s timeout with retry logic |
| Data loss during integration | High | Low | Transaction-based saves; verify each step |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| API round-trip success rate | 100% | Integration test pass rate |
| Error handling coverage | 100% | All HTTP status codes handled |
| User feedback (loading/error) | < 500ms | Time to display feedback |
| Data integrity | 100% | Submitted data matches stored data |

### Transition Criteria to Phase 9

- [x] Frontend and backend communicate successfully
- [x] All API endpoints reachable from frontend
- [x] Error handling covers all scenarios
- [x] Full data flow (input → calculation → storage → display) works
- [x] Integration tests pass

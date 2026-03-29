# PHASE 13 — DEPLOYMENT (PRODUCTION)

## Explanation (WHY)

Deployment makes your app accessible to users worldwide. Without deployment:
- Only you can access the app (on your local machine)
- Users can't use it
- It's not a "real" application

**Why Vercel + Render + MongoDB Atlas?**
- **Free tiers** available (perfect for learning)
- **Automatic deployments** from GitHub
- **No server management** (they handle infrastructure)
- **HTTPS included** (secure by default)
- **Global CDN** (fast loading worldwide)

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                PRODUCTION ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────┘

User's Browser
       │
       │ HTTPS
       ▼
┌─────────────────┐
│  VERCEL         │
│  (Frontend)     │
│                 │
│  • HTML/CSS/JS  │
│  • Global CDN   │
│  • Auto-deploy  │
│                 │
│  URL: https://  │
│  carbonapp.     │
│  vercel.app     │
└────────┬────────┘
         │
         │ API calls
         │ HTTPS
         ▼
┌─────────────────┐
│  RENDER         │
│  (Backend)      │
│                 │
│  • Node.js      │
│  • Express      │
│  • Auto-deploy  │
│                 │
│  URL: https://  │
│  carbonapi.     │
│  onrender.com   │
└────────┬────────┘
         │
         │ MongoDB connection
         │ (encrypted)
         ▼
┌─────────────────┐
│  MONGODB ATLAS  │
│  (Database)     │
│                 │
│  • Cloud-hosted │
│  • Auto-backup  │
│  • 512MB free   │
│                 │
│  Cluster:       │
│  cluster0.      │
│  mongodb.net    │
└─────────────────┘
```

---

## Step-by-Step Deployment

### Step 1: Prepare Your Code

**A. Create GitHub Repository**

```bash
# Initialize Git repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Carbon Accounting Platform"

# Create repository on GitHub (via website)
# Then push:
git remote add origin https://github.com/yourusername/carbon-accounting-app.git
git branch -M main
git push -u origin main
```

**B. Project Structure**

```
carbon-accounting-app/
├── frontend/
│   ├── index.html
│   ├── js/
│   │   ├── app.js
│   │   └── modules/
│   └── css/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   └── middleware/
└── README.md
```

---

### Step 2: Deploy MongoDB Atlas

**A. Create Free Cluster**

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (choose FREE tier)
4. Select region closest to your users

**B. Configure Database**

1. Create database user:
   - Username: `carbonadmin`
   - Password: (generate strong password)
   - Save these credentials!

2. Whitelist IP addresses:
   - Add `0.0.0.0/0` (allow all IPs) for development
   - In production, restrict to Render's IP ranges

3. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your actual password

**Connection String Example:**
```
mongodb+srv://carbonadmin:yourpassword@cluster0.xxxxx.mongodb.net/carbonaccounting?retryWrites=true&w=majority
```

---

### Step 3: Deploy Backend (Render)

**A. Prepare Backend**

1. Update `package.json`:
```json
{
  "name": "carbon-accounting-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

2. Update `server.js` for production:
```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS configuration for production
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://your-app.vercel.app'  // Update with your Vercel URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Use PORT from environment variable (Render provides this)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

3. Create `.env` file (DO NOT commit to GitHub):
```env
PORT=3000
MONGODB_URI=mongodb+srv://carbonadmin:yourpassword@cluster0.xxxxx.mongodb.net/carbonaccounting?retryWrites=true&w=majority
NODE_ENV=production
```

**B. Deploy to Render**

1. Go to https://render.com
2. Sign up with GitHub account
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** carbon-accounting-api
   - **Region:** Choose closest to users
   - **Branch:** main
   - **Root Directory:** backend
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. Add Environment Variables:
   - `MONGODB_URI`: (your MongoDB connection string)
   - `NODE_ENV`: production

7. Click "Create Web Service"

8. Wait for deployment (5-10 minutes)

9. Copy your backend URL: `https://carbon-accounting-api.onrender.com`

---

### Step 4: Deploy Frontend (Vercel)

**A. Prepare Frontend**

1. Update API URL in `js/modules/api.js`:
```javascript
// Use environment-based URL
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://carbon-accounting-api.onrender.com/api';
```

2. Create `vercel.json` in frontend folder:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

**B. Deploy to Vercel**

1. Go to https://vercel.com
2. Sign up with GitHub account
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** frontend
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)

6. Click "Deploy"

7. Wait for deployment (2-3 minutes)

8. Copy your frontend URL: `https://carbon-accounting-app.vercel.app`

---

### Step 5: Update CORS Configuration

**WHY:** Backend must allow requests from your frontend URL.

```javascript
// backend/server.js - Update CORS origin
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://carbon-accounting-app.vercel.app'  // Your Vercel URL
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

**Redeploy backend after this change!**

---

### Step 6: Test Live System

```
┌─────────────────────────────────────────────────────────────┐
│                LIVE TESTING CHECKLIST                        │
└─────────────────────────────────────────────────────────────┘

FRONTEND:
[ ] Website loads correctly
[ ] All tabs work
[ ] Forms display correctly
[ ] Charts render properly
[ ] No console errors

BACKEND:
[ ] Health check works: https://yourapi.onrender.com/health
[ ] API endpoints respond
[ ] Database connection works
[ ] Calculations work correctly

INTEGRATION:
[ ] Form submission works
[ ] Data is saved to database
[ ] Calculations return correct results
[ ] Dashboard updates with new data
[ ] Error messages display correctly

SECURITY:
[ ] HTTPS is enabled
[ ] CORS is configured correctly
[ ] Environment variables are not exposed
[ ] Database credentials are secure
```

---

## Environment Variables

**WHY:** Never hardcode sensitive data in your code.

```
┌─────────────────────────────────────────────────────────────┐
│                ENVIRONMENT VARIABLES                         │
└─────────────────────────────────────────────────────────────┘

BACKEND (.env file - NOT in Git):
┌─────────────────────────────────────────────────────────────┐
│ PORT=3000                                                   │
│ MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db  │
│ NODE_ENV=production                                         │
└─────────────────────────────────────────────────────────────┘

RENDER (Environment Variables section):
┌─────────────────────────────────────────────────────────────┐
│ MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/db│
│ NODE_ENV = production                                       │
│ PORT = (auto-provided by Render)                            │
└─────────────────────────────────────────────────────────────┘

VERCEL (if needed):
┌─────────────────────────────────────────────────────────────┐
│ VITE_API_URL = https://yourapi.onrender.com/api             │
└─────────────────────────────────────────────────────────────┘
```

---

## Automatic Deployments

**WHY:** Every time you push to GitHub, your app automatically updates.

```
┌─────────────────────────────────────────────────────────────┐
│                AUTOMATIC DEPLOYMENT FLOW                     │
└─────────────────────────────────────────────────────────────┘

Developer pushes code to GitHub
       │
       ▼
GitHub sends webhook to Vercel/Render
       │
       ├──────────────────────────────────────┐
       │                                      │
       ▼                                      ▼
┌─────────────────┐                  ┌─────────────────┐
│  VERCEL         │                  │  RENDER         │
│                 │                  │                 │
│  1. Detects     │                  │  1. Detects     │
│     changes     │                  │     changes     │
│  2. Builds      │                  │  2. npm install │
│  3. Deploys     │                  │  3. Restarts    │
│  4. Live!       │                  │     server      │
│                 │                  │  4. Live!       │
└─────────────────┘                  └─────────────────┘
```

---

## Custom Domain (Optional)

**WHY:** `yourapp.com` looks more professional than `yourapp.vercel.app`.

**Vercel:**
1. Go to Project Settings → Domains
2. Add your domain (e.g., `carbonaccounting.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

**Render:**
1. Go to Service Settings → Custom Domains
2. Add your domain (e.g., `api.carbonaccounting.com`)
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

---

## Common Deployment Issues

### Issue 1: Build Fails
```
Error: Build failed
```

**Solutions:**
- Check `package.json` has correct scripts
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Check Node.js version compatibility

### Issue 2: Environment Variables Not Working
```
Error: MONGODB_URI is undefined
```

**Solutions:**
- Add environment variables in Render dashboard
- Redeploy after adding variables
- Check variable names match exactly

### Issue 3: CORS Errors in Production
```
Access to fetch at 'https://api.onrender.com' from origin
'https://app.vercel.app' has been blocked by CORS policy
```

**Solutions:**
- Update CORS origin in backend to include Vercel URL
- Redeploy backend
- Clear browser cache

### Issue 4: Database Connection Fails
```
Error: MongoServerError: Authentication failed
```

**Solutions:**
- Check MongoDB connection string
- Verify username and password
- Ensure IP address is whitelisted
- Check database name in connection string

---

## Common Mistakes

❌ **Mistake 1:** Committing `.env` file to GitHub
✅ **Solution:** Add `.env` to `.gitignore`

❌ **Mistake 2:** Not updating CORS for production
✅ **Solution:** Add production URLs to CORS origin

❌ **Mistake 3:** Hardcoding API URLs in frontend
✅ **Solution:** Use environment-based URL detection

❌ **Mistake 4:** Not testing after deployment
✅ **Solution:** Run through testing checklist on live system

❌ **Mistake 5:** Using free tier for production
✅ **Solution:** Upgrade to paid tier when ready for real users

---

## Next Action

Now that your app is deployed, proceed to **Phase 11: Scaling** to add advanced features.

---

*Phase 13 Complete ✅*
*Next: Phase 14 — Monitoring, Maintenance & Scaling*

---

## Phase 13 Deliverables & Milestones

### Deliverables

| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| D13.1 | GitHub Repository (Production-Ready) | Git repo | DevOps Lead |
| D13.2 | MongoDB Atlas (Production Cluster) | Cloud instance | DevOps Lead |
| D13.3 | Backend Deployed (Render) | Live URL | DevOps Lead |
| D13.4 | Frontend Deployed (Vercel) | Live URL | DevOps Lead |
| D13.5 | Environment Variables Configured | Cloud dashboards | DevOps Lead |
| D13.6 | Custom Domain (Optional) | DNS configuration | DevOps Lead |
| D13.7 | Deployment Runbook | Markdown | DevOps Lead |
| D13.8 | Live System Verification Report | Markdown with checklist | QA Engineer |

### Key Milestones

| # | Milestone | Criteria | Target Week |
|---|-----------|----------|-------------|
| M13.1 | MongoDB Atlas Production Ready | Cluster live, credentials secured | Day 1 |
| M13.2 | Backend Deployed | Health check returns OK | Day 2 |
| M13.3 | Frontend Deployed | Site loads, API calls succeed | Day 3 |
| M13.4 | CORS Configured for Production | No CORS errors in production | Day 4 |
| M13.5 | Live System Verified | All checklist items pass | Day 5 |

### Responsible Parties

| Role | Responsibility |
|------|---------------|
| DevOps Lead | Deployment, environment config, domain setup |
| Backend Lead | Production server configuration |
| Frontend Lead | Production API URL configuration |
| QA Engineer | Live system verification |

### Estimated Timeline: 1 week

| Day | Activities |
|-----|-----------|
| Day 1 | MongoDB Atlas production setup, credentials |
| Day 2 | Backend deployment to Render, environment variables |
| Day 3 | Frontend deployment to Vercel, API URL update |
| Day 4 | CORS update, redeploy backend, smoke testing |
| Day 5 | Full verification, documentation, sign-off |

### Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Environment variable misconfiguration | High | Medium | Use checklist; verify each variable |
| CORS errors in production | High | High | Test CORS immediately after deployment |
| Cold start latency (Render free tier) | Medium | High | Document limitation; plan upgrade |
| Database connection failures | High | Low | Whitelist IPs; test connection string |

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Deployment success | Both services live | Health check + page load |
| End-to-end functionality | 100% | Live testing checklist |
| HTTPS enabled | Yes | Browser padlock check |
| API response time (production) | < 2s | Postman test |

### Transition Criteria to Phase 14

- [x] Frontend accessible via public URL
- [x] Backend accessible via public URL
- [x] Database connected and operational
- [x] Full data flow works in production
- [x] HTTPS enabled on both services
- [x] Live testing checklist 100% complete

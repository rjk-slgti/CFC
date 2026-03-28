# Carbon Accounting Platform - System Architecture

## Phase 2: Enterprise System Architecture Design

### Architecture Overview

The Carbon Accounting Platform follows a **modular, microservices-inspired architecture** designed for scalability, maintainability, and auditability. The system is built to handle multi-tenant data, support ISO 14064 compliance, and provide real-time calculation capabilities.

---

## 1. Frontend Responsibilities

### **Data Input Layer**

| Component | Responsibility | Technology Stack |
|-----------|---------------|------------------|
| **Activity Data Forms** | Capture monthly/quarterly emission data | React/Vue.js with form validation |
| **File Upload** | Import utility bills, fuel receipts | Drag-and-drop interface |
| **Bulk Import** | CSV/Excel import for historical data | Template-based import wizard |
| **Real-time Validation** | Client-side data quality checks | Custom validation rules engine |

### **Visualization Layer**

| Component | Responsibility | Technology Stack |
|-----------|---------------|------------------|
| **Dashboard** | Real-time emission overview | Chart.js/D3.js/Recharts |
| **Scope Breakdown** | Pie/bar charts by scope | Interactive visualizations |
| **Trend Analysis** | Year-over-year comparisons | Time-series charts |
| **Source Analysis** | Emission by source category | Drill-down capabilities |
| **Export Module** | PDF/Excel report generation | jsPDF/ExcelJS |

### **User Interface Features**

```
┌─────────────────────────────────────────────────────────────┐
│                    CARBON ACCOUNTING DASHBOARD               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Scope 1    │  │  Scope 2    │  │  Scope 3    │         │
│  │  1,200 kg   │  │  8,500 kg   │  │   450 kg    │         │
│  │   CO₂e      │  │   CO₂e      │  │   CO₂e      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Monthly Emission Trend (Line Chart)                │   │
│  │  [Chart visualization]                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐        │
│  │  Recent Activity     │  │  Pending Approvals   │        │
│  │  • Diesel entry      │  │  • 3 entries         │        │
│  │  • Electricity bill  │  │  • 2 reports         │        │
│  └──────────────────────┘  └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Backend Components

### **Component Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY                            │
│  (Authentication, Rate Limiting, Request Routing)           │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  AUTH SERVICE │    │  DATA SERVICE │    │  CALC SERVICE │
│               │    │               │    │               │
│ • JWT tokens  │    │ • CRUD ops    │    │ • Scope class │
│ • Role-based  │    │ • Validation  │    │ • Emission    │
│   access      │    │ • File upload │    │   calculation │
│ • Session mgmt│    │ • Bulk import │    │ • CO₂e conv   │
└───────────────┘    └───────────────┘    └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   AUDIT SERVICE   │
                    │                   │
                    │ • Log all changes │
                    │ • Track user actions│
                    │ • Version control │
                    └───────────────────┘
```

### **A. Calculation Engine**

**Purpose:** Perform ISO 14064-compliant emission calculations

**Core Functions:**

```python
class CalculationEngine:
    
    def calculate_scope1(activity_data, emission_factor):
        """
        Calculate direct emissions
        Formula: Activity Data × Emission Factor × GWP
        """
        return activity_data * emission_factor * gwp_value
    
    def calculate_scope2(electricity_kwh, grid_factor):
        """
        Calculate indirect emissions from purchased energy
        Formula: kWh × Grid Emission Factor
        """
        return electricity_kwh * grid_factor
    
    def calculate_scope3(activity_data, emission_factor):
        """
        Calculate other indirect emissions
        Formula: Activity Data × Emission Factor × GWP
        """
        return activity_data * emission_factor * gwp_value
    
    def convert_to_co2e(emissions_by_gas):
        """
        Convert individual gas emissions to CO2 equivalent
        CO2e = (CO2 × 1) + (CH4 × 28) + (N2O × 265)
        """
        return (
            emissions_by_gas['CO2'] * 1 +
            emissions_by_gas['CH4'] * 28 +
            emissions_by_gas['N2O'] * 265
        )
```

**Calculation Workflow:**

```
Input Data → Scope Classification → Emission Factor Lookup → 
Gas-specific Calculation → GWP Application → CO₂e Conversion → 
Result Storage
```

### **B. Scope Classification Module**

**Purpose:** Automatically classify emissions into ISO 14064 scopes

**Classification Rules:**

```python
SCOPE_CLASSIFICATION = {
    # Scope 1: Direct Emissions
    'diesel_generator': 'scope_1',
    'diesel_vehicle': 'scope_1',
    'lpg_combustion': 'scope_1',
    'refrigerant_leak': 'scope_1',
    
    # Scope 2: Indirect from Purchased Energy
    'electricity_grid': 'scope_2',
    'purchased_heat': 'scope_2',
    'purchased_steam': 'scope_2',
    
    # Scope 3: Other Indirect
    'office_paper': 'scope_3',
    'waste_landfill': 'scope_3',
    'waste_recycled': 'scope_3',
    'equipment_purchase': 'scope_3',
    'employee_commuting': 'scope_3',
}
```

### **C. Validation Layer**

**Purpose:** Ensure data quality and completeness before calculation

**Validation Rules:**

| Rule Type | Description | Example |
|-----------|-------------|---------|
| **Range Check** | Values within expected bounds | Electricity: 0-100,000 kWh/month |
| **Completeness** | All required fields present | No null values in mandatory fields |
| **Consistency** | Related data aligns | Fuel consumption vs. vehicle distance |
| **Temporal** | Dates within reporting period | No future dates, within fiscal year |
| **Format** | Correct data types | Numeric fields contain numbers only |
| **Business Logic** | Domain-specific rules | Diesel consumption > 0 if generator used |

**Validation Pipeline:**

```
Raw Input → Format Validation → Range Validation → 
Consistency Check → Business Logic → Approved Data
```

---

## 3. Database Design (High-Level)

### **Entity-Relationship Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    USERS     │       │  ORGANIZATIONS│       │   ROLES      │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ email        │       │ name         │       │ name         │
│ name         │       │ boundary_type│       │ permissions  │
│ role_id      │◄──────│ created_at   │       │ description  │
│ org_id       │       └──────────────┘       └──────────────┘
└──────────────┘
        │
        │
        ▼
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│ ACTIVITY_DATA│       │EMISSION_FACTORS│     │ CALCULATIONS │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │
│ user_id      │       │ source_type  │       │ activity_id  │
│ scope        │       │ gas_type     │       │ scope        │
│ source_type  │       │ factor_value │       │ co2_emission │
│ activity_value│      │ unit         │       │ ch4_emission │
│ unit         │       │ source       │       │ n2o_emission │
│ reporting_period│    │ year         │       │ co2e_total   │
│ created_at   │       │ region       │       │ calculated_at│
│ validated_at │       └──────────────┘       └──────────────┘
│ validated_by │
└──────────────┘
        │
        ▼
┌──────────────┐       ┌──────────────┐
│  AUDIT_LOG   │       │   REPORTS    │
├──────────────┤       ├──────────────┤
│ id           │       │ id           │
│ user_id      │       │ org_id       │
│ action       │       │ report_type  │
│ table_name   │       │ period_start │
│ record_id    │       │ period_end   │
│ old_value    │       │ total_scope1 │
│ new_value    │       │ total_scope2 │
│ ip_address   │       │ total_scope3 │
│ timestamp    │       │ generated_at │
└──────────────┘       │ generated_by │
                       └──────────────┘
```

### **Table Specifications**

#### **A. Activity Data Table**

```sql
CREATE TABLE activity_data (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    scope VARCHAR(10) NOT NULL, -- 'scope_1', 'scope_2', 'scope_3'
    source_type VARCHAR(50) NOT NULL, -- 'diesel_generator', 'electricity_grid', etc.
    activity_value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'liters', 'kWh', 'kg', etc.
    reporting_period_start DATE NOT NULL,
    reporting_period_end DATE NOT NULL,
    data_quality VARCHAR(20) DEFAULT 'primary', -- 'primary', 'secondary', 'estimated'
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    validated_at TIMESTAMP,
    validated_by UUID REFERENCES users(id),
    validation_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    rejection_reason TEXT,
    deleted_at TIMESTAMP, -- Soft delete
    INDEX idx_scope (scope),
    INDEX idx_period (reporting_period_start, reporting_period_end),
    INDEX idx_user (user_id)
);
```

#### **B. Emission Factors Table**

```sql
CREATE TABLE emission_factors (
    id UUID PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL,
    gas_type VARCHAR(10) NOT NULL, -- 'CO2', 'CH4', 'N2O'
    factor_value DECIMAL(15,8) NOT NULL,
    unit VARCHAR(30) NOT NULL, -- 'kgCO2/liter', 'kgCH4/kWh', etc.
    source VARCHAR(100) NOT NULL, -- 'IPCC AR5', 'Sri Lanka CEA', etc.
    year INT NOT NULL,
    region VARCHAR(50) DEFAULT 'global',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE KEY unique_factor (source_type, gas_type, year, region)
);
```

#### **C. Calculations Table**

```sql
CREATE TABLE calculations (
    id UUID PRIMARY KEY,
    activity_data_id UUID REFERENCES activity_data(id),
    emission_factor_id UUID REFERENCES emission_factors(id),
    scope VARCHAR(10) NOT NULL,
    co2_emission DECIMAL(15,4) DEFAULT 0,
    ch4_emission DECIMAL(15,4) DEFAULT 0,
    n2o_emission DECIMAL(15,4) DEFAULT 0,
    co2e_total DECIMAL(15,4) NOT NULL,
    calculation_method VARCHAR(50) NOT NULL,
    calculated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_activity (activity_data_id),
    INDEX idx_scope (scope)
);
```

#### **D. Audit Log Table**

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'VALIDATE', 'CALCULATE'
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT NOW(),
    INDEX idx_user (user_id),
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_timestamp (timestamp)
);
```

#### **E. Reports Table**

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id),
    report_type VARCHAR(30) NOT NULL, -- 'annual', 'quarterly', 'audit', 'esg'
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_scope1 DECIMAL(15,4),
    total_scope2 DECIMAL(15,4),
    total_scope3 DECIMAL(15,4),
    total_co2e DECIMAL(15,4),
    report_data JSONB, -- Detailed breakdown
    generated_at TIMESTAMP DEFAULT NOW(),
    generated_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'approved', 'submitted'
    file_path VARCHAR(255), -- Path to generated PDF/Excel
    INDEX idx_org (organization_id),
    INDEX idx_period (period_start, period_end)
);
```

---

## 4. Data Flow

### **Complete Data Flow Diagram**

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA FLOW ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   INPUT     │
    │  (User/     │
    │   File)     │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  VALIDATION │
    │  LAYER      │
    │             │
    │ • Format    │
    │ • Range     │
    │ • Consistency│
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  SCOPE      │
    │ CLASSIFI-   │
    │  CATION    │
    │             │
    │ • Scope 1   │
    │ • Scope 2   │
    │ • Scope 3   │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ CALCULATION │
    │  ENGINE     │
    │             │
    │ • Emission  │
    │   factors   │
    │ • Gas-spec  │
    │ • CO₂e conv │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │   STORAGE   │
    │             │
    │ • Activity  │
    │   data      │
    │ • Calculated│
    │   emissions │
    │ • Audit log │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  REPORTING  │
    │             │
    │ • Dashboard │
    │ • ISO report│
    │ • Export    │
    └─────────────┘
```

### **Detailed Data Flow Steps**

#### **Step 1: Data Input**
```
User Action → Frontend Form → API Request → Backend Validation
```

**Example: Diesel Generator Entry**
```json
{
  "source_type": "diesel_generator",
  "activity_value": 500,
  "unit": "liters",
  "reporting_period_start": "2025-01-01",
  "reporting_period_end": "2025-01-31",
  "notes": "Main campus generator - monthly consumption"
}
```

#### **Step 2: Validation**
```
Input Data → Format Check → Range Check → Business Logic → 
Validation Result (Pass/Fail)
```

**Validation Response:**
```json
{
  "valid": true,
  "warnings": [],
  "errors": []
}
```

#### **Step 3: Scope Classification**
```
Validated Data → Source Type Lookup → Scope Assignment → 
Scope-tagged Data
```

**Classification Result:**
```json
{
  "source_type": "diesel_generator",
  "scope": "scope_1",
  "classification_reason": "Direct combustion from owned equipment"
}
```

#### **Step 4: Calculation**
```
Scope-tagged Data → Emission Factor Lookup → Gas Calculation → 
CO₂e Conversion → Calculation Result
```

**Calculation Example:**
```
Input: 500 liters diesel
Emission Factor: 2.68 kgCO2/liter (IPCC AR5)
CO2 Emission: 500 × 2.68 = 1,340 kg CO2
CH4 Emission: 500 × 0.0002 = 0.1 kg CH4
N2O Emission: 500 × 0.00001 = 0.005 kg N2O

CO2e = (1,340 × 1) + (0.1 × 28) + (0.005 × 265)
CO2e = 1,340 + 2.8 + 1.325
CO2e = 1,344.125 kg CO2e
```

**Calculation Result:**
```json
{
  "activity_id": "uuid-123",
  "scope": "scope_1",
  "co2_emission": 1340.00,
  "ch4_emission": 0.10,
  "n2o_emission": 0.005,
  "co2e_total": 1344.125,
  "calculation_method": "IPCC_AR5_GWP"
}
```

#### **Step 5: Storage**
```
Calculation Result → Database Write → Audit Log Entry → 
Storage Confirmation
```

**Database Operations:**
1. Insert into `activity_data` table
2. Insert into `calculations` table
3. Insert into `audit_log` table

#### **Step 6: Reporting**
```
Stored Data → Aggregation → Visualization → Export
```

**Report Generation:**
1. Query aggregated data by scope
2. Calculate totals and percentages
3. Generate charts and tables
4. Export to PDF/Excel

---

## 5. Audit Trail Mechanism

### **Audit Trail Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    AUDIT TRAIL SYSTEM                        │
└─────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │ USER ACTION │
    │             │
    │ • Create    │
    │ • Update    │
    │ • Delete    │
    │ • Validate  │
    │ • Calculate │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ AUDIT       │
    │ INTERCEPTOR │
    │             │
    │ • Capture   │
    │   action    │
    │ • Record    │
    │   user      │
    │ • Timestamp │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ AUDIT LOG   │
    │ DATABASE    │
    │             │
    │ • Immutable │
    │ • Indexed   │
    │ • Queryable │
    └──────┬──────┘
           │
           ▼
    ┌─────────────┐
    │ AUDIT       │
    │ REPORTS     │
    │             │
    │ • User      │
    │   activity  │
    │ • Data      │
    │   changes   │
    │ • Compliance│
    │   reports   │
    └─────────────┘
```

### **Audit Log Implementation**

#### **A. Database Trigger Approach**

```sql
-- Trigger function to log all changes
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (
            user_id, action, table_name, record_id, 
            new_value, timestamp
        ) VALUES (
            current_setting('app.current_user_id')::UUID,
            'CREATE',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(NEW),
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (
            user_id, action, table_name, record_id,
            old_value, new_value, timestamp
        ) VALUES (
            current_setting('app.current_user_id')::UUID,
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            to_jsonb(OLD),
            to_jsonb(NEW),
            NOW()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (
            user_id, action, table_name, record_id,
            old_value, timestamp
        ) VALUES (
            current_setting('app.current_user_id')::UUID,
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            to_jsonb(OLD),
            NOW()
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to activity_data table
CREATE TRIGGER activity_data_audit
    AFTER INSERT OR UPDATE OR DELETE ON activity_data
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

#### **B. Application-Level Audit**

```python
class AuditService:
    
    def log_action(self, user_id, action, table_name, record_id, 
                   old_value=None, new_value=None):
        """
        Log user action to audit trail
        """
        audit_entry = {
            'user_id': user_id,
            'action': action,  # CREATE, UPDATE, DELETE, VALIDATE, CALCULATE
            'table_name': table_name,
            'record_id': record_id,
            'old_value': old_value,
            'new_value': new_value,
            'ip_address': request.remote_addr,
            'user_agent': request.headers.get('User-Agent'),
            'timestamp': datetime.utcnow()
        }
        
        db.audit_log.insert(audit_entry)
    
    def get_audit_trail(self, record_id=None, user_id=None, 
                        table_name=None, start_date=None, end_date=None):
        """
        Query audit trail with filters
        """
        query = db.audit_log.query()
        
        if record_id:
            query = query.filter_by(record_id=record_id)
        if user_id:
            query = query.filter_by(user_id=user_id)
        if table_name:
            query = query.filter_by(table_name=table_name)
        if start_date:
            query = query.filter(timestamp >= start_date)
        if end_date:
            query = query.filter(timestamp <= end_date)
        
        return query.order_by(timestamp.desc()).all()
```

### **Audit Trail Use Cases**

#### **1. Data Entry Audit**
```
User: student@slgti.lk
Action: CREATE
Table: activity_data
Record: uuid-123
Data: {
  "source_type": "diesel_generator",
  "activity_value": 500,
  "unit": "liters",
  "reporting_period": "2025-01"
}
Timestamp: 2025-02-01 10:30:00 UTC
IP: 192.168.1.100
```

#### **2. Validation Audit**
```
User: trainer@slgti.lk
Action: VALIDATE
Table: activity_data
Record: uuid-123
Old: {"validation_status": "pending"}
New: {"validation_status": "approved", "validated_by": "trainer-uuid"}
Timestamp: 2025-02-02 14:15:00 UTC
```

#### **3. Calculation Audit**
```
User: system
Action: CALCULATE
Table: calculations
Record: uuid-456
Data: {
  "activity_id": "uuid-123",
  "co2_emission": 1340.00,
  "ch4_emission": 0.10,
  "n2o_emission": 0.005,
  "co2e_total": 1344.125,
  "emission_factor_id": "ef-uuid",
  "calculation_method": "IPCC_AR5_GWP"
}
Timestamp: 2025-02-02 14:16:00 UTC
```

---

## 6. Scalability and Modularity

### **Scalability Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                  SCALABILITY DESIGN                          │
└─────────────────────────────────────────────────────────────┘

    ┌─────────────┐
    │   LOAD      │
    │  BALANCER   │
    │             │
    │ • Nginx     │
    │ • HAProxy   │
    └──────┬──────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────┐  ┌─────────┐
│ APP     │  │ APP     │
│ SERVER 1│  │ SERVER 2│
│         │  │         │
│ • API   │  │ • API   │
│ • Calc  │  │ • Calc  │
│ • Auth  │  │ • Auth  │
└────┬────┘  └────┬────┘
     │            │
     └─────┬──────┘
           │
           ▼
    ┌─────────────┐
    │  DATABASE   │
    │  CLUSTER    │
    │             │
    │ • Primary   │
    │ • Read      │
    │   replicas  │
    │ • Sharding  │
    └─────────────┘
```

### **Modular Component Design**

```
┌─────────────────────────────────────────────────────────────┐
│                  MODULAR ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   MODULE 1  │  │   MODULE 2  │  │   MODULE 3  │
│             │  │             │  │             │
│  AUTH       │  │  DATA       │  │  CALCULATION│
│  MODULE     │  │  MODULE     │  │  MODULE     │
│             │  │             │  │             │
│ • Login     │  │ • CRUD      │  │ • Scope     │
│ • Register  │  │ • Validate  │  │   class     │
│ • JWT       │  │ • Import    │  │ • Emission  │
│ • RBAC      │  │ • Export    │  │   calc      │
└──────┬──────┘  └──────┬──────┘  └──────┬──────┘
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │   MODULE 4  │
                 │             │
                 │  REPORTING  │
                 │  MODULE     │
                 │             │
                 │ • Dashboard │
                 │ • ISO report│
                 │ • Audit     │
                 │ • Export    │
                 └─────────────┘
```

### **Technology Stack Recommendations**

#### **Frontend**
- **Framework:** React.js or Vue.js
- **State Management:** Redux or Vuex
- **UI Library:** Material-UI or Ant Design
- **Charts:** Chart.js, D3.js, or Recharts
- **Forms:** Formik or VeeValidate

#### **Backend**
- **Framework:** Node.js (Express) or Python (FastAPI/Django)
- **API:** RESTful or GraphQL
- **Authentication:** JWT with refresh tokens
- **Validation:** Joi or Pydantic
- **ORM:** Sequelize or SQLAlchemy

#### **Database**
- **Primary:** PostgreSQL (for relational data)
- **Cache:** Redis (for session and frequently accessed data)
- **Search:** Elasticsearch (for audit log queries)

#### **Infrastructure**
- **Containerization:** Docker
- **Orchestration:** Kubernetes or Docker Compose
- **CI/CD:** GitHub Actions or GitLab CI
- **Cloud:** AWS, Azure, or GCP
- **Monitoring:** Prometheus + Grafana

### **Scalability Features**

| Feature | Implementation | Benefit |
|---------|---------------|---------|
| **Horizontal Scaling** | Load balancer + multiple app servers | Handle increased user load |
| **Database Replication** | Primary-replica setup | Read scalability, high availability |
| **Caching** | Redis for emission factors, user sessions | Faster response times |
| **Async Processing** | Message queue (RabbitMQ/Redis) for calculations | Non-blocking operations |
| **CDN** | Static assets served via CDN | Faster page loads |
| **API Rate Limiting** | Token bucket algorithm | Prevent abuse |
| **Database Indexing** | Optimized indexes on frequently queried fields | Faster queries |
| **Data Partitioning** | Partition audit logs by date | Manage large datasets |

### **Modularity Benefits**

| Module | Independence | Reusability | Testability |
|--------|-------------|-------------|-------------|
| **Auth Module** | Can be deployed separately | Reusable across apps | Unit testable |
| **Data Module** | Independent CRUD operations | Generic data management | Integration testable |
| **Calculation Module** | Pure functions, no side effects | Reusable for different standards | Unit testable |
| **Reporting Module** | Pluggable report generators | Multiple output formats | End-to-end testable |

---

## Summary

### **Architecture Highlights**

1. **Separation of Concerns:** Clear separation between input, validation, calculation, storage, and reporting
2. **Audit Trail:** Complete traceability of all data changes for ISO 14064 compliance
3. **Scalability:** Horizontal scaling capabilities for growing user base
4. **Modularity:** Independent modules for easier maintenance and testing
5. **Data Quality:** Multi-layer validation ensures accurate calculations
6. **Compliance:** Built-in support for ISO 14064 reporting requirements

### **Key Design Decisions**

- **Database:** PostgreSQL for ACID compliance and JSONB support
- **Audit Trail:** Database triggers + application-level logging for completeness
- **Calculation Engine:** Stateless, pure functions for reliability
- **API Design:** RESTful for simplicity, GraphQL optional for complex queries
- **Authentication:** JWT with role-based access control (RBAC)

### **Deployment Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                  DEPLOYMENT ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────┘

Internet → CDN → Load Balancer → App Servers → Database Cluster
                                    ↓
                              Cache (Redis)
                                    ↓
                              Message Queue
                                    ↓
                              File Storage (S3)
```

---

*Document Version: 1.0*
*Last Updated: 2026-03-28*
*Architecture Pattern: Modular Monolith with Microservices-ready Design*

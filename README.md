# OpenLedger Black

**Enterprise-Grade Finance & Project Intelligence Platform**

Zero-cost, SQLite-powered, military-grade finance and project management system built for SMEs, NGOs, SACCOs, and non-profits that demand **surgical precision, accountability, and ruthless stability**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14-black.svg)

---

## 🔥 **Features**

### **Finance Engine**

- Real-time transaction tracking (income, expenses, disbursements, transfers)
- Budget vs. actual analysis with variance tracking
- Cashflow trends, burn rate calculations, and financial projections
- Immutable audit trail for full accountability
- CSV/PDF export capabilities

### **Project Intelligence System**

- Complete project lifecycle management
- Milestone and deliverable tracking
- Budget monitoring with auto-flagging for overspending
- Document upload and receipt management
- One-click donor report generation

### **Asset & Inventory Command Center**

- Comprehensive asset tracking with depreciation
- Assignment management (staff/projects)
- Maintenance scheduling and logging
- Inventory management with low-stock warnings

### **Impact Metrics Cortex**

- Custom KPI creation and tracking
- Beneficiary management
- Impact heatmaps and visualizations
- Real-time dashboard analytics

---

## 🛠️ **Tech Stack**

### **Backend**

- **FastAPI** - Lightning-fast Python web framework
- **SQLite** - Zero-cost, portable, offline-ready database
- **JWT** - Secure authentication with role-based permissions
- **Pydantic** - Type-safe data validation

### **Frontend**

- **Next.js 14** - React framework with SSR
- **TypeScript** - Type safety across the codebase
- **Tailwind CSS** - VIP dark theme design system
- **Chart.js** - Real-time data visualizations
- **Framer Motion** - Smooth micro-animations

### **Key Principles**

✅ **NO** paid APIs  
✅ **NO** cloud dependencies  
✅ **NO** bullshit  

---

## 🚀 **Quick Start**

### **Prerequisites**

- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn

### **Backend Setup**

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Initialize database (automatic on first run)
python main.py

# Or use uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`  
Interactive API docs at `http://localhost:8000/docs`

### **Frontend Setup**

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### **Demo Credentials**

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `OpenLedger2024!` |
| Finance Manager | `finance_mgr` | `OpenLedger2024!` |
| Project Manager | `project_mgr` | `OpenLedger2024!` |

---

## 📊 **Database Schema**

The database includes 30+ tables organized into these modules:

- **Authentication**: `users`, `roles`, `permissions`
- **Finance**: `transactions`, `budgets`, `cashflow_snapshots`
- **Projects**: `projects`, `milestones`, `deliverables`
- **Assets**: `assets`, `maintenance_logs`, `inventory_items`
- **Impact**: `kpis`, `beneficiaries`, `impact_reports`
- **Audit**: `audit_logs` (immutable)

---

## 🔌 **API Endpoints**

Full API documentation available at `http://localhost:8000/docs` after starting the backend.

### Key Endpoints

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Finance**: `/api/finance/transactions`, `/api/finance/analytics`
- **Projects**: `/api/projects`, `/api/projects/{id}/milestones`
- **Assets**: `/api/assets`, `/api/assets/inventory`
- **Impact**: `/api/impact/dashboard`, `/api/impact/kpis`

---

## 🎨 **UI/UX Design**

VIP dark theme designed for executives and auditors:

- **Deep blacks** with glassmorphism effects
- **Electric blue accents** for primary actions
- **Surgical spacing** and premium typography
- **Smooth micro-animations**
- **Real-time Chart.js visualizations**

---

## 🔐 **Security**

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Bcrypt password hashing
- Immutable audit logs
- SQL injection protection

---

## 🚢 **Deployment**

### Production Backend

```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Production Frontend

```bash
npm run build && npm start
```

---

**OpenLedger Black** - Where precision meets power. Zero cost, maximum accountability.

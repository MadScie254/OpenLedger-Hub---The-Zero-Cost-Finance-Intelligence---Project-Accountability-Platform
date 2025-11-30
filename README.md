# OpenLedger Hub

**Open-Access Finance & Project Intelligence Platform**

Zero-cost, SQLite-powered, completely open finance and project management system built for SMEs, NGOs, SACCOs, and non-profits in emerging markets.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Next.js](https://img.shields.io/badge/next.js-14-black.svg)

---

## 🌟 **What Makes Us Different**

✅ **NO** Authentication - Completely open access  
✅ **NO** Paid APIs - 13+ free data sources  
✅ **NO** Cloud Lock-in - Runs entirely offline  
✅ **NO** Signup Required - Start using immediately

---

## 🔥 **Core Features**

### **Finance Engine**

- Real-time transaction tracking (income, expenses, transfers)
- Budget vs. actual analysis with variance tracking
- Cashflow trends and burn rate calculations
- CSV/PDF export capabilities
- Multi-currency support via free exchange rate APIs

### **Project Intelligence**

- Complete project lifecycle management
- Milestone and deliverable tracking
- Budget monitoring with auto-flagging
- Document management
- Donor report generation

### **Asset & Inventory Management**

- Comprehensive asset tracking with depreciation
- Assignment management
- Maintenance scheduling
- Inventory with low-stock warnings

### **Impact Metrics**

- Custom KPI creation and tracking
- Beneficiary management
- Impact simulators and calculators
- Real-time analytics dashboard

---

## 🚀 **NEW: Enhanced Intelligence Features**

### **13 Free API Integrations**

1. **Currency Exchange** - Real-time forex rates (180+ currencies)
2. **Cryptocurrency** - Bitcoin, Ethereum, Cardano prices
3. **Weather Data** - Current conditions for project locations
4. **Geocoding** - Convert addresses to coordinates
5. **Economic Indicators** - World Bank GDP, inflation, unemployment data
6. **Country Information** - Flags, population, languages, currencies
7. **Public Holidays** - Plan around holidays in 100+ countries
8. **Book/Resource Library** - Search educational materials
9. **Demo Data Generator** - Create realistic beneficiary profiles
10. **Air Quality** - Environmental health monitoring
11. **IP Geolocation** - Auto-detect user location
12. **Carbon Footprint** - Calculate environmental impact
13. **Market Intelligence** - Crypto and forex trends

### **8 Creative Dashboard Tabs**

- 🌍 **Global Context** - Economic indicators, weather, country data
- 📊 **Impact Simulator** - Model project outcomes and ROI
- 📚 **Resource Library** - Search books and educational content
- 👥 **Beneficiary Generator** - Create demo profiles for testing
- 🌱 **Carbon Tracker** - Calculate environmental footprint
- 💹 **Market Intelligence** - Real-time crypto and currency data
- 📅 **Holiday Calendar** - Public holidays by country
- 🌫️ **Air Quality Monitor** - Environmental health data

---

## 🛠️ **Tech Stack**

### **Backend**

- **FastAPI** - Lightning-fast Python web framework
- **SQLite** - Zero-cost, portable database
- **Pydantic** - Type-safe data validation
- **HTTPX** - Async HTTP client for API integrations

### **Frontend**

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety across the codebase
- **Tailwind CSS** - Glassmorphism dark theme
- **Real-time Data** - Live API integrations

### **Key Principles**

✅ **Zero Cost** - No paid services ever  
✅ **Open Access** - No login or authentication required
✅ **Privacy First** - All data stays on your device  
✅ **Offline Ready** - Works without internet (core features)

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

# Start the server
python main.py
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
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

**That's it!** No login required - instant access to all features.

---

## 📊 **Database Schema**

Simplified schema (no authentication tables):

- **Finance**: `transactions`, `budgets`, `budget_items`, `cashflow_snapshots`
- **Projects**: `projects`, `milestones`, `deliverables`, `project_documents`
- **Assets**: `assets`, `asset_assignments`, `maintenance_logs`, `inventory`
- **Impact**: `kpis`, `kpi_values`, `beneficiaries`, `impact_reports`

---

## 🔌 **API Endpoints**

### Core Endpoints

- **Finance**: `/api/finance/transactions`, `/api/finance/analytics`
- **Projects**: `/api/projects`, `/api/projects/{id}/milestones`
- **Assets**: `/api/assets`, `/api/assets/inventory`
- **Impact**: `/api/impact/dashboard`, `/api/impact/kpis`

### External Data APIs

- **Currency**: `/api/external/exchange-rates`
- **Crypto**: `/api/external/crypto/{coin_id}`
- **Weather**: `/api/external/weather?latitude=X&longitude=Y`
- **Countries**: `/api/external/countries/{name}`
- **Holidays**: `/api/external/holidays/{country}/{year}`
- **Books**: `/api/external/books/search?q=agriculture`
- **Demo Users**: `/api/external/demo/users?count=10`
- **Air Quality**: `/api/external/air-quality/{country_code}`
- **Carbon**: `/api/external/carbon-footprint` (POST)
- **Geolocation**: `/api/external/geolocation`

Full API documentation: `http://localhost:8000/docs`

---

## 🎨 **UI/UX Design**

Premium dark theme with glassmorphism:

- **Deep blacks** with frosted glass effects
- **Electric blue accents** for interactive elements
- **Smooth animations** and micro-interactions
- **Real-time data** visualizations
- **Responsive** - works on all devices

---

## 🌐 **Free APIs Used**

All APIs are genuinely free with no signup required:

1. exchangerate.host - Currency data
2. CoinGecko - Cryptocurrency prices
3. Open-Meteo - Weather forecasts
4. Nominatim/OSM - Geocoding
5. World Bank - Economic indicators
6. REST Countries - Country information
7. Nager.Date - Public holidays
8. OpenLibrary - Book database
9. RandomUser - Demo data generation
10. OpenAQ - Air quality measurements
11. ipapi.co - IP geolocation
12. Local calculation - Carbon footprint

---

## 🚢 **Deployment**

### Production Backend

```bash
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

### Production Frontend

```bash
npm run build && npm start
```

### Deploy Anywhere

- **VPS**: DigitalOcean, Linode, Hetzner
- **Cloud**: AWS EC2, Google Cloud, Azure
- **Platform**: Railway, Render, Fly.io
- **Local**: USB drive, Raspberry Pi, old laptop

---

## 🤝 **Contributing**

OpenLedger Hub is open source! Contributions welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 **License**

MIT License - Use freely for any purpose

---

## 🌍 **Built For**

- 🏢 Small and Medium Enterprises
- 🤝 SACCOs and Credit Unions
- 💚 NGOs and Non-Profits
- 🏘️ Community-Based Organizations
- 🎓 Educational Institutions
- 🌱 Social Enterprises

---

**OpenLedger Hub** - Where transparency meets intelligence. Zero cost, maximum accountability, completely open.

**No login. No fees. No limits.**

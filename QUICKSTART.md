# OpenLedger Black - Quick Start Guide

## 🚀 **Getting Started**

### **Step 1: Start the Backend**

**Windows:**

```bash
cd backend
start.bat
```

**Linux/Mac:**

```bash
cd backend
chmod +x start.sh
./start.sh
```

The backend will be available at:

- **API**: <http://localhost:8000>
- **Interactive Docs**: <http://localhost:8000/docs>
- **Health Check**: <http://localhost:8000/health>

### **Step 2: Start the Frontend**

In a **new terminal**:

**Windows:**

```bash
cd frontend
start.bat
```

**Linux/Mac:**

```bash
cd frontend
chmod +x start.sh
./start.sh
```

The frontend will be available at: **<http://localhost:3000>**

### **Step 3: Login**

Navigate to <http://localhost:3000> and click "Access System"

**Demo Credentials:**

- Username: `admin`
- Password: `OpenLedger2024!`

---

## 📊 **What's Included**

### **Backend (FastAPI)**

✅ Complete SQLite database with seed data  
✅ JWT authentication with role-based permissions  
✅ Finance, Projects, Assets, and Impact Metrics APIs  
✅ Immutable audit trail  
✅ Auto-generated API documentation

### **Frontend (Next.js)**

✅ VIP dark theme executive dashboard  
✅ Real-time metrics and Chart.js visualizations  
✅ Glassmorphism design with micro-animations  
✅ Responsive layout for all devices  
✅ Type-safe API client with JWT handling

---

## 🗂️ **Key Features to Explore**

1. **Dashboard** - Real-time financial metrics, cashflow breakdown, budget status
2. **Finance Engine** - Transaction tracking, budget analysis, burn rate calculations
3. **Project Intelligence** - Project management, milestones, deliverables
4. **Asset Management** - Asset tracking, maintenance scheduling, inventory
5. **Impact Metrics** - Custom KPIs, beneficiary tracking, impact heatmaps

---

## 🔧 **Manual Setup (Alternative)**

If the startup scripts don't work, follow these manual steps:

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
npm run dev
```

---

## 🎯 **Next Steps**

1. Explore the interactive API docs at <http://localhost:8000/docs>
2. Test all API endpoints with different user roles
3. Create your own projects, transactions, and KPIs
4. Customize the theme in `frontend/tailwind.config.ts`
5. Add your own modules and features

---

## 💡 **Tips**

- **Database Location**: `backend/openledger.db` (created automatically)
- **File Uploads**: Stored in `backend/uploads/`
- **Change Password**: Update hash in `backend/database/seed.sql`
- **Add Users**: Use the `/api/auth/register` endpoint
- **Reset Database**: Delete `openledger.db` and restart backend

---

## 🐛 **Troubleshooting**

**Port Already in Use:**

- Backend: Change port in `backend/main.py` (line with `uvicorn.run`)
- Frontend: Use `npm run dev -- -p 3001`

**Database Errors:**

- Delete `backend/openledger.db` and restart

**Frontend API Errors:**

- Check `.env.local` has correct API URL
- Verify backend is running

**Dependencies Issues:**

- Backend: `pip install --upgrade pip` then retry
- Frontend: Delete `node_modules` and `package-lock.json`, run `npm install`

---

**You're all set!** Enjoy OpenLedger Black - where precision meets power. 🚀

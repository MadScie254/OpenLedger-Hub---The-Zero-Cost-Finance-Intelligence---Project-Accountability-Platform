# OpenLedger Black - Quick Start Guide

## 🚀 Start Everything in 3 Steps

### 1️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies (one time only)
python -m pip install bcrypt google-auth python-jose[cryptography] httpx slowapi

# Start the backend server
python main.py
```

**Backend runs on**: <http://localhost:8000>  
**API Docs**: <http://localhost:8000/docs>

### 2️⃣ Frontend Setup

Frontend is already running! ✅

**Access at**: <http://localhost:3000>

### 3️⃣ Login

Navigate to: <http://localhost:3000/login>

**Demo Credentials**:

- Username: `admin`
- Password: `root1234`

---

## 📊 What You Can Test

Once logged in, check out:

### Google Sign-In

- Click the Google Sign-In button on login page
- Note: Requires Google Cloud Console OAuth setup

### Analytics API

```bash
# Get financial analytics with predictions
curl http://localhost:8000/api/finance/analytics

# Get summary metrics only
curl http://localhost:8000/api/finance/metrics/summary
```

### External Data APIs

```bash
# Currency exchange rates
curl "http://localhost:8000/api/external/exchange-rates?base=USD&symbols=KES,EUR,GBP"

# Bitcoin price
curl "http://localhost:8000/api/external/crypto/bitcoin"

# Weather (Nairobi)
curl "http://localhost:8000/api/external/weather?latitude=-1.286389&longitude=36.817223"
```

---

## ❓ Troubleshooting

**Backend won't start?**

- Make sure you're in the `backend` directory
- Verify dependencies installed: `python -m pip list | grep bcrypt`

**Can't login?**

- Check backend is running (<http://localhost:8000/health> should return 200)
- Try credentials: `admin` / `root1234`
- Check browser console for errors (F12)

**Google Sign-In not working?**

- Expected - requires Google Cloud Console configuration
- Add redirect URI: `http://localhost:3001` to your OAuth client

---

## 🎯 What We Built

✅ **Google OAuth** - Full authentication flow  
✅ **ML Analytics** - Cashflow predictions with linear regression  
✅ **Free APIs** - Currency, crypto, weather, geocoding, macro data  
✅ **Security** - CORS, rate limiting, security headers  
✅ **Zero Cost** - No paid services required

**~1,700 lines** of production code delivered!

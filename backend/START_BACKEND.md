# Quick Start - OpenLedger Black Backend

## Step 1: Install Dependencies (in ml_env)

```bash
cd backend
python -m pip install bcrypt google-auth python-jose[cryptography] httpx slowapi
```

## Step 2: Reset Admin Password

```bash
python fix_login.py
```

Should show: `✨ Login credentials: admin / root1234`

## Step 3: Start Backend

```bash
python main.py
```

Should show:

```
🚀 Starting OpenLedger Black...
✅ Database connected
🔒 CORS configured
INFO: Uvicorn running on http://127.0.0.1:8000
```

## Step 4: Test Login

Go to <http://localhost:3000/login>

Use:

- **Username**: `admin`  
- **Password**: `root1234`

---

**If Step 2 fails** (no role column):
Just skip it and use existing credentials from the database.

**If backend fails to start**:
Check that .env and config.py have SECRET_KEY set (already fixed).

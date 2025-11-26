@echo off
REM OpenLedger Black - Backend Startup Script (Windows)

echo 🚀 Starting OpenLedger Black Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment  
call venv\Scripts\activate

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Start server
echo ✅ Starting FastAPI server on http://localhost:8000
echo 📚 API Documentation: http://localhost:8000/docs
echo.

python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

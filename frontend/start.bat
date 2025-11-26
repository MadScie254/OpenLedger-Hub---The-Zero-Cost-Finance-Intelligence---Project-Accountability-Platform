@echo off
REM OpenLedger Black - Frontend Startup Script (Windows)

echo 🎨 Starting OpenLedger Black Frontend...

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
)

REM Create .env.local if it doesn't exist
if not exist ".env.local" (
    echo 🔧 Creating environment file...
    echo NEXT_PUBLIC_API_URL=http://localhost:8000/api > .env.local
)

REM Start development server
echo ✅ Starting Next.js on http://localhost:3000
echo.

npm run dev

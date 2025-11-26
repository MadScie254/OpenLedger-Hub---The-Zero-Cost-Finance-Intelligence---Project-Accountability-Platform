#!/bin/bash

# OpenLedger Black - Backend Startup Script

echo "🚀 Starting OpenLedger Black Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Initialize database if needed
if [ ! -f "openledger.db" ]; then
    echo "🔧 Initializing database..."
fi

# Start server
echo "✅ Starting FastAPI server on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000

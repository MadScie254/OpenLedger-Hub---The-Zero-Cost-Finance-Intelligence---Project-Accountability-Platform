#!/bin/bash

# OpenLedger Black - Frontend Startup Script

echo "🎨 Starting OpenLedger Black Frontend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "🔧 Creating environment file..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
fi

# Start development server
echo "✅ Starting Next.js on http://localhost:3000"
echo ""

npm run dev

#!/bin/bash
# =============================================================================
# QUICK START SCRIPT
# =============================================================================
# Run this script to set up and start both the backend and frontend servers.
#
# Usage: ./start.sh
# =============================================================================

echo "=============================================="
echo "  Schwab Job Search Agent - Quick Start"
echo "=============================================="
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi
echo "✓ Python 3 found"

# Check Node
if ! command -v npm &> /dev/null; then
    echo "⚠ Node.js/npm not found - frontend won't start automatically"
    SKIP_FRONTEND=true
fi

# Setup Python environment
echo ""
echo "Setting up Python environment..."
cd "$(dirname "$0")"

python3 -m venv venv 2>/dev/null
source venv/bin/activate 2>/dev/null || true

pip install -q flask flask-cors requests beautifulsoup4 2>/dev/null
echo "✓ Python dependencies installed"

# Seed database if needed
if [ ! -f schwab_jobs.db ] || [ ! -s schwab_jobs.db ]; then
    echo ""
    echo "Seeding database with job listings..."
    python3 crawler.py --mock
fi

# Start backend in background
echo ""
echo "Starting backend server..."
python3 crawler.py --serve &
BACKEND_PID=$!
echo "✓ Backend started (PID: $BACKEND_PID)"
echo "  API: http://localhost:5000"

# Start frontend if Node available
if [ -z "$SKIP_FRONTEND" ]; then
    echo ""
    echo "Setting up React frontend..."
    cd frontend
    npm install --silent 2>/dev/null
    echo "✓ Frontend dependencies installed"
    
    echo ""
    echo "Starting frontend server..."
    npm start &
    FRONTEND_PID=$!
    echo "✓ Frontend started (PID: $FRONTEND_PID)"
    echo "  Web UI: http://localhost:3000"
fi

echo ""
echo "=============================================="
echo "  Ready!"
echo "=============================================="
echo ""
echo "Backend API: http://localhost:5000/api/jobs"
if [ -z "$SKIP_FRONTEND" ]; then
    echo "Web UI:      http://localhost:3000"
fi
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

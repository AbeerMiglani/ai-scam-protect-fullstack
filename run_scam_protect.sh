#!/bin/bash

# Cleanup function to kill background processes on exit
cleanup() {
    echo "🛑 Shutting down..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

echo "--------------------------------------------------------"
echo "🛡️  Starting AI Scam Protect (Fullstack Mode)"
echo "--------------------------------------------------------"

# 1. Start Backend
if [ -d "venv" ]; then
    echo "✅ Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  No 'venv' found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

echo "🚀 Starting Backend (FastAPI)..."
python3 -m uvicorn backend.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "   Backend running on PID $BACKEND_PID"

# 2. Start Frontend
echo "💻 Starting Frontend (Vite)..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi
npm run dev -- --open &
FRONTEND_PID=$!
echo "   Frontend running on PID $FRONTEND_PID"

echo "--------------------------------------------------------"
echo "✅ System Operational!"
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo "--------------------------------------------------------"
echo "Press Ctrl+C to stop."

# Wait for processes
wait

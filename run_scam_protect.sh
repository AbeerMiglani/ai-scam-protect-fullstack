#!/bin/bash
# run_scam_protect.sh

echo "--------------------------------------------------------"
echo "🛡️  Starting AI Scam Protect (Local Mode)"
echo "--------------------------------------------------------"

# 1. Check for Virtual Env
if [ -d "venv" ]; then
    echo "✅ Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  No 'venv' found. Please run setup first (pip install)."
    exit 1
fi

# 2. Check for Ollama (optional check)
if ! command -v ollama &> /dev/null; then
    echo "⚠️  'ollama' command not found. Make sure Ollama is installed!"
fi

# 3. Start Frontend
echo "💻 Starting Application..."
streamlit run scam_app.py

# Deployment Guide

## 1. Prerequisites
- A GitHub account.
- A [Vercel](https://vercel.com/) account (for Frontend).
- A [Render](https://render.com/) account (for Backend).
- A [Google AI Studio](https://aistudio.google.com/) API Key.

## 2. Push to GitHub
Ensure this project is pushed to a GitHub repository.
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 3. Deploy Backend (Render)
1.  Go to [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository.
4.  Settings:
    *   **Root Directory**: `.` (leave empty or set to root)
    *   **Runtime**: `Python 3`
    *   **Build Command**: `pip install -r requirements.txt`
    *   **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5.  **Environment Variables**:
    *   Key: `GEMINI_API_KEY`
    *   Value: `your_google_api_key`
    *   Key: `PYTHON_VERSION`
    *   Value: `3.10.0` (or higher)
6.  Click **Deploy Web Service**.
7.  Copy the URL (e.g., `https://ai-scam-protect.onrender.com`).

## 4. Deploy Frontend (Vercel)
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository.
4.  **Framework Preset**: Vite
5.  **Root Directory**: `frontend`
6.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: `https://your-backend-app-name.onrender.com` (The URL you got from Render)
7.  Click **Deploy**.

## 5. Final Step: Verification
- Open your Vercel URL.
- Allow Microphone access.
- Speak "I need you to buy 500 dollars in gift cards".
- Watch the AI react!

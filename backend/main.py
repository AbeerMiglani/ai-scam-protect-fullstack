from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from backend.core import detector

app = FastAPI(title="AI Scam Protect API (Cloud)")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class AnalyzeRequest(BaseModel):
    text: str

class ClearRequest(BaseModel):
    pass

@app.get("/")
def health_check():
    return {"status": "ok", "app": "AI Scam Protect Cloud"}

@app.get("/status")
def get_status():
    """Returns current threat level."""
    return {
        "threat_level": detector.threat_level
    }

@app.get("/transcript")
def get_transcript():
    """Returns the full log of analyzed phrases."""
    return detector.text_log

@app.post("/analyze")
def analyze_text(request: AnalyzeRequest):
    """
    Receives text from the frontend and analyzes it for scam probability.
    """
    try:
        # We pass the full history from the server-side memory 
        # (In a real production app, we might want to accept history from client or use a DB)
        result = detector.analyze_text(request.text, detector.text_log)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/clear")
def clear_session():
    """Clears the current session history."""
    detector.clear_session()
    return {"message": "Session cleared"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

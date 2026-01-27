from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core import detector
import uvicorn

app = FastAPI(title="AI Scam Protect API")

# Setup CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "app": "AI Scam Protect"}

@app.get("/status")
def get_status():
    """Returns current monitoring state and thread level."""
    return {
        "is_listening": detector.is_listening,
        "threat_level": detector.threat_level
    }

@app.get("/transcript")
def get_transcript():
    """Returns the full log of analyzed phrases."""
    return detector.text_log

@app.post("/start")
def start_monitoring():
    """Starts the listening background thread."""
    detector.start_listening()
    return {"message": "Monitoring started", "is_listening": True}

@app.post("/stop")
def stop_monitoring():
    """Stops the listening background thread."""
    detector.stop_listening()
    return {"message": "Monitoring stopped", "is_listening": False}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

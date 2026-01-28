import { useEffect, useState, useCallback, useRef } from "react"
import { Shield, Zap, AlertTriangle, Mic, MicOff } from "lucide-react"
import { StatusBoard } from "@/components/status-board"
import { ControlPanel } from "@/components/control-panel"
import { TranscriptFeed } from "@/components/transcript-feed"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function CybersecurityDashboard() {
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    error: speechError,
    resetTranscript
  } = useSpeechRecognition()

  const [threatLevel, setThreatLevel] = useState(0)
  const [transcripts, setTranscripts] = useState([])
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [backendError, setBackendError] = useState(null)

  // Combined error state
  const error = speechError || backendError

  // Analyze text when a final transcript is received
  useEffect(() => {
    if (transcript) {
      handleAnalyze(transcript)
      resetTranscript()
    }
  }, [transcript])

  const handleAnalyze = async (text) => {
    try {
      // Optimistic update (optional, but good for UI responsiveness)

      const response = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      })

      if (!response.ok) throw new Error("Analysis failed")

      // We can either use the response here or rely on the polling of /transcript
      // Let's rely on polling to keep it synced with the backend's "truth"
      fetchTranscripts()
    } catch (e) {
      console.error("Analysis Error:", e)
    }
  }

  // Fetch status from backend (Threat Level)
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/status`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to fetch status")

      const data = await response.json()
      // We don't update isListening from backend anymore
      setThreatLevel(data.threat_level)
      setIsConnected(true)
      setBackendError(null)
    } catch {
      setIsConnected(false)
      setBackendError("Unable to connect to backend. Ensure server is running.")
    }
  }, [])

  // Fetch transcripts from backend
  const fetchTranscripts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/transcript`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to fetch transcripts")

      const data = await response.json()
      setTranscripts(data)
    } catch {
      console.log("[v0] Failed to fetch transcripts")
    }
  }, [])

  // Start monitoring
  const handleStart = () => {
    startListening()
  }

  // Stop monitoring
  const handleStop = () => {
    stopListening()
  }

  // Polling effect for status and transcripts
  useEffect(() => {
    fetchStatus()
    fetchTranscripts()
    const interval = setInterval(() => {
      fetchStatus()
      fetchTranscripts()
    }, 1000)
    return () => clearInterval(interval)
  }, [fetchStatus, fetchTranscripts])

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg bg-primary/20 border border-primary"
                style={{ boxShadow: '0 0 15px rgba(34, 197, 94, 0.3)' }}
              >
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-wider text-foreground">
                  SCAM<span className="text-primary">SHIELD</span>
                </h1>
                <p className="text-xs text-muted-foreground tracking-wider">
                  REAL-TIME THREAT DETECTION
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                <span className="uppercase tracking-wider">Cloud AI Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="bg-neon-red/10 border-b border-neon-red/30 px-6 py-3">
          <div className="container mx-auto flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-neon-red" />
            <p className="text-sm text-neon-red">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Status & Controls */}
          <div className="lg:col-span-1 space-y-6">
            <StatusBoard
              isListening={isListening}
              threatLevel={threatLevel}
              isConnected={isConnected}
            />

            {/* Microphone Status Indicator */}
            <div className={`p-4 rounded-lg border flex items-center gap-3 ${isListening ? 'bg-primary/10 border-primary animate-pulse' : 'bg-card border-border'}`}>
              {isListening ? <Mic className="h-5 w-5 text-primary" /> : <MicOff className="h-5 w-5 text-muted-foreground" />}
              <div>
                <p className="text-sm font-bold">{isListening ? 'Microphone Active' : 'Microphone Inactive'}</p>
                <p className="text-xs text-muted-foreground">{isListening ? 'Listening for speech...' : 'Press START to monitor'}</p>
              </div>
            </div>

            <ControlPanel
              isListening={isListening}
              isLoading={isLoading}
              onStart={handleStart}
              onStop={handleStop}
            />

            {/* Quick Stats */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Session Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">{transcripts.length}</p>
                  <p className="text-xs text-muted-foreground">Total Scans</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-neon-red">
                    {transcripts.filter(t => t.is_scam).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Threats Found</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Transcript Feed */}
          <div className="lg:col-span-2 min-h-[600px] flex flex-col gap-4">
            {/* Live Transcription Preview */}
            {isListening && interimTranscript && (
              <div className="p-4 bg-muted/30 border border-dashed border-muted-foreground/50 rounded-lg">
                <p className="text-sm text-muted-foreground animate-pulse italic">
                  Listening: "{interimTranscript}"
                </p>
              </div>
            )}

            <TranscriptFeed
              transcripts={transcripts}
              isListening={isListening}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 mt-auto">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>ScamShield Cloud Edition</span>
            <span>API: {API_BASE}</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

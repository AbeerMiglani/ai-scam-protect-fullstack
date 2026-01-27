import streamlit as st
import speech_recognition as sr
import requests
import threading
import time
import queue
import json
from streamlit.runtime.scriptrunner import add_script_run_ctx

# --- Configuration ---
st.set_page_config(page_title="🛡️ AI Scam Protect (Local)", layout="wide")
OLLAMA_MODEL = "llama3.1" # Configurable model name

# Queue for thread communication
if "audio_queue" not in st.session_state:
    st.session_state.audio_queue = queue.Queue()
if "text_log" not in st.session_state:
    st.session_state.text_log = [] 
if "is_listening" not in st.session_state:
    st.session_state.is_listening = False
if "threat_level" not in st.session_state:
    st.session_state.threat_level = 0.0

# --- Functions ---

def analyze_with_ollama(new_text, history):
    """Sends text + history to Local Ollama instance."""
    if not new_text or len(new_text) < 2: return False, 0.0, 100.0, "Too short"
    
    url = "http://localhost:11434/api/generate"
    
    # Format history for the prompt
    history_str = "\n".join([f"- {item['text']}" for item in history[-30:]]) # Expanded context to last 30 turns
    
    prompt = f"""
    You are a PARANOID SCAM DETECTION SYSTEM. Your ONLY job is to PROTECT the user.
    
    CONVERSATION HISTORY (Chronological):
    {history_str}
    
    NEWEST PHRASE:
    "{new_text}"
    
    ANALYSIS INSTRUCTIONS:
    1. Analyze the ENTIRE conversation history. NOT just the new phrase.
    2. A conversation that STARTED with a scam attempt (e.g., "I am from Amazon") STAYS a scam even if the caller says "okay" or "hello" later.
    3. Be HYPER-SENSITIVE. If "gift cards", "verify password", "urgent", or "refund" were mentioned ANYWHERE in the past, the Risk Level MUST be HIGH (80-100).
    4. Do not settle for "Potential". If it looks like a duck, call it a Scam.
    
    Output JSON ONLY:
    {{
        "is_scam": boolean, # True if the OVERALL conversation is a scam
        "scam_score": 0-100, # Confidence that this is a scam
        "safety_score": 0-100, # confidence that this is SAFE (Low if scam)
        "risk_level": 0-100, # THE MOST CRITICAL METRIC. 0=Safe, 100=DEFINITE SCAM.
        "reason": "Cite the specific suspicious part from the history that makes this risky"
    }}
    """
    
    payload = {
        "model": OLLAMA_MODEL, 
        "prompt": prompt,
        "stream": False,
        "format": "json"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        if response.status_code == 200:
            result = response.json()
            response_text = result.get("response", "{}")
            
            try:
                data = json.loads(response_text)
                # Default to current threat level if risk_level is missing
                # We use 'risk_level' as the new holistic score
                risk = data.get("risk_level", data.get("scam_score", 0))
                return data.get("is_scam", False), data.get("scam_score", 0), data.get("safety_score", 100), risk, data.get("reason", "Unknown")
            except:
                return False, 0.0, 100.0, 0.0, "Failed to parse JSON"
        else:
            return False, 0.0, 100.0, 0.0, f"Ollama Error: {response.status_code}"
            
    except requests.exceptions.ConnectionError:
        return False, 0.0, 100.0, 0.0, "Ollama Unreachable (Is it running?)"
    except Exception as e:
        return False, 0.0, 100.0, 0.0, f"Error: {e}"

def listen_loop():
    """Background thread to listen to audio."""
    r = sr.Recognizer()
    r.energy_threshold = 2000
    r.dynamic_energy_threshold = True
    
    with sr.Microphone() as source:
        while st.session_state.is_listening:
            try:
                # Listen specifically for a phrase
                audio = r.listen(source, timeout=1, phrase_time_limit=8)
                try:
                    text = r.recognize_google(audio)
                    if text:
                        st.session_state.audio_queue.put(text)
                except sr.UnknownValueError:
                     pass # No speech detected
                except sr.RequestError:
                    st.session_state.audio_queue.put("[API Error: Google Speech Unreachable]")
                    
            except sr.WaitTimeoutError:
                continue
            except Exception as e:
                print(f"Loop Error: {e}")
                break

def perform_analysis_step():
    """Pop from queue and analyze."""
    while not st.session_state.audio_queue.empty():
        text = st.session_state.audio_queue.get()
        if text.startswith("[API Error]"): 
            st.toast(text, icon="⚠️")
            continue
        
        # Get history properly (chronological order for the prompt)
        # text_log is stored Newest -> Oldest for UI, so we reverse it for the prompt
        history_for_context = list(reversed(st.session_state.text_log))
        
        # Analyze
        is_scam, scam_score, safety_score, risk_level, reason = analyze_with_ollama(text, history_for_context)
        
        # Update State
        st.session_state.text_log.insert(0, {
            "text": text, 
            "is_scam": is_scam, 
            "scam_score": scam_score, 
            "safety_score": safety_score,
            "reason": reason
        })
        
        # Directly update threat level from the LLM's holistic risk assessment
        st.session_state.threat_level = risk_level


# --- UI Layout ---

st.title("🛡️ AI Scam Protect (Local)")

# Check if Ollama is running
try:
    requests.get("http://localhost:11434", timeout=1)
except:
    st.error("⚠️ **Ollama is not running!** Please start the Ollama app or run `ollama serve`.")

col1, col2 = st.columns([3, 1])

with col1:
    # Controls
    if not st.session_state.is_listening:
        if st.button("▶️ Start Monitoring", use_container_width=True, type="primary"):
            st.session_state.is_listening = True
            
            # START THREAD WITH CONTEXT
            t = threading.Thread(target=listen_loop, daemon=True)
            add_script_run_ctx(t)
            t.start()
            st.rerun()
    else:
        if st.button("⏹️ Stop Monitoring", use_container_width=True):
            st.session_state.is_listening = False
            st.rerun()
        st.caption("🎙️ Listening... Speak now.")

    st.divider()
    
    # Process Queue (Non-blocking check)
    perform_analysis_step()
    
    # Transcript Display
    st.subheader("Live Transcript Analysis")
    
    transcript_container = st.container()
    
    with transcript_container:
        if not st.session_state.text_log:
            st.info("Waiting for speech... (Try speaking clearly into your microphone)")
        
        for item in st.session_state.text_log:
            # Color coding based on individual message risk
            if item["is_scam"] or item["scam_score"] > 60:
                st.error(f"🚨 **HIGH RISK** | Scam Score: {item['scam_score']}%\n\n> \"{item['text']}\"\n\n_{item['reason']}_")
            elif item["scam_score"] > 30:
                st.warning(f"⚠️ **SUSPICIOUS** | Scam Score: {item['scam_score']}%\n\n> \"{item['text']}\"\n\n_{item['reason']}_")
            else:
                st.success(f"✅ **SAFE** | Safety: {item['safety_score']}%\n\n> \"{item['text']}\"")


with col2:
    st.subheader("Context Threat Level")
    
    # Use container for stability
    metric_container = st.container()
    
    with metric_container:
        level = st.session_state.threat_level
        st.metric("Risk Probability", f"{int(level)}%")
        
        if level < 20:
            st.markdown("## 🟢 Safe")
            st.progress(level / 100 + 0.01)
        elif level < 60:
            st.markdown("## 🟡 Caution")
            st.progress(level / 100)
        else:
            st.markdown("## 🔴 DANGER")
            st.progress(level / 100)
            st.error("POTENTIAL SCAM DETECTED!")

    # Auto-refresh logic
    if st.session_state.is_listening:
        time.sleep(1) 
        st.rerun()

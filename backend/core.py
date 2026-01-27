import threading
import queue
import time
import speech_recognition as sr
import requests
import json

class ScamDetector:
    def __init__(self):
        self.audio_queue = queue.Queue()
        self.text_log = []
        self.is_listening = False
        self.threat_level = 0.0
        self.ollama_model = "llama3.1"
        self._thread = None

    def start_listening(self):
        if not self.is_listening:
            self.is_listening = True
            self._thread = threading.Thread(target=self._listen_loop, daemon=True)
            self._thread.start()

    def stop_listening(self):
        self.is_listening = False
        if self._thread:
            self._thread.join(timeout=1)
            self._thread = None

    def _listen_loop(self):
        r = sr.Recognizer()
        r.energy_threshold = 2000
        r.dynamic_energy_threshold = True

        with sr.Microphone() as source:
            while self.is_listening:
                try:
                    # Listen specifically for a phrase
                    audio = r.listen(source, timeout=1, phrase_time_limit=8)
                    try:
                        text = r.recognize_google(audio)
                        if text:
                            # Analyze immediately when text is found
                            self._process_text(text)
                    except sr.UnknownValueError:
                        pass # No speech detected
                    except sr.RequestError:
                        self.text_log.insert(0, {
                            "text": "[API Error: Google Speech Unreachable]",
                            "is_scam": False,
                            "scam_score": 0,
                            "safety_score": 0,
                            "reason": "Create check internet connection"
                        })
                except sr.WaitTimeoutError:
                    continue
                except Exception as e:
                    print(f"Loop Error: {e}")
                    break

    def _process_text(self, text):
        # 1. Analyze
        # History needs to be chronological for the prompt (Oldest -> Newest)
        # self.text_log is (Newest -> Oldest), so we reverse it
        history_chronological = list(reversed(self.text_log))
        
        is_scam, scam_score, safety_score, risk_level, reason = self._analyze_with_ollama(text, history_chronological)

        # 2. Update State
        self.text_log.insert(0, {
            "text": text,
            "is_scam": is_scam,
            "scam_score": scam_score,
            "safety_score": safety_score,
            "reason": reason
        })
        
        # 3. Update Global Threat Level
        self.threat_level = risk_level

    def _analyze_with_ollama(self, new_text, history):
        if not new_text or len(new_text) < 2: 
            return False, 0.0, 100.0, 0.0, "Too short"
        
        url = "http://localhost:11434/api/generate"
        
        history_str = "\n".join([f"- {item['text']}" for item in history[-30:]]) 
        
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
            "is_scam": boolean, 
            "scam_score": 0-100, 
            "safety_score": 0-100, 
            "risk_level": 0-100, 
            "reason": "Cite the specific suspicious part from the history that makes this risky"
        }}
        """
        
        payload = {
            "model": self.ollama_model, 
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }
        
        try:
            response = requests.post(url, json=payload, timeout=60)
            if response.status_code == 200:
                result = response.json()
                response_text = result.get("response", "{}")
                try:
                    data = json.loads(response_text)
                    risk = data.get("risk_level", data.get("scam_score", 0))
                    return data.get("is_scam", False), data.get("scam_score", 0), data.get("safety_score", 100), risk, data.get("reason", "Unknown")
                except:
                    return False, 0.0, 100.0, 0.0, "Failed to parse JSON"
            else:
                return False, 0.0, 100.0, 0.0, f"Ollama Error: {response.status_code}"
                
        except requests.exceptions.ConnectionError:
            return False, 0.0, 100.0, 0.0, "Ollama Unreachable"
        except Exception as e:
            return False, 0.0, 100.0, 0.0, f"Error: {e}"

# Global Singleton for the API to use
detector = ScamDetector()

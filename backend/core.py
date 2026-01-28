import os
import json
import google.generativeai as genai
from typing import List, Dict, Tuple

class ScamDetector:
    def __init__(self):
        self.text_log = []
        self.threat_level = 0.0
        
        # Configure Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("⚠️ WARNING: GEMINI_API_KEY not found. AI features will fail.")
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')

    def analyze_text(self, text: str, history: List[Dict]) -> Dict:
        """
        Analyzes the new text in the context of the history using Gemini.
        Returns the analysis result.
        """
        # 1. Update Log immediately (Optimistic UI update possible on frontend, but we store it here too)
        # Note: In a stateless REST API, we might rely on the frontend to send history, 
        # but for simplicity, we can keep a session-based approach or append here if valid.
        
        # For this refactor, we will perform analysis first.
        
        if not text or len(text) < 2:
            return {
                "is_scam": False,
                "scam_score": 0,
                "safety_score": 100,
                "risk_level": 0,
                "reason": "Text too short"
            }

        try:
            # Construct Prompt
            history_str = "\n".join([f"- {item.get('text', '')}" for item in history[-30:]]) 
            
            prompt = f"""
            You are a PARANOID SCAM DETECTION SYSTEM. Your ONLY job is to PROTECT the user.
            
            CONVERSATION HISTORY (Chronological):
            {history_str}
            
            NEWEST PHRASE:
            "{text}"
            
            ANALYSIS INSTRUCTIONS:
            1. Analyze the conversation.
            2. Be HYPER-SENSITIVE to keywords: "gift cards", "verify password", "urgent", "refund", "bank", "SSN".
            3. If it looks like a scam, risk level must be HIGH (80-100).
            
            Output JSON ONLY:
            {{
                "is_scam": boolean, 
                "scam_score": 0-100,
                "safety_score": 0-100,
                "risk_level": 0-100, 
                "reason": "Short explanation"
            }}
            """

            response = self.model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            
            # Parse Result
            data = json.loads(response.text)
            
            result = {
                "text": text,
                "is_scam": data.get("is_scam", False),
                "scam_score": data.get("scam_score", 0),
                "safety_score": data.get("safety_score", 100),
                "risk_level": data.get("risk_level", 0),
                "reason": data.get("reason", "Analysis complete")
            }
            
            # Update Internal State
            self.text_log.insert(0, result)
            self.threat_level = result["risk_level"]
            
            return result

        except Exception as e:
            print(f"Gemini Error: {e}")
            return {
                "text": text,
                "is_scam": False,
                "scam_score": 0,
                "safety_score": 100,
                "risk_level": 0,
                "reason": f"AI Error: {str(e)}"
            }

    def clear_session(self):
        self.text_log = []
        self.threat_level = 0.0

# Global Instance
detector = ScamDetector()

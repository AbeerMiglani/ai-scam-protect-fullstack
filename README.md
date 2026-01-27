## Setup

1.  **Install Dependencies**:
    ```bash
    source venv/bin/activate
    pip install -r requirements.txt
    ```

2.  **Install Ollama (Local AI)**:
    *   Download from [ollama.com](https://ollama.com).
    *   Run it.
    *   Pull the model (run this in terminal):
        ```bash
        ollama pull llama3.2
        ```

3.  **Run the App**:
    ```bash
    ./run_scam_protect.sh
    ```

## Usage
1.  Click **Start Monitoring**.
2.  Speak into your microphone (simulating a conversation).
3.  The AI will transcribe text and flag suspicious phrases (e.g., asking for OTP, urgent money transfer).

import { useState, useEffect, useCallback, useRef } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);

  // Refs to keep track of current state inside callbacks/effects
  const isListeningRef = useRef(isListening);
  const recognitionRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Browser does not support Speech Recognition. Try Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTrans = '';
      let interimTrans = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTrans += event.results[i][0].transcript;
        } else {
          interimTrans += event.results[i][0].transcript;
        }
      }

      if (finalTrans) {
        setTranscript(finalTrans);
      }
      setInterimTranscript(interimTrans);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow permission.');
        setIsListening(false);
      } else if (event.error === 'network') {
        setError('Network error during speech recognition.');
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Use ref to check current "intended" state
      if (isListeningRef.current) {
        console.log("Speech recognition ended unexpectedly. Restarting...");

        // Add a small delay to prevent rapid-fire restart loops that browsers block
        setTimeout(() => {
          try {
            recognition.start();
          } catch (e) {
            console.log("Restart failed", e);
          }
        }, 300);
      } else {
        console.log("Speech recognition stopped intentionally.");
      }
    };

    recognitionRef.current = recognition;

    // cleanup
    return () => {
      recognition.onend = null; // Prevent restart on cleanup
      recognition.stop();
    };
  }, []); // Only run setup ONCE on mount

  // Effect to handle Start/Stop based on state
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Usually errors if already started, which is fine
        console.log("Start called but maybe already running", e);
      }
    } else {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech Recognition not supported or not initialized.');
      return;
    }
    setError(null);
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    error,
    resetTranscript: () => setTranscript('')
  };
}

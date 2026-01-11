/**
 * Voice Input Button
 * 
 * Enables voice-to-text input for elderly users
 * Uses Web Speech API
 * 
 * Architecture: UI Layer
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Check browser support
const isSpeechSupported = typeof window !== 'undefined' && 
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

export default function VoiceInputButton({ 
  onTranscript, 
  onStart, 
  onEnd,
  disabled = false,
  size = 'md' 
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  
  // Use refs to avoid re-creating recognition on callback changes
  const recognitionRef = useRef(null);
  const callbacksRef = useRef({ onTranscript, onStart, onEnd });

  // Keep callbacks ref updated
  useEffect(() => {
    callbacksRef.current = { onTranscript, onStart, onEnd };
  }, [onTranscript, onStart, onEnd]);

  // Initialize speech recognition ONCE
  useEffect(() => {
    if (!isSpeechSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'vi-VN'; // Vietnamese
    recognitionInstance.maxAlternatives = 1;

    recognitionInstance.onstart = () => {
      setIsListening(true);
      setError(null);
      callbacksRef.current.onStart?.();
    };

    recognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(interimTranscript || finalTranscript);
      
      if (finalTranscript) {
        callbacksRef.current.onTranscript?.(finalTranscript);
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error);
      setIsListening(false);
      callbacksRef.current.onEnd?.();
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
      setTranscript('');
      callbacksRef.current.onEnd?.();
    };

    recognitionRef.current = recognitionInstance;

    return () => {
      recognitionInstance.abort();
    };
  }, []); // Empty deps - only run once

  const toggleListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      setError(null);
      try {
        recognition.start();
      } catch (e) {
        // Already started - ignore
        console.warn('Recognition already started');
      }
    }
  }, [isListening]);

  // Size variants
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (!isSpeechSupported) {
    return null; // Hide button if not supported
  }

  return (
    <div className="relative">
      {/* Main Button */}
      <motion.button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
        className={`
          ${sizeClasses[size]}
          rounded-full flex items-center justify-center
          transition-all duration-200
          ${isListening 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' 
            : 'bg-gray-100 text-gray-600 hover:bg-[#7CB342] hover:text-white'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
        title={isListening ? 'Đang nghe... (Nhấn để dừng)' : 'Nói để nhập (Tiếng Việt)'}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <MicOff className={iconSizes[size]} />
              {/* Pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [1, 0, 1]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity 
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic className={iconSizes[size]} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 
                       bg-gray-900 text-white px-3 py-2 rounded-lg text-xs
                       whitespace-nowrap shadow-lg z-50"
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <span>🎤 Đang nghe...</span>
            </div>
            {transcript && (
              <div className="mt-1 text-gray-300 text-[10px] max-w-[150px] truncate">
                "{transcript}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error indicator */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                       bg-red-500 text-white px-2 py-1 rounded text-[10px]
                       whitespace-nowrap"
          >
            {error === 'not-allowed' 
              ? 'Cho phép microphone' 
              : error === 'no-speech'
              ? 'Không nghe thấy'
              : 'Lỗi, thử lại'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Voice output (Text-to-Speech) - Vietnamese only
 * Luôn đọc tiếng Việt, bỏ qua text không hợp lệ
 */
export function speakText(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  
  // Validate text
  if (!text || typeof text !== 'string') return false;
  
  // Clean text - remove markdown, emoji codes, etc
  const cleanText = text
    .replace(/\*\*/g, '') // Bold markdown
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/`[^`]+`/g, '') // Code
    .replace(/---/g, '')
    .replace(/\n+/g, '. ')
    .replace(/•/g, ',')
    .trim();
  
  if (!cleanText) return false;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'vi-VN'; // Always Vietnamese
  utterance.rate = 0.95; // Slightly slower for elderly
  utterance.pitch = 1;
  utterance.volume = 1;

  // Function to speak with Vietnamese voice
  const doSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    
    // Find Vietnamese voice - prioritize by order
    const viVoice = voices.find(v => v.lang === 'vi-VN')
      || voices.find(v => v.lang.toLowerCase().startsWith('vi'))
      || voices.find(v => v.name.toLowerCase().includes('vietnam'))
      || voices.find(v => v.name.toLowerCase().includes('viet'));
    
    if (viVoice) {
      utterance.voice = viVoice;
      console.log('[TTS] Using Vietnamese voice:', viVoice.name);
    } else {
      console.warn('[TTS] No Vietnamese voice found, using default');
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Chrome requires voices to be loaded async
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    // Voices not loaded yet - wait for them
    window.speechSynthesis.onvoiceschanged = () => {
      doSpeak();
      window.speechSynthesis.onvoiceschanged = null; // Clean up
    };
  } else {
    doSpeak();
  }

  return true;
}

/**
 * Stop speaking
 */
export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
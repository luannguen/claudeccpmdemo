/**
 * Voice Chat Mode - Real Voice Conversation
 * 
 * Chế độ chat bằng giọng nói thực sự:
 * - Nhấn giữ để nói
 * - Bot trả lời bằng giọng nói
 * - Không hiển thị text (trừ khi cần)
 * 
 * Architecture: UI Layer
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, VolumeX, X, 
  MessageSquare, Loader2, Phone, PhoneOff,
  Bot, User
} from 'lucide-react';

// ========== SPEECH RECOGNITION ==========

const SpeechRecognition = typeof window !== 'undefined' && 
  (window.SpeechRecognition || window.webkitSpeechRecognition);

// ========== SPEECH SYNTHESIS (Vietnamese) ==========

// Voice availability state
let cachedVietnameseVoice = null;
let hasVietnameseVoice = false;
let voicesLoaded = false;

// Clean text for TTS
const cleanTextForSpeech = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/---/g, '')
    .replace(/\n+/g, '. ')
    .replace(/•/g, ',')
    .replace(/[👤📞📍💳✅❌🛒📦🥬🍚🍎💰🌱💡🎤🔊😅🤔🎉💚📋🚚]/gu, '')
    .trim();
};

// Load and detect Vietnamese voice
const loadVoices = () => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  
  const voices = window.speechSynthesis.getVoices();
  cachedVietnameseVoice = voices.find(v => v.lang === 'vi-VN')
    || voices.find(v => v.lang?.toLowerCase().startsWith('vi'))
    || voices.find(v => v.name?.toLowerCase().includes('vietnam'))
    || voices.find(v => v.name?.toLowerCase().includes('viet'));
  
  hasVietnameseVoice = !!cachedVietnameseVoice;
  voicesLoaded = true;
  
  // Vietnamese voice detection complete
};

// Initialize voices
if (typeof window !== 'undefined' && window.speechSynthesis) {
  if (window.speechSynthesis.getVoices().length > 0) {
    loadVoices();
  } else {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/**
 * Check if Vietnamese voice is available
 */
const checkVietnameseVoiceAvailable = () => {
  if (!voicesLoaded) loadVoices();
  return hasVietnameseVoice;
};

/**
 * Speak text in Vietnamese
 * @returns {boolean} true if speech started, false if no voice available
 */
const speak = (text, onEnd) => {
  // Ensure voices are loaded
  if (!voicesLoaded) loadVoices();
  
  if (!window.speechSynthesis || !text) {
    onEnd?.();
    return false;
  }
  
  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) {
    onEnd?.();
    return false;
  }

  // If no Vietnamese voice, return false (caller will show text instead)
  if (!hasVietnameseVoice) {
    // No Vietnamese voice, skipping TTS
    onEnd?.();
    return false;
  }

  // Speaking text
  
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'vi-VN';
  utterance.rate = 0.9; // Slower for elderly
  utterance.pitch = 1;
  utterance.volume = 1;
  utterance.voice = cachedVietnameseVoice;
  
  utterance.onend = () => {
    // Finished speaking
    onEnd?.();
  };
  utterance.onerror = (e) => {
    // Speech error
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
  return true;
};

const stopSpeaking = () => {
  window.speechSynthesis?.cancel();
};

// ========== VOICE STATE ==========

const VOICE_STATE = {
  IDLE: 'idle',           // Chờ user nói
  LISTENING: 'listening', // Đang nghe user
  PROCESSING: 'processing', // Đang xử lý
  SPEAKING: 'speaking'    // Bot đang nói
};

// ========== MAIN COMPONENT ==========

export default function VoiceChatMode({ 
  isOpen, 
  onClose, 
  onSendMessage,
  onSwitchToText 
}) {
  const [voiceState, setVoiceState] = useState(VOICE_STATE.IDLE);
  const [transcript, setTranscript] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [hasVoice, setHasVoice] = useState(true); // Assume yes until checked
  const [showTextFallback, setShowTextFallback] = useState(false);
  
  const recognitionRef = useRef(null);
  const isHoldingRef = useRef(false);

  // Check Vietnamese voice availability on mount
  useEffect(() => {
    const checkVoice = () => {
      const available = checkVietnameseVoiceAvailable();
      setHasVoice(available);
      if (!available) {
        // No Vietnamese voice - will show text fallback
      }
    };
    
    // Check immediately and after voices load
    checkVoice();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = checkVoice;
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (!SpeechRecognition) {
      setError('Trình duyệt không hỗ trợ giọng nói');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after each phrase
    recognition.interimResults = true;
    recognition.lang = 'vi-VN'; // Vietnamese
    recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy

    recognition.onstart = () => {
      // Recognition started
      setVoiceState(VOICE_STATE.LISTENING);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        // Get best transcript
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        
        // Recognition result received
        
        if (result.isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const displayText = finalTranscript || interimTranscript;
      setTranscript(displayText);
      
      // If we got a final result
      if (finalTranscript) {
        // Final transcript received
        // Process after a short delay to allow for more input
        setTimeout(() => {
          if (!isHoldingRef.current) {
            handleUserMessage(finalTranscript);
          }
        }, 300);
      }
    };

    recognition.onerror = (event) => {
      // Recognition error handling
      if (event.error === 'not-allowed') {
        setError('Vui lòng cho phép sử dụng microphone');
      } else if (event.error === 'no-speech') {
        setError('Không nghe thấy giọng nói');
      } else if (event.error !== 'aborted') {
        setError('Lỗi nhận diện giọng nói: ' + event.error);
      }
      setVoiceState(VOICE_STATE.IDLE);
    };

    recognition.onend = () => {
      // Recognition ended
      // If still holding, restart to keep listening
      if (isHoldingRef.current) {
        try { 
          recognition.start(); 
        } catch (e) {
          // Could not restart recognition
        }
      } else {
        // Only change state if not already processing
        setVoiceState(prev => 
          prev === VOICE_STATE.LISTENING ? VOICE_STATE.IDLE : prev
        );
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  // Handle user message -> send to bot
  const handleUserMessage = useCallback(async (text) => {
    if (!text?.trim()) return;
    
    setVoiceState(VOICE_STATE.PROCESSING);
    setTranscript('');
    setShowTextFallback(false);
    
    // Add to history
    setConversationHistory(prev => [...prev, { role: 'user', text }]);

    try {
      // Call parent's send message
      const response = await onSendMessage(text);
      
      // Get voice text from response
      const voiceText = response?.voiceText || response?.content || response;
      
      if (voiceText && typeof voiceText === 'string') {
        setBotResponse(voiceText);
        setConversationHistory(prev => [...prev, { role: 'bot', text: voiceText }]);
        
        // Try to speak the response
        setVoiceState(VOICE_STATE.SPEAKING);
        const didSpeak = speak(voiceText, () => {
          setVoiceState(VOICE_STATE.IDLE);
          setShowTextFallback(false);
        });
        
        // If no voice available, show text fallback prominently
        if (!didSpeak) {
          setShowTextFallback(true);
          // Auto-hide after reading time (approx 100ms per character)
          const readTime = Math.max(3000, Math.min(voiceText.length * 80, 15000));
          setTimeout(() => {
            setVoiceState(VOICE_STATE.IDLE);
            setShowTextFallback(false);
          }, readTime);
        }
      } else {
        setVoiceState(VOICE_STATE.IDLE);
      }
    } catch (err) {
      console.error('Error processing voice message:', err);
      setError('Có lỗi xảy ra, thử lại nhé');
      setVoiceState(VOICE_STATE.IDLE);
    }
  }, [onSendMessage]);

  // Start listening (press and hold)
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    if (voiceState === VOICE_STATE.SPEAKING) {
      stopSpeaking();
    }
    
    isHoldingRef.current = true;
    setTranscript('');
    setError(null);
    
    try {
      recognitionRef.current.start();
    } catch (e) {
      // Already started
    }
  }, [voiceState]);

  // Stop listening (release)
  const stopListening = useCallback(() => {
    // Stop listening
    isHoldingRef.current = false;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // If we have transcript and still listening, process it
    if (transcript && voiceState === VOICE_STATE.LISTENING) {
      handleUserMessage(transcript);
    }
  }, [transcript, voiceState, handleUserMessage]);

  // Cancel current action
  const handleCancel = useCallback(() => {
    isHoldingRef.current = false;
    recognitionRef.current?.abort();
    stopSpeaking();
    setVoiceState(VOICE_STATE.IDLE);
    setTranscript('');
    setBotResponse('');
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-[#1a472a] via-[#2d5a3d] to-[#1a472a]"
      >
        {/* Close & Switch buttons */}
        <div className="absolute top-4 left-4 right-4 flex justify-between z-10">
          <button
            onClick={onSwitchToText}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 
                       text-white rounded-full transition-colors text-sm"
          >
            <MessageSquare className="w-4 h-4" />
            Chat văn bản
          </button>
          
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-red-500/50 text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center h-full px-6">
          
          {/* Bot Avatar */}
          <motion.div
            animate={{
              scale: voiceState === VOICE_STATE.SPEAKING ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: voiceState === VOICE_STATE.SPEAKING ? Infinity : 0 }}
            className={`
              w-24 h-24 rounded-full flex items-center justify-center mb-8
              ${voiceState === VOICE_STATE.SPEAKING 
                ? 'bg-[#7CB342] shadow-lg shadow-[#7CB342]/50' 
                : 'bg-white/20'
              }
            `}
          >
            <Bot className="w-12 h-12 text-white" />
          </motion.div>

          {/* Status Text */}
          <div className="text-center mb-8 min-h-[80px]">
            {voiceState === VOICE_STATE.IDLE && (
              <p className="text-white/80 text-lg">
                Nhấn giữ nút mic để nói
              </p>
            )}
            
            {voiceState === VOICE_STATE.LISTENING && (
              <div className="space-y-2">
                <p className="text-[#7CB342] text-lg font-medium">
                  🎤 Đang nghe...
                </p>
                {transcript && (
                  <p className="text-white text-xl max-w-sm">
                    "{transcript}"
                  </p>
                )}
              </div>
            )}
            
            {voiceState === VOICE_STATE.PROCESSING && (
              <div className="flex items-center gap-3 text-white">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang xử lý...</span>
              </div>
            )}
            
            {voiceState === VOICE_STATE.SPEAKING && (
              <div className="space-y-2">
                {hasVoice && !showTextFallback ? (
                  <>
                    <p className="text-[#7CB342] text-lg font-medium">
                      🔊 Bot đang nói...
                    </p>
                    <p className="text-white/70 text-sm max-w-sm mx-auto line-clamp-3">
                      {botResponse}
                    </p>
                  </>
                ) : (
                  /* Text Fallback - Large readable text when no voice */
                  <div className="bg-white/10 rounded-2xl p-4 max-w-md mx-auto backdrop-blur-sm">
                    <p className="text-white/60 text-xs mb-2 flex items-center gap-1 justify-center">
                      <VolumeX className="w-3 h-3" />
                      Thiết bị chưa có giọng đọc tiếng Việt
                    </p>
                    <p className="text-white text-lg leading-relaxed">
                      {cleanTextForSpeech(botResponse)}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
          </div>

          {/* Main Mic Button */}
          <motion.button
            onPointerDown={startListening}
            onPointerUp={stopListening}
            onPointerLeave={stopListening}
            whileTap={{ scale: 0.95 }}
            disabled={voiceState === VOICE_STATE.PROCESSING}
            className={`
              w-28 h-28 rounded-full flex items-center justify-center
              transition-all duration-200 select-none
              ${voiceState === VOICE_STATE.LISTENING
                ? 'bg-red-500 shadow-lg shadow-red-500/50 scale-110'
                : voiceState === VOICE_STATE.PROCESSING
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100 active:scale-95'
              }
            `}
          >
            {voiceState === VOICE_STATE.LISTENING ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : voiceState === VOICE_STATE.PROCESSING ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : (
              <Mic className={`w-12 h-12 ${voiceState === VOICE_STATE.SPEAKING ? 'text-[#7CB342]' : 'text-[#1a472a]'}`} />
            )}
          </motion.button>

          {/* Listening animation rings */}
          {voiceState === VOICE_STATE.LISTENING && (
            <>
              <motion.div
                className="absolute w-28 h-28 rounded-full border-4 border-red-400"
                animate={{ scale: [1, 1.5, 1.5], opacity: [0.8, 0, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute w-28 h-28 rounded-full border-4 border-red-400"
                animate={{ scale: [1, 1.8, 1.8], opacity: [0.6, 0, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
            </>
          )}

          {/* Cancel/Continue button when speaking */}
          {voiceState === VOICE_STATE.SPEAKING && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleCancel}
              className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 
                         text-white rounded-full transition-colors text-sm"
            >
              {showTextFallback ? 'Tiếp tục' : 'Dừng lại'}
            </motion.button>
          )}

          {/* No voice warning banner */}
          {!hasVoice && voiceState === VOICE_STATE.IDLE && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 px-4 py-2 bg-amber-500/20 border border-amber-500/30 
                         rounded-lg text-amber-200 text-xs text-center max-w-xs"
            >
              <VolumeX className="w-4 h-4 inline mr-1" />
              Thiết bị chưa có giọng đọc tiếng Việt. Bot sẽ hiển thị text để bác đọc.
            </motion.div>
          )}

          {/* Recent conversation */}
          {conversationHistory.length > 0 && (
            <div className="absolute bottom-24 left-4 right-4 max-h-32 overflow-y-auto">
              <div className="flex flex-col gap-2">
                {conversationHistory.slice(-4).map((msg, i) => (
                  <div
                    key={i}
                    className={`
                      flex items-start gap-2 text-xs
                      ${msg.role === 'user' ? 'justify-end' : 'justify-start'}
                    `}
                  >
                    {msg.role === 'bot' && (
                      <Bot className="w-4 h-4 text-[#7CB342] flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`
                      px-3 py-1.5 rounded-lg max-w-[70%] line-clamp-2
                      ${msg.role === 'user' 
                        ? 'bg-white/20 text-white' 
                        : 'bg-[#7CB342]/30 text-white'
                      }
                    `}>
                      {msg.text}
                    </span>
                    {msg.role === 'user' && (
                      <User className="w-4 h-4 text-white/60 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hint */}
          <p className="absolute bottom-8 text-white/40 text-xs text-center">
            Nhấn giữ để nói • Thả để gửi • Nhấn khi bot nói để dừng
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
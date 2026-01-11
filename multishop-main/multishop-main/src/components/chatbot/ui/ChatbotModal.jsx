/**
 * Chatbot Modal
 * 
 * Enhanced modal with drag, resize, minimize, fullscreen
 * Based on EnhancedModal pattern
 */

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  X, Maximize2, Minimize2, Minus, Move, RotateCcw, 
  Bot, Trash2, Settings, Zap, Volume2, VolumeX, Phone
} from 'lucide-react';

import ChatbotMessageEnhanced from './ChatbotMessageEnhanced';
import ChatbotTypingIndicator from '../ChatbotTypingIndicator';
import EnhancedQuickActions from './EnhancedQuickActions';
import ChatbotInput from '../ChatbotInput';
import VoiceInputButton, { speakText, stopSpeaking } from './VoiceInputButton';

const POSITION_STORAGE_KEY = 'chatbot-modal-position';

function ChatbotModal({
  isOpen,
  onClose,
  messages,
  inputText,
  setInputText,
  onSend,
  onKeyPress,
  isTyping,
  quickActions,
  onQuickAction,
  onClear,
  inputRef,
  messagesEndRef,
  onAddToCart,
  cacheStats,
  rateLimitStats,
  userContext,
  onSwitchToVoice
}) {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [lastSpokenMessageId, setLastSpokenMessageId] = useState(null);

  const dragControls = useDragControls();
  const modalRef = useRef(null);

  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  // Load saved position
  useEffect(() => {
    if (!isMobile) {
      const saved = localStorage.getItem(POSITION_STORAGE_KEY);
      if (saved) {
        try {
          setPosition(JSON.parse(saved));
        } catch (e) {}
      }
    }
  }, [isMobile]);

  // Save position
  useEffect(() => {
    if (!isMobile && (position.x !== 0 || position.y !== 0)) {
      localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
    }
  }, [position, isMobile]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && !isMinimized) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isMinimized, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if (!isOpen) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
        e.preventDefault();
        setIsMaximized(!isMaximized);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onSend();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isOpen, isMaximized, onSend]);

  // Scroll lock
  useEffect(() => {
    if (isOpen && !isMinimized) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen, isMinimized]);

  // Focus input on open
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef?.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized, inputRef]);

  // Auto-speak latest bot message when voiceEnabled
  useEffect(() => {
    if (!voiceEnabled || !messages.length) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== 'bot') return;
    if (lastMessage.id === lastSpokenMessageId) return;
    
    // Get voice text
    const textToSpeak = lastMessage.voiceText || 
      (typeof lastMessage.content === 'string' ? lastMessage.content : null);
    
    if (textToSpeak) {
      setLastSpokenMessageId(lastMessage.id);
      // Small delay to let UI render
      setTimeout(() => speakText(textToSpeak), 300);
    }
  }, [messages, voiceEnabled, lastSpokenMessageId]);

  const handleReset = useCallback(() => {
    setPosition({ x: 0, y: 0 });
    setIsMaximized(false);
  }, []);

  // Minimized state
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white px-4 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          <Bot className="w-5 h-5" />
          <span className="font-medium">Trợ Lý Zero Farm</span>
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
        </button>
      </motion.div>
    );
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className={`fixed inset-0 z-50 ${isMaximized || isMobile ? '' : 'pointer-events-none'}`}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isDragging) {
            // Click outside to minimize on desktop
            if (!isMobile) setIsMinimized(true);
          }
        }}
      >
        {/* Backdrop for mobile */}
        {isMobile && (
          <div className="absolute inset-0 bg-black/40 pointer-events-auto" onClick={onClose} />
        )}

        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: isMaximized || isMobile ? 0 : position.x,
            ...(isMaximized || isMobile ? {} : position)
          }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          drag={!isMaximized && !isMobile}
          dragControls={dragControls}
          dragMomentum={false}
          dragElastic={0.1}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(e, info) => {
            setIsDragging(false);
            setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y });
          }}
          className={`
            pointer-events-auto
            bg-white shadow-2xl flex flex-col overflow-hidden
            ${isMaximized 
              ? 'fixed inset-0 rounded-none' 
              : isMobile
                ? 'fixed bottom-0 left-0 right-0 h-[85vh] rounded-t-3xl'
                : 'fixed bottom-4 right-4 w-[420px] h-[600px] rounded-3xl'
            }
          `}
        >
          {/* Header */}
          <div 
            className={`
              bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white p-3
              flex items-center justify-between flex-shrink-0
              ${!isMaximized && !isMobile ? 'cursor-move' : ''}
            `}
            onPointerDown={(e) => {
              if (!isMaximized && !isMobile) {
                dragControls.start(e);
              }
            }}
          >
            <div className="flex items-center gap-2">
              {!isMaximized && !isMobile && <Move className="w-4 h-4 opacity-60" />}
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Trợ Lý Zero Farm</h3>
                <p className="text-xs opacity-80">Online • AI Powered</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Stats */}
              {cacheStats && (
                <div className="hidden sm:flex items-center gap-1 mr-2 text-xs opacity-70">
                  <Zap className="w-3 h-3" />
                  <span>{cacheStats.validEntries} cached</span>
                </div>
              )}

              {/* Voice Mode Switch */}
              {onSwitchToVoice && (
                <button
                  onClick={onSwitchToVoice}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="Chế độ gọi thoại"
                >
                  <Phone className="w-4 h-4" />
                </button>
              )}

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Clear */}
              <button
                onClick={onClear}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                title="Xóa lịch sử"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Desktop controls */}
              {!isMobile && (
                <>
                  <button
                    onClick={handleReset}
                    className="hidden sm:block p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    title="Reset vị trí"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    title="Thu nhỏ"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsMaximized(!isMaximized)}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                    title={isMaximized ? "Thu nhỏ" : "Phóng to"}
                  >
                    {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </>
              )}

              {/* Close */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-red-500/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings panel */}
          {showSettings && (
            <div className="p-3 bg-gray-50 border-b text-xs space-y-2">
              <div className="flex justify-between">
                <span>Cache entries:</span>
                <span className="font-medium">{cacheStats?.validEntries || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Messages/phút:</span>
                <span className="font-medium">{rateLimitStats?.messagesThisMinute || 0}/{rateLimitStats?.limitPerMinute || 20}</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('chatbot_response_cache');
                  setShowSettings(false);
                }}
                className="w-full py-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
              >
                Xóa cache
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((message) => (
              <ChatbotMessageEnhanced 
                key={message.id} 
                message={message}
                compact={isMobile}
                onAddToCart={onAddToCart}
                onQuickAction={onQuickAction}
              />
            ))}
            
            <AnimatePresence>
              {isTyping && <ChatbotTypingIndicator compact={isMobile} />}
            </AnimatePresence>
            
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Quick Actions */}
          <div className="p-2 border-t border-gray-100">
            <EnhancedQuickActions
              onAction={onQuickAction}
              userContext={userContext}
              variant={isMobile ? 'grid' : 'row'}
              maxActions={isMobile ? 6 : 4}
            />
          </div>

          {/* Input with Voice */}
          <div className="p-3 border-t border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              {/* Voice Input */}
              <VoiceInputButton
                onTranscript={(text) => {
                  setInputText(prev => prev + ' ' + text);
                }}
                onStart={() => setIsListening(true)}
                onEnd={() => setIsListening(false)}
                disabled={isTyping}
                size={isMobile ? 'lg' : 'md'}
              />
              
              {/* Main Input */}
              <div className="flex-1">
                <ChatbotInput
                  ref={inputRef}
                  value={inputText}
                  onChange={setInputText}
                  onSend={onSend}
                  onKeyPress={onKeyPress}
                  disabled={isTyping || isListening}
                  compact={isMobile}
                  placeholder={isListening ? "🎤 Đang nghe..." : "Nhập hoặc nói để hỏi..."}
                />
              </div>
              
              {/* Voice Output Toggle */}
              <button
                type="button"
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled) stopSpeaking();
                }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-colors
                  ${voiceEnabled 
                    ? 'bg-[#7CB342] text-white' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }
                `}
                title={voiceEnabled ? 'Tắt đọc' : 'Bật đọc'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Voice hint for elderly */}
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              💡 Nhấn 🎤 để nói • Nhấn 🔊 để nghe trả lời
            </p>
          </div>

          {/* Mobile drag indicator */}
          {isMobile && (
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/30 rounded-full" />
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default memo(ChatbotModal);
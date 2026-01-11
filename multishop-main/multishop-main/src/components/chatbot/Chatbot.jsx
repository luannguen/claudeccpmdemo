/**
 * Chatbot - Main Chatbot Component
 * 
 * Composes all chatbot sub-components
 * Uses useChatbot hook for logic
 * 
 * Architecture: UI Layer (AI-CODING-RULES compliant)
 */

import React, { memo } from 'react';
import { useChatbot } from './useChatbot';
import ChatbotTrigger from './ChatbotTrigger';
import ChatbotWindow from './ChatbotWindow';

/**
 * @param {Object} props
 * @param {boolean} props.enableAIContext - Enable AI personalization
 * @param {boolean} props.hideOnMobile - Hide trigger on mobile (for BottomNav)
 */
function Chatbot({ enableAIContext = true, hideOnMobile = true }) {
  const {
    // State
    messages,
    inputText,
    isOpen,
    isTyping,
    
    // Refs
    messagesEndRef,
    inputRef,
    
    // Actions
    setInputText,
    sendMessage,
    handleKeyPress,
    handleQuickAction,
    clearHistory,
    open,
    close,
    
    // Config
    quickActions
  } = useChatbot({ enableAIContext });

  // Detect mobile for compact mode
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <>
      {/* Floating Trigger Button */}
      <ChatbotTrigger
        onClick={open}
        isOpen={isOpen}
        hideOnMobile={hideOnMobile}
      />

      {/* Chat Window */}
      <ChatbotWindow
        isOpen={isOpen}
        onClose={close}
        messages={messages}
        inputText={inputText}
        setInputText={setInputText}
        onSend={sendMessage}
        onKeyPress={handleKeyPress}
        isTyping={isTyping}
        quickActions={quickActions}
        onQuickAction={handleQuickAction}
        onClear={clearHistory}
        inputRef={inputRef}
        messagesEndRef={messagesEndRef}
        compact={isMobile}
      />
    </>
  );
}

export default memo(Chatbot);
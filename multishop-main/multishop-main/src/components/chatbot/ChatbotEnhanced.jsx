/**
 * ChatbotEnhanced - Full Featured Chatbot
 * 
 * Composes all chatbot components with multi-agent support
 * Supports 2 modes: Text Chat & Voice Chat
 * 
 * Architecture: UI Layer (AI-CODING-RULES compliant)
 */

import React, { memo, useState, useCallback } from 'react';
import useChatbotEnhanced from './useChatbotEnhanced';
import ChatbotTrigger from './ChatbotTrigger';
import ChatbotModal from './ui/ChatbotModal';
import VoiceChatMode from './ui/VoiceChatMode';

// Chat modes
const CHAT_MODE = {
  TEXT: 'text',
  VOICE: 'voice'
};

/**
 * @param {Object} props
 * @param {boolean} props.enableAIContext - Enable AI personalization
 * @param {boolean} props.hideOnMobile - Hide trigger on mobile (for BottomNav)
 */
function ChatbotEnhanced({ enableAIContext = true, hideOnMobile = true }) {
  const [chatMode, setChatMode] = useState(CHAT_MODE.TEXT);
  
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
    handleAddToCart,
    
    // Config
    quickActions,
    
    // Stats
    cacheStats,
    rateLimitStats,
    
    // User context for quick actions
    userContext
  } = useChatbotEnhanced({ enableAIContext });

  // Voice mode: send message and return response for TTS
  // Directly call orchestrator to get response
  const handleVoiceSendMessage = useCallback(async (text) => {
    try {
      // Import orchestrator dynamically
      const { default: chatbotOrchestrator } = await import('./services/chatbotOrchestrator');
      
      // Process message through orchestrator
      const result = await chatbotOrchestrator.processMessage(text, {
        history: messages.slice(-10),
        userContext: userContext ? {
          contextString: userContext.contextSummary,
          segment: userContext.segment,
          intent: userContext.intent,
          persona: userContext.persona
        } : null
      });
      
      if (result.success && result.data) {
        const data = result.data;
        return {
          voiceText: data.voiceText || data.content,
          content: data.content,
          contentType: data.contentType
        };
      }
      
      return { voiceText: 'Xin lỗi, có lỗi xảy ra. Bác thử lại nhé.' };
    } catch (err) {
      console.error('Voice message error:', err);
      return { voiceText: 'Xin lỗi, có lỗi xảy ra. Bác thử lại nhé.' };
    }
  }, [messages, userContext]);

  // Switch to voice mode
  const openVoiceMode = useCallback(() => {
    setChatMode(CHAT_MODE.VOICE);
    if (!isOpen) open();
  }, [isOpen, open]);

  // Switch to text mode
  const openTextMode = useCallback(() => {
    setChatMode(CHAT_MODE.TEXT);
    if (!isOpen) open();
  }, [isOpen, open]);

  // Close any mode
  const handleClose = useCallback(() => {
    close();
    setChatMode(CHAT_MODE.TEXT);
  }, [close]);

  return (
    <>
      {/* Floating Trigger Button - with voice mode option */}
      <ChatbotTrigger
        onClick={open}
        onLongPress={openVoiceMode}
        isOpen={isOpen}
        hideOnMobile={hideOnMobile}
      />

      {/* Text Chat Modal */}
      {chatMode === CHAT_MODE.TEXT && (
        <ChatbotModal
          isOpen={isOpen}
          onClose={handleClose}
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
          onAddToCart={handleAddToCart}
          cacheStats={cacheStats}
          rateLimitStats={rateLimitStats}
          userContext={userContext}
          onSwitchToVoice={openVoiceMode}
        />
      )}

      {/* Voice Chat Mode - Full screen voice conversation */}
      {chatMode === CHAT_MODE.VOICE && (
        <VoiceChatMode
          isOpen={isOpen}
          onClose={handleClose}
          onSendMessage={handleVoiceSendMessage}
          onSwitchToText={openTextMode}
        />
      )}
    </>
  );
}

export default memo(ChatbotEnhanced);
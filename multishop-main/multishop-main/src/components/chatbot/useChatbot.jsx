/**
 * useChatbot Hook
 * 
 * Feature Logic Layer for ChatBot
 * Manages state, handles message flow, integrates with AI context
 * 
 * Architecture: Hook Layer (AI-CODING-RULES compliant)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { useAIUserContext } from '@/components/ai/useAIUserContext';
import chatbotAPI, { 
  MESSAGE_ROLES, 
  CHATBOT_CONFIG,
  QUICK_ACTIONS 
} from './chatbotService';

/**
 * @typedef {Object} UseChatbotOptions
 * @property {boolean} autoWelcome - Show welcome message on init
 * @property {boolean} enableAIContext - Use AI personalization
 * @property {Function} onMessageSent - Callback when message sent
 * @property {Function} onResponseReceived - Callback when response received
 */

/**
 * Main chatbot hook
 * @param {UseChatbotOptions} options
 */
export function useChatbot(options = {}) {
  const {
    autoWelcome = true,
    enableAIContext = true,
    onMessageSent,
    onResponseReceived
  } = options;

  // Auth & AI Context
  const { user, isAuthenticated } = useAuth();
  const aiContext = useAIUserContext({ enabled: enableAIContext && isAuthenticated });

  // State
  const [messages, setMessages] = useState(() => 
    autoWelcome ? [chatbotAPI.getWelcomeMessage()] : []
  );
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for external open events
  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('open-chatbot', handleOpenChatbot);
  }, []);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      // Add user message to UI immediately
      const userMessage = chatbotAPI.createMessage(MESSAGE_ROLES.USER, content);
      setMessages(prev => [...prev, userMessage]);
      
      // Callback
      onMessageSent?.(userMessage);

      // Get AI response
      const result = await chatbotAPI.sendMessage({
        content,
        history: messages.slice(-10), // Last 10 messages for context
        userContext: enableAIContext ? {
          contextString: aiContext.contextString,
          segment: aiContext.segment,
          intent: aiContext.intent,
          recommendations: aiContext.recommendations,
          isAuthorized: aiContext.isAuthorized
        } : null,
        rbacContext: enableAIContext ? {
          buildSystemPromptRBAC: aiContext.buildSystemPromptRBAC
        } : null
      });

      return result;
    },
    onSuccess: (result) => {
      let responseContent;
      let suggestedActions = [];

      if (result.success) {
        responseContent = result.data.content;
        suggestedActions = result.data.suggestedActions || [];
      } else {
        // Use fallback on error
        const fallback = chatbotAPI.getFallbackResponse();
        responseContent = fallback.content;
        suggestedActions = fallback.suggestedActions;
      }

      const botMessage = chatbotAPI.createMessage(MESSAGE_ROLES.BOT, responseContent);
      botMessage.suggestedActions = suggestedActions;
      
      setMessages(prev => [...prev, botMessage]);
      onResponseReceived?.(botMessage);
    },
    onError: () => {
      // Use fallback on network error
      const fallback = chatbotAPI.getFallbackResponse();
      const botMessage = chatbotAPI.createMessage(MESSAGE_ROLES.BOT, fallback.content);
      setMessages(prev => [...prev, botMessage]);
    }
  });

  // Handlers
  const sendMessage = useCallback((content = inputText) => {
    const trimmedContent = content?.trim();
    if (!trimmedContent || sendMessageMutation.isPending) return;

    const validation = chatbotAPI.validateMessage(trimmedContent);
    if (!validation.success) {
      // Could show error toast here
      return;
    }

    setInputText('');
    sendMessageMutation.mutate(trimmedContent);
  }, [inputText, sendMessageMutation]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleQuickAction = useCallback((action) => {
    sendMessage(action.prompt);
  }, [sendMessage]);

  const clearHistory = useCallback(() => {
    setMessages(autoWelcome ? [chatbotAPI.getWelcomeMessage()] : []);
  }, [autoWelcome]);

  const open = useCallback(() => {
    setIsOpen(true);
    // Focus input after opening
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    // State
    messages,
    inputText,
    isOpen,
    isTyping: sendMessageMutation.isPending,
    isError: sendMessageMutation.isError,
    
    // User info
    user,
    isAuthenticated,
    
    // AI Context (RBAC-secured)
    aiContext: enableAIContext ? {
      isAuthorized: aiContext.isAuthorized,
      segment: aiContext.segment,
      intent: aiContext.intent,
      persona: aiContext.persona,
      communicationStyle: aiContext.getCommunicationStyle?.() || 'friendly_helpful'
    } : null,
    
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
    toggle,
    
    // Config
    quickActions: QUICK_ACTIONS,
    config: CHATBOT_CONFIG
  };
}

/**
 * Lightweight hook for just open/close state
 */
export function useChatbotVisibility() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('open-chatbot', handleOpenChatbot);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  };
}

export default useChatbot;
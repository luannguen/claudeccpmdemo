/**
 * useChatbotEnhanced Hook
 * 
 * Enhanced hook with multi-agent orchestration
 * Integrates security, caching, rate limiting, AI context
 * 
 * Architecture: Hook Layer (AI-CODING-RULES compliant)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useUserFullContext } from '@/components/ai/useUserFullContext';
import { createPageUrl } from '@/utils';

// Services
import chatbotOrchestrator from './services/chatbotOrchestrator';
import cacheManager from './services/cacheManager';
import rateLimiter from './services/rateLimiter';
import { QUICK_ACTIONS } from './chatbotService';

// ========== CONSTANTS ==========

const MESSAGE_ROLES = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system'
};

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: MESSAGE_ROLES.BOT,
  content: `🌱 **Xin chào bác!** 

Cháu là trợ lý mua hàng của Zero Farm, sẵn sàng giúp bác:

🛒 **Mua rau củ, gạo, trái cây**
📦 **Xem đơn hàng**
🚚 **Hỏi giao hàng**
💬 **Tư vấn nông sản**

---
💡 **Mẹo:** Nhấn 🎤 để nói, nhấn 🔊 để nghe trả lời!

**Bác muốn mua gì hôm nay?** 👇`,
  contentType: 'markdown',
  timestamp: new Date().toISOString(),
  voiceText: 'Xin chào bác! Cháu là trợ lý mua hàng của Zero Farm. Bác muốn mua gì hôm nay ạ? Bác có thể nhấn nút microphone để nói, hoặc gõ tin nhắn.',
  suggestedActions: ['🥬 Rau củ', '🍚 Gạo', '🍎 Trái cây', '📦 Đơn hàng']
};

// ========== MAIN HOOK ==========

export function useChatbotEnhanced(options = {}) {
  const {
    autoWelcome = true,
    enableAIContext = true,
    onMessageSent,
    onResponseReceived
  } = options;

  // Auth & AI Context - ENHANCED with full user context
  const { user, isAuthenticated } = useAuth();
  const userContext = useUserFullContext({ enabled: enableAIContext && isAuthenticated });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // State
  const [messages, setMessages] = useState(() => 
    autoWelcome ? [{ ...WELCOME_MESSAGE, id: `welcome_${Date.now()}` }] : []
  );
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  
  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Stats
  const [cacheStats, setCacheStats] = useState(() => cacheManager.getCacheStats());
  const [rateLimitStats, setRateLimitStats] = useState(() => 
    rateLimiter.getRateLimitStats(user?.email)
  );

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for external events
  useEffect(() => {
    const handleOpenChatbot = () => setIsOpen(true);
    const handleNavigate = (e) => {
      const { page } = e.detail || {};
      if (page) {
        navigate(createPageUrl(page));
      }
    };
    
    window.addEventListener('open-chatbot', handleOpenChatbot);
    window.addEventListener('navigate-to', handleNavigate);
    
    return () => {
      window.removeEventListener('open-chatbot', handleOpenChatbot);
      window.removeEventListener('navigate-to', handleNavigate);
    };
  }, [navigate]);

  // Initialize session - FIXED: Don't load old messages to avoid JSON display issues
  useEffect(() => {
    if (isAuthenticated && user?.email && !sessionId) {
      chatbotOrchestrator.getOrCreateSession(user.email)
        .then(result => {
          if (result.success && result.data) {
            setSessionId(result.data.id);
            // NOTE: Not loading old messages to avoid JSON content display issues
            // Session is only used for analytics and rate limiting now
          }
        });
    }
  }, [isAuthenticated, user?.email, sessionId]);

  // Update stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(cacheManager.getCacheStats());
      setRateLimitStats(rateLimiter.getRateLimitStats(user?.email));
    }, 5000);
    return () => clearInterval(interval);
  }, [user?.email]);

  // Create message helper
  const createMessage = useCallback((role, content, extra = {}) => ({
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    contentType: extra.contentType || 'text',
    timestamp: new Date().toISOString(),
    ...extra
  }), []);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      // Add user message to UI immediately
      const userMessage = createMessage(MESSAGE_ROLES.USER, content);
      setMessages(prev => [...prev, userMessage]);
      onMessageSent?.(userMessage);

      // Save to session
      if (sessionId) {
        chatbotOrchestrator.saveMessageToSession(sessionId, userMessage);
      }

      // Process through orchestrator - ENHANCED with full context
      const result = await chatbotOrchestrator.processMessage(content, {
        history: messages.slice(-10),
        userContext: enableAIContext ? {
          // AI Profile
          contextString: userContext.contextSummary,
          segment: userContext.aiProfile?.segment,
          intent: userContext.aiProfile?.intent,
          persona: userContext.aiProfile?.persona,
          // Real-time data
          cart: userContext.cart,
          wishlist: userContext.wishlist,
          orders: userContext.orders,
          community: userContext.community,
          profile: userContext.profile,
          // Flags
          flags: userContext.flags,
          // Security
          isAuthorized: userContext.isAuthenticated,
          securityContext: {
            currentUserEmail: user?.email
          }
        } : null,
        userEmail: user?.email
      });

      return result;
    },
    onSuccess: (result) => {
      if (!result.success) {
        // Show error message
        const errorMessage = createMessage(
          MESSAGE_ROLES.BOT, 
          'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.',
          { contentType: 'text' }
        );
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      const data = result.data;

      // Create bot message
      const botMessage = createMessage(MESSAGE_ROLES.BOT, data.content, {
        contentType: data.contentType || 'markdown',
        intent: data.intent,
        cached: data.cached || data.source === 'cache' || data.source === 'faq',
        tokensUsed: data.tokensUsed || 0,
        suggestedActions: data.suggestedActions,
        processingTime: data.processingTime
      });

      setMessages(prev => [...prev, botMessage]);
      onResponseReceived?.(botMessage);

      // Save to session
      if (sessionId) {
        chatbotOrchestrator.saveMessageToSession(sessionId, botMessage, true);
      }

      // Update stats
      setCacheStats(cacheManager.getCacheStats());
      setRateLimitStats(rateLimiter.getRateLimitStats(user?.email));
    },
    onError: (error) => {
      const errorMessage = createMessage(
        MESSAGE_ROLES.BOT,
        'Xin lỗi, không thể kết nối. Vui lòng thử lại hoặc gọi hotline 098 765 4321.',
        { contentType: 'text' }
      );
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  // Handlers
  const sendMessage = useCallback((content = inputText) => {
    // Ensure content is string before trim
    const contentStr = typeof content === 'string' ? content : String(content || '');
    const trimmedContent = contentStr.trim();
    if (!trimmedContent || sendMessageMutation.isPending) return;

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
    // Handle different action types
    if (action?.type === 'send_prompt' && action?.prompt) {
      // Suggested action from bot response - send as new message
      sendMessage(action.prompt);
      return;
    }
    
    // Standard quick action with prompt
    if (action?.prompt) {
      sendMessage(action.prompt);
    }
  }, [sendMessage]);

  const clearHistory = useCallback(() => {
    setMessages([{ ...WELCOME_MESSAGE, id: `welcome_${Date.now()}` }]);
    cacheManager.clearCache();
    setCacheStats(cacheManager.getCacheStats());
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Add to cart handler - FIXED: Include full product data
  const handleAddToCart = useCallback((product) => {
    window.dispatchEvent(new CustomEvent('add-to-cart', {
      detail: {
        id: product.id,
        name: product.name,
        price: product.sale_price || product.salePrice || product.price,
        unit: product.unit || 'sản phẩm',
        image_url: product.image_url || product.image,
        quantity: 1,
        // Additional data
        category: product.category,
        original_price: product.price
      }
    }));
  }, []);
  
  // Open QuickView modal
  const openProductQuickView = useCallback((product) => {
    window.dispatchEvent(new CustomEvent('quick-view-product', {
      detail: { 
        product: {
          ...product,
          // Normalize fields
          image_url: product.image_url || product.image,
          sale_price: product.sale_price || product.salePrice,
          rating_average: product.rating_average || product.rating || 5,
          stock_quantity: product.stock_quantity ?? 100,
          status: product.inStock === false ? 'out_of_stock' : 'active'
        }
      }
    }));
  }, []);

  // Open Order detail modal
  const openOrderDetail = useCallback((orderId) => {
    window.dispatchEvent(new CustomEvent('open-order-detail', {
      detail: { orderId }
    }));
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
    
    // Full User Context (RBAC-secured)
    userContext: enableAIContext ? {
      isAuthenticated: userContext.isAuthenticated,
      segment: userContext.aiProfile?.segment,
      intent: userContext.aiProfile?.intent,
      persona: userContext.aiProfile?.persona,
      // Real-time flags
      hasCart: userContext.flags?.hasCart,
      hasWishlist: userContext.flags?.hasWishlist,
      hasOrders: userContext.flags?.hasOrders,
      // Quick access
      cartCount: userContext.cart?.count || 0,
      wishlistCount: userContext.wishlist?.count || 0
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
    handleAddToCart,
    openProductQuickView,
    openOrderDetail,
    
    // Config
    quickActions: QUICK_ACTIONS,
    
    // Stats
    cacheStats,
    rateLimitStats,
    sessionId
  };
}

export default useChatbotEnhanced;
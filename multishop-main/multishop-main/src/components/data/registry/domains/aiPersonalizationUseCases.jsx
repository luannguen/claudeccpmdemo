/**
 * AI Personalization Use Cases Registry
 * 
 * Architecture: Log-First, Batch Processing, Token-Optimized AI Context
 * 
 * 10 ENHANCEMENTS:
 * 1. Content-aware logging (post content, comments, searches)
 * 2. Time pattern tracking (hours, days, duration)
 * 3. Session sequence tracking  
 * 4. Behavioral pattern detection
 * 5. Persona classification
 * 6. Intent prediction
 * 7. Price sensitivity analysis
 * 8. Conversion funnel tracking
 * 9. AI-readable context generation (token-optimized)
 * 10. Cart abandonment detection
 */

export const aiPersonalizationUseCases = [
  // ========== ACTIVITY LOGGING ==========
  {
    id: 'ai.activity.log',
    domain: 'aiPersonalization',
    description: 'Log single user activity with rich context',
    input: '{ event_type, target_type, target_id?, target_name?, target_category?, content_excerpt?, value?, duration_seconds?, scroll_depth_percent?, referrer_source?, metadata? }',
    output: 'Result<UserActivity>',
    service: 'aiPersonalizationAPI.logActivity',
    notes: 'Lightweight - no AI processing, just DB write. Includes time/device/sequence context.'
  },
  {
    id: 'ai.activity.bulkLog',
    domain: 'aiPersonalization',
    description: 'Bulk log multiple activities (efficient batching)',
    input: 'Activity[]',
    output: 'Result<{ logged: number }>',
    service: 'aiPersonalizationAPI.bulkLogActivities',
    notes: 'Used by AIPersonalizationEngine for batch DB writes'
  },

  // ========== QUICK TRACKING HELPERS ==========
  {
    id: 'ai.track.productView',
    domain: 'aiPersonalization',
    description: 'Quick log product view with duration',
    input: '{ product, durationSeconds? }',
    service: 'quickLog.productView'
  },
  {
    id: 'ai.track.addToCart',
    domain: 'aiPersonalization',
    description: 'Quick log add to cart',
    input: '{ product, quantity }',
    service: 'quickLog.addToCart'
  },
  {
    id: 'ai.track.cartAbandon',
    domain: 'aiPersonalization',
    description: 'Log cart abandonment with items',
    input: '{ items: CartItem[] }',
    service: 'quickLog.cartAbandon'
  },
  {
    id: 'ai.track.checkoutStart',
    domain: 'aiPersonalization',
    description: 'Log checkout funnel start',
    input: '{ totalValue, itemsCount }',
    service: 'quickLog.checkoutStart'
  },
  {
    id: 'ai.track.purchase',
    domain: 'aiPersonalization',
    description: 'Log completed purchase',
    input: '{ order }',
    service: 'quickLog.purchase'
  },
  {
    id: 'ai.track.postView',
    domain: 'aiPersonalization',
    description: 'Log post view with engagement depth',
    input: '{ post, durationSeconds?, scrollDepth? }',
    service: 'quickLog.postView'
  },
  {
    id: 'ai.track.postCreate',
    domain: 'aiPersonalization',
    description: 'Log post creation with content excerpt',
    input: '{ post }',
    service: 'quickLog.postCreate'
  },
  {
    id: 'ai.track.postComment',
    domain: 'aiPersonalization',
    description: 'Log comment with content',
    input: '{ post, commentText }',
    service: 'quickLog.postComment'
  },
  {
    id: 'ai.track.search',
    domain: 'aiPersonalization',
    description: 'Log search query with filters',
    input: '{ query, resultsCount, selectedFilters? }',
    service: 'quickLog.search'
  },
  {
    id: 'ai.track.filter',
    domain: 'aiPersonalization',
    description: 'Log filter/sort usage',
    input: '{ filterType, filterValue }',
    service: 'quickLog.filterUse'
  },
  {
    id: 'ai.track.scrollDepth',
    domain: 'aiPersonalization',
    description: 'Log scroll depth and time on page',
    input: '{ pageType, pageName, depthPercent, timeSpent }',
    service: 'quickLog.scrollDepth'
  },
  {
    id: 'ai.track.chatbot',
    domain: 'aiPersonalization',
    description: 'Log chatbot interaction with query',
    input: '{ intent, query }',
    service: 'quickLog.chatbotInteraction'
  },

  // ========== PROFILE RETRIEVAL ==========
  {
    id: 'ai.profile.get',
    domain: 'aiPersonalization',
    description: 'Get user AI profile (full data)',
    input: 'email: string',
    output: 'Result<UserProfileAI | null>',
    service: 'aiPersonalizationAPI.getProfile'
  },
  {
    id: 'ai.context.getAIReadable',
    domain: 'aiPersonalization',
    description: 'Get token-optimized context for AI/chatbot use',
    input: 'email: string',
    output: 'Result<AIReadableContext>',
    service: 'aiPersonalizationAPI.getAIReadableContext',
    hook: 'useAIUserContext',
    notes: 'Primary method for AI components to get user context'
  },
  {
    id: 'ai.activity.unprocessedCount',
    domain: 'aiPersonalization',
    description: 'Get count of unprocessed activities for user',
    input: 'email: string',
    output: 'Result<{ count: number }>',
    service: 'aiPersonalizationAPI.getUnprocessedCount'
  },

  // ========== PROCESSING (BACKEND CRON) ==========
  {
    id: 'ai.process.batch',
    domain: 'aiPersonalization',
    description: 'Batch process all users with pending activities (CRON JOB)',
    input: 'none',
    output: 'Result<{ processed: number, failed: number }>',
    backendFunction: 'processUserPersonalization',
    notes: 'Should run every 30-60 mins via CRON'
  },
  {
    id: 'ai.process.singleUser',
    domain: 'aiPersonalization',
    description: 'Process single user activities (manual trigger)',
    input: '{ user_email: string }',
    output: 'Result<{ activitiesProcessed: number }>',
    backendFunction: 'processUserPersonalization',
    service: 'aiPersonalizationAPI.triggerProcessing'
  },
  {
    id: 'ai.cleanup.oldActivities',
    domain: 'aiPersonalization',
    description: 'Cleanup old processed activities (CRON JOB)',
    input: '{ cleanup: true }',
    output: 'Result<{ deleted: number }>',
    backendFunction: 'processUserPersonalization',
    notes: 'Run daily to clean activities older than 7 days'
  }
];

// ========== HOOKS REGISTRY ==========
export const aiPersonalizationHooks = {
  useAIUserContext: {
    description: 'Hook for AI components to access user personalization context',
    returns: '{ context, contextString, segment, intent, buildPromptContext(), isLikelyToConvert(), getCommunicationStyle() }',
    example: `
const { contextString, segment, buildPromptContext } = useAIUserContext();

// For LLM prompt (token-efficient):
const prompt = \`User: \${contextString}\\n\\nQuestion: \${question}\`;

// For logic:
if (segment === 'loyal_buyer') showLoyaltyBenefits();
    `
  },
  useAIContext: {
    description: 'Hook to access AI context within AIContextProvider',
    returns: 'Same as useAIUserContext',
    notes: 'Use inside components wrapped by AIContextProvider'
  }
};

// ========== COMPONENTS REGISTRY ==========
export const aiPersonalizationComponents = {
  AIPersonalizationEngine: {
    description: 'Background component that tracks user activities',
    location: 'components/ai/AIPersonalizationEngine',
    notes: 'Mount once in Layout. No UI - runs silently.'
  },
  AIContextProvider: {
    description: 'RBAC-secured context provider for AI components',
    location: 'components/ai/AIContextProvider',
    usage: '<AIContextProvider><ChatBot /><Recommendations /></AIContextProvider>',
    security: 'Users can only access own data. Admin requires customers.view permission.'
  }
};

// ========== CHATBOT MODULE REGISTRY ==========
export const chatbotUseCases = [
  {
    id: 'chatbot.sendMessage',
    domain: 'chatbot',
    description: 'Send message to chatbot and get AI response',
    input: 'SendMessageDTO { content, history, userContext?, rbacContext? }',
    output: 'Result<ChatResponseDTO>',
    service: 'chatbotAPI.sendMessage',
    hook: 'useChatbot'
  },
  {
    id: 'chatbot.createMessage',
    domain: 'chatbot',
    description: 'Create message object with unique ID',
    input: '{ role, content }',
    output: 'ChatMessageDTO',
    service: 'chatbotAPI.createMessage'
  },
  {
    id: 'chatbot.validateMessage',
    domain: 'chatbot',
    description: 'Validate message before sending',
    input: 'content: string',
    output: 'Result<boolean>',
    service: 'chatbotAPI.validateMessage'
  }
];

export const chatbotHooks = {
  useChatbot: {
    description: 'Main hook for chatbot functionality',
    location: 'components/chatbot/useChatbot',
    returns: '{ messages, inputText, isOpen, isTyping, sendMessage, open, close, ... }',
    options: '{ autoWelcome, enableAIContext, onMessageSent, onResponseReceived }',
    security: 'Integrates with useAIUserContext for RBAC-aware personalization'
  },
  useChatbotVisibility: {
    description: 'Lightweight hook for just open/close state',
    location: 'components/chatbot/useChatbot',
    returns: '{ isOpen, open, close, toggle }'
  }
};

export const chatbotComponents = {
  Chatbot: {
    description: 'Complete chatbot component with trigger and window',
    location: 'components/chatbot/Chatbot',
    props: '{ enableAIContext, hideOnMobile }'
  },
  ChatbotWindow: {
    description: 'Chat window container (for custom layouts)',
    location: 'components/chatbot/ChatbotWindow'
  },
  ChatbotTrigger: {
    description: 'Floating button to open chatbot',
    location: 'components/chatbot/ChatbotTrigger'
  }
};

// ========== EVENT TYPES ==========
export const AIEventTypes = {
  // Custom events to trigger tracking
  SEARCH: 'ai-track-search',
  CATEGORY: 'ai-track-category',
  FILTER: 'ai-track-filter',
  SORT: 'ai-track-sort',
  FOLLOW: 'ai-track-follow',
  POST_LIKE: 'ai-track-post-like',
  POST_COMMENT: 'ai-track-post-comment',
  POST_CREATE: 'ai-track-post-create',
  POST_SAVE: 'ai-track-post-save',
  POST_SHARE: 'ai-track-post-share',
  LOT_VIEW: 'ai-track-lot-view',
  REVIEW: 'ai-track-review',
  CHATBOT: 'ai-track-chatbot',
  COUPON: 'ai-track-coupon',
  WISHLIST_ADD: 'wishlist-add',
  CHECKOUT_START: 'checkout-start'
};

// ========== BACKEND FUNCTIONS REGISTRY ==========
export const chatbotBackendFunctions = {
  cleanupChatSessions: {
    name: 'cleanupChatSessions',
    description: 'Delete expired chat sessions (>3 days)',
    schedule: 'Daily at 2:00 AM',
    notes: 'CRON job để cleanup chat history'
  }
};

// ========== CHATBOT E-COMMERCE USE CASES ==========
export const chatbotEcommerceUseCases = {
  // Product interactions
  'chatbot.product.quickview': {
    id: 'chatbot.product.quickview',
    domain: 'chatbot',
    description: 'Open product quick view modal from chatbot',
    event: 'quick-view-product',
    component: 'ChatbotProductCard'
  },
  'chatbot.product.addToCart': {
    id: 'chatbot.product.addToCart',
    domain: 'chatbot',
    description: 'Add product to cart with full data',
    event: 'add-to-cart',
    component: 'ChatbotProductCard'
  },
  'chatbot.product.wishlist': {
    id: 'chatbot.product.wishlist',
    domain: 'chatbot',
    description: 'Toggle product wishlist from chatbot',
    event: 'wishlist-add',
    component: 'ChatbotProductCard'
  },
  
  // Order interactions
  'chatbot.order.viewDetail': {
    id: 'chatbot.order.viewDetail',
    domain: 'chatbot',
    description: 'Open order detail modal from chatbot',
    event: 'open-order-detail',
    component: 'OrderCardRenderer'
  },
  'chatbot.order.list': {
    id: 'chatbot.order.list',
    domain: 'chatbot',
    description: 'View order list in chatbot',
    service: 'orderAgent.handleOrderQuery',
    hook: 'useChatbotEnhanced'
  },
  
  // Cart interactions
  'chatbot.cart.open': {
    id: 'chatbot.cart.open',
    domain: 'chatbot',
    description: 'Open cart modal from chatbot',
    event: 'open-cart-widget',
    component: 'ChatbotActionButtons'
  },
  
  // Navigation
  'chatbot.nav.products': {
    id: 'chatbot.nav.products',
    domain: 'chatbot',
    description: 'Navigate to products page',
    page: 'Services',
    component: 'ChatbotActionButtons'
  }
};

// ========== USER CONTEXT USE CASES ==========
export const userContextUseCases = {
  'userContext.getCart': {
    id: 'userContext.getCart',
    domain: 'userContext',
    description: 'Get current cart items from localStorage',
    service: 'userContextAPI.getCartItems',
    sync: true
  },
  'userContext.getWishlist': {
    id: 'userContext.getWishlist',
    domain: 'userContext',
    description: 'Get wishlist items from localStorage',
    service: 'userContextAPI.getWishlistItems',
    sync: true
  },
  'userContext.getOrders': {
    id: 'userContext.getOrders',
    domain: 'userContext',
    description: 'Get recent orders for user',
    service: 'userContextAPI.getRecentOrders',
    input: 'userEmail, limit'
  },
  'userContext.getCommunity': {
    id: 'userContext.getCommunity',
    domain: 'userContext',
    description: 'Get community profile (posts, followers)',
    service: 'userContextAPI.getCommunityProfile'
  },
  'userContext.getAIProfile': {
    id: 'userContext.getAIProfile',
    domain: 'userContext',
    description: 'Get AI-generated user profile',
    service: 'userContextAPI.getAIProfile'
  },
  'userContext.getFullContext': {
    id: 'userContext.getFullContext',
    domain: 'userContext',
    description: 'Get complete user context for AI/chatbot',
    service: 'userContextAPI.getFullUserContext',
    hook: 'useUserFullContext'
  }
};

// ========== ACTION AGENT USE CASES ==========
export const actionAgentUseCases = {
  'action.openCart': {
    id: 'action.openCart',
    domain: 'action',
    description: 'Open cart modal and show cart info',
    service: 'actionAgent.executeAction(OPEN_CART)',
    keywords: ['xem giỏ hàng', 'mở giỏ hàng', 'cart']
  },
  'action.openWishlist': {
    id: 'action.openWishlist',
    domain: 'action',
    description: 'Open wishlist modal',
    service: 'actionAgent.executeAction(OPEN_WISHLIST)',
    keywords: ['xem wishlist', 'yêu thích']
  },
  'action.viewOrders': {
    id: 'action.viewOrders',
    domain: 'action',
    description: 'Navigate to orders page with summary',
    service: 'actionAgent.executeAction(VIEW_ORDERS)'
  },
  'action.navigate': {
    id: 'action.navigate',
    domain: 'action',
    description: 'Navigate to any page',
    service: 'actionAgent.executeNavigate(pageName)'
  }
};

// ========== ELDERLY-FRIENDLY CHATBOT USE CASES ==========
export const elderlyFriendlyChatbotUseCases = {
  // Simple Language Agent
  'chatbot.simpleLang.makeFriendly': {
    id: 'chatbot.simpleLang.makeFriendly',
    domain: 'chatbot',
    description: 'Transform response to be elderly-friendly with simple vocabulary',
    service: 'simpleLangAgent.makeFriendly',
    input: '{ content: string, context?: { type: string } }',
    output: 'string'
  },
  'chatbot.simpleLang.toSpeakable': {
    id: 'chatbot.simpleLang.toSpeakable',
    domain: 'chatbot',
    description: 'Convert text to TTS-friendly format (no markdown, emojis)',
    service: 'simpleLangAgent.toSpeakableText',
    input: 'content: string',
    output: 'string'
  },
  
  // Smart Suggestions
  'chatbot.suggestion.seasonal': {
    id: 'chatbot.suggestion.seasonal',
    domain: 'chatbot',
    description: 'Get seasonal product suggestions',
    service: 'smartSuggestionEngine.getSeasonalSuggestions',
    output: 'Result<{ season, emoji, products, message }>'
  },
  'chatbot.suggestion.combo': {
    id: 'chatbot.suggestion.combo',
    domain: 'chatbot',
    description: 'Get combo suggestions based on query',
    service: 'smartSuggestionEngine.getComboSuggestions',
    input: 'userQuery: string'
  },
  'chatbot.suggestion.reorder': {
    id: 'chatbot.suggestion.reorder',
    domain: 'chatbot',
    description: 'Get reorder suggestions based on past orders',
    service: 'smartSuggestionEngine.getReorderSuggestions',
    input: 'userEmail: string'
  },
  
  // In-Chat Checkout
  'chatbot.checkout.start': {
    id: 'chatbot.checkout.start',
    domain: 'chatbot',
    description: 'Start in-chat checkout flow with cart items',
    service: 'checkoutAgent.startCheckout',
    input: '{ userEmail, cartItems }',
    output: 'Result<CheckoutStepResponse>'
  },
  'chatbot.checkout.handleStep': {
    id: 'chatbot.checkout.handleStep',
    domain: 'chatbot',
    description: 'Handle user response in checkout flow',
    service: 'checkoutAgent.handleCheckoutResponse',
    input: '{ userEmail, response }',
    output: 'Result<CheckoutStepResponse>'
  },
  'chatbot.checkout.getState': {
    id: 'chatbot.checkout.getState',
    domain: 'chatbot',
    description: 'Get current checkout state for user',
    service: 'checkoutAgent.getCheckoutState',
    input: 'userEmail: string'
  },
  
  // Voice Support
  'chatbot.voice.input': {
    id: 'chatbot.voice.input',
    domain: 'chatbot',
    description: 'Voice-to-text input using Web Speech API',
    component: 'VoiceInputButton',
    notes: 'Vietnamese (vi-VN) support'
  },
  'chatbot.voice.output': {
    id: 'chatbot.voice.output',
    domain: 'chatbot',
    description: 'Text-to-speech output',
    service: 'speakText(text, lang)',
    notes: 'Auto-speaks bot responses when enabled'
  },

  // ========== AUTO PURCHASE AGENT ==========
  'chatbot.autoPurchase.detect': {
    id: 'chatbot.autoPurchase.detect',
    domain: 'chatbot',
    description: 'Detect purchase intent from user message',
    service: 'autoPurchaseAgent.isPurchaseIntent',
    input: 'query: string',
    output: 'boolean',
    examples: ['mua 1 kg gạo', 'mua lại rau', 'đặt lại đơn trước']
  },
  'chatbot.autoPurchase.handle': {
    id: 'chatbot.autoPurchase.handle',
    domain: 'chatbot',
    description: 'Handle auto purchase query (find product → create order → confirm)',
    service: 'autoPurchaseAgent.handleAutoPurchase',
    input: '{ query, userEmail, userContext }',
    output: 'Result<AutoPurchaseResponse>'
  },
  'chatbot.autoPurchase.getState': {
    id: 'chatbot.autoPurchase.getState',
    domain: 'chatbot',
    description: 'Get current auto purchase state for user',
    service: 'autoPurchaseAgent.getAutoPurchaseState',
    input: 'userEmail: string',
    output: 'AutoPurchaseState | null'
  },
  'chatbot.autoPurchase.clear': {
    id: 'chatbot.autoPurchase.clear',
    domain: 'chatbot',
    description: 'Clear auto purchase state (cancel flow)',
    service: 'autoPurchaseAgent.clearAutoPurchaseState',
    input: 'userEmail: string'
  }
};

// ========== CHATBOT ENHANCED COMPONENTS ==========
export const chatbotEnhancedComponents = {
  VoiceInputButton: {
    description: 'Microphone button for voice input',
    location: 'components/chatbot/ui/VoiceInputButton',
    props: '{ onTranscript, onStart, onEnd, disabled, size }',
    exports: ['speakText', 'stopSpeaking']
  },
  EnhancedQuickActions: {
    description: 'Large, clear action buttons for elderly',
    location: 'components/chatbot/ui/EnhancedQuickActions',
    props: '{ onAction, userContext, variant, maxActions }',
    variants: ['grid', 'row', 'compact']
  },
  ChatbotProductCard: {
    description: 'Product card with image in chatbot',
    location: 'components/chatbot/ui/renderers/ChatbotProductCard',
    features: ['QuickView modal', 'Add to cart', 'Wishlist']
  },
  CheckoutStepRenderer: {
    description: 'Visual checkout progress bar and order preview in chat',
    location: 'components/chatbot/ui/renderers/CheckoutStepRenderer',
    features: ['Progress bar', 'Order preview', 'Success animation'],
    exports: ['CheckoutProgressBar', 'OrderPreviewCard', 'OrderSuccessAnimation']
  }
};

// ========== AUTO PURCHASE STEPS ==========
export const AUTO_PURCHASE_STEPS = {
  IDLE: 'idle',
  FINDING_PRODUCT: 'finding_product',
  PENDING_CONFIRM: 'pending_confirm',
  COLLECTING_INFO: 'collecting_info',
  CONFIRMED: 'confirmed'
};

export default aiPersonalizationUseCases;
/**
 * Chatbot Module - Enhanced for Elderly & Farmers
 * 
 * FEATURES:
 * - Multi-agent architecture (product, order, action, checkout)
 * - Voice input/output (Web Speech API)
 * - Simple, friendly language
 * - In-chat checkout flow
 * - Smart contextual suggestions
 * - RBAC security
 * - Caching & rate limiting
 * 
 * ARCHITECTURE:
 * - Service Layer: agents, orchestrator, cache
 * - Hook Layer: useChatbotEnhanced
 * - UI Layer: components
 */

// ========== MAIN COMPONENTS ==========
export { default as Chatbot } from './Chatbot';
export { default as ChatbotEnhanced } from './ChatbotEnhanced';

// ========== UI COMPONENTS ==========
export { default as ChatbotWindow } from './ChatbotWindow';
export { default as ChatbotTrigger } from './ChatbotTrigger';
export { default as ChatbotHeader } from './ChatbotHeader';
export { default as ChatbotMessage } from './ChatbotMessage';
export { default as ChatbotInput } from './ChatbotInput';
export { default as ChatbotQuickActions } from './ChatbotQuickActions';
export { default as ChatbotTypingIndicator } from './ChatbotTypingIndicator';

// ========== ENHANCED UI ==========
export { default as ChatbotModal } from './ui/ChatbotModal';
export { default as ChatbotMessageEnhanced } from './ui/ChatbotMessageEnhanced';
export { default as VoiceInputButton, speakText, stopSpeaking } from './ui/VoiceInputButton';
export { default as EnhancedQuickActions, InlineActions, CategoryQuickButtons } from './ui/EnhancedQuickActions';
export { default as VoiceChatMode } from './ui/VoiceChatMode';

// ========== RENDERERS ==========
export * from './ui/renderers';

// ========== HOOKS ==========
export { default as useChatbotEnhanced } from './useChatbotEnhanced';
export { useChatbot, useChatbotVisibility } from './useChatbot';

// ========== SERVICES ==========
// Core orchestration
export { default as chatbotOrchestrator } from './services/chatbotOrchestrator';
export { default as securityGuard } from './services/securityGuard';
export { default as cacheManager } from './services/cacheManager';
export { default as rateLimiter } from './services/rateLimiter';
export { default as routerAgent } from './services/routerAgent';

// Specialized agents
export { default as productAgent } from './services/productAgent';
export { default as orderAgent } from './services/orderAgent';
export { default as agricultureAgent } from './services/agricultureAgent';
export { default as actionAgent } from './services/actionAgent';

// NEW: Elderly-friendly agents
export { default as simpleLangAgent } from './services/simpleLangAgent';
export { default as smartSuggestionEngine } from './services/smartSuggestionEngine';
export { default as checkoutAgent, CHECKOUT_STEPS } from './services/checkoutAgent';
export { default as autoPurchaseAgent, AUTO_PURCHASE_STEPS } from './services/autoPurchaseAgent';

// Enhanced services
export { default as semanticCache } from './services/semanticCache';
export { default as contextCompressor } from './services/contextCompressor';
export { default as userPreferenceLearner } from './services/userPreferenceLearner';
export { default as piiDetector } from './services/piiDetector';
export { default as sharedCachePool } from './services/sharedCachePool';

// ========== LEGACY EXPORTS ==========
export { chatbotAPI, MESSAGE_ROLES, QUICK_ACTIONS } from './chatbotService';
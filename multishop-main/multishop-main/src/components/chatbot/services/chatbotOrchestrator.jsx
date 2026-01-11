/**
 * Chatbot Orchestrator
 * 
 * Main service that coordinates all agents
 * Handles full message flow with security, caching, rate limiting
 * Architecture: Service Layer
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// Import agents & services
import securityGuard from './securityGuard';
import cacheManager from './cacheManager';
import rateLimiter from './rateLimiter';
import routerAgent from './routerAgent';
import productAgent from './productAgent';
import orderAgent from './orderAgent';
import agricultureAgent from './agricultureAgent';
import actionAgent from './actionAgent';

// User Context Service
import userContextAPI from '@/components/services/userContextService';

// NEW ENHANCEMENTS
import semanticCache from './semanticCache';
import contextCompressor from './contextCompressor';
import userPreferenceLearner from './userPreferenceLearner';
import piiDetector from './piiDetector';
import sharedCachePool from './sharedCachePool';

// NEW: Elderly-friendly agents
import simpleLang from './simpleLangAgent';
import smartSuggestion from './smartSuggestionEngine';
import checkoutAgent from './checkoutAgent';
import autoPurchaseAgent from './autoPurchaseAgent';

// ========== CONFIG ==========

const ORCHESTRATOR_CONFIG = {
  maxHistoryMessages: 10,
  sessionTtlDays: 3,
  // NEW: Performance tuning
  useSemanticCache: true,
  useContextCompression: true,
  usePreferenceLearning: true,
  usePIIDetection: true,
  useSharedCache: true
};

// ========== MAIN ORCHESTRATOR ==========

/**
 * Process user message through full pipeline
 * 
 * Pipeline:
 * 1. Rate limit check
 * 2. Security validation
 * 3. FAQ cache check
 * 4. Response cache check
 * 5. Intent routing
 * 6. Specialized agent handling
 * 7. Cache response
 * 8. Return formatted response
 */
export async function processMessage(message, options = {}) {
  const {
    history = [],
    userContext = {},
    userEmail = null
  } = options;

  const startTime = Date.now();
  let tokensUsed = 0;

  // Step 1: Rate limit check
  const rateLimitResult = rateLimiter.checkRateLimit(userEmail);
  if (rateLimitResult.success && !rateLimitResult.data.allowed) {
    return success({
      content: rateLimitResult.data.message,
      contentType: 'text',
      intent: 'rate_limited',
      blocked: true
    });
  }

  // Step 2: Security validation
  const securityResult = securityGuard.validateQuery(message, userContext);
  if (!securityResult.success) {
    return securityResult;
  }
  if (securityResult.data && !securityResult.data.allowed) {
    return success({
      content: securityResult.data.message,
      contentType: 'text',
      intent: 'security_blocked',
      blocked: true,
      reason: securityResult.data.reason
    });
  }

  // Step 2.5: PII Detection & Sanitization
  if (ORCHESTRATOR_CONFIG.usePIIDetection) {
    const piiReport = piiDetector.generatePIIReport(message);
    if (piiReport.risk === 'high') {
      // Mask PII before processing
      const { masked } = piiDetector.maskPII(message);
      message = masked;
    }
  }

  // Step 3: Check SHARED cache first (all users benefit)
  if (ORCHESTRATOR_CONFIG.useSharedCache) {
    const sharedResult = sharedCachePool.checkSharedCache(message);
    if (sharedResult.hit) {
      rateLimiter.recordMessage(userEmail);
      // Learn from this interaction
      if (ORCHESTRATOR_CONFIG.usePreferenceLearning && userEmail) {
        userPreferenceLearner.learnFromMessage(userEmail, message, sharedResult.response);
      }
      return success({
        ...sharedResult.response,
        processingTime: Date.now() - startTime,
        tokensUsed: 0,
        cacheLevel: 'shared'
      });
    }
  }

  // Step 3.5: Check FAQ cache (no LLM)
  const faqResult = cacheManager.checkFAQ(message);
  if (faqResult.hit) {
    rateLimiter.recordMessage(userEmail);
    return success({
      ...faqResult.response,
      processingTime: Date.now() - startTime,
      tokensUsed: 0,
      cacheLevel: 'faq'
    });
  }

  // Step 4: Check SEMANTIC cache (similar queries)
  if (ORCHESTRATOR_CONFIG.useSemanticCache) {
    const semanticResult = semanticCache.findSimilar(message);
    if (semanticResult.hit) {
      rateLimiter.recordMessage(userEmail);
      return success({
        ...semanticResult.response,
        processingTime: Date.now() - startTime,
        tokensUsed: 0,
        similarity: semanticResult.similarity,
        cacheLevel: 'semantic'
      });
    }
  }

  // Step 4.5: Check exact response cache
  const cacheResult = cacheManager.getFromCache(message);
  if (cacheResult.hit) {
    rateLimiter.recordMessage(userEmail);
    return success({
      ...cacheResult.response,
      processingTime: Date.now() - startTime,
      tokensUsed: 0,
      cacheLevel: 'exact'
    });
  }

  // Step 5: Check for AUTO PURCHASE intent FIRST (voice-first, highest priority)
  // "mua 1 kg gạo", "mua lại rau", "đặt lại đơn trước"
  if (autoPurchaseAgent.isPurchaseIntent(message) || autoPurchaseAgent.isInAutoPurchaseFlow(userEmail)) {
    let purchaseResult;
    
    // Check if in existing flow and responding
    if (autoPurchaseAgent.isInAutoPurchaseFlow(userEmail)) {
      purchaseResult = await autoPurchaseAgent.handleAutoPurchase(message, {
        userEmail,
        userContext
      });
    } else {
      // Start new auto purchase
      purchaseResult = await autoPurchaseAgent.handleAutoPurchase(message, {
        userEmail,
        userContext
      });
    }
    
    if (purchaseResult.success) {
      rateLimiter.recordMessage(userEmail);
      const response = purchaseResult.data;
      response.voiceText = response.voiceText || simpleLang.toSpeakableText(response.content);
      return success({
        ...response,
        intent: 'auto_purchase',
        processingTime: Date.now() - startTime,
        tokensUsed: 0
      });
    }
  }

  // Step 5.1: Check for CHECKOUT intent (manual checkout flow)
  if (checkoutAgent.isCheckoutIntent(message)) {
    // Check if already in checkout flow
    const checkoutState = checkoutAgent.getCheckoutState(userEmail);
    
    let checkoutResult;
    if (checkoutState) {
      // Continue checkout flow
      checkoutResult = await checkoutAgent.handleCheckoutResponse(userEmail, message);
    } else {
      // Start new checkout
      const cartItems = userContextAPI.getCartItems()?.items || [];
      checkoutResult = await checkoutAgent.startCheckout(userEmail, cartItems);
    }
    
    if (checkoutResult.success) {
      rateLimiter.recordMessage(userEmail);
      // Add voice text for TTS
      const response = checkoutResult.data;
      response.voiceText = response.voiceText || simpleLang.toSpeakableText(response.content);
      return success({
        ...response,
        processingTime: Date.now() - startTime,
        tokensUsed: 0
      });
    }
  }

  // Step 5.5: Check for ACTION intent (xem giỏ hàng, mở wishlist, etc.)
  if (actionAgent.isActionIntent(message)) {
    const actionResult = await actionAgent.handleActionQuery(message, {
      userEmail,
      userContext
    });
    
    if (actionResult.success) {
      rateLimiter.recordMessage(userEmail);
      // Make response friendly
      const response = actionResult.data;
      if (response.content) {
        response.content = simpleLang.makeFriendly(response.content, { type: 'action' });
        response.voiceText = simpleLang.toSpeakableText(response.content);
      }
      return success({
        ...response,
        processingTime: Date.now() - startTime,
        tokensUsed: 0
      });
    }
  }

  // Step 5.5: Route to appropriate agent
  const routeResult = await routerAgent.routeQuery(message);
  if (!routeResult.success) {
    return routeResult;
  }

  const { intent, confidence, method } = routeResult.data;
  if (method === 'llm') {
    tokensUsed += 50; // Router LLM cost
  }

  // Step 6: Handle by specialized agent
  let agentResponse;

  switch (intent) {
    // ACTION intent (fallback if not caught above)
    case routerAgent.INTENTS.ACTION:
      agentResponse = await actionAgent.handleActionQuery(message, { userEmail, userContext });
      break;

    // USER CONTEXT queries (about user's own data)
    case routerAgent.INTENTS.USER_CONTEXT:
      agentResponse = await handleUserContextQuery(message, userEmail, userContext);
      break;

    case routerAgent.INTENTS.PRODUCT_QUERY:
      agentResponse = await productAgent.handleProductQuery(message, userContext);
      break;

    case routerAgent.INTENTS.ORDER_STATUS:
      agentResponse = await orderAgent.handleOrderQuery(message, userContext);
      break;

    case routerAgent.INTENTS.AGRICULTURE:
      agentResponse = await agricultureAgent.handleAgricultureQuery(message, userContext);
      break;

    case routerAgent.INTENTS.GREETING:
      agentResponse = await handleGreeting(userEmail, userContext);
      break;

    case routerAgent.INTENTS.DELIVERY_INFO:
    case routerAgent.INTENTS.PAYMENT_INFO:
    case routerAgent.INTENTS.SUPPORT:
    case routerAgent.INTENTS.PREORDER:
      // These are handled by FAQ or fallback to general LLM
      agentResponse = await handleGeneralQuery(message, intent, history, userContext);
      break;

    default:
      agentResponse = await handleGeneralQuery(message, intent, history, userContext);
  }

  if (!agentResponse.success) {
    return agentResponse;
  }

  tokensUsed += agentResponse.data.tokensUsed || 0;

  // Step 7: Multi-layer caching
  if (tokensUsed > 0) {
    // Exact cache
    cacheManager.saveToCache(message, agentResponse.data);
    
    // Semantic cache
    if (ORCHESTRATOR_CONFIG.useSemanticCache) {
      semanticCache.addToCache(message, agentResponse.data);
    }
    
    // Shared cache (for generic responses)
    if (ORCHESTRATOR_CONFIG.useSharedCache) {
      sharedCachePool.addToSharedCache(message, agentResponse.data);
    }
  }

  // Step 7.5: Learn from interaction
  if (ORCHESTRATOR_CONFIG.usePreferenceLearning && userEmail) {
    userPreferenceLearner.learnFromMessage(userEmail, message, {
      intent,
      tokensUsed
    });
  }

  // Record message for rate limiting
  rateLimiter.recordMessage(userEmail);

  // Step 8: Return formatted response
  return success({
    ...agentResponse.data,
    intent,
    confidence,
    routeMethod: method,
    processingTime: Date.now() - startTime,
    tokensUsed
  });
}

// ========== HELPER FUNCTIONS ==========

/**
 * Handle greeting with full user context - ENHANCED for elderly
 */
async function handleGreeting(userEmail, userContext) {
  // Use smart greeting from suggestion engine
  const smartGreeting = smartSuggestion.getSmartGreeting({
    hasCart: userContext?.flags?.hasCart,
    cartCount: userContext?.cart?.count || 0,
    hasOrders: userContext?.flags?.hasOrders,
    lastOrderDays: userContext?.orders?.days_since_last
  });
  
  // Make it even friendlier
  const friendlyContent = simpleLang.makeFriendly(smartGreeting.content, { type: 'greeting' });
  
  // Generate voice text
  const voiceText = 'Xin chào bác! Cháu là trợ lý mua hàng của Zero Farm. Bác muốn tìm rau củ, gạo, hay trái cây hôm nay ạ?';
  
  return success({
    content: friendlyContent,
    contentType: 'markdown',
    intent: 'greeting',
    tokensUsed: 0,
    suggestedActions: smartGreeting.suggestedActions,
    voiceText
  });
}

/**
 * Handle questions about user's own context
 */
async function handleUserContextQuery(query, userEmail, userContext) {
  // Get full context
  const contextResult = await userContextAPI.getFullUserContext(userEmail);
  
  if (!contextResult.success) {
    return success({
      content: 'Xin lỗi, tôi không thể lấy thông tin của bạn lúc này.',
      contentType: 'text',
      tokensUsed: 0
    });
  }
  
  const ctx = contextResult.data;
  const parts = [];
  
  // Cart info
  if (query.match(/giỏ|cart/i)) {
    if (ctx.cart.isEmpty) {
      parts.push('🛒 **Giỏ hàng trống**\nBạn chưa có sản phẩm nào trong giỏ.');
    } else {
      const items = ctx.cart.items.slice(0, 3).map(i => `• ${i.name}`).join('\n');
      parts.push(`🛒 **Giỏ hàng của bạn** (${ctx.cart.count} sản phẩm)\n${items}\n**Tổng: ${formatPrice(ctx.cart.total)}**`);
    }
  }
  
  // Wishlist info
  if (query.match(/yêu thích|wishlist|favorite/i)) {
    if (ctx.wishlist.isEmpty) {
      parts.push('❤️ **Chưa có sản phẩm yêu thích**');
    } else {
      const items = ctx.wishlist.items.slice(0, 3).map(i => `• ${i.name}`).join('\n');
      parts.push(`❤️ **Sản phẩm yêu thích** (${ctx.wishlist.count})\n${items}`);
    }
  }
  
  // Orders info
  if (query.match(/đơn|order/i)) {
    if (ctx.orders.total_count === 0) {
      parts.push('📦 **Chưa có đơn hàng**');
    } else {
      parts.push(`📦 **${ctx.orders.total_count} đơn hàng**`);
      if (ctx.orders.pending > 0) parts.push(`⏳ ${ctx.orders.pending} chờ xác nhận`);
      if (ctx.orders.shipping > 0) parts.push(`🚚 ${ctx.orders.shipping} đang giao`);
    }
  }
  
  // Profile/account info
  if (query.match(/profile|tài khoản|thông tin/i)) {
    if (ctx.profile?.user) {
      parts.push(`👤 **${ctx.profile.user.full_name}**`);
    }
    if (ctx.profile?.customer) {
      parts.push(`💰 Tổng chi tiêu: ${formatPrice(ctx.profile.customer.total_spent)}`);
    }
    if (ctx.profile?.referral) {
      parts.push(`🌱 Cấp bậc: ${ctx.profile.referral.rank}`);
    }
  }
  
  // If no specific match, show summary
  if (parts.length === 0) {
    parts.push(`📊 **Tổng quan tài khoản**`);
    parts.push(`🛒 Giỏ hàng: ${ctx.cart.isEmpty ? 'Trống' : `${ctx.cart.count} sản phẩm`}`);
    parts.push(`❤️ Yêu thích: ${ctx.wishlist.count} sản phẩm`);
    parts.push(`📦 Đơn hàng: ${ctx.orders.total_count}`);
    if (ctx.community?.is_active) {
      parts.push(`💬 Cộng đồng: ${ctx.community.posts_count} bài viết`);
    }
  }
  
  return success({
    content: parts.join('\n\n'),
    contentType: 'markdown',
    intent: 'user_context',
    tokensUsed: 0,
    userContext: ctx.summary
  });
}

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

/**
 * Handle general queries using LLM
 * ENHANCED: Context compression + Personalization
 */
async function handleGeneralQuery(query, intent, history, userContext) {
  try {
    const contextParts = [];
    
    // ENHANCEMENT: Compress history to save tokens
    let compressedHistory = history;
    let compressionStats = null;
    
    if (ORCHESTRATOR_CONFIG.useContextCompression && history.length > 4) {
      const compression = contextCompressor.buildOptimizedContext(history, userContext);
      contextParts.push(compression.context);
      compressionStats = compression.stats;
    } else {
      // Add user context (truncated)
      if (userContext?.contextString) {
        const truncated = userContext.contextString.length > 150
          ? userContext.contextString.substring(0, 150) + '...'
          : userContext.contextString;
        contextParts.push(`[User: ${truncated}]`);
      }
      
      // Add recent history (last 4 only)
      if (history.length > 0) {
        const recentHistory = history.slice(-4);
        const historyText = recentHistory
          .map(m => `${m.role === 'user' ? 'U' : 'B'}: ${
            (typeof m.content === 'string' ? m.content : '').substring(0, 100)
          }`)
          .join('\n');
        contextParts.push(`[Chat:\n${historyText}]`);
      }
    }
    
    // Add security prompt (minimal)
    contextParts.push(securityGuard.buildSecurityPrompt(userContext));
    
    // ENHANCEMENT: Add personalized prompt modifier
    let personalModifier = '';
    if (ORCHESTRATOR_CONFIG.usePreferenceLearning && userContext?.userEmail) {
      personalModifier = userPreferenceLearner.buildPersonalizedPrompt(userContext.userEmail);
    }

    // Build COMPACT system prompt (save tokens)
    const systemPrompt = `Trợ lý Zero Farm - nông sản hữu cơ.
${contextParts.join('\n')}
${personalModifier ? `\n[Style: ${personalModifier}]` : ''}

RULES: Ngắn gọn, thân thiện, emoji OK, gợi ý action.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nQ: ${query}`,
      response_json_schema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          suggestedActions: { type: 'array', items: { type: 'string' } }
        },
        required: ['content']
      }
    });

    // Estimate tokens saved
    const baseTokens = 150;
    const savedTokens = compressionStats?.savings 
      ? Math.round(baseTokens * compressionStats.savings / 100) 
      : 0;

    return success({
      content: response.content,
      contentType: 'markdown',
      suggestedActions: response.suggestedActions || [],
      tokensUsed: baseTokens - savedTokens,
      compressionStats
    });

  } catch (error) {
    console.error('General query error:', error);
    return success({
      content: 'Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi. Vui lòng thử lại hoặc liên hệ hotline 098 765 4321.',
      contentType: 'text',
      tokensUsed: 0
    });
  }
}

// ========== SESSION MANAGEMENT ==========

/**
 * Get or create chat session
 */
export async function getOrCreateSession(userEmail) {
  if (!userEmail) {
    return success(null); // Anonymous session
  }

  try {
    const sessions = await base44.entities.ChatSession.filter({
      user_email: userEmail,
      is_active: true
    });

    if (sessions.length > 0) {
      // Check expiry
      const session = sessions[0];
      if (new Date(session.expires_at) > new Date()) {
        return success(session);
      }
      // Expired, deactivate
      await base44.entities.ChatSession.update(session.id, { is_active: false });
    }

    // Create new session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ORCHESTRATOR_CONFIG.sessionTtlDays);

    const newSession = await base44.entities.ChatSession.create({
      user_email: userEmail,
      messages: [],
      total_messages: 0,
      total_tokens_used: 0,
      intents_detected: [],
      last_activity: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      is_active: true
    });

    return success(newSession);
  } catch (error) {
    console.error('Session error:', error);
    return success(null);
  }
}

/**
 * Save message to session
 * FIX: Ensure content is ALWAYS a string for ChatSession entity
 */
export async function saveMessageToSession(sessionId, message, isBot = false) {
  if (!sessionId) return;

  try {
    const sessions = await base44.entities.ChatSession.filter({ id: sessionId });
    if (sessions.length === 0) return;

    const session = sessions[0];
    const messages = session.messages || [];
    
    // FIX: ALWAYS serialize content to string
    let contentString = message.content;
    if (typeof contentString === 'object' && contentString !== null) {
      try {
        contentString = JSON.stringify(contentString);
      } catch (e) {
        contentString = String(contentString);
      }
    } else if (contentString === null || contentString === undefined) {
      contentString = '';
    } else {
      contentString = String(contentString);
    }
    
    const serializedMessage = {
      id: message.id || Date.now().toString(),
      role: message.role || (isBot ? 'bot' : 'user'),
      content: contentString,
      content_type: message.contentType || message.content_type || 'text',
      timestamp: message.timestamp || new Date().toISOString(),
      intent: message.intent || null,
      tokens_used: message.tokensUsed || message.tokens_used || 0,
      cached: message.cached || false
    };
    
    // Add message
    messages.push(serializedMessage);
    
    // Keep only last 50 messages
    const trimmedMessages = messages.slice(-50);

    // Update intents
    const intents = session.intents_detected || [];
    if (serializedMessage.intent && !intents.includes(serializedMessage.intent)) {
      intents.push(serializedMessage.intent);
    }

    await base44.entities.ChatSession.update(sessionId, {
      messages: trimmedMessages,
      total_messages: (session.total_messages || 0) + 1,
      total_tokens_used: (session.total_tokens_used || 0) + (serializedMessage.tokens_used || 0),
      intents_detected: intents.slice(-20),
      last_activity: new Date().toISOString()
    });
  } catch (error) {
    console.error('Save message error:', error);
  }
}

// ========== ENHANCED EXPORTS ==========

/**
 * Get all cache statistics
 */
export function getAllCacheStats() {
  return {
    exact: cacheManager.getCacheStats(),
    semantic: ORCHESTRATOR_CONFIG.useSemanticCache ? semanticCache.getSemanticCacheStats() : null,
    shared: ORCHESTRATOR_CONFIG.useSharedCache ? sharedCachePool.getSharedCacheStats() : null,
    rateLimit: rateLimiter.getRateLimitStats()
  };
}

/**
 * Clear all caches
 */
export function clearAllCaches() {
  cacheManager.clearCache();
  if (ORCHESTRATOR_CONFIG.useSemanticCache) semanticCache.clearSemanticCache();
  if (ORCHESTRATOR_CONFIG.useSharedCache) sharedCachePool.clearSharedCache();
  return success(true);
}

/**
 * Get user preference profile
 */
export function getUserPreferences(userEmail) {
  if (!ORCHESTRATOR_CONFIG.usePreferenceLearning) return null;
  return userPreferenceLearner.getPreferenceProfile(userEmail);
}

export default {
  processMessage,
  getOrCreateSession,
  saveMessageToSession,
  getAllCacheStats,
  clearAllCaches,
  getUserPreferences,
  ORCHESTRATOR_CONFIG
};
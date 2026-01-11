/**
 * ChatBot Service Layer
 * 
 * Handles all API calls and business logic for chatbot
 * Architecture: Data/Service Layer (AI-CODING-RULES compliant)
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== CONSTANTS ==========

export const CHATBOT_CONFIG = {
  MAX_HISTORY_MESSAGES: 20,
  TYPING_DELAY_MS: 800,
  MAX_MESSAGE_LENGTH: 2000,
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
};

export const MESSAGE_ROLES = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system'
};

export const QUICK_ACTIONS = [
  { id: 'order', label: '🛒 Đặt Hàng', prompt: 'Xem tất cả sản phẩm để đặt hàng' },
  { id: 'price', label: '💰 Bảng Giá', prompt: 'Cho tôi xem sản phẩm nổi bật với giá' },
  { id: 'address', label: '📍 Địa Chỉ', prompt: 'Địa chỉ Zero Farm ở đâu? Số điện thoại liên hệ?' },
  { id: 'delivery', label: '🚚 Giao Hàng', prompt: 'Thông tin về phí ship và cách giao hàng của Zero Farm' }
];

export const WELCOME_MESSAGE = {
  id: 'welcome',
  role: MESSAGE_ROLES.BOT,
  content: `Xin chào! Tôi là trợ lý ảo của Zero Farm 🌱

Tôi có thể giúp bạn:
🌿 Tư vấn chọn sản phẩm organic phù hợp
🛒 Hướng dẫn đặt hàng
📦 Kiểm tra đơn hàng
🚚 Thông tin giao hàng
💰 Báo giá sản phẩm
🏡 Giới thiệu về trang trại

Bạn cần tôi hỗ trợ gì hôm nay?`,
  timestamp: new Date().toISOString()
};

// ========== DTO TYPES ==========

/**
 * @typedef {Object} ChatMessageDTO
 * @property {string} id - Unique message ID
 * @property {string} role - 'user' | 'bot' | 'system'
 * @property {string} content - Message content
 * @property {string} timestamp - ISO timestamp
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * @typedef {Object} SendMessageDTO
 * @property {string} content - User message content
 * @property {ChatMessageDTO[]} history - Previous messages for context
 * @property {Object} [userContext] - AI personalization context
 * @property {Object} [rbacContext] - RBAC permissions context
 */

/**
 * @typedef {Object} ChatResponseDTO
 * @property {string} content - Bot response content
 * @property {string[]} [suggestedActions] - Suggested follow-up actions
 * @property {Object} [metadata] - Response metadata
 */

// ========== SERVICE METHODS ==========

export const chatbotAPI = {
  /**
   * Send message to chatbot and get response
   * @param {SendMessageDTO} data
   * @returns {Promise<Result<ChatResponseDTO>>}
   */
  sendMessage: async (data) => {
    // Validation
    if (!data.content?.trim()) {
      return failure('Tin nhắn không được trống', ErrorCodes.VALIDATION_ERROR);
    }
    
    if (data.content.length > CHATBOT_CONFIG.MAX_MESSAGE_LENGTH) {
      return failure('Tin nhắn quá dài', ErrorCodes.VALIDATION_ERROR);
    }

    try {
      // Build context-aware prompt
      const systemPrompt = buildSystemPrompt(data.userContext, data.rbacContext);
      const historyContext = formatHistoryForLLM(data.history);
      
      const fullPrompt = `${systemPrompt}

${historyContext}

User: ${data.content}

Hãy trả lời ngắn gọn, thân thiện, tập trung vào nhu cầu của người dùng.`;

      // Call LLM
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: fullPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'Nội dung phản hồi' },
            suggestedActions: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Các hành động gợi ý tiếp theo'
            },
            intent: { type: 'string', description: 'Intent phát hiện được' }
          },
          required: ['content']
        }
      });

      // Track chatbot interaction for AI personalization
      trackChatbotInteraction(response.intent || 'general', data.content);

      return success({
        content: response.content,
        suggestedActions: response.suggestedActions || [],
        metadata: { intent: response.intent }
      });

    } catch (error) {
      console.error('Chatbot API error:', error);
      return failure('Không thể kết nối với trợ lý ảo', ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Get fallback response when LLM fails
   * @returns {ChatResponseDTO}
   */
  getFallbackResponse: () => {
    const fallbacks = [
      'Cảm ơn bạn đã liên hệ! Sản phẩm organic 100%, không hóa chất. Bạn muốn xem danh mục không?',
      'Rau củ thu hoạch buổi sáng, giao trong ngày. Đặt trước 9h để nhận cùng ngày! 🚚',
      'Chúng tôi có nhiều combo tiết kiệm cho gia đình. Bạn quan tâm loại nào?',
      'Giá từ 25k - 180k. Freeship từ 200k. Hotline: 098 765 4321'
    ];
    
    return {
      content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      suggestedActions: ['Xem sản phẩm', 'Đặt hàng', 'Liên hệ hotline']
    };
  },

  /**
   * Create a new message object
   * @param {string} role
   * @param {string} content
   * @returns {ChatMessageDTO}
   */
  createMessage: (role, content) => ({
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date().toISOString()
  }),

  /**
   * Get welcome message
   * @returns {ChatMessageDTO}
   */
  getWelcomeMessage: () => ({
    ...WELCOME_MESSAGE,
    id: `welcome_${Date.now()}`,
    timestamp: new Date().toISOString()
  }),

  /**
   * Validate message before sending
   * @param {string} content
   * @returns {Result<boolean>}
   */
  validateMessage: (content) => {
    if (!content?.trim()) {
      return failure('Tin nhắn không được trống', ErrorCodes.VALIDATION_ERROR);
    }
    if (content.length > CHATBOT_CONFIG.MAX_MESSAGE_LENGTH) {
      return failure(`Tin nhắn tối đa ${CHATBOT_CONFIG.MAX_MESSAGE_LENGTH} ký tự`, ErrorCodes.VALIDATION_ERROR);
    }
    return success(true);
  }
};

// ========== HELPER FUNCTIONS ==========

/**
 * Build system prompt with user context and RBAC
 */
function buildSystemPrompt(userContext, rbacContext) {
  let prompt = `Bạn là trợ lý ảo của Zero Farm - trang trại rau củ organic.
Nhiệm vụ: Tư vấn sản phẩm, hỗ trợ đặt hàng, trả lời thắc mắc.
Giọng điệu: Thân thiện, chuyên nghiệp, ngắn gọn.
Ngôn ngữ: Tiếng Việt.`;

  // Add user personalization context
  if (userContext?.contextString && userContext.contextString !== 'ACCESS_DENIED') {
    prompt += `\n\nThông tin người dùng: ${userContext.contextString}`;
    
    if (userContext.segment) {
      prompt += `\nPhân khúc: ${userContext.segment}`;
    }
    if (userContext.intent) {
      prompt += `\nDự đoán ý định: ${userContext.intent}`;
    }
    if (userContext.recommendations?.length > 0) {
      prompt += `\nGợi ý hành động: ${userContext.recommendations.slice(0, 3).join(', ')}`;
    }
  }

  // Add RBAC context
  if (rbacContext?.buildSystemPromptRBAC) {
    prompt += `\n\n${rbacContext.buildSystemPromptRBAC()}`;
  }

  prompt += `\n\nQuy tắc:
- Chỉ trả lời trong phạm vi được phép
- Không tiết lộ thông tin nhạy cảm
- Gợi ý sản phẩm phù hợp với người dùng
- Nếu không chắc, hướng dẫn liên hệ hotline`;

  return prompt;
}

/**
 * Format message history for LLM context
 */
function formatHistoryForLLM(history = []) {
  if (!history.length) return '';

  const recentHistory = history.slice(-CHATBOT_CONFIG.MAX_HISTORY_MESSAGES);
  
  return recentHistory
    .map(msg => `${msg.role === MESSAGE_ROLES.USER ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');
}

/**
 * Track chatbot interaction for AI personalization
 */
function trackChatbotInteraction(intent, query) {
  try {
    window.dispatchEvent(new CustomEvent('ai-track-chatbot', {
      detail: { intent, query }
    }));
  } catch (e) {
    // Silent fail for tracking
  }
}

export default chatbotAPI;
/**
 * Router Agent
 * 
 * Lightweight intent classification (~50 tokens)
 * Routes to specialized agents
 * Architecture: Service Layer
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== INTENT DEFINITIONS ==========

export const INTENTS = {
  PRODUCT_QUERY: 'product_query',      // Questions about products
  ORDER_STATUS: 'order_status',        // Check order status
  DELIVERY_INFO: 'delivery_info',      // Shipping, delivery
  PAYMENT_INFO: 'payment_info',        // Payment methods
  SUPPORT: 'support',                  // General support
  AGRICULTURE: 'agriculture',          // Farming, organic tips
  COMMUNITY: 'community',              // Posts, reviews
  PREORDER: 'preorder',                // Pre-order lots
  GREETING: 'greeting',                // Hello, thanks
  ACTION: 'action',                    // User wants to DO something (open cart, etc)
  USER_CONTEXT: 'user_context',        // Questions about user's own data
  UNKNOWN: 'unknown'                   // Can't classify
};

// ========== KEYWORD-BASED CLASSIFICATION (No LLM) ==========

const INTENT_KEYWORDS = {
  // ACTION intent - user wants to DO something (highest priority)
  [INTENTS.ACTION]: [
    'xem giỏ hàng', 'mở giỏ hàng', 'giỏ hàng của tôi', 'my cart', 'open cart',
    'xem wishlist', 'mở wishlist', 'yêu thích của tôi', 'danh sách yêu thích',
    'xem đơn hàng', 'đơn hàng của tôi', 'my orders', 'tất cả đơn hàng',
    'xem sản phẩm', 'tất cả sản phẩm', 'danh sách sản phẩm',
    'về trang chủ', 'đi đến', 'mở trang', 'chuyển đến'
  ],
  // USER_CONTEXT - questions about user's own data
  [INTENTS.USER_CONTEXT]: [
    'của tôi', 'my', 'tôi có', 'đang có gì', 'trong giỏ có gì',
    'profile của tôi', 'thông tin của tôi', 'tài khoản của tôi',
    'cấp bậc của tôi', 'hoa hồng của tôi', 'điểm của tôi'
  ],
  [INTENTS.PRODUCT_QUERY]: [
    'sản phẩm', 'product', 'giá', 'price', 'mua', 'buy', 'rau', 'củ', 'quả',
    'combo', 'khuyến mãi', 'sale', 'có bán', 'còn hàng', 'hết hàng',
    'loại nào', 'gợi ý', 'recommend', 'tư vấn'
  ],
  [INTENTS.ORDER_STATUS]: [
    'đơn hàng', 'order', 'đặt hàng', 'tracking', 'theo dõi', 'tình trạng',
    'đã giao', 'đang giao', 'khi nào nhận', 'mã đơn'
  ],
  [INTENTS.DELIVERY_INFO]: [
    'giao hàng', 'ship', 'vận chuyển', 'delivery', 'phí ship', 'freeship',
    'miễn phí', 'khu vực', 'địa chỉ giao'
  ],
  [INTENTS.PAYMENT_INFO]: [
    'thanh toán', 'payment', 'trả tiền', 'cod', 'chuyển khoản', 'momo',
    'vnpay', 'bank', 'ngân hàng'
  ],
  [INTENTS.SUPPORT]: [
    'hỗ trợ', 'support', 'giúp', 'help', 'liên hệ', 'contact', 'hotline',
    'đổi trả', 'return', 'khiếu nại', 'complaint'
  ],
  [INTENTS.AGRICULTURE]: [
    'trồng', 'plant', 'chăm sóc', 'care', 'phân bón', 'fertilizer',
    'thuốc', 'pesticide', 'organic', 'hữu cơ', 'nông nghiệp', 'agriculture',
    'mùa vụ', 'thu hoạch', 'giống', 'hạt'
  ],
  [INTENTS.COMMUNITY]: [
    'bài viết', 'post', 'review', 'đánh giá', 'cộng đồng', 'community',
    'chia sẻ', 'share', 'kinh nghiệm', 'experience'
  ],
  [INTENTS.PREORDER]: [
    'đặt trước', 'preorder', 'pre-order', 'lô hàng', 'lot', 'mùa vụ',
    'thu hoạch', 'đặt cọc', 'deposit'
  ],
  [INTENTS.GREETING]: [
    'xin chào', 'hello', 'hi', 'hey', 'chào', 'cảm ơn', 'thank',
    'bye', 'tạm biệt', 'good morning', 'good afternoon'
  ]
};

// ========== CLASSIFICATION ==========

/**
 * Classify intent using keywords (no LLM)
 * @param {string} query
 * @returns {{ intent: string, confidence: number }}
 */
export function classifyByKeywords(query) {
  const lowerQuery = query.toLowerCase();
  const scores = {};
  
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    scores[intent] = keywords.filter(kw => lowerQuery.includes(kw)).length;
  }
  
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) {
    return { intent: INTENTS.UNKNOWN, confidence: 0 };
  }
  
  const topIntent = Object.entries(scores).find(([_, score]) => score === maxScore)[0];
  const confidence = Math.min(maxScore / 3, 1); // Max 1.0
  
  return { intent: topIntent, confidence };
}

/**
 * Classify intent using LLM (for complex queries)
 * @param {string} query
 * @returns {Promise<Result<{ intent: string, confidence: number }>>}
 */
export async function classifyByLLM(query) {
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Phân loại intent của câu hỏi sau. CHỈ TRẢ VỀ 1 trong các intent:
- product_query: Hỏi về sản phẩm, giá cả
- order_status: Kiểm tra đơn hàng
- delivery_info: Thông tin giao hàng
- payment_info: Thanh toán
- support: Hỗ trợ, liên hệ
- agriculture: Nông nghiệp, trồng trọt
- community: Bài viết, review
- preorder: Đặt trước
- greeting: Chào hỏi
- unknown: Không xác định

Câu hỏi: "${query}"`,
      response_json_schema: {
        type: 'object',
        properties: {
          intent: { type: 'string' },
          confidence: { type: 'number' }
        },
        required: ['intent']
      }
    });
    
    return success({
      intent: response.intent || INTENTS.UNKNOWN,
      confidence: response.confidence || 0.5
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Main router function
 * Uses keywords first, falls back to LLM for low confidence
 */
export async function routeQuery(query) {
  // Try keyword classification first (free)
  const keywordResult = classifyByKeywords(query);
  
  // If high confidence, use it
  if (keywordResult.confidence >= 0.5) {
    return success({
      ...keywordResult,
      method: 'keyword'
    });
  }
  
  // For low confidence, use LLM (~50 tokens)
  const llmResult = await classifyByLLM(query);
  if (llmResult.success) {
    return success({
      ...llmResult.data,
      method: 'llm'
    });
  }
  
  // Fallback to keyword result
  return success({
    ...keywordResult,
    method: 'keyword_fallback'
  });
}

export default {
  routeQuery,
  classifyByKeywords,
  classifyByLLM,
  INTENTS,
  INTENT_KEYWORDS
};
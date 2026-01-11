/**
 * Product Agent
 * 
 * Architecture: Feature Logic Layer (Hook-like)
 * - Orchestrates product queries for chatbot
 * - Uses chatbotProductService for API calls
 * - Formats responses for UI rendering
 * 
 * @see AI-CODING-RULES.jsx - Section 3: Feature Logic Layer
 */

import { success, failure, ErrorCodes } from '@/components/data/types';
import { 
  chatbotProductAPI,
  detectCategory,
  isFeaturedQuery 
} from './chatbotProductService';

// ========== RESPONSE FORMATTERS ==========

/**
 * Format products list for chatbot UI
 * @param {ChatbotProductDTO[]} products 
 * @param {string} query - Original search query
 * @returns {Object} Formatted response for ContentRenderer
 */
function formatProductsResponse(products, query) {
  // No results
  if (!products || products.length === 0) {
    return {
      contentType: 'markdown',
      content: `😅 **Không tìm thấy "${query}"**\n\nBác thử:\n• Tìm "rau", "gạo", "trái cây"\n• Hoặc nhấn nút bên dưới!`,
      suggestedActions: ['🥬 Rau củ', '🍚 Gạo', '🍎 Trái cây'],
      voiceText: `Xin lỗi bác, cháu không tìm thấy sản phẩm ${query}. Bác thử tìm rau, gạo hoặc trái cây nhé!`
    };
  }

  // Format title
  const title = products.length === 1
    ? `🌿 Đây là **${products[0].name}**:`
    : `🌿 Cháu tìm được **${products.length} sản phẩm**:`;

  // Voice text for TTS
  const voiceText = products.length === 1
    ? `Cháu tìm thấy ${products[0].name}. Giá ${products[0].price} đồng mỗi ${products[0].unit}. Bác nhấn Thêm để mua nhé!`
    : `Cháu tìm được ${products.length} sản phẩm cho bác. Bác nhấn vào sản phẩm để xem chi tiết.`;

  return {
    contentType: 'product_list',
    content: {
      title,
      products // Already mapped to DTO - removed actions to keep AI-first
    },
    suggestedActions: ['🛒 Thanh toán', '🔍 Tìm thêm', '📦 Đơn hàng'],
    voiceText
  };
}

/**
 * Format single product detail
 * @param {ChatbotProductDTO} product 
 * @returns {Object}
 */
function formatProductDetail(product) {
  return {
    contentType: 'product_detail',
    content: {
      product,
      actions: [
        { type: 'add_to_cart', label: 'Thêm vào giỏ' },
        { type: 'view_detail', label: 'Xem chi tiết' }
      ]
    }
  };
}

// ========== MAIN HANDLER ==========

/**
 * Handle product-related query
 * @param {string} query - User query
 * @param {Object} userContext - Optional user context
 * @returns {Promise<Result<Object>>}
 */
export async function handleProductQuery(query, userContext = {}) {
  // 1. Check for featured/popular request
  if (isFeaturedQuery(query)) {
    const result = await chatbotProductAPI.getFeaturedProducts(4);
    if (result.success) {
      return success({
        ...formatProductsResponse(result.data, 'sản phẩm nổi bật'),
        intent: 'product_query',
        tokensUsed: 0
      });
    }
    return result;
  }

  // 2. Check for category query
  const category = detectCategory(query);
  if (category) {
    const result = await chatbotProductAPI.getProductsByCategory(category, 6);
    if (result.success) {
      return success({
        ...formatProductsResponse(result.data, category),
        intent: 'product_query',
        tokensUsed: 0
      });
    }
    return result;
  }

  // 3. General search
  const searchResult = await chatbotProductAPI.searchProducts(query, 5);
  if (searchResult.success) {
    return success({
      ...formatProductsResponse(searchResult.data, query),
      intent: 'product_query',
      tokensUsed: 0
    });
  }

  return failure('Không thể tìm kiếm sản phẩm', ErrorCodes.SERVER_ERROR);
}

// ========== EXPORTS ==========

export {
  formatProductsResponse,
  formatProductDetail
};

export default {
  handleProductQuery,
  formatProductsResponse,
  formatProductDetail
};
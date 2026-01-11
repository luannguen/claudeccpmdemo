/**
 * Chatbot Security Guard
 * 
 * RBAC enforcement, topic filtering, data protection
 * Architecture: Service Layer
 */

import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== SECURITY CONFIG ==========

export const CHATBOT_SECURITY = {
  // Allowed topics by role
  allowedTopics: {
    user: [
      'products', 'orders_own', 'agriculture', 'community', 
      'support', 'delivery', 'payment', 'preorder', 'organic'
    ],
    admin: [
      'products', 'orders', 'customers', 'inventory', 
      'reports', 'agriculture', 'community', 'support'
    ]
  },

  // NEVER answer these
  blockedTopics: [
    'admin_credentials', 'database_config', 'api_keys', 'user_passwords',
    'financial_reports', 'other_users_data', 'system_logs', 'security_settings',
    'employee_salaries', 'internal_communications'
  ],

  // Keywords that trigger security check
  sensitiveKeywords: [
    'password', 'mật khẩu', 'api key', 'token', 'secret',
    'admin', 'database', 'sql', 'inject', 'hack', 'exploit',
    'credit card', 'thẻ tín dụng', 'cvv', 'bank account', 'tài khoản ngân hàng'
  ],

  // Out of scope keywords (not agriculture related)
  outOfScopeKeywords: [
    'bitcoin', 'crypto', 'gambling', 'cá cược', 'casino',
    'adult', 'porn', 'violence', 'weapon', 'vũ khí', 
    'drug', 'ma túy', 'politic', 'chính trị'
  ],

  // Agriculture domain keywords (for validation)
  agricultureKeywords: [
    'rau', 'củ', 'quả', 'organic', 'hữu cơ', 'nông sản', 'farm', 'trang trại',
    'phân bón', 'thuốc', 'giống', 'hạt', 'cây', 'trồng', 'thu hoạch',
    'nông nghiệp', 'agriculture', 'vegetable', 'fruit', 'fertilizer',
    'pesticide', 'seed', 'plant', 'harvest', 'crop', 'soil', 'đất',
    'tưới', 'irrigation', 'greenhouse', 'nhà kính', 'compost', 'ủ phân'
  ],

  // Rate limiting
  rateLimit: {
    maxMessagesPerMinute: 20,
    maxMessagesPerHour: 100,
    cooldownMinutes: 5
  },

  // Spam detection
  spamPatterns: [
    /(.)\1{10,}/,           // Repeated characters
    /^.{0,3}$/,             // Too short
    /^[^a-zA-Zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+$/i  // No letters
  ]
};

// ========== SECURITY CHECKS ==========

/**
 * Check if query contains sensitive keywords
 */
export function containsSensitiveContent(query) {
  const lowerQuery = query.toLowerCase();
  return CHATBOT_SECURITY.sensitiveKeywords.some(kw => lowerQuery.includes(kw));
}

/**
 * Check if query is out of scope
 */
export function isOutOfScope(query) {
  const lowerQuery = query.toLowerCase();
  return CHATBOT_SECURITY.outOfScopeKeywords.some(kw => lowerQuery.includes(kw));
}

/**
 * Check if query is agriculture related
 */
export function isAgricultureRelated(query) {
  const lowerQuery = query.toLowerCase();
  return CHATBOT_SECURITY.agricultureKeywords.some(kw => lowerQuery.includes(kw));
}

/**
 * Check if query is spam
 */
export function isSpam(query) {
  return CHATBOT_SECURITY.spamPatterns.some(pattern => pattern.test(query));
}

/**
 * Main security validation
 * @param {string} query - User query
 * @param {Object} rbacContext - RBAC context from useAIUserContext
 * @returns {Result<{ allowed: boolean, reason?: string }>}
 */
export function validateQuery(query, rbacContext = {}) {
  // 1. Check spam
  if (isSpam(query)) {
    return failure('Tin nhắn không hợp lệ', ErrorCodes.VALIDATION_ERROR);
  }

  // 2. Check sensitive content
  if (containsSensitiveContent(query)) {
    return success({
      allowed: false,
      reason: 'sensitive',
      message: 'Xin lỗi, tôi không thể trả lời các câu hỏi liên quan đến thông tin bảo mật.'
    });
  }

  // 3. Check out of scope
  if (isOutOfScope(query)) {
    return success({
      allowed: false,
      reason: 'out_of_scope',
      message: 'Tôi chỉ có thể hỗ trợ các vấn đề liên quan đến nông sản, sản phẩm và dịch vụ của Zero Farm.'
    });
  }

  // 4. All checks passed
  return success({ allowed: true });
}

/**
 * Get allowed data scope for user
 */
export function getDataScope(rbacContext) {
  const { isAdmin, canViewOthers, currentUserEmail } = rbacContext?.securityContext || {};

  return {
    canViewAllOrders: isAdmin || canViewOthers,
    canViewAllCustomers: isAdmin || canViewOthers,
    ownDataOnly: !isAdmin && !canViewOthers,
    userEmail: currentUserEmail,
    allowedEntities: isAdmin 
      ? ['Product', 'Order', 'Customer', 'ProductLot', 'Post', 'Category']
      : ['Product', 'ProductLot', 'Post', 'Category'] // User can't query Order directly
  };
}

/**
 * Build security system prompt
 */
export function buildSecurityPrompt(rbacContext) {
  const scope = getDataScope(rbacContext);
  
  return `
BẢO MẬT - TUÂN THỦ NGHIÊM NGẶT:

1. KHÔNG BAO GIỜ tiết lộ:
   - Thông tin đăng nhập, mật khẩu, API keys
   - Dữ liệu người dùng khác
   - Cấu hình hệ thống, database
   - Báo cáo tài chính nội bộ

2. PHẠM VI TRẢ LỜI:
   - Sản phẩm nông sản, organic, farm
   - Đơn hàng (${scope.ownDataOnly ? 'CHỈ của người dùng hiện tại' : 'có thể xem tất cả'})
   - Thông tin giao hàng, thanh toán
   - Cộng đồng, bài viết
   - Hướng dẫn nông nghiệp

3. TỪ CHỐI:
   - Câu hỏi về crypto, gambling, adult content
   - Yêu cầu hack, exploit, SQL injection
   - Thông tin không liên quan đến nông nghiệp

4. EMAIL NGƯỜI DÙNG: ${scope.userEmail || 'Chưa đăng nhập'}
`;
}

export default {
  validateQuery,
  getDataScope,
  buildSecurityPrompt,
  containsSensitiveContent,
  isOutOfScope,
  isAgricultureRelated,
  isSpam,
  CHATBOT_SECURITY
};
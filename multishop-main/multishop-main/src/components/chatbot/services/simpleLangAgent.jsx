/**
 * Simple Language Agent
 * 
 * Transforms responses to be friendly, simple for elderly/farmers
 * Uses more emojis, simpler vocabulary
 * 
 * Architecture: Service Layer
 */

import { success } from '@/components/data/types';

// ========== VOCABULARY MAPPING ==========

const SIMPLIFY_MAP = {
  // Technical -> Simple Vietnamese
  'sản phẩm': 'món hàng',
  'thanh toán': 'trả tiền',
  'xác nhận': 'đồng ý',
  'hủy bỏ': 'bỏ đi',
  'thông tin': 'tin tức',
  'chi tiết': 'rõ hơn',
  'số lượng': 'bao nhiêu',
  'đơn hàng': 'đơn mua',
  'giao dịch': 'mua bán',
  'tài khoản': 'thông tin bạn',
  'đăng nhập': 'vào tài khoản',
  'phương thức': 'cách',
  'vận chuyển': 'giao hàng',
  'xử lý': 'làm',
  'cập nhật': 'đổi mới',
  'tối ưu': 'tốt nhất',
  'khuyến mãi': 'giảm giá',
  'ưu đãi': 'quà tặng',
  'organic': 'hữu cơ sạch',
  'premium': 'loại ngon nhất'
};

// ========== EMOJI ENHANCERS ==========

const CONTEXT_EMOJIS = {
  product: ['🥬', '🥕', '🍅', '🌾', '🥦', '🍆', '🥒', '🌽'],
  cart: ['🛒', '🧺'],
  order: ['📦', '📋', '✅'],
  delivery: ['🚚', '🏠', '📍'],
  payment: ['💳', '💰', '✨'],
  success: ['✅', '🎉', '👍', '💚'],
  warning: ['⚠️', '📢'],
  greeting: ['🌱', '👋', '😊', '🌿'],
  question: ['🤔', '❓'],
  tip: ['💡', '📝', '🌟']
};

// ========== FRIENDLY PHRASES ==========

const FRIENDLY_STARTERS = [
  'Dạ, ',
  'Vâng ạ, ',
  'Để cháu giúp bác nhé, ',
  'Bác ơi, ',
  'Dạ thưa bác, '
];

const FRIENDLY_ENDERS = [
  '\n\nBác cần gì nữa không ạ? 😊',
  '\n\nCháu còn giúp gì được bác nữa không ạ?',
  '\n\nBác cứ hỏi cháu nếu cần nhé! 💚',
  '\n\nBác nhấn nút bên dưới nếu cần giúp thêm ạ!'
];

// ========== CORE FUNCTIONS ==========

/**
 * Make response friendlier for elderly users
 */
export function makeFriendly(content, context = {}) {
  if (!content || typeof content !== 'string') return content;
  
  let result = content;
  
  // 1. Add friendly starter (30% chance to avoid repetition)
  if (Math.random() > 0.7 && !result.startsWith('Dạ') && !result.startsWith('Vâng')) {
    const starter = FRIENDLY_STARTERS[Math.floor(Math.random() * FRIENDLY_STARTERS.length)];
    result = starter + result.charAt(0).toLowerCase() + result.slice(1);
  }
  
  // 2. Simplify vocabulary
  Object.entries(SIMPLIFY_MAP).forEach(([complex, simple]) => {
    const regex = new RegExp(complex, 'gi');
    result = result.replace(regex, simple);
  });
  
  // 3. Add context emojis if not enough
  const emojiCount = (result.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
  if (emojiCount < 2 && context.type) {
    const emojis = CONTEXT_EMOJIS[context.type] || CONTEXT_EMOJIS.greeting;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    result = emoji + ' ' + result;
  }
  
  // 4. Add friendly ender for long responses (20% chance)
  if (result.length > 100 && Math.random() > 0.8) {
    const ender = FRIENDLY_ENDERS[Math.floor(Math.random() * FRIENDLY_ENDERS.length)];
    result += ender;
  }
  
  return result;
}

/**
 * Generate voice-friendly text (for TTS)
 * Removes markdown, emojis, keeps only speakable text
 */
export function toSpeakableText(content) {
  if (!content || typeof content !== 'string') return '';
  
  let result = content;
  
  // Remove markdown
  result = result.replace(/\*\*/g, '');
  result = result.replace(/\*/g, '');
  result = result.replace(/##/g, '');
  result = result.replace(/- /g, '');
  result = result.replace(/\[.*?\]\(.*?\)/g, ''); // Links
  
  // Remove emojis
  result = result.replace(/[\u{1F300}-\u{1F9FF}]/gu, '');
  result = result.replace(/[\u{2700}-\u{27BF}]/gu, '');
  
  // Clean up extra spaces
  result = result.replace(/\n+/g, '. ');
  result = result.replace(/\s+/g, ' ');
  result = result.trim();
  
  return result;
}

/**
 * Create simple step-by-step instructions
 */
export function createSimpleSteps(steps, title = 'Hướng dẫn') {
  const header = `📝 **${title}**\n\n`;
  
  const stepText = steps.map((step, i) => {
    const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣'][i] || `${i + 1}.`;
    return `${emoji} ${step}`;
  }).join('\n\n');
  
  return header + stepText + '\n\n💚 Bác làm theo từng bước nhé!';
}

/**
 * Format price in friendly way
 */
export function friendlyPrice(price) {
  if (!price) return 'Miễn phí';
  
  const formatted = new Intl.NumberFormat('vi-VN').format(price);
  
  if (price >= 1000000) {
    const millions = (price / 1000000).toFixed(1);
    return `${millions} triệu đồng`;
  }
  
  if (price >= 1000) {
    const thousands = Math.round(price / 1000);
    return `${thousands} ngàn đồng`;
  }
  
  return `${formatted} đồng`;
}

/**
 * Create confirmation message with clear options
 */
export function createConfirmation(question, yesText = 'Đồng ý', noText = 'Không') {
  return {
    content: `🤔 **${question}**`,
    contentType: 'markdown',
    suggestedActions: [
      `✅ ${yesText}`,
      `❌ ${noText}`,
      '❓ Hỏi thêm'
    ]
  };
}

/**
 * Create success message
 */
export function createSuccessMessage(action, details = '') {
  const messages = {
    order: '🎉 **Đặt hàng thành công!**\n\nĐơn hàng của bác đã được ghi nhận. Cháu sẽ gọi điện xác nhận sớm nhé!',
    cart: '✅ **Đã thêm vào giỏ!**\n\nBác muốn mua thêm gì nữa không ạ?',
    payment: '💚 **Thanh toán thành công!**\n\nCảm ơn bác đã mua hàng. Hàng sẽ giao trong 1-2 ngày ạ!'
  };
  
  return {
    content: messages[action] || '✅ Thành công!',
    contentType: 'markdown'
  };
}

export default {
  makeFriendly,
  toSpeakableText,
  createSimpleSteps,
  friendlyPrice,
  createConfirmation,
  createSuccessMessage
};
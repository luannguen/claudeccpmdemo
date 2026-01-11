/**
 * Chatbot Cache Manager
 * 
 * Caches responses to save tokens
 * Architecture: Service Layer
 */

import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== CONFIG ==========

const CACHE_CONFIG = {
  maxEntries: 500,
  ttlMs: 24 * 60 * 60 * 1000, // 24 hours
  faqTtlMs: 7 * 24 * 60 * 60 * 1000, // 7 days for FAQ
  storageKey: 'chatbot_response_cache'
};

// ========== FAQ DATABASE (No LLM needed) ==========

export const FAQ_DATABASE = {
  // Contact & Address - HIGH PRIORITY
  'địa chỉ': {
    content: `📍 **Thông tin liên hệ Zero Farm**

🏠 **Địa chỉ:** Ấp Long Thạnh, Long An, Việt Nam
📞 **Hotline:** 098 765 4321
📧 **Email:** info@zerofarm.vn

⏰ **Giờ làm việc:**
- Thứ 2 - Thứ 6: 7:00 - 18:00
- Thứ 7 - CN: 8:00 - 17:00

Bạn có thể đến tham quan trang trại sau khi đặt lịch hẹn!`,
    intent: 'contact_info',
    contentType: 'markdown'
  },
  'số điện thoại': {
    content: `📞 **Hotline Zero Farm:** 098 765 4321\n\nGọi ngay để được tư vấn và đặt hàng!`,
    intent: 'contact_info',
    contentType: 'markdown'
  },
  'liên hệ': {
    content: `📞 **Liên hệ Zero Farm**

📱 **Hotline:** 098 765 4321
📧 **Email:** info@zerofarm.vn
🏠 **Địa chỉ:** Ấp Long Thạnh, Long An

💬 Giờ làm việc: 7h-21h hàng ngày`,
    intent: 'contact_info',
    contentType: 'markdown'
  },
  'hotline': {
    content: `☎️ **Hotline Zero Farm: 098 765 4321**\n\nSẵn sàng hỗ trợ bạn từ 7h-21h hàng ngày!`,
    intent: 'contact_info',
    contentType: 'markdown'
  },

  // Shipping - HIGH PRIORITY
  'giao hàng': {
    content: `🚚 **Thông tin giao hàng Zero Farm:**

📦 **Phí vận chuyển:**
- **Freeship** đơn từ 200.000đ (nội thành HCM)
- Ship 15.000đ - 30.000đ tùy khu vực

⏰ **Thời gian giao:**
- Đặt trước **9h sáng** → Giao trong ngày
- Đặt sau 9h → Giao ngày hôm sau

💳 **Thanh toán:**
- COD (thanh toán khi nhận hàng)
- Chuyển khoản ngân hàng
- Ví điện tử (MoMo, VNPay)

📞 Hotline: 098 765 4321`,
    intent: 'delivery_info',
    contentType: 'markdown'
  },
  'phí ship': {
    content: `💰 **Phí ship Zero Farm:**

- Nội thành HCM: 15.000đ
- Ngoại thành: 25.000đ - 30.000đ
- **FREESHIP** đơn từ 200.000đ

📦 Giao trong ngày nếu đặt trước 9h!`,
    intent: 'delivery_info',
    contentType: 'markdown'
  },
  'freeship': {
    content: `🎉 **Miễn phí ship** cho đơn hàng từ 200.000đ!\n\nMẹo: Mua combo tiết kiệm để dễ đạt ngưỡng freeship hơn.`,
    intent: 'shipping_fee',
    contentType: 'markdown'
  },
  'ship': {
    content: `🚚 **Giao hàng Zero Farm:**

✅ Freeship từ 200k
✅ Giao trong ngày (đặt trước 9h)
✅ Hỗ trợ COD

📞 Hotline: 098 765 4321`,
    intent: 'delivery_info',
    contentType: 'markdown'
  },

  // Payment
  'thanh toán': {
    content: `💳 **Phương thức thanh toán:**

1. **COD** - Thanh toán khi nhận hàng
2. **Chuyển khoản** - Qua ngân hàng/Momo/ZaloPay
3. **VNPay** - Quét mã QR

Chúng tôi khuyến khích COD để bạn kiểm tra hàng trước khi thanh toán!`,
    intent: 'payment_info',
    contentType: 'markdown'
  },
  'cod': {
    content: `💵 **COD - Thanh toán khi nhận hàng:**\n\nBạn kiểm tra hàng thoải mái, hài lòng mới thanh toán. Đây là cách an toàn nhất!`,
    intent: 'payment_info',
    contentType: 'markdown'
  },

  // Products
  'organic': {
    content: `🌿 **Sản phẩm Organic Zero Farm:**

- 100% hữu cơ, không hóa chất
- Chứng nhận VietGAP, GlobalGAP
- Thu hoạch sáng sớm, giao trong ngày
- Nguồn gốc rõ ràng, truy xuất được

Bạn muốn xem danh mục sản phẩm không?`,
    intent: 'product_info',
    contentType: 'markdown'
  },
  'hữu cơ': {
    content: `🌱 **Nông sản hữu cơ Zero Farm:**

Chúng tôi cam kết:
- Không thuốc trừ sâu hóa học
- Không phân bón hóa học
- Không chất bảo quản
- Không biến đổi gen (GMO)

An toàn tuyệt đối cho gia đình bạn!`,
    intent: 'product_info',
    contentType: 'markdown'
  },

  // Preorder
  'đặt trước': {
    content: `🌾 **Đặt trước (Pre-order):**

Đặt trước sản phẩm theo mùa vụ với giá ưu đãi:
- Giá thấp hơn 10-20%
- Đảm bảo có hàng
- Nhận ngay khi thu hoạch

Xem các lô đang mở đặt trước tại mục "Đặt Trước"!`,
    intent: 'preorder_info',
    contentType: 'markdown'
  },

  // Return
  'đổi trả': {
    content: `🔄 **Chính sách đổi trả:**

- Đổi trả trong 24h nếu sản phẩm có vấn đề
- Hoàn tiền 100% nếu hàng không đúng mô tả
- Liên hệ hotline 098 765 4321 để được hỗ trợ

Chúng tôi luôn đặt quyền lợi khách hàng lên hàng đầu!`,
    intent: 'return_policy',
    contentType: 'markdown'
  },

  // Working hours
  'giờ làm việc': {
    content: `🕐 **Giờ làm việc Zero Farm:**

- Hotline: 7h-21h hàng ngày
- Showroom: 8h-20h (T2-CN)
- Giao hàng: 8h-18h

Đặt hàng online 24/7 qua website!`,
    intent: 'working_hours',
    contentType: 'markdown'
  },
  
  // Price list - triggers product search
  'bảng giá': {
    content: `💰 **Bảng giá Zero Farm:**

Để xem bảng giá đầy đủ, bạn có thể:
1. Gõ "xem sản phẩm" để xem danh sách sản phẩm với giá
2. Hỏi về danh mục cụ thể: "giá rau củ", "giá trái cây"

📦 **Combo tiết kiệm từ 99k!**
🎉 **Freeship đơn từ 200k!**`,
    intent: 'price_info',
    contentType: 'markdown'
  },
  'giá': {
    content: `💰 **Giá sản phẩm Zero Farm:**

- 🥬 Rau củ: từ 15.000đ/bó
- 🍎 Trái cây: từ 35.000đ/kg
- 🍚 Gạo hữu cơ: từ 45.000đ/kg
- 📦 Combo: từ 99.000đ

Gõ "xem sản phẩm" để xem chi tiết giá!`,
    intent: 'price_info',
    contentType: 'markdown'
  }
};

// ========== CACHE OPERATIONS ==========

/**
 * Generate cache key from query
 */
function generateCacheKey(query) {
  const normalized = query.toLowerCase().trim()
    .replace(/[^\wàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/gi, '')
    .replace(/\s+/g, ' ');
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `q_${Math.abs(hash)}`;
}

/**
 * Check FAQ database (no LLM needed)
 */
export function checkFAQ(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  for (const [keyword, response] of Object.entries(FAQ_DATABASE)) {
    if (lowerQuery.includes(keyword)) {
      return {
        hit: true,
        response: {
          content: response.content,
          intent: response.intent,
          contentType: 'markdown',
          cached: true,
          source: 'faq'
        }
      };
    }
  }
  
  return { hit: false };
}

/**
 * Get from cache
 */
export function getFromCache(query) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_CONFIG.storageKey) || '{}');
    const key = generateCacheKey(query);
    const entry = cache[key];
    
    if (entry && Date.now() < entry.expiresAt) {
      return {
        hit: true,
        response: {
          ...entry.response,
          cached: true,
          source: 'cache'
        }
      };
    }
    
    return { hit: false };
  } catch (e) {
    return { hit: false };
  }
}

/**
 * Save to cache
 */
export function saveToCache(query, response) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_CONFIG.storageKey) || '{}');
    const key = generateCacheKey(query);
    
    // Cleanup old entries if too many
    const keys = Object.keys(cache);
    if (keys.length >= CACHE_CONFIG.maxEntries) {
      const sortedKeys = keys.sort((a, b) => cache[a].expiresAt - cache[b].expiresAt);
      for (let i = 0; i < 50; i++) {
        delete cache[sortedKeys[i]];
      }
    }
    
    cache[key] = {
      response,
      expiresAt: Date.now() + CACHE_CONFIG.ttlMs,
      createdAt: Date.now()
    };
    
    localStorage.setItem(CACHE_CONFIG.storageKey, JSON.stringify(cache));
    return success(true);
  } catch (e) {
    return failure('Cache save failed', ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Clear cache
 */
export function clearCache() {
  try {
    localStorage.removeItem(CACHE_CONFIG.storageKey);
    return success(true);
  } catch (e) {
    return failure('Cache clear failed', ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_CONFIG.storageKey) || '{}');
    const entries = Object.values(cache);
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(e => now < e.expiresAt).length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.createdAt)) : null,
      faqCount: Object.keys(FAQ_DATABASE).length
    };
  } catch (e) {
    return { totalEntries: 0, validEntries: 0, faqCount: Object.keys(FAQ_DATABASE).length };
  }
}

export default {
  checkFAQ,
  getFromCache,
  saveToCache,
  clearCache,
  getCacheStats,
  FAQ_DATABASE,
  CACHE_CONFIG
};
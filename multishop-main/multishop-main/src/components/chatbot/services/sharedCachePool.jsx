/**
 * Shared Cache Pool Service
 * 
 * ENHANCEMENT #10: Cache phổ biến lưu server-side, tất cả user dùng chung
 * Giảm 50%+ LLM calls cho popular queries
 * 
 * NOTE: Đây là client-side implementation với fallback.
 * Để full server-side, cần backend function.
 * 
 * Architecture: Service Layer (AI-CODING-RULES compliant)
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== CONFIG ==========

const SHARED_CACHE_CONFIG = {
  localStorageKey: 'chatbot_shared_cache_local',
  maxLocalEntries: 50,
  ttlMs: 24 * 60 * 60 * 1000, // 24 hours
  syncIntervalMs: 5 * 60 * 1000, // Sync every 5 minutes
  minAccessCountForSharing: 3 // Must be accessed 3+ times to be shared
};

// ========== POPULAR QUERIES DATABASE ==========
// Pre-defined responses that all users can benefit from

const SHARED_POPULAR_RESPONSES = {
  // High-frequency queries (exact or very similar)
  'giá ship': {
    content: '📦 **Phí vận chuyển:**\n- Đơn < 200k: 20.000đ\n- Đơn ≥ 200k: **MIỄN PHÍ**\n\nMẹo: Mua combo để đạt freeship!',
    intent: 'delivery_info',
    category: 'shipping'
  },
  'ship miễn phí': {
    content: '🎉 **Freeship** từ 200.000đ! Đặt thêm để được miễn phí giao hàng nhé.',
    intent: 'delivery_info',
    category: 'shipping'
  },
  'thời gian giao hàng': {
    content: '🚚 **Thời gian giao:**\n- Nội thành HCM: 2-4 tiếng\n- Ngoại thành: 1-2 ngày\n- Đặt trước 9h → Giao trong ngày',
    intent: 'delivery_info',
    category: 'shipping'
  },
  'cách thanh toán': {
    content: '💳 **Phương thức thanh toán:**\n1. COD (tiền mặt)\n2. Chuyển khoản\n3. Momo/ZaloPay\n4. VNPay QR\n\nKhuyến khích COD để kiểm tra hàng!',
    intent: 'payment_info',
    category: 'payment'
  },
  'có ship không': {
    content: '✅ Có giao hàng ạ! Ship nội thành HCM trong 2-4 tiếng, ngoại thành 1-2 ngày. Freeship từ 200k.',
    intent: 'delivery_info',
    category: 'shipping'
  },
  'combo tiết kiệm': {
    content: '🥗 **Combo tiết kiệm Zero Farm:**\n- Tiết kiệm 15-25%\n- Đủ dinh dưỡng cho gia đình\n- Đạt freeship dễ dàng\n\nXem tất cả combo tại mục Sản Phẩm!',
    intent: 'product_info',
    category: 'product'
  },
  'có hóa đơn không': {
    content: '🧾 Có ạ! Zero Farm xuất hóa đơn VAT theo yêu cầu. Vui lòng ghi chú khi đặt hàng hoặc liên hệ hotline.',
    intent: 'support',
    category: 'billing'
  },
  'bảo quản rau': {
    content: '🥬 **Cách bảo quản rau:**\n- Để ngăn mát tủ lạnh (5-8°C)\n- Bọc giấy hoặc túi lỗ\n- Không rửa trước khi cất\n- Dùng trong 3-5 ngày\n\nRau organic tươi lâu hơn rau thường!',
    intent: 'agriculture',
    category: 'tips'
  },
  'chính sách đổi trả': {
    content: '🔄 **Đổi trả Zero Farm:**\n- Đổi trong 24h nếu lỗi\n- Hoàn 100% nếu không đúng mô tả\n- Liên hệ hotline 098 765 4321\n\nQuyền lợi khách hàng là ưu tiên hàng đầu!',
    intent: 'return_policy',
    category: 'policy'
  },
  'sản phẩm organic': {
    content: '🌿 **Organic Zero Farm:**\n- 100% hữu cơ, không hóa chất\n- Chứng nhận VietGAP\n- Thu hoạch sáng sớm\n- Nguồn gốc truy xuất\n\nAn toàn tuyệt đối cho gia đình!',
    intent: 'product_info',
    category: 'product'
  }
};

// ========== LOCAL CACHE OPERATIONS ==========

function getLocalCache() {
  try {
    return JSON.parse(localStorage.getItem(SHARED_CACHE_CONFIG.localStorageKey) || '{}');
  } catch {
    return {};
  }
}

function saveLocalCache(cache) {
  try {
    localStorage.setItem(SHARED_CACHE_CONFIG.localStorageKey, JSON.stringify(cache));
  } catch {
    // Silent fail
  }
}

// ========== QUERY NORMALIZATION ==========

/**
 * Normalize query for matching
 */
function normalizeQuery(query) {
  return query
    .toLowerCase()
    .replace(/[^\wàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate query similarity (for fuzzy matching)
 */
function querySimilarity(q1, q2) {
  const words1 = new Set(q1.split(' '));
  const words2 = new Set(q2.split(' '));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// ========== MAIN FUNCTIONS ==========

/**
 * Check shared cache for response
 */
export function checkSharedCache(query) {
  const normalizedQuery = normalizeQuery(query);
  
  // 1. Check pre-defined popular responses (exact or fuzzy)
  for (const [key, response] of Object.entries(SHARED_POPULAR_RESPONSES)) {
    const normalizedKey = normalizeQuery(key);
    
    // Exact match
    if (normalizedQuery.includes(normalizedKey) || normalizedKey.includes(normalizedQuery)) {
      return {
        hit: true,
        response: {
          ...response,
          cached: true,
          source: 'shared_popular'
        },
        matchType: 'popular'
      };
    }
    
    // Fuzzy match with high similarity
    if (querySimilarity(normalizedQuery, normalizedKey) > 0.7) {
      return {
        hit: true,
        response: {
          ...response,
          cached: true,
          source: 'shared_similar'
        },
        matchType: 'similar'
      };
    }
  }
  
  // 2. Check local shared cache
  const localCache = getLocalCache();
  for (const [key, entry] of Object.entries(localCache)) {
    if (Date.now() > entry.expiresAt) continue;
    
    if (querySimilarity(normalizedQuery, key) > 0.75) {
      entry.accessCount++;
      saveLocalCache(localCache);
      
      return {
        hit: true,
        response: {
          ...entry.response,
          cached: true,
          source: 'shared_local'
        },
        matchType: 'local'
      };
    }
  }
  
  return { hit: false };
}

/**
 * Add to shared cache if response is generic enough
 */
export function addToSharedCache(query, response) {
  // Don't cache personalized or order-specific responses
  const nonSharableIntents = ['order_status', 'greeting'];
  if (nonSharableIntents.includes(response.intent)) {
    return { shared: false, reason: 'non_sharable_intent' };
  }
  
  // Don't cache if contains user-specific data
  const content = typeof response.content === 'string' ? response.content : '';
  if (content.includes('@') || content.match(/\d{10,}/)) {
    return { shared: false, reason: 'contains_pii' };
  }
  
  const normalizedQuery = normalizeQuery(query);
  const localCache = getLocalCache();
  
  // Check if similar already exists
  for (const key of Object.keys(localCache)) {
    if (querySimilarity(normalizedQuery, key) > 0.8) {
      return { shared: false, reason: 'similar_exists' };
    }
  }
  
  // Add to local cache
  if (Object.keys(localCache).length >= SHARED_CACHE_CONFIG.maxLocalEntries) {
    // Remove oldest
    const sortedKeys = Object.entries(localCache)
      .sort((a, b) => a[1].createdAt - b[1].createdAt)
      .map(([k]) => k);
    delete localCache[sortedKeys[0]];
  }
  
  localCache[normalizedQuery] = {
    response: {
      content: response.content,
      contentType: response.contentType || 'markdown',
      intent: response.intent
    },
    createdAt: Date.now(),
    expiresAt: Date.now() + SHARED_CACHE_CONFIG.ttlMs,
    accessCount: 1
  };
  
  saveLocalCache(localCache);
  return { shared: true };
}

/**
 * Get cache statistics
 */
export function getSharedCacheStats() {
  const localCache = getLocalCache();
  const now = Date.now();
  const validEntries = Object.values(localCache).filter(e => now < e.expiresAt);
  
  return {
    popularQueriesCount: Object.keys(SHARED_POPULAR_RESPONSES).length,
    localEntriesCount: validEntries.length,
    totalAccessCount: validEntries.reduce((sum, e) => sum + (e.accessCount || 0), 0),
    topAccessedQueries: Object.entries(localCache)
      .sort((a, b) => (b[1].accessCount || 0) - (a[1].accessCount || 0))
      .slice(0, 5)
      .map(([q, e]) => ({ query: q.substring(0, 40), count: e.accessCount }))
  };
}

/**
 * Clear local shared cache
 */
export function clearSharedCache() {
  localStorage.removeItem(SHARED_CACHE_CONFIG.localStorageKey);
  return success(true);
}

/**
 * Get all popular queries (for suggestions)
 */
export function getPopularQueries() {
  return Object.keys(SHARED_POPULAR_RESPONSES).map(q => ({
    query: q,
    category: SHARED_POPULAR_RESPONSES[q].category
  }));
}

export default {
  checkSharedCache,
  addToSharedCache,
  getSharedCacheStats,
  clearSharedCache,
  getPopularQueries,
  SHARED_POPULAR_RESPONSES,
  SHARED_CACHE_CONFIG
};
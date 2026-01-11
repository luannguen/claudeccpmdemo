/**
 * Smart Suggestion Engine
 * 
 * Provides contextual suggestions based on:
 * - Current season/weather
 * - User history
 * - Popular combos
 * - Time of day
 * 
 * Architecture: Service Layer
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== SEASONAL DATA ==========

const SEASONS = {
  spring: { months: [2, 3, 4], name: 'Xuân', emoji: '🌸' },
  summer: { months: [5, 6, 7], name: 'Hè', emoji: '☀️' },
  autumn: { months: [8, 9, 10], name: 'Thu', emoji: '🍂' },
  winter: { months: [11, 0, 1], name: 'Đông', emoji: '❄️' }
};

const SEASONAL_PRODUCTS = {
  spring: ['rau mầm', 'đậu', 'cải', 'xà lách'],
  summer: ['dưa', 'cà chua', 'ớt', 'bí', 'mướp'],
  autumn: ['bí đỏ', 'khoai', 'ngô', 'lạc'],
  winter: ['cải thảo', 'su hào', 'củ cải', 'cà rốt']
};

const POPULAR_COMBOS = [
  {
    id: 'combo_salad',
    name: 'Combo Salad Tươi',
    emoji: '🥗',
    keywords: ['xà lách', 'cà chua', 'dưa leo'],
    description: 'Rau tươi làm salad'
  },
  {
    id: 'combo_soup',
    name: 'Combo Nấu Canh',
    emoji: '🍲',
    keywords: ['rau muống', 'mồng tơi', 'rau đay'],
    description: 'Rau nấu canh ngon'
  },
  {
    id: 'combo_stir_fry',
    name: 'Combo Xào',
    emoji: '🥬',
    keywords: ['cải', 'bắp cải', 'đậu'],
    description: 'Rau xào nhanh'
  },
  {
    id: 'combo_rice',
    name: 'Combo Gạo Ngon',
    emoji: '🍚',
    keywords: ['gạo st25', 'gạo lứt'],
    description: 'Gạo sạch cho gia đình'
  }
];

// ========== TIME-BASED SUGGESTIONS ==========

const TIME_SUGGESTIONS = {
  morning: { // 5-11
    greeting: 'Chào buổi sáng!',
    emoji: '🌅',
    suggest: ['rau tươi', 'trứng', 'sữa'],
    message: 'Bác mua rau tươi sáng nay nấu bữa trưa nhé!'
  },
  noon: { // 11-14
    greeting: 'Chào buổi trưa!',
    emoji: '☀️',
    suggest: ['trái cây', 'rau củ'],
    message: 'Trưa nắng, bác dùng trái cây mát nhé!'
  },
  afternoon: { // 14-18
    greeting: 'Chào buổi chiều!',
    emoji: '🌤️',
    suggest: ['rau xanh', 'thịt', 'cá'],
    message: 'Chuẩn bị bữa tối, bác cần gì ạ?'
  },
  evening: { // 18-22
    greeting: 'Chào buổi tối!',
    emoji: '🌙',
    suggest: ['combo tiện lợi', 'đồ khô'],
    message: 'Tối rồi, bác đặt hàng sáng mai giao nhé!'
  },
  night: { // 22-5
    greeting: 'Khuya rồi bác ơi!',
    emoji: '🌃',
    suggest: ['đặt trước'],
    message: 'Bác đặt hàng giờ, sáng mai giao sớm ạ!'
  }
};

// ========== CORE FUNCTIONS ==========

/**
 * Get current season
 */
function getCurrentSeason() {
  const month = new Date().getMonth();
  for (const [key, season] of Object.entries(SEASONS)) {
    if (season.months.includes(month)) {
      return { key, ...season };
    }
  }
  return { key: 'spring', ...SEASONS.spring };
}

/**
 * Get time of day context
 */
function getTimeContext() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 11) return TIME_SUGGESTIONS.morning;
  if (hour >= 11 && hour < 14) return TIME_SUGGESTIONS.noon;
  if (hour >= 14 && hour < 18) return TIME_SUGGESTIONS.afternoon;
  if (hour >= 18 && hour < 22) return TIME_SUGGESTIONS.evening;
  return TIME_SUGGESTIONS.night;
}

/**
 * Get seasonal product suggestions
 */
export async function getSeasonalSuggestions() {
  try {
    const season = getCurrentSeason();
    const keywords = SEASONAL_PRODUCTS[season.key] || [];
    
    // Fetch products matching seasonal keywords
    const allProducts = await base44.entities.Product.filter({ status: 'active' });
    
    const seasonalProducts = allProducts
      .filter(p => {
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        return keywords.some(kw => name.includes(kw) || desc.includes(kw));
      })
      .slice(0, 4);
    
    return success({
      season: season.name,
      emoji: season.emoji,
      products: seasonalProducts,
      message: `${season.emoji} Mùa ${season.name} - Rau củ ngon nhất!`
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get smart greeting with suggestions
 */
export function getSmartGreeting(userContext = {}) {
  const timeCtx = getTimeContext();
  const season = getCurrentSeason();
  
  let greeting = `${timeCtx.emoji} ${timeCtx.greeting} 🌱\n\n`;
  greeting += `Tôi là trợ lý mua hàng của Zero Farm.\n\n`;
  
  // Add contextual suggestion
  greeting += `💡 **${timeCtx.message}**\n\n`;
  
  // Add seasonal tip
  greeting += `${season.emoji} Mùa ${season.name} có nhiều ${SEASONAL_PRODUCTS[season.key].slice(0, 2).join(', ')} ngon lắm!\n\n`;
  
  // Personalized based on user
  if (userContext?.hasCart) {
    greeting += `🛒 Bác đang có ${userContext.cartCount} món trong giỏ. Mua luôn nhé?\n\n`;
  }
  
  if (userContext?.lastOrderDays && userContext.lastOrderDays > 7) {
    greeting += `📦 Lâu rồi bác chưa mua hàng, hôm nay đặt nhé!\n\n`;
  }
  
  greeting += `**Bác muốn làm gì?** 👇`;
  
  return {
    content: greeting,
    contentType: 'markdown',
    suggestedActions: [
      '🛒 Mua rau củ',
      '🍚 Mua gạo',
      '📦 Xem đơn hàng',
      '💬 Hỏi tư vấn'
    ]
  };
}

/**
 * Get combo suggestions
 */
export async function getComboSuggestions(userQuery = '') {
  try {
    const query = userQuery.toLowerCase();
    
    // Find matching combos
    let matchedCombos = POPULAR_COMBOS;
    
    if (query.includes('salad') || query.includes('gỏi')) {
      matchedCombos = [POPULAR_COMBOS[0]];
    } else if (query.includes('canh') || query.includes('nấu')) {
      matchedCombos = [POPULAR_COMBOS[1]];
    } else if (query.includes('xào')) {
      matchedCombos = [POPULAR_COMBOS[2]];
    } else if (query.includes('gạo') || query.includes('cơm')) {
      matchedCombos = [POPULAR_COMBOS[3]];
    }
    
    // Fetch actual products for each combo
    const allProducts = await base44.entities.Product.filter({ status: 'active' });
    
    const combosWithProducts = matchedCombos.map(combo => {
      const products = allProducts
        .filter(p => {
          const name = (p.name || '').toLowerCase();
          return combo.keywords.some(kw => name.includes(kw));
        })
        .slice(0, 3);
      
      return {
        ...combo,
        products
      };
    }).filter(c => c.products.length > 0);
    
    return success(combosWithProducts);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get reorder suggestions based on user history
 */
export async function getReorderSuggestions(userEmail) {
  if (!userEmail) {
    return success({ orders: [], suggestion: null });
  }
  
  try {
    // Get user's past orders
    const orders = await base44.entities.Order.filter({
      customer_email: userEmail,
      order_status: 'delivered'
    });
    
    if (orders.length === 0) {
      return success({ orders: [], suggestion: null });
    }
    
    // Find most frequently ordered items
    const itemCount = {};
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const id = item.product_id;
        itemCount[id] = (itemCount[id] || 0) + item.quantity;
      });
    });
    
    // Get top 3 most ordered
    const topItems = Object.entries(itemCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);
    
    // Fetch those products
    const allProducts = await base44.entities.Product.filter({ status: 'active' });
    const suggestedProducts = allProducts.filter(p => topItems.includes(p.id));
    
    // Check last order date
    const lastOrder = orders.sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    )[0];
    
    const daysSinceLastOrder = Math.floor(
      (Date.now() - new Date(lastOrder.created_date)) / (1000 * 60 * 60 * 24)
    );
    
    let suggestion = null;
    if (daysSinceLastOrder > 7) {
      suggestion = `📦 Lâu rồi bác chưa mua hàng (${daysSinceLastOrder} ngày). Đặt lại mấy món hay mua nhé!`;
    }
    
    return success({
      products: suggestedProducts,
      lastOrderDays: daysSinceLastOrder,
      suggestion
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get contextual quick actions
 */
export function getContextualActions(userContext = {}) {
  const timeCtx = getTimeContext();
  const actions = [];
  
  // Time-based actions
  if (timeCtx === TIME_SUGGESTIONS.morning) {
    actions.push({ emoji: '🥬', label: 'Rau tươi sáng', prompt: 'Tìm rau tươi' });
  }
  
  // Cart-based actions
  if (userContext?.hasCart && userContext.cartCount > 0) {
    actions.push({ emoji: '🛒', label: `Thanh toán (${userContext.cartCount})`, prompt: 'Thanh toán giỏ hàng' });
  }
  
  // Order-based actions
  if (userContext?.hasOrders) {
    actions.push({ emoji: '📦', label: 'Đơn của tôi', prompt: 'Xem đơn hàng' });
  }
  
  // Default actions
  actions.push(
    { emoji: '🔍', label: 'Tìm sản phẩm', prompt: 'Tìm sản phẩm' },
    { emoji: '💬', label: 'Hỏi tư vấn', prompt: 'Tôi cần tư vấn' }
  );
  
  return actions.slice(0, 4);
}

export default {
  getSeasonalSuggestions,
  getSmartGreeting,
  getComboSuggestions,
  getReorderSuggestions,
  getContextualActions,
  getCurrentSeason,
  getTimeContext
};
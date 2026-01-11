/**
 * Action Agent
 * 
 * Handles action intents - when user wants to DO something
 * Examples: "xem giỏ hàng", "mở wishlist", "đi đến trang đơn hàng"
 * 
 * Có thể tự thực thi actions trong phạm vi cho phép:
 * - Mở modals/widgets (cart, wishlist, quick view)
 * - Navigate đến pages
 * - Thực hiện các thao tác client-side
 * 
 * Architecture: Service Layer (AI-CODING-RULES compliant)
 * 
 * @module actionAgent
 */

import { success, failure, ErrorCodes } from '@/components/data/types';
import userContextAPI from '@/components/services/userContextService';

// ========== ACTION DEFINITIONS ==========

export const ACTIONS = {
  // Cart actions
  OPEN_CART: 'open_cart',
  ADD_TO_CART: 'add_to_cart',
  VIEW_CART: 'view_cart',
  CLEAR_CART: 'clear_cart',
  
  // Wishlist actions
  OPEN_WISHLIST: 'open_wishlist',
  VIEW_WISHLIST: 'view_wishlist',
  
  // Order actions
  VIEW_ORDERS: 'view_orders',
  TRACK_ORDER: 'track_order',
  VIEW_ORDER_DETAIL: 'view_order_detail',
  
  // Product actions
  VIEW_PRODUCTS: 'view_products',
  SEARCH_PRODUCTS: 'search_products',
  VIEW_PRODUCT_DETAIL: 'view_product_detail',
  
  // Navigation
  GO_TO_HOME: 'go_to_home',
  GO_TO_COMMUNITY: 'go_to_community',
  GO_TO_PREORDER: 'go_to_preorder',
  GO_TO_PROFILE: 'go_to_profile',
  GO_TO_CONTACT: 'go_to_contact',
  
  // User actions
  VIEW_PROFILE: 'view_profile',
  VIEW_REFERRAL: 'view_referral',
  
  // Unknown
  UNKNOWN: 'unknown'
};

// ========== ACTION KEYWORDS ==========

const ACTION_KEYWORDS = {
  [ACTIONS.OPEN_CART]: [
    'xem giỏ hàng', 'mở giỏ hàng', 'giỏ hàng của tôi', 'cart', 'my cart',
    'xem cart', 'giỏ hàng', 'trong giỏ', 'đang có gì trong giỏ'
  ],
  [ACTIONS.VIEW_CART]: [
    'có gì trong giỏ', 'giỏ hàng có gì', 'xem giỏ', 'kiểm tra giỏ'
  ],
  [ACTIONS.OPEN_WISHLIST]: [
    'xem wishlist', 'mở wishlist', 'danh sách yêu thích', 'sản phẩm yêu thích',
    'yêu thích của tôi', 'favorite', 'favourites', 'xem yêu thích'
  ],
  [ACTIONS.VIEW_ORDERS]: [
    'xem đơn hàng', 'đơn hàng của tôi', 'my orders', 'đơn mua',
    'lịch sử mua', 'lịch sử đơn', 'các đơn hàng', 'tất cả đơn hàng'
  ],
  [ACTIONS.TRACK_ORDER]: [
    'theo dõi đơn', 'track order', 'đơn đang giao', 'tình trạng giao hàng'
  ],
  [ACTIONS.VIEW_PRODUCTS]: [
    'xem sản phẩm', 'tất cả sản phẩm', 'danh sách sản phẩm', 'menu sản phẩm',
    'có những sản phẩm gì', 'mua gì', 'xem hàng'
  ],
  [ACTIONS.SEARCH_PRODUCTS]: [
    'tìm kiếm', 'tìm sản phẩm', 'search', 'tìm'
  ],
  [ACTIONS.GO_TO_HOME]: [
    'về trang chủ', 'home', 'trang chủ'
  ],
  [ACTIONS.GO_TO_COMMUNITY]: [
    'xem cộng đồng', 'community', 'bài viết', 'diễn đàn'
  ],
  [ACTIONS.GO_TO_PREORDER]: [
    'đặt trước', 'preorder', 'pre-order', 'lô hàng', 'mùa vụ'
  ],
  [ACTIONS.GO_TO_PROFILE]: [
    'xem profile', 'trang cá nhân', 'hồ sơ', 'my profile', 'thông tin của tôi'
  ],
  [ACTIONS.GO_TO_CONTACT]: [
    'liên hệ', 'contact', 'hotline', 'gọi điện', 'hỗ trợ'
  ],
  [ACTIONS.VIEW_REFERRAL]: [
    'giới thiệu', 'referral', 'mã giới thiệu', 'hoa hồng'
  ]
};

// ========== ACTION CLASSIFICATION ==========

/**
 * Detect action intent from query
 */
export function detectAction(query) {
  const lowerQuery = query.toLowerCase().trim();
  
  // Check each action
  for (const [action, keywords] of Object.entries(ACTION_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword)) {
        return {
          action,
          confidence: keyword.length > 5 ? 0.9 : 0.7,
          matchedKeyword: keyword
        };
      }
    }
  }
  
  return { action: ACTIONS.UNKNOWN, confidence: 0 };
}

/**
 * Check if query is an action intent
 */
export function isActionIntent(query) {
  const { action, confidence } = detectAction(query);
  return action !== ACTIONS.UNKNOWN && confidence >= 0.5;
}

// ========== ACTION EXECUTORS ==========

/**
 * Execute action and return response
 */
export async function executeAction(action, context = {}) {
  const { userEmail } = context;
  
  switch (action) {
    case ACTIONS.OPEN_CART:
    case ACTIONS.VIEW_CART:
      return executeOpenCart();
      
    case ACTIONS.OPEN_WISHLIST:
    case ACTIONS.VIEW_WISHLIST:
      return executeOpenWishlist();
      
    case ACTIONS.VIEW_ORDERS:
      return executeViewOrders(userEmail);
      
    case ACTIONS.VIEW_PRODUCTS:
      return executeViewProducts();
      
    case ACTIONS.GO_TO_HOME:
      return executeNavigate('Home', 'trang chủ');
      
    case ACTIONS.GO_TO_COMMUNITY:
      return executeNavigate('Community', 'cộng đồng');
      
    case ACTIONS.GO_TO_PREORDER:
      return executeNavigate('PreOrderLots', 'đặt trước');
      
    case ACTIONS.GO_TO_PROFILE:
      return executeNavigate('MyProfile', 'trang cá nhân');
      
    case ACTIONS.GO_TO_CONTACT:
      return executeNavigate('Contact', 'liên hệ');
      
    case ACTIONS.VIEW_REFERRAL:
      return executeNavigate('MyReferrals', 'chương trình giới thiệu');
      
    default:
      return failure('Action không được hỗ trợ', ErrorCodes.VALIDATION_ERROR);
  }
}

// ========== SPECIFIC ACTION HANDLERS ==========

/**
 * Open cart modal and return cart info
 */
function executeOpenCart() {
  const cart = userContextAPI.getCartItems();
  
  // Dispatch event to open cart
  setTimeout(() => {
    window.dispatchEvent(new Event('open-cart-widget'));
  }, 100);
  
  if (cart.isEmpty) {
    return success({
      action: ACTIONS.OPEN_CART,
      executed: true,
      contentType: 'markdown',
      content: `🛒 **Giỏ hàng trống**

Bạn chưa có sản phẩm nào trong giỏ hàng.

**Gợi ý cho bạn:**
- [Xem sản phẩm nổi bật](/Services)
- [Combo tiết kiệm](/Services?category=combo)
- Hỏi tôi "tư vấn sản phẩm" để được gợi ý!`
    });
  }
  
  // Format cart items
  const itemsList = cart.items.slice(0, 5).map(item => 
    `• ${item.name} (${item.quantity} ${item.unit}) - ${formatPrice(item.price * item.quantity)}`
  ).join('\n');
  
  const moreText = cart.items.length > 5 ? `\n• ...và ${cart.items.length - 5} sản phẩm khác` : '';
  
  return success({
    action: ACTIONS.OPEN_CART,
    executed: true,
    contentType: 'markdown',
    content: `🛒 **Giỏ hàng của bạn** (${cart.count} sản phẩm)

${itemsList}${moreText}

**Tổng cộng: ${formatPrice(cart.total)}**

_Tôi đã mở giỏ hàng cho bạn. Bạn có thể thanh toán ngay hoặc tiếp tục mua sắm!_`,
    cart: cart
  });
}

/**
 * Open wishlist modal and return wishlist info
 */
function executeOpenWishlist() {
  const wishlist = userContextAPI.getWishlistItems();
  
  // Dispatch event to open wishlist
  setTimeout(() => {
    window.dispatchEvent(new Event('open-wishlist-modal'));
  }, 100);
  
  if (wishlist.isEmpty) {
    return success({
      action: ACTIONS.OPEN_WISHLIST,
      executed: true,
      contentType: 'markdown',
      content: `❤️ **Danh sách yêu thích trống**

Bạn chưa lưu sản phẩm yêu thích nào.

**Mẹo:** Nhấn ❤️ trên sản phẩm để lưu vào danh sách yêu thích!`
    });
  }
  
  const itemsList = wishlist.items.slice(0, 5).map(item => 
    `• ${item.name} - ${formatPrice(item.price)}`
  ).join('\n');
  
  return success({
    action: ACTIONS.OPEN_WISHLIST,
    executed: true,
    contentType: 'markdown',
    content: `❤️ **Sản phẩm yêu thích** (${wishlist.count} sản phẩm)

${itemsList}

_Tôi đã mở danh sách yêu thích cho bạn!_`,
    wishlist: wishlist
  });
}

/**
 * Navigate to orders and show summary
 */
async function executeViewOrders(userEmail) {
  // Navigate to orders page
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('navigate-to', {
      detail: { page: 'MyOrders' }
    }));
  }, 100);
  
  if (!userEmail) {
    return success({
      action: ACTIONS.VIEW_ORDERS,
      executed: true,
      requiresAuth: true,
      contentType: 'markdown',
      content: `📦 **Xem đơn hàng**

Vui lòng đăng nhập để xem đơn hàng của bạn.`
    });
  }
  
  const ordersResult = await userContextAPI.getRecentOrders(userEmail, 3);
  
  if (!ordersResult.success || ordersResult.data.count === 0) {
    return success({
      action: ACTIONS.VIEW_ORDERS,
      executed: true,
      contentType: 'markdown',
      content: `📦 **Chưa có đơn hàng**

Bạn chưa đặt đơn hàng nào. [Xem sản phẩm](/Services) và đặt hàng ngay!`
    });
  }
  
  const { orders, count, pending_count, shipping_count } = ordersResult.data;
  
  const ordersList = orders.map(o => 
    `• #${o.order_number} - ${formatPrice(o.total)} (${getStatusLabel(o.status)})`
  ).join('\n');
  
  return success({
    action: ACTIONS.VIEW_ORDERS,
    executed: true,
    contentType: 'order_list',
    content: {
      title: `📦 Bạn có ${count} đơn hàng`,
      orders: orders,
      summary: { pending_count, shipping_count }
    },
    markdown: `📦 **Đơn hàng gần đây** (${count} đơn)

${ordersList}

${pending_count > 0 ? `⏳ ${pending_count} đơn chờ xác nhận\n` : ''}${shipping_count > 0 ? `🚚 ${shipping_count} đơn đang giao` : ''}

[Xem tất cả đơn hàng →](/MyOrders)`
  });
}

/**
 * Navigate to products page
 */
function executeViewProducts() {
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('navigate-to', {
      detail: { page: 'Services' }
    }));
  }, 100);
  
  return success({
    action: ACTIONS.VIEW_PRODUCTS,
    executed: true,
    contentType: 'markdown',
    content: `🥬 **Khám phá sản phẩm**

Đang chuyển bạn đến trang sản phẩm...

**Danh mục nổi bật:**
- 🥗 [Rau củ tươi](/Services?category=vegetables)
- 🍎 [Trái cây](/Services?category=fruits)
- 🍚 [Gạo hữu cơ](/Services?category=rice)
- 📦 [Combo tiết kiệm](/Services?category=combo)

Bạn muốn tôi tư vấn sản phẩm phù hợp không?`
  });
}

/**
 * Generic navigation
 */
function executeNavigate(pageName, displayName) {
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('navigate-to', {
      detail: { page: pageName }
    }));
  }, 100);
  
  return success({
    action: 'navigate',
    executed: true,
    contentType: 'markdown',
    content: `✨ Đang chuyển bạn đến **${displayName}**...`,
    navigateTo: pageName
  });
}

// ========== MAIN HANDLER ==========

/**
 * Handle action query
 * Returns: action response with executed flag
 */
export async function handleActionQuery(query, context = {}) {
  const { action, confidence, matchedKeyword } = detectAction(query);
  
  if (action === ACTIONS.UNKNOWN || confidence < 0.5) {
    return failure('Không nhận diện được action', ErrorCodes.VALIDATION_ERROR);
  }
  
  const result = await executeAction(action, context);
  
  if (result.success) {
    return success({
      ...result.data,
      intent: 'action',
      detectedAction: action,
      matchedKeyword,
      confidence,
      tokensUsed: 0 // No LLM needed
    });
  }
  
  return result;
}

// ========== HELPERS ==========

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

function getStatusLabel(status) {
  const labels = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'processing': 'Đang xử lý',
    'shipping': 'Đang giao',
    'delivered': 'Đã giao',
    'cancelled': 'Đã hủy'
  };
  return labels[status] || status;
}

// ========== EXPORTS ==========

export default {
  ACTIONS,
  detectAction,
  isActionIntent,
  executeAction,
  handleActionQuery
};
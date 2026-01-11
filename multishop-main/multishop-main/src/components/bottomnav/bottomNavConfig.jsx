/**
 * Bottom Navigation Configuration
 * 
 * Cấu hình context-aware navigation items cho từng trang.
 * Tuân thủ kiến trúc 3 lớp - đây là Config Layer.
 * 
 * Nguyên tắc:
 * - 1 item CỐ ĐỊNH: Sản phẩm (luôn có để quay lại shop)
 * - 4 items ĐỘNG: Thay đổi theo context của trang
 * - Giỏ hàng CHỈ hiển thị ở trang mua sắm (Services, ProductDetail, PreOrderLots)
 */

import { 
  Package, ShoppingCart, Heart, MessageCircle, Users,
  PenSquare, Bookmark, UserPlus, SlidersHorizontal, Layers,
  ClipboardList, Settings, Truck, Star, Share2, Phone, MapPin,
  MessageSquare, History, Bell, BookOpen, Home, RefreshCw,
  Library, BookMarked, Sparkles, FileText, Plus, ListTodo
} from 'lucide-react';

// ========== FIXED ITEMS (Luôn hiển thị) ==========
export const FIXED_ITEMS = {
  products: {
    id: 'products',
    icon: Package,
    label: 'Sản phẩm',
    type: 'navigate',
    path: 'Services',
    priority: 1
  },
  cart: {
    id: 'cart',
    icon: ShoppingCart,
    label: 'Giỏ hàng',
    type: 'event',
    event: 'open-cart-widget',
    highlight: true,
    showBadge: 'cart',
    priority: 2
  }
};

// ========== PAGES CÓ GIỎ HÀNG ==========
export const CART_ENABLED_PAGES = ['Services', 'ProductDetail', 'PreOrderLots', 'PreOrderProductDetail', 'FlipMode'];

// ========== CONTEXT ITEMS (Thay đổi theo trang) ==========
export const CONTEXT_ITEMS = {
  // Community
  createPost: {
    id: 'createPost',
    icon: PenSquare,
    label: 'Viết bài',
    type: 'event',
    event: 'open-create-post-modal'
  },
  savedPosts: {
    id: 'savedPosts',
    icon: Bookmark,
    label: 'Đã lưu',
    type: 'navigate',
    path: 'MySavedPosts'
  },
  following: {
    id: 'following',
    icon: UserPlus,
    label: 'Theo dõi',
    type: 'navigate',
    path: 'Community',
    params: '?tab=following'
  },
  
  // Services/Products
  filters: {
    id: 'filters',
    icon: SlidersHorizontal,
    label: 'Bộ lọc',
    type: 'event',
    event: 'toggle-filters'
  },
  flipMode: {
    id: 'flipMode',
    icon: Layers,
    label: 'FlipMode',
    type: 'navigate',
    path: 'FlipMode'
  },
  wishlist: {
    id: 'wishlist',
    icon: Heart,
    label: 'Yêu thích',
    type: 'event',
    event: 'open-wishlist-modal',
    showBadge: 'wishlist'
  },
  
  // Profile
  myOrders: {
    id: 'myOrders',
    icon: ClipboardList,
    label: 'Đơn hàng',
    type: 'navigate',
    path: 'MyOrders'
  },
  settings: {
    id: 'settings',
    icon: Settings,
    label: 'Cài đặt',
    type: 'navigate',
    path: 'MyProfile',
    params: '?tab=settings'
  },
  
  // Orders
  trackOrder: {
    id: 'trackOrder',
    icon: Truck,
    label: 'Theo dõi',
    type: 'event',
    event: 'track-order'
  },
  support: {
    id: 'support',
    icon: MessageCircle,
    label: 'Hỗ trợ',
    type: 'event',
    event: 'open-chatbot'
  },
  review: {
    id: 'review',
    icon: Star,
    label: 'Đánh giá',
    type: 'event',
    event: 'open-review-modal'
  },
  
  // Product Detail
  share: {
    id: 'share',
    icon: Share2,
    label: 'Chia sẻ',
    type: 'action',
    action: 'share'
  },
  
  // Blog
  comments: {
    id: 'comments',
    icon: MessageSquare,
    label: 'Bình luận',
    type: 'event',
    event: 'scroll-to-comments'
  },
  
  // Contact
  callPhone: {
    id: 'callPhone',
    icon: Phone,
    label: 'Gọi điện',
    type: 'external',
    href: 'tel:0123456789'
  },
  openMap: {
    id: 'openMap',
    icon: MapPin,
    label: 'Bản đồ',
    type: 'event',
    event: 'open-map'
  },
  
  // Default/Common
  community: {
    id: 'community',
    icon: Users,
    label: 'Cộng đồng',
    type: 'navigate',
    path: 'Community'
  },
  chat: {
    id: 'chat',
    icon: MessageCircle,
    label: 'Trợ lý',
    type: 'event',
    event: 'open-chatbot'
  },
  notifications: {
    id: 'notifications',
    icon: Bell,
    label: 'Thông báo',
    type: 'event',
    event: 'open-notification-modal'
  },
  history: {
    id: 'history',
    icon: History,
    label: 'Lịch sử',
    type: 'navigate',
    path: 'MyOrders'
  },
  blog: {
    id: 'blog',
    icon: BookOpen,
    label: 'Blog',
    type: 'navigate',
    path: 'Blog'
  },
  home: {
    id: 'home',
    icon: Home,
    label: 'Trang chủ',
    type: 'navigate',
    path: 'Home'
  },
  returns: {
    id: 'returns',
    icon: RefreshCw,
    label: 'Đổi trả',
    type: 'navigate',
    path: 'MyReturns'
  },
  
  // Book Library
  bookLibrary: {
    id: 'bookLibrary',
    icon: Library,
    label: 'Thư viện',
    type: 'navigate',
    path: 'BookLibrary'
  },
  myReadingList: {
    id: 'myReadingList',
    icon: BookMarked,
    label: 'Đang đọc',
    type: 'navigate',
    path: 'MyReadingList',
    showBadge: 'reading'
  },
  createBook: {
    id: 'createBook',
    icon: Plus,
    label: 'Tạo sách',
    type: 'event',
    event: 'open-create-book-modal'
  },
  featured: {
    id: 'featured',
    icon: Sparkles,
    label: 'Nổi bật',
    type: 'navigate',
    path: 'BookLibrary',
    params: '?featured=true'
  },
  
  // Blog enhanced
  blogPosts: {
    id: 'blogPosts',
    icon: FileText,
    label: 'Bài viết',
    type: 'navigate',
    path: 'Blog'
  }
};

// ========== PAGE CONTEXT MAPPING ==========
// contextItems: 4 items động (vì chỉ còn 1 fixed item là Sản phẩm)
// showCart: true nếu trang cần hiển thị giỏ hàng
export const PAGE_CONTEXT_CONFIG = {
  // Community Pages - Tích hợp Book Library
  Community: {
    contextItems: ['createPost', 'bookLibrary', 'savedPosts', 'following'],
    theme: 'community',
    showCart: false
  },
  MySavedPosts: {
    contextItems: ['createPost', 'community', 'bookLibrary', 'following'],
    theme: 'community',
    showCart: false
  },
  MyLikedPosts: {
    contextItems: ['createPost', 'savedPosts', 'bookLibrary', 'community'],
    theme: 'community',
    showCart: false
  },
  
  // Book Library Pages
  BookLibrary: {
    contextItems: ['myReadingList', 'createBook', 'community', 'blog'],
    theme: 'book',
    showCart: false
  },
  BookDetail: {
    contextItems: ['myReadingList', 'bookLibrary', 'share', 'community'],
    theme: 'book',
    showCart: false
  },
  BookEditor: {
    contextItems: ['bookLibrary', 'myReadingList', 'community', 'chat'],
    theme: 'book',
    showCart: false
  },
  MyReadingList: {
    contextItems: ['bookLibrary', 'createBook', 'community', 'home'],
    theme: 'book',
    showCart: false
  },
  
  // Product Pages - CÓ giỏ hàng
  Services: {
    contextItems: ['community', 'wishlist', 'chat'],
    theme: 'shop',
    showCart: true
  },
  FlipMode: {
    contextItems: ['wishlist', 'community', 'chat'],
    theme: 'shop',
    showCart: true
  },
  ProductDetail: {
    contextItems: ['wishlist', 'share', 'chat'],
    theme: 'shop',
    showCart: true
  },
  PreOrderLots: {
    contextItems: ['wishlist', 'history', 'chat'],
    theme: 'shop',
    showCart: true
  },
  PreOrderProductDetail: {
    contextItems: ['wishlist', 'share', 'chat'],
    theme: 'shop',
    showCart: true
  },
  
  // Profile Pages - Thay giỏ hàng bằng Trang chủ
  MyProfile: {
    contextItems: ['myOrders', 'wishlist', 'home', 'settings'],
    theme: 'profile',
    showCart: false
  },
  UserProfile: {
    contextItems: ['community', 'wishlist', 'home', 'chat'],
    theme: 'profile',
    showCart: false
  },
  
  // Order Pages - Thay giỏ hàng bằng Đổi trả / Hỗ trợ
  MyOrders: {
    contextItems: ['trackOrder', 'returns', 'home', 'support'],
    theme: 'orders',
    showCart: false
  },
  MyReturns: {
    contextItems: ['myOrders', 'home', 'support', 'chat'],
    theme: 'orders',
    showCart: false
  },
  
  // Content Pages - Tích hợp Book Library
  Blog: {
    contextItems: ['bookLibrary', 'savedPosts', 'share', 'community'],
    theme: 'content',
    showCart: false
  },
  BlogDetail: {
    contextItems: ['bookLibrary', 'comments', 'share', 'community'],
    theme: 'content',
    showCart: false
  },
  
  // Contact/Info Pages - Thay giỏ hàng bằng Home
  Contact: {
    contextItems: ['callPhone', 'openMap', 'home', 'chat'],
    theme: 'info',
    showCart: false
  },
  Team: {
    contextItems: ['community', 'home', 'chat', 'share'],
    theme: 'info',
    showCart: false
  },
  
  // Referral Pages - Thay giỏ hàng bằng Home
  MyReferrals: {
    contextItems: ['share', 'history', 'home', 'support'],
    theme: 'referral',
    showCart: false
  },
  
  // Notifications - Thay giỏ hàng bằng Home
  MyNotifications: {
    contextItems: ['community', 'myOrders', 'home', 'chat'],
    theme: 'default',
    showCart: false
  },
  
  // Wishlist - Có thể cần giỏ hàng vì user có thể mua từ wishlist
  MyWishlist: {
    contextItems: ['community', 'history', 'chat'],
    theme: 'shop',
    showCart: true
  },
  
  // Communications - Thay giỏ hàng bằng Home
  MyCommunications: {
    contextItems: ['myOrders', 'home', 'support', 'notifications'],
    theme: 'orders',
    showCart: false
  },
  
  // Home page - Tích hợp Book Library
  Home: {
    contextItems: ['community', 'bookLibrary', 'blog', 'chat'],
    theme: 'default',
    showCart: false
  }
};

// ========== DEFAULT CONFIG ==========
export const DEFAULT_CONTEXT_CONFIG = {
  contextItems: ['community', 'bookLibrary', 'home', 'chat'],
  theme: 'default',
  showCart: false
};

// ========== HELPER FUNCTIONS ==========

/**
 * Lấy config cho trang hiện tại
 */
export function getPageConfig(pageName) {
  return PAGE_CONTEXT_CONFIG[pageName] || DEFAULT_CONTEXT_CONFIG;
}

/**
 * Lấy danh sách items cho trang
 */
export function getNavItemsForPage(pageName) {
  const config = getPageConfig(pageName);
  
  // Fixed item: Sản phẩm (luôn có)
  const fixedProducts = FIXED_ITEMS.products;
  
  // Context items
  const context = config.contextItems
    .map(id => CONTEXT_ITEMS[id])
    .filter(Boolean);
  
  // Giỏ hàng chỉ hiển thị ở các trang shopping
  const showCart = config.showCart === true;
  
  if (showCart) {
    // Trang shopping: context + products + cart (5 items)
    return [...context, fixedProducts, FIXED_ITEMS.cart];
  } else {
    // Trang khác: context + products (5 items, không có cart)
    return [...context, fixedProducts];
  }
}

/**
 * Lấy theme cho trang
 */
export function getPageTheme(pageName) {
  const config = getPageConfig(pageName);
  return config.theme || 'default';
}

/**
 * Kiểm tra trang có hiển thị giỏ hàng không
 */
export function shouldShowCart(pageName) {
  const config = getPageConfig(pageName);
  return config.showCart === true;
}
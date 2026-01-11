/**
 * Core Types & DTOs for Data Layer
 * All services must use these types
 */

// ========== RESULT PATTERN ==========

/**
 * @typedef {Object} SuccessResult
 * @property {true} success
 * @property {*} data
 */

/**
 * @typedef {Object} FailureResult
 * @property {false} success
 * @property {string} message
 * @property {string} code - ErrorCode
 * @property {Object} [details] - Additional error details
 */

/**
 * @typedef {SuccessResult|FailureResult} Result
 */

/**
 * Create a success result
 * @template T
 * @param {T} data
 * @returns {SuccessResult}
 */
export const success = (data) => ({
  success: true,
  data
});

/**
 * Create a failure result
 * @param {string} message
 * @param {string} code - ErrorCode
 * @param {Object} [details]
 * @returns {FailureResult}
 */
export const failure = (message, code = ErrorCodes.UNKNOWN, details = null) => ({
  success: false,
  message,
  code,
  ...(details && { details })
});

// ========== ERROR CODES ==========

export const ErrorCodes = {
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Data
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Network/Server
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Business
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  REFERRAL_INELIGIBLE: 'REFERRAL_INELIGIBLE',
  
  // Generic
  UNKNOWN: 'UNKNOWN'
};

// ========== PAGINATION ==========

/**
 * @typedef {Object} PaginationParams
 * @property {number} page
 * @property {number} limit
 * @property {string} [sortBy]
 * @property {'asc'|'desc'} [sortOrder]
 */

/**
 * @typedef {Object} PaginatedResult
 * @property {Array} items
 * @property {number} total
 * @property {number} page
 * @property {number} limit
 * @property {number} totalPages
 */

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  sortBy: 'created_date',
  sortOrder: 'desc'
};

// ========== FILTER PARAMS ==========

/**
 * @typedef {Object} FilterParams
 * @property {string} [search]
 * @property {string} [status]
 * @property {string} [category]
 * @property {string} [dateFrom]
 * @property {string} [dateTo]
 */

// ========== ENTITY DTOs ==========

/**
 * @typedef {Object} ProductDTO
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} category
 * @property {number} price
 * @property {number} [sale_price]
 * @property {string} unit
 * @property {string} [image_url]
 * @property {string} [description]
 * @property {string} status
 * @property {number} stock_quantity
 * @property {number} rating_average
 * @property {number} rating_count
 */

/**
 * @typedef {Object} OrderDTO
 * @property {string} id
 * @property {string} order_number
 * @property {string} customer_name
 * @property {string} customer_email
 * @property {string} customer_phone
 * @property {Array} items
 * @property {number} subtotal
 * @property {number} total_amount
 * @property {string} order_status
 * @property {string} payment_status
 * @property {string} payment_method
 * @property {string} [shipping_address]
 * @property {string} created_date
 */

/**
 * @typedef {Object} CustomerDTO
 * @property {string} id
 * @property {string} full_name
 * @property {string} email
 * @property {string} phone
 * @property {string} [address]
 * @property {number} total_orders
 * @property {number} total_spent
 * @property {string} status
 */

/**
 * @typedef {Object} ReferralMemberDTO
 * @property {string} id
 * @property {string} user_email
 * @property {string} full_name
 * @property {string} referral_code
 * @property {string} status
 * @property {string} seeder_rank
 * @property {number} total_referred_customers
 * @property {number} total_referral_revenue
 * @property {number} unpaid_commission
 */

/**
 * @typedef {Object} NotificationDTO
 * @property {string} id
 * @property {string} recipient_email
 * @property {string} type
 * @property {string} title
 * @property {string} message
 * @property {boolean} is_read
 * @property {string} [link]
 * @property {string} created_date
 */

// ========== CREATE/UPDATE DTOs ==========

/**
 * @typedef {Object} ProductCreateDTO
 * @property {string} name
 * @property {string} category
 * @property {number} price
 * @property {string} unit
 * @property {string} [description]
 * @property {string} [image_url]
 * @property {number} [stock_quantity]
 */

/**
 * @typedef {Object} OrderCreateDTO
 * @property {string} customer_name
 * @property {string} customer_email
 * @property {string} customer_phone
 * @property {Array} items
 * @property {string} payment_method
 * @property {string} [shipping_address]
 * @property {string} [note]
 */

/**
 * @typedef {Object} ReferralRegisterDTO
 * @property {string} email
 * @property {string} fullName
 * @property {string} [phone]
 */

// ========== STATUS ENUMS ==========

export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned_refunded'
};

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const ProductStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock'
};

export const ReferralStatus = {
  PENDING: 'pending_approval',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
};

export const SeederRank = {
  NGUOI_GIEO_HAT: 'nguoi_gieo_hat',
  HAT_GIONG_KHOE: 'hat_giong_khoe',
  MAM_KHOE: 'mam_khoe',
  CHOI_KHOE: 'choi_khoe',
  CANH_KHOE: 'canh_khoe',
  CAY_KHOE: 'cay_khoe',
  DANH_HIEU: 'danh_hieu'
};

// ========== UI DISPLAY CONFIGS ==========

export const OrderStatusConfig = {
  [OrderStatus.PENDING]: { label: 'Chờ xác nhận', color: 'bg-amber-100 text-amber-700' },
  [OrderStatus.CONFIRMED]: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700' },
  [OrderStatus.PROCESSING]: { label: 'Đang xử lý', color: 'bg-indigo-100 text-indigo-700' },
  [OrderStatus.SHIPPING]: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700' },
  [OrderStatus.DELIVERED]: { label: 'Đã giao', color: 'bg-green-100 text-green-700' },
  [OrderStatus.CANCELLED]: { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
  [OrderStatus.RETURNED]: { label: 'Đã hoàn', color: 'bg-gray-100 text-gray-700' }
};

export const SeederRankConfig = {
  [SeederRank.NGUOI_GIEO_HAT]: { label: 'Người Gieo Hạt', color: 'bg-gray-100 text-gray-600' },
  [SeederRank.HAT_GIONG_KHOE]: { label: 'Hạt Giống Khỏe', color: 'bg-green-100 text-green-700' },
  [SeederRank.MAM_KHOE]: { label: 'Mầm Khỏe', color: 'bg-lime-100 text-lime-700' },
  [SeederRank.CHOI_KHOE]: { label: 'Chồi Khỏe', color: 'bg-emerald-100 text-emerald-700' },
  [SeederRank.CANH_KHOE]: { label: 'Cành Khỏe', color: 'bg-teal-100 text-teal-700' },
  [SeederRank.CAY_KHOE]: { label: 'Cây Khỏe', color: 'bg-amber-100 text-amber-700' },
  [SeederRank.DANH_HIEU]: { label: 'Danh Hiệu', color: 'bg-purple-100 text-purple-700' }
};
/**
 * Referral DTOs and Constants
 * Types Layer - Định nghĩa chuẩn cho toàn bộ module referral
 * 
 * @module features/referral/types
 */

// ========== STATUS ENUMS ==========

export const REFERRAL_STATUS = {
  PENDING: 'pending_approval',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  FRAUD_SUSPECT: 'fraud_suspect'
};

export const SEEDER_RANK = {
  NGUOI_GIEO_HAT: 'nguoi_gieo_hat',
  HAT_GIONG_KHOE: 'hat_giong_khoe',
  MAM_KHOE: 'mam_khoe',
  CHOI_KHOE: 'choi_khoe',
  CANH_KHOE: 'canh_khoe',
  CAY_KHOE: 'cay_khoe',
  DANH_HIEU: 'danh_hieu'
};

export const RANK_ORDER = [
  'nguoi_gieo_hat',
  'hat_giong_khoe',
  'mam_khoe',
  'choi_khoe',
  'canh_khoe',
  'cay_khoe',
  'danh_hieu'
];

export const EVENT_STATUS = {
  PENDING: 'pending',
  CALCULATED: 'calculated',
  PAID: 'paid',
  FRAUDULENT: 'fraudulent'
};

// ========== UI CONFIG ==========

export const RANK_CONFIG = {
  nguoi_gieo_hat: { label: 'Người Gieo Hạt', color: 'bg-gray-100 text-gray-700', icon: '🌱' },
  hat_giong_khoe: { label: 'Hạt Giống Khỏe', color: 'bg-green-100 text-green-700', icon: '🌿' },
  mam_khoe: { label: 'Mầm Khỏe', color: 'bg-emerald-100 text-emerald-700', icon: '🌾' },
  choi_khoe: { label: 'Chồi Khỏe', color: 'bg-teal-100 text-teal-700', icon: '🌳' },
  canh_khoe: { label: 'Cành Khỏe', color: 'bg-cyan-100 text-cyan-700', icon: '🪴' },
  cay_khoe: { label: 'Cây Khỏe', color: 'bg-blue-100 text-blue-700', icon: '🌲' },
  danh_hieu: { label: 'Danh Hiệu', color: 'bg-purple-100 text-purple-700', icon: '🏆' }
};

export const STATUS_CONFIG = {
  pending_approval: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
  active: { label: 'Hoạt động', color: 'bg-green-100 text-green-700' },
  suspended: { label: 'Đình chỉ', color: 'bg-red-100 text-red-700' },
  fraud_suspect: { label: 'Nghi vấn', color: 'bg-orange-100 text-orange-700' }
};

export const EVENT_STATUS_CONFIG = {
  pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-700' },
  calculated: { label: 'Đã tính', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700' },
  fraudulent: { label: 'Gian lận', color: 'bg-red-100 text-red-700' }
};

// ========== DEFAULT VALUES ==========

export const DEFAULT_COMMISSION_TIERS = [
  { min_revenue: 0, max_revenue: 10000000, rate: 1, label: '0 - 10 triệu' },
  { min_revenue: 10000000, max_revenue: 50000000, rate: 2, label: '10 - 50 triệu' },
  { min_revenue: 50000000, max_revenue: null, rate: 3, label: '> 50 triệu' }
];

export const DEFAULT_RANK_CONFIG = {
  nguoi_gieo_hat: { label: 'Người Gieo Hạt', f1_required: 0, bonus: 0 },
  hat_giong_khoe: { label: 'Hạt Giống Khỏe', f1_required: 7, bonus: 0.1 },
  mam_khoe: { label: 'Mầm Khỏe', f1_required: 7, f1_rank_required: 'hat_giong_khoe', bonus: 0.2 },
  choi_khoe: { label: 'Chồi Khỏe', f1_required: 7, f1_rank_required: 'mam_khoe', bonus: 0.3 },
  canh_khoe: { label: 'Cành Khỏe', f1_required: 7, f1_rank_required: 'choi_khoe', bonus: 0.4 },
  cay_khoe: { label: 'Cây Khỏe', f1_required: 7, f1_rank_required: 'canh_khoe', bonus: 0.5 },
  danh_hieu: { label: 'Danh Hiệu', f1_required: 1, f1_rank_required: 'cay_khoe', bonus: 0.5 }
};

/**
 * @typedef {Object} ReferralMemberDTO
 * @property {string} id
 * @property {string} user_email
 * @property {string} full_name
 * @property {string} [phone]
 * @property {string} referral_code
 * @property {string} referral_link
 * @property {string} status - REFERRAL_STATUS
 * @property {string} seeder_rank - SEEDER_RANK
 * @property {number} seeder_rank_bonus
 * @property {number} unpaid_commission
 * @property {number} total_paid_commission
 * @property {number} total_referral_revenue
 * @property {number} current_month_revenue
 * @property {number} total_referred_customers
 * @property {boolean} custom_rate_enabled
 * @property {number} [custom_commission_rate]
 * @property {number} [fraud_score]
 */

/**
 * @typedef {Object} ReferralEventDTO
 * @property {string} id
 * @property {string} referrer_id
 * @property {string} referrer_email
 * @property {string} referrer_name
 * @property {string} referred_customer_email
 * @property {string} referred_customer_name
 * @property {string} order_id
 * @property {string} order_number
 * @property {number} order_amount
 * @property {number} commission_rate
 * @property {number} commission_amount
 * @property {string} commission_tier
 * @property {string} status - EVENT_STATUS
 * @property {string} period_month
 * @property {boolean} [fraud_suspect]
 * @property {string} [fraud_reason]
 */

/**
 * @typedef {Object} ReferralSettingsDTO
 * @property {string} id
 * @property {string} setting_key
 * @property {boolean} is_program_enabled
 * @property {Array} commission_tiers
 * @property {Object} seeder_rank_config
 * @property {number} min_orders_for_referrer
 * @property {boolean} enable_referrer_order_check
 * @property {boolean} require_admin_approval
 * @property {boolean} enable_fraud_detection
 * @property {number} fraud_threshold_score
 * @property {number} min_payout_amount
 */

/**
 * @typedef {Object} CommissionResult
 * @property {number} commission_rate
 * @property {string} commission_tier
 * @property {number} commission_amount
 * @property {number} order_amount
 * @property {number} current_month_revenue
 * @property {boolean} is_custom_rate
 */

/**
 * @typedef {Object} MemberRegisterDTO
 * @property {string} email
 * @property {string} fullName
 * @property {string} [phone]
 */

/**
 * @typedef {Object} CustomerRegisterDTO
 * @property {string} referrerId
 * @property {string} customerPhone
 * @property {string} customerName
 * @property {string} [customerEmail]
 */
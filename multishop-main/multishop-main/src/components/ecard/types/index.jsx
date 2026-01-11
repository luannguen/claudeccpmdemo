/**
 * E-Card Module - Types & DTOs
 * Type definitions exported for external use
 */

// Care Levels
export const CARE_LEVELS = {
  NORMAL: 'normal',
  VIP: 'vip',
  PREMIUM: 'premium'
};

export const CARE_LEVEL_CONFIG = {
  [CARE_LEVELS.NORMAL]: {
    name: 'Bình thường',
    color: 'bg-gray-100 text-gray-800',
    icon: 'User',
    minGiftValue: 0,
    maxGiftValue: 200000,
    benefits: ['Lưu thông tin liên hệ', 'Gửi quà cơ bản'],
    reminderFrequency: 'never'
  },
  [CARE_LEVELS.VIP]: {
    name: 'VIP',
    color: 'bg-blue-100 text-blue-800',
    icon: 'Star',
    minGiftValue: 200000,
    maxGiftValue: 1000000,
    benefits: ['Tất cả quyền lợi Normal', 'Gợi ý quà VIP', 'Nhắc nhở tự động'],
    reminderFrequency: 'quarterly'
  },
  [CARE_LEVELS.PREMIUM]: {
    name: 'Premium',
    color: 'bg-purple-100 text-purple-800',
    icon: 'Crown',
    minGiftValue: 1000000,
    maxGiftValue: null,
    benefits: ['Tất cả quyền lợi VIP', 'Quà cao cấp', 'Chăm sóc ưu tiên', 'Tư vấn cá nhân hóa'],
    reminderFrequency: 'monthly'
  }
};

// Connection Methods
export const CONNECTION_METHODS = {
  QR_SCAN: 'qr_scan',
  PHONE_SEARCH: 'phone_search',
  EMAIL_SEARCH: 'email_search',
  LINK_SHARE: 'link_share',
  MANUAL: 'manual'
};

// Connection Status
export const CONNECTION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  BLOCKED: 'blocked'
};

// Gift Status
export const GIFT_STATUS = {
  PENDING: 'pending',
  SENT: 'sent',
  REDEEMED: 'redeemed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired'
};

// Design Templates
export const DESIGN_TEMPLATES = [
  'minimal',
  'nature',
  'professional',
  'creative',
  'elegant'
];

// Default theme color
export const DEFAULT_THEME_COLOR = '#7CB342';

// Gift expiry
export const GIFT_EXPIRY_DAYS = 90;

/**
 * @typedef {Object} EcardProfileDTO
 * @property {string} user_id
 * @property {string} public_url_slug
 * @property {string} display_name
 * @property {string} [profile_image_url]
 * @property {string} [title_profession]
 * @property {string} [company_name]
 * @property {string} [bio]
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [website]
 * @property {string} [address]
 * @property {Object} [contact_visibility]
 * @property {Array} [social_links]
 * @property {Array} [custom_fields]
 * @property {string} [design_template]
 * @property {string} [theme_color]
 * @property {string} [qr_code_url]
 * @property {boolean} [is_public]
 * @property {number} [view_count]
 */

/**
 * @typedef {Object} ConnectionDTO
 * @property {string} initiator_user_id
 * @property {string} target_user_id
 * @property {string} [target_name]
 * @property {string} [target_avatar]
 * @property {string} [target_title]
 * @property {string} [target_company]
 * @property {string} status
 * @property {string} connection_method
 * @property {string} care_level
 * @property {string} [notes]
 * @property {Array<string>} [tags]
 * @property {string} [last_interaction_date]
 * @property {number} [gift_count]
 */

/**
 * @typedef {Object} GiftDTO
 * @property {string} sender_user_id
 * @property {string} receiver_user_id
 * @property {string} [connection_id]
 * @property {string} item_id
 * @property {string} item_type
 * @property {string} [item_name]
 * @property {number} item_value
 * @property {string} [message]
 * @property {string} status
 * @property {string} [redemption_code]
 * @property {string} [sent_date]
 * @property {string} [redeemed_date]
 * @property {string} [expires_at]
 */
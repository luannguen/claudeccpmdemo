/**
 * Delivery Policies
 * Rules for gift delivery modes
 */

export const DELIVERY_MODE = {
  INSTANT: 'instant',
  SCHEDULED: 'scheduled',
  REDEEM_REQUIRED: 'redeem_required'
};

export const OCCASION = {
  BIRTHDAY: 'birthday',
  ANNIVERSARY: 'anniversary',
  HOLIDAY: 'holiday',
  THANK_YOU: 'thank_you',
  CONGRATULATIONS: 'congratulations',
  OTHER: 'other'
};

/**
 * Delivery mode configurations
 */
export const DELIVERY_MODE_CONFIG = {
  [DELIVERY_MODE.INSTANT]: {
    label: 'Gửi ngay',
    description: 'Người nhận có thể đổi quà ngay sau khi bạn thanh toán',
    icon: 'Zap',
    requiresDate: false,
    autoRedeemable: true
  },
  [DELIVERY_MODE.SCHEDULED]: {
    label: 'Gửi vào ngày...',
    description: 'Quà sẽ được gửi vào ngày bạn chọn',
    icon: 'Calendar',
    requiresDate: true,
    autoRedeemable: false
  },
  [DELIVERY_MODE.REDEEM_REQUIRED]: {
    label: 'Người nhận tự đổi',
    description: 'Người nhận sẽ chọn thời gian và địa chỉ nhận quà',
    icon: 'Gift',
    requiresDate: false,
    autoRedeemable: true
  }
};

/**
 * Occasion configurations
 */
export const OCCASION_CONFIG = {
  [OCCASION.BIRTHDAY]: {
    label: 'Sinh nhật',
    emoji: '🎂',
    defaultMessage: 'Chúc mừng sinh nhật!'
  },
  [OCCASION.ANNIVERSARY]: {
    label: 'Kỷ niệm',
    emoji: '💝',
    defaultMessage: 'Chúc mừng kỷ niệm!'
  },
  [OCCASION.HOLIDAY]: {
    label: 'Lễ tết',
    emoji: '🎊',
    defaultMessage: 'Chúc mừng năm mới!'
  },
  [OCCASION.THANK_YOU]: {
    label: 'Cảm ơn',
    emoji: '🙏',
    defaultMessage: 'Cảm ơn bạn rất nhiều!'
  },
  [OCCASION.CONGRATULATIONS]: {
    label: 'Chúc mừng',
    emoji: '🎉',
    defaultMessage: 'Xin chúc mừng bạn!'
  },
  [OCCASION.OTHER]: {
    label: 'Khác',
    emoji: '🎁',
    defaultMessage: ''
  }
};

/**
 * Get expiry date (90 days from sent)
 */
export const getExpiryDate = (sentDate = new Date()) => {
  const expiry = new Date(sentDate);
  expiry.setDate(expiry.getDate() + 90);
  return expiry;
};

/**
 * Check if scheduled date is valid
 */
export const isValidScheduledDate = (date) => {
  const selected = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return selected >= today;
};
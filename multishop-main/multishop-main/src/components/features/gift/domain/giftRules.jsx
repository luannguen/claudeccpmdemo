/**
 * Gift Business Rules
 * Domain logic for gift operations
 */

import { GIFT_STATUS } from './giftStateMachine';

/**
 * Validate gift can be sent
 */
export const canSendGift = (buyer, receiver) => {
  // Cannot send to self
  if (buyer.id === receiver.user_id) {
    return { valid: false, reason: 'Không thể tặng quà cho chính mình' };
  }

  // Buyer must be authenticated
  if (!buyer.email) {
    return { valid: false, reason: 'Bạn cần đăng nhập để gửi quà' };
  }

  return { valid: true };
};

/**
 * Validate delivery mode and date
 */
export const validateDeliveryMode = (mode, scheduledDate) => {
  if (mode === 'scheduled') {
    if (!scheduledDate) {
      return { valid: false, reason: 'Vui lòng chọn ngày giao' };
    }
    
    const selectedDate = new Date(scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { valid: false, reason: 'Ngày giao phải là hôm nay hoặc sau' };
    }
  }

  return { valid: true };
};

/**
 * Determine if gift should be redeemable immediately
 */
export const shouldBeRedeemableNow = (gift) => {
  if (gift.status !== GIFT_STATUS.SENT) return false;

  // Instant delivery
  if (gift.delivery_mode === 'instant') return true;

  // Scheduled delivery - check date
  if (gift.delivery_mode === 'scheduled') {
    if (!gift.scheduled_delivery_date) return false;
    const scheduledDate = new Date(gift.scheduled_delivery_date);
    const now = new Date();
    return now >= scheduledDate;
  }

  // Redeem required - redeemable immediately after sent
  if (gift.delivery_mode === 'redeem_required') return true;

  return false;
};

/**
 * Validate swap product value
 */
export const canSwapToProduct = (originalGift, newProduct) => {
  if (!originalGift.can_swap) {
    return { valid: false, reason: 'Quà này không cho phép đổi' };
  }

  if (originalGift.status !== GIFT_STATUS.REDEEMABLE) {
    return { valid: false, reason: 'Chỉ có thể đổi quà ở trạng thái chờ đổi' };
  }

  // New product value must be <= original
  if (newProduct.price > originalGift.item_value) {
    return { valid: false, reason: 'Chỉ có thể đổi sang quà cùng giá hoặc rẻ hơn' };
  }

  return { valid: true };
};

/**
 * Calculate refund amount for swap
 */
export const calculateSwapRefund = (originalValue, newValue) => {
  const refund = originalValue - newValue;
  return refund > 0 ? refund : 0;
};

/**
 * Validate redemption info
 */
export const validateRedemptionInfo = (shippingInfo) => {
  if (!shippingInfo.phone) {
    return { valid: false, reason: 'Vui lòng nhập số điện thoại' };
  }

  if (!shippingInfo.address) {
    return { valid: false, reason: 'Vui lòng nhập địa chỉ giao hàng' };
  }

  return { valid: true };
};
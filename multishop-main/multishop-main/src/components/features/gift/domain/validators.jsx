/**
 * Gift Validators
 * Input validation logic
 */

import { success, failure, ErrorCodes } from '@/components/data/types';

/**
 * Validate gift order items
 */
export const validateGiftOrderItems = (items) => {
  if (!items || items.length === 0) {
    return failure('Vui lòng chọn sản phẩm quà tặng', ErrorCodes.VALIDATION_ERROR);
  }

  // Gift order should have only 1 item
  if (items.length > 1) {
    return failure('Mỗi quà chỉ được tặng 1 sản phẩm', ErrorCodes.VALIDATION_ERROR);
  }

  const item = items[0];
  if (!item.product_id || !item.price || item.price <= 0) {
    return failure('Thông tin sản phẩm không hợp lệ', ErrorCodes.VALIDATION_ERROR);
  }

  return success(true);
};

/**
 * Validate gift receiver
 */
export const validateReceiver = (receiver) => {
  if (!receiver.user_id) {
    return failure('Vui lòng chọn người nhận', ErrorCodes.VALIDATION_ERROR);
  }

  if (!receiver.name) {
    return failure('Thiếu tên người nhận', ErrorCodes.VALIDATION_ERROR);
  }

  return success(true);
};

/**
 * Validate shipping info for redemption
 */
export const validateShippingInfo = (shippingInfo) => {
  if (!shippingInfo.phone || shippingInfo.phone.trim().length < 10) {
    return failure('Số điện thoại không hợp lệ', ErrorCodes.VALIDATION_ERROR);
  }

  if (!shippingInfo.address || shippingInfo.address.trim().length < 10) {
    return failure('Địa chỉ giao hàng không hợp lệ', ErrorCodes.VALIDATION_ERROR);
  }

  return success(true);
};

/**
 * Validate scheduled date
 */
export const validateScheduledDate = (date) => {
  if (!date) {
    return failure('Vui lòng chọn ngày giao', ErrorCodes.VALIDATION_ERROR);
  }

  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) {
    return failure('Ngày giao phải là hôm nay hoặc sau', ErrorCodes.VALIDATION_ERROR);
  }

  // Max 365 days in future
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 365);

  if (selectedDate > maxDate) {
    return failure('Ngày giao không được quá 1 năm', ErrorCodes.VALIDATION_ERROR);
  }

  return success(true);
};

/**
 * Validate redemption code format
 */
export const validateRedemptionCode = (code) => {
  if (!code || typeof code !== 'string') {
    return failure('Mã đổi quà không hợp lệ', ErrorCodes.VALIDATION_ERROR);
  }

  // Format: GIFT-timestamp-random
  const pattern = /^GIFT-\d+-[A-Z0-9]{6,}$/;
  if (!pattern.test(code)) {
    return failure('Định dạng mã đổi quà không đúng', ErrorCodes.VALIDATION_ERROR);
  }

  return success(true);
};
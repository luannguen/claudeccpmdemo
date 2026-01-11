/**
 * Checkout Business Rules
 * Domain Layer - Business logic decisions
 * 
 * @module features/checkout/domain/checkoutRules
 */

import { PAYMENT_METHODS } from '../types/CheckoutDTO';

/**
 * Check if user can proceed to checkout
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @returns {boolean}
 */
export function canCheckout(cartItems) {
  return cartItems && cartItems.length > 0;
}

/**
 * Check if cart requires deposit payment
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @returns {boolean}
 */
export function requiresDeposit(cartItems) {
  return cartItems.some(item => 
    item.is_preorder && (item.deposit_percentage || 100) < 100
  );
}

/**
 * Check if referral code can be applied
 * @param {string} customerEmail
 * @param {string} referrerEmail
 * @returns {boolean}
 */
export function canApplyReferral(customerEmail, referrerEmail) {
  if (!customerEmail || !referrerEmail) return false;
  return customerEmail.toLowerCase() !== referrerEmail.toLowerCase();
}

/**
 * Check if payment method is valid for order
 * @param {string} paymentMethod
 * @param {number} total
 * @returns {boolean}
 */
export function isValidPaymentMethod(paymentMethod, total) {
  const validMethods = Object.values(PAYMENT_METHODS);
  if (!validMethods.includes(paymentMethod)) return false;
  
  // COD has max amount limit (optional rule)
  // if (paymentMethod === PAYMENT_METHODS.COD && total > 5000000) {
  //   return false;
  // }
  
  return true;
}

/**
 * Get default payment status based on payment method
 * @param {string} paymentMethod
 * @returns {string}
 */
export function getInitialPaymentStatus(paymentMethod) {
  if (paymentMethod === PAYMENT_METHODS.COD) {
    return 'pending';
  }
  return 'awaiting_confirmation';
}

/**
 * Check if payment confirmation is needed
 * @param {string} paymentMethod
 * @returns {boolean}
 */
export function needsPaymentConfirmation(paymentMethod) {
  return paymentMethod !== PAYMENT_METHODS.COD;
}

/**
 * Check if order can be cancelled
 * @param {string} orderStatus
 * @param {string} paymentStatus
 * @returns {boolean}
 */
export function canCancelOrder(orderStatus, paymentStatus) {
  const nonCancellableStatuses = ['shipping', 'delivered', 'cancelled', 'returned_refunded'];
  return !nonCancellableStatuses.includes(orderStatus);
}

/**
 * Get step title
 * @param {number} step
 * @returns {string}
 */
export function getStepTitle(step) {
  const titles = {
    1: 'Giỏ Hàng & Thông Tin',
    2: 'Thanh Toán',
    3: 'Xác Nhận Thanh Toán',
    4: 'Hoàn Tất Đơn Hàng'
  };
  return titles[step] || 'Thanh Toán';
}

/**
 * Get order success message
 * @param {string} paymentMethod
 * @param {boolean} hasPreorder
 * @returns {string}
 */
export function getSuccessMessage(paymentMethod, hasPreorder) {
  if (hasPreorder) {
    return 'Đơn hàng đặt trước đã được tạo thành công! Chúng tôi sẽ thông báo khi hàng sẵn sàng.';
  }
  if (paymentMethod === PAYMENT_METHODS.COD) {
    return 'Đơn hàng đã được tạo thành công! Vui lòng thanh toán khi nhận hàng.';
  }
  return 'Đơn hàng đã được tạo thành công!';
}

export default {
  canCheckout,
  requiresDeposit,
  canApplyReferral,
  isValidPaymentMethod,
  getInitialPaymentStatus,
  needsPaymentConfirmation,
  canCancelOrder,
  getStepTitle,
  getSuccessMessage
};
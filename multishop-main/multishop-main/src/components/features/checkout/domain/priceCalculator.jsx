/**
 * Price Calculator - Pure calculation functions
 * Domain Layer - No external dependencies
 * 
 * @module features/checkout/domain/priceCalculator
 */

// Constants
const FREE_SHIPPING_THRESHOLD = 200000;
const SHIPPING_FEE = 30000;
const DISCOUNT_THRESHOLD = 500000;
const DISCOUNT_AMOUNT = 50000;

/**
 * Calculate cart subtotal
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @returns {number}
 */
export function calculateSubtotal(cartItems) {
  if (!cartItems || cartItems.length === 0) return 0;
  return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Calculate shipping fee based on subtotal
 * @param {number} subtotal
 * @returns {number}
 */
export function calculateShippingFee(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
}

/**
 * Calculate discount based on subtotal
 * @param {number} subtotal
 * @returns {number}
 */
export function calculateDiscount(subtotal) {
  return subtotal >= DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0;
}

/**
 * Calculate total amount
 * @param {number} subtotal
 * @param {number} shippingFee
 * @param {number} discount
 * @returns {number}
 */
export function calculateTotal(subtotal, shippingFee, discount) {
  return subtotal + shippingFee - discount;
}

/**
 * Calculate all checkout values
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @returns {Object} { subtotal, shippingFee, discount, total }
 */
export function calculateCheckoutTotals(cartItems) {
  const subtotal = calculateSubtotal(cartItems);
  const shippingFee = calculateShippingFee(subtotal);
  const discount = calculateDiscount(subtotal);
  const total = calculateTotal(subtotal, shippingFee, discount);
  
  return {
    subtotal,
    shippingFee,
    discount,
    total
  };
}

/**
 * Format currency for display
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return amount.toLocaleString('vi-VN') + 'đ';
}

/**
 * Check if order qualifies for free shipping
 * @param {number} subtotal
 * @returns {boolean}
 */
export function qualifiesForFreeShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD;
}

/**
 * Check if order qualifies for discount
 * @param {number} subtotal
 * @returns {boolean}
 */
export function qualifiesForDiscount(subtotal) {
  return subtotal >= DISCOUNT_THRESHOLD;
}

/**
 * Get amount needed for free shipping
 * @param {number} subtotal
 * @returns {number}
 */
export function amountNeededForFreeShipping(subtotal) {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return FREE_SHIPPING_THRESHOLD - subtotal;
}

export default {
  calculateSubtotal,
  calculateShippingFee,
  calculateDiscount,
  calculateTotal,
  calculateCheckoutTotals,
  formatCurrency,
  qualifiesForFreeShipping,
  qualifiesForDiscount,
  amountNeededForFreeShipping,
  // Export constants for reference
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE,
  DISCOUNT_THRESHOLD,
  DISCOUNT_AMOUNT
};
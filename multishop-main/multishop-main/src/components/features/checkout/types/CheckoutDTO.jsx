/**
 * Checkout DTOs - Type definitions
 * Types Layer - Pure type exports
 * 
 * @module features/checkout/types
 */

/**
 * @typedef {Object} CartItemDTO
 * @property {string} id - Item ID
 * @property {string} product_id - Product ID
 * @property {string} name - Product name
 * @property {number} price - Unit price
 * @property {number} quantity - Quantity
 * @property {string} [image] - Image URL
 * @property {boolean} [is_preorder] - Is preorder item
 * @property {string} [lot_id] - Lot ID for preorder
 * @property {number} [deposit_percentage] - Deposit percentage (30-100)
 * @property {string} [estimated_harvest_date] - Estimated harvest date
 * @property {number} [moq] - Minimum order quantity
 */

/**
 * @typedef {Object} CustomerInfoDTO
 * @property {string} name - Full name
 * @property {string} email - Email address
 * @property {string} phone - Phone number
 * @property {string} address - Street address
 * @property {string} city - City/Province
 * @property {string} district - District
 * @property {string} [ward] - Ward
 * @property {string} [note] - Order note
 */

/**
 * @typedef {Object} CalculationDTO
 * @property {number} subtotal - Cart subtotal
 * @property {number} shippingFee - Shipping fee
 * @property {number} discount - Discount amount
 * @property {number} total - Total amount
 * @property {boolean} hasPreorderItems - Has preorder items
 * @property {number} depositAmount - Deposit amount
 * @property {number} remainingAmount - Remaining amount
 * @property {number} depositPercentage - Average deposit percentage
 * @property {string} [estimatedHarvestDate] - Earliest harvest date
 * @property {boolean} hasDeposit - Requires deposit payment
 */

/**
 * @typedef {Object} CheckoutStateDTO
 * @property {number} step - Current step (1-4)
 * @property {CartItemDTO[]} cartItems - Cart items
 * @property {string} paymentMethod - Selected payment method
 * @property {boolean} isSubmitting - Is submitting order
 * @property {boolean} orderSuccess - Order created successfully
 * @property {string} [orderNumber] - Created order number
 * @property {Object} [createdOrder] - Created order object
 */

/**
 * @typedef {Object} OrderCreateDTO
 * @property {CartItemDTO[]} cartItems
 * @property {CustomerInfoDTO} customerInfo
 * @property {string} paymentMethod
 * @property {CalculationDTO} calculations
 * @property {boolean} hasPreorderItems
 * @property {Object} [depositInfo]
 * @property {string} [referralCode]
 */

/**
 * @typedef {Object} OrderResultDTO
 * @property {Object} order - Created order
 * @property {string} orderNumber - Order number
 * @property {Object} [depositInfo] - Deposit info if preorder
 */

// Payment method types
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  COD: 'cod',
  MOMO: 'momo',
  VNPAY: 'vnpay'
};

// Checkout steps
export const CHECKOUT_STEPS = {
  CART_INFO: 1,
  PAYMENT: 2,
  CONFIRM: 3,
  SUCCESS: 4
};

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned_refunded'
};

// Payment status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  AWAITING_CONFIRMATION: 'awaiting_confirmation',
  AWAITING_VERIFICATION: 'awaiting_verification',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export default {
  PAYMENT_METHODS,
  CHECKOUT_STEPS,
  ORDER_STATUS,
  PAYMENT_STATUS
};
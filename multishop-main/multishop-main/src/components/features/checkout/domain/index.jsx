/**
 * Checkout Domain Layer - Public exports
 * 
 * @module features/checkout/domain
 */

export { default as validators, validateCustomerInfo, validateCart, validateLotAvailability, isCustomerInfoComplete } from './validators';
export { default as priceCalculator, calculateSubtotal, calculateShippingFee, calculateDiscount, calculateTotal, calculateCheckoutTotals, formatCurrency } from './priceCalculator';
export { default as depositCalculator, calculateDepositForItems, enrichCartItemsWithDeposit, adjustDepositWithFees, hasPreorderItems } from './depositCalculator';
export { default as checkoutRules, canCheckout, requiresDeposit, canApplyReferral, getStepTitle, needsPaymentConfirmation } from './checkoutRules';
export { default as cartHelpers, updateItemQuantity, removeItem, addItem, persistCart, clearCart, generateOrderNumber } from './cartHelpers';
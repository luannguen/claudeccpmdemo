/**
 * Deposit Calculator - Pre-order deposit logic
 * Domain Layer - Pure calculations
 * 
 * @module features/checkout/domain/depositCalculator
 */

/**
 * Calculate deposit info for cart items
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @returns {Object} Deposit calculation result
 */
export function calculateDepositForItems(cartItems) {
  let totalDeposit = 0;
  let totalRemaining = 0;
  let earliestHarvestDate = null;
  let avgDepositPercentage = 100;

  const preorderItems = cartItems.filter(item => item.is_preorder);
  
  if (preorderItems.length === 0) {
    return {
      depositAmount: 0,
      remainingAmount: 0,
      hasDeposit: false,
      depositPercentage: 100,
      estimatedHarvestDate: null
    };
  }

  let totalDepositPercentage = 0;
  
  preorderItems.forEach(item => {
    const depositPct = item.deposit_percentage || 100;
    const itemTotal = item.price * item.quantity;
    const itemDeposit = Math.round(itemTotal * depositPct / 100);
    const itemRemaining = itemTotal - itemDeposit;
    
    totalDeposit += itemDeposit;
    totalRemaining += itemRemaining;
    totalDepositPercentage += depositPct;

    if (item.estimated_harvest_date) {
      const harvestDate = new Date(item.estimated_harvest_date);
      if (!earliestHarvestDate || harvestDate < earliestHarvestDate) {
        earliestHarvestDate = harvestDate;
      }
    }
  });

  avgDepositPercentage = Math.round(totalDepositPercentage / preorderItems.length);

  // Regular items are paid in full
  const regularItems = cartItems.filter(item => !item.is_preorder);
  regularItems.forEach(item => {
    totalDeposit += item.price * item.quantity;
  });

  return {
    depositAmount: totalDeposit,
    remainingAmount: totalRemaining,
    hasDeposit: avgDepositPercentage < 100,
    depositPercentage: avgDepositPercentage,
    estimatedHarvestDate: earliestHarvestDate ? earliestHarvestDate.toISOString() : null
  };
}

/**
 * Enrich cart items with deposit info from lots
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @param {Object[]} lots - Lot data
 * @returns {import('../types/CheckoutDTO').CartItemDTO[]}
 */
export function enrichCartItemsWithDeposit(cartItems, lots = []) {
  return cartItems.map(item => {
    if (!item.is_preorder || !item.lot_id) {
      return { ...item, deposit_percentage: 100 };
    }

    const lot = lots.find(l => l.id === item.lot_id);
    const depositPct = lot?.deposit_percentage || item.deposit_percentage || 100;
    const itemTotal = item.price * item.quantity;
    const depositAmt = Math.round(itemTotal * depositPct / 100);

    return {
      ...item,
      deposit_percentage: depositPct,
      deposit_amount: depositAmt,
      estimated_harvest_date: lot?.estimated_harvest_date || item.estimated_harvest_date
    };
  });
}

/**
 * Adjust deposit with shipping and discount
 * @param {Object} depositInfo - Base deposit calculation
 * @param {number} shippingFee - Shipping fee
 * @param {number} discount - Discount amount
 * @param {number} total - Total order amount
 * @returns {Object} Adjusted deposit info
 */
export function adjustDepositWithFees(depositInfo, shippingFee, discount, total) {
  if (!depositInfo.hasDeposit) {
    return depositInfo;
  }
  
  // Add shipping to deposit, apply discount proportionally
  const depositRatio = depositInfo.depositAmount / (depositInfo.depositAmount + depositInfo.remainingAmount);
  const discountOnDeposit = Math.round(discount * depositRatio);
  const finalDepositAmount = depositInfo.depositAmount + shippingFee - discountOnDeposit;
  const finalRemainingAmount = total - finalDepositAmount;
  
  return {
    ...depositInfo,
    depositAmount: finalDepositAmount,
    remainingAmount: Math.max(0, finalRemainingAmount)
  };
}

/**
 * Check if cart has preorder items
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @returns {boolean}
 */
export function hasPreorderItems(cartItems) {
  return cartItems.some(item => item.is_preorder);
}

/**
 * Get preorder items only
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @returns {import('../types/CheckoutDTO').CartItemDTO[]}
 */
export function getPreorderItems(cartItems) {
  return cartItems.filter(item => item.is_preorder);
}

/**
 * Get regular items only
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @returns {import('../types/CheckoutDTO').CartItemDTO[]}
 */
export function getRegularItems(cartItems) {
  return cartItems.filter(item => !item.is_preorder);
}

export default {
  calculateDepositForItems,
  enrichCartItemsWithDeposit,
  adjustDepositWithFees,
  hasPreorderItems,
  getPreorderItems,
  getRegularItems
};
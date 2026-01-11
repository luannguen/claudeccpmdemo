/**
 * useCheckoutCalculations - Price calculations hook
 * Hooks Layer - Single Goal: Price/deposit calculations
 * 
 * @module features/checkout/hooks/useCheckoutCalculations
 */

import { useMemo } from 'react';
import { priceCalculator, depositCalculator } from '../domain';

/**
 * Calculate all checkout values
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @returns {import('../types/CheckoutDTO').CalculationDTO}
 */
export function useCheckoutCalculations(cartItems) {
  return useMemo(() => {
    // Base price calculations
    const subtotal = priceCalculator.calculateSubtotal(cartItems);
    const shippingFee = priceCalculator.calculateShippingFee(subtotal);
    const discount = priceCalculator.calculateDiscount(subtotal);
    const total = priceCalculator.calculateTotal(subtotal, shippingFee, discount);
    
    // Deposit calculations for preorder
    const hasPreorderItems = depositCalculator.hasPreorderItems(cartItems);
    const baseDepositInfo = depositCalculator.calculateDepositForItems(cartItems);
    
    // Adjust deposit with shipping and discount
    const adjustedDeposit = depositCalculator.adjustDepositWithFees(
      baseDepositInfo,
      shippingFee,
      discount,
      total
    );
    
    return {
      subtotal,
      shippingFee,
      discount,
      total,
      hasPreorderItems,
      depositAmount: adjustedDeposit.depositAmount,
      remainingAmount: adjustedDeposit.remainingAmount,
      depositPercentage: adjustedDeposit.depositPercentage,
      estimatedHarvestDate: adjustedDeposit.estimatedHarvestDate,
      hasDeposit: adjustedDeposit.hasDeposit
    };
  }, [cartItems]);
}

export default useCheckoutCalculations;
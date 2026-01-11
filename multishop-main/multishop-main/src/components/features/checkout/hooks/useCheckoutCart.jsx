/**
 * useCheckoutCart - Cart operations hook
 * Hooks Layer - Single Goal: Cart management
 * 
 * @module features/checkout/hooks/useCheckoutCart
 */

import { useCallback } from 'react';
import { cartHelpers } from '../domain';

/**
 * Manage cart operations within checkout
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @param {Function} setCartItems
 * @returns {Object} Cart actions
 */
export function useCheckoutCart(cartItems, setCartItems) {
  /**
   * Update item quantity
   */
  const updateQuantity = useCallback((itemId, newQuantity) => {
    const updated = cartHelpers.updateItemQuantity(cartItems, itemId, newQuantity);
    setCartItems(updated);
    // Persist to localStorage
    cartHelpers.persistCart(updated);
  }, [cartItems, setCartItems]);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback((itemId) => {
    const updated = cartHelpers.removeItem(cartItems, itemId);
    setCartItems(updated);
    // Persist to localStorage
    cartHelpers.persistCart(updated);
    
    // Dispatch event if cart is empty
    if (updated.length === 0) {
      window.dispatchEvent(new Event('cart-cleared'));
    }
  }, [cartItems, setCartItems]);

  /**
   * Clear all items
   */
  const clearAllItems = useCallback(() => {
    setCartItems([]);
    cartHelpers.clearCart();
  }, [setCartItems]);

  /**
   * Get cart info
   */
  const getCartInfo = useCallback(() => {
    return {
      itemCount: cartHelpers.getItemCount(cartItems),
      isEmpty: cartHelpers.isEmpty(cartItems),
      hasPreorder: cartItems.some(item => item.is_preorder)
    };
  }, [cartItems]);

  return {
    updateQuantity,
    removeItem,
    clearAllItems,
    getCartInfo,
    isEmpty: cartHelpers.isEmpty(cartItems),
    itemCount: cartHelpers.getItemCount(cartItems)
  };
}

export default useCheckoutCart;
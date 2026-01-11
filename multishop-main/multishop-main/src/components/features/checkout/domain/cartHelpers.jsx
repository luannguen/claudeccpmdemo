/**
 * Cart Helper Functions
 * Domain Layer - Cart manipulation logic
 * 
 * @module features/checkout/domain/cartHelpers
 */

const CART_STORAGE_KEY = 'zerofarm-cart';

/**
 * Update item quantity in cart
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @param {string} itemId
 * @param {number} newQuantity
 * @returns {import('../types/CheckoutDTO').CartItemDTO[]}
 */
export function updateItemQuantity(cartItems, itemId, newQuantity) {
  return cartItems.map(item => {
    if (item.id === itemId) {
      // Check MOQ for preorder items
      if (item.is_preorder && item.moq && newQuantity < item.moq) {
        return item; // Don't update if below MOQ
      }
      if (newQuantity < 1) return item; // Don't allow 0 or negative
      return { ...item, quantity: newQuantity };
    }
    return item;
  });
}

/**
 * Remove item from cart
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @param {string} itemId
 * @returns {import('../types/CheckoutDTO').CartItemDTO[]}
 */
export function removeItem(cartItems, itemId) {
  return cartItems.filter(item => item.id !== itemId);
}

/**
 * Add item to cart
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @param {import('../types/CheckoutDTO').CartItemDTO} newItem
 * @returns {import('../types/CheckoutDTO').CartItemDTO[]}
 */
export function addItem(cartItems, newItem) {
  const existingIndex = cartItems.findIndex(item => item.id === newItem.id);
  
  if (existingIndex >= 0) {
    // Update quantity if item exists
    return cartItems.map((item, index) => {
      if (index === existingIndex) {
        return { ...item, quantity: item.quantity + (newItem.quantity || 1) };
      }
      return item;
    });
  }
  
  // Add new item
  return [...cartItems, { ...newItem, quantity: newItem.quantity || 1 }];
}

/**
 * Get cart from localStorage
 * @returns {import('../types/CheckoutDTO').CartItemDTO[]}
 */
export function getStoredCart() {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save cart to localStorage
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 */
export function persistCart(cartItems) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cart-updated'));
  } catch (error) {
    console.error('Failed to persist cart:', error);
  }
}

/**
 * Clear cart from localStorage
 */
export function clearCart() {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new Event('cart-updated'));
    window.dispatchEvent(new Event('cart-cleared'));
  } catch (error) {
    console.error('Failed to clear cart:', error);
  }
}

/**
 * Get cart item count
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @returns {number}
 */
export function getItemCount(cartItems) {
  return cartItems.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Check if cart is empty
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} cartItems
 * @returns {boolean}
 */
export function isEmpty(cartItems) {
  return !cartItems || cartItems.length === 0;
}

/**
 * Generate order number
 * @returns {string}
 */
export function generateOrderNumber() {
  return 'ORD-' + Date.now().toString().slice(-8);
}

export default {
  updateItemQuantity,
  removeItem,
  addItem,
  getStoredCart,
  persistCart,
  clearCart,
  getItemCount,
  isEmpty,
  generateOrderNumber,
  CART_STORAGE_KEY
};
/**
 * useCart - Hook for preorder cart actions
 * 
 * Feature Logic Layer
 */

import { useCallback, useState } from 'react';
import { validateLotPurchase, calculateDeposit } from '../domain';

/**
 * Hook for adding lot to cart
 */
export function useAddToCart(onSuccess, onError) {
  return useCallback((lot, displayName, displayImage, quantity = 1) => {
    // Validate purchase
    const validation = validateLotPurchase(lot, quantity);
    if (!validation.valid) {
      onError?.(validation.errors.join('. '));
      return false;
    }

    // Calculate deposit info
    const depositPct = lot.deposit_percentage || 100;
    const itemTotal = lot.current_price * quantity;
    const depositAmt = calculateDeposit(lot.current_price, quantity, depositPct);

    // Dispatch cart event
    window.dispatchEvent(new CustomEvent('add-to-cart', {
      detail: {
        id: lot.id,
        name: `${displayName} - ${lot.lot_name}`,
        price: lot.current_price,
        image_url: displayImage,
        quantity: quantity,
        unit: lot.unit || 'kg',
        is_preorder: true,
        lot_id: lot.id,
        estimated_harvest_date: lot.estimated_harvest_date,
        moq: lot.moq,
        product_id: lot.product_id || lot.preOrder?.product_id,
        available_quantity: lot.available_quantity,
        deposit_percentage: depositPct,
        deposit_amount: depositAmt
      }
    }));

    onSuccess?.(`Đã thêm ${quantity} sản phẩm vào giỏ!`);
    return true;
  }, [onSuccess, onError]);
}

/**
 * Hook for wishlist management
 */
export function useWishlist(lotId) {
  const [isInWishlist, setIsInWishlist] = useState(false);

  const checkWishlist = useCallback(() => {
    const wishlistKey = `lot:${lotId}`;
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    setIsInWishlist(wishlist.includes(wishlistKey));
  }, [lotId]);

  const toggleWishlist = useCallback(() => {
    const wishlistKey = `lot:${lotId}`;
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    
    if (isInWishlist) {
      const updated = wishlist.filter(id => id !== wishlistKey);
      localStorage.setItem('zerofarm-wishlist', JSON.stringify(updated));
      setIsInWishlist(false);
    } else {
      wishlist.push(wishlistKey);
      localStorage.setItem('zerofarm-wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
    }
    
    window.dispatchEvent(new Event('wishlist-updated'));
  }, [lotId, isInWishlist]);

  return { isInWishlist, checkWishlist, toggleWishlist };
}

/**
 * Hook for quantity selector
 */
export function useQuantitySelector(lot, initialQty = 1) {
  const [quantity, setQuantity] = useState(initialQty);
  
  const minQty = lot?.moq || 1;
  const maxQty = lot?.available_quantity || 999;
  
  const increment = useCallback(() => {
    setQuantity(prev => Math.min(prev + 1, maxQty));
  }, [maxQty]);
  
  const decrement = useCallback(() => {
    setQuantity(prev => Math.max(prev - 1, minQty));
  }, [minQty]);
  
  const setValidQuantity = useCallback((value) => {
    const num = parseInt(value) || minQty;
    setQuantity(Math.max(minQty, Math.min(num, maxQty)));
  }, [minQty, maxQty]);
  
  const totalPrice = lot ? lot.current_price * quantity : 0;
  const depositAmount = lot ? calculateDeposit(
    lot.current_price, 
    quantity, 
    lot.deposit_percentage || 100
  ) : 0;
  
  return {
    quantity,
    setQuantity: setValidQuantity,
    increment,
    decrement,
    minQty,
    maxQty,
    totalPrice,
    depositAmount,
    isMinQty: quantity <= minQty,
    isMaxQty: quantity >= maxQty
  };
}
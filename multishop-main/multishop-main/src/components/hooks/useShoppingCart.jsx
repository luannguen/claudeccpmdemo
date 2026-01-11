import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// ========== CART SYNC TO DATABASE ==========

/**
 * Sync cart từ localStorage → Cart entity trong database
 * Dùng cho tính năng Abandoned Cart Recovery
 */
async function syncCartToDatabase(cart, userEmail) {
  if (!cart || cart.length === 0) return;
  
  try {
    const email = userEmail || (await base44.auth.me())?.email;
    if (!email) return; // Guest user without email, skip sync
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Map cart items to entity format
    const items = cart.map(item => ({
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      image_url: item.image
    }));
    
    // Find existing cart for this user
    const existingCarts = await base44.entities.Cart.filter(
      { user_email: email, status: 'active' },
      '-last_activity',
      1
    );
    
    if (existingCarts.length > 0) {
      // Update existing cart
      await base44.entities.Cart.update(existingCarts[0].id, {
        items,
        subtotal,
        last_activity: new Date().toISOString()
      });
    } else {
      // Create new cart
      await base44.entities.Cart.create({
        user_email: email,
        items,
        subtotal,
        status: 'active',
        last_activity: new Date().toISOString(),
        recovery_email_sent: false
      });
    }
  } catch (error) {
    console.warn('Cart sync to DB failed (non-critical):', error.message);
  }
}

/**
 * Mark cart as checked_out khi đơn hàng được tạo
 */
export async function markCartAsCheckedOut(userEmail) {
  try {
    const email = userEmail || (await base44.auth.me())?.email;
    if (!email) return;
    
    const existingCarts = await base44.entities.Cart.filter(
      { user_email: email, status: 'active' },
      '-last_activity',
      1
    );
    
    if (existingCarts.length > 0) {
      await base44.entities.Cart.update(existingCarts[0].id, {
        status: 'checked_out'
      });
    }
  } catch (error) {
    console.warn('Failed to mark cart as checked out:', error.message);
  }
}

// ========== CART STATE HOOK ==========

export function useCartState() {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('zerofarm-cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const syncTimeoutRef = useRef(null);

  // Persist to localStorage + sync to database (debounced)
  useEffect(() => {
    try {
      localStorage.setItem('zerofarm-cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      
      // Debounce sync to database (5 seconds)
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
      syncTimeoutRef.current = setTimeout(() => {
        syncCartToDatabase(cart);
      }, 5000);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [cart]);

  return { cart, setCart, isOpen, setIsOpen, isValidating, setIsValidating };
}

// ========== LOTS VALIDATION HOOK ==========

export function useLotsValidation(cart) {
  const preorderLotIds = cart.filter(i => i.is_preorder && i.lot_id).map(i => i.lot_id);
  
  return useQuery({
    queryKey: ['cart-lots-validation', preorderLotIds.join(',')],
    queryFn: async () => {
      if (preorderLotIds.length === 0) return [];
      const lots = await base44.entities.ProductLot.list('-created_date', 200);
      return lots.filter(l => preorderLotIds.includes(l.id));
    },
    enabled: preorderLotIds.length > 0,
    refetchInterval: 15000,
    staleTime: 10000
  });
}

// ========== CART ACTIONS ==========

export function useCartActions(cart, setCart, lotsData, setIsValidating, setIsOpen) {
  
  const updateQuantity = useCallback((productId, shopId, newQuantity) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId && item.shop_id === shopId) {
        if (item.is_preorder && item.moq && newQuantity < item.moq) return item;
        if (newQuantity < 1) return item;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  }, [setCart]);

  const removeFromCart = useCallback((productId, shopId) => {
    setCart(prev => prev.filter(item => !(item.id === productId && item.shop_id === shopId)));
  }, [setCart]);

  const addToCart = useCallback(async (product) => {
    // Validate preorder lot
    if (product.is_preorder && product.lot_id) {
      try {
        const lots = await base44.entities.ProductLot.filter({ id: product.lot_id }, '-created_date', 1);
        if (!lots?.length) { alert('❌ Sản phẩm không còn tồn tại!'); return false; }
        const lot = lots[0];
        if (lot.available_quantity < product.quantity) { alert(`❌ Chỉ còn ${lot.available_quantity} sản phẩm!`); return false; }
        if (lot.status !== 'active') { alert('❌ Sản phẩm không còn mở bán!'); return false; }
      } catch { return false; }
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.shop_id === product.shop_id);
      if (existing) {
        return prev.map(item =>
          (item.id === product.id && item.shop_id === product.shop_id)
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
    return true;
  }, [setCart]);

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) return;

    const preorderItems = cart.filter(i => i.is_preorder && i.lot_id);
    if (preorderItems.length > 0) {
      setIsValidating(true);
      
      for (const item of preorderItems) {
        const lot = lotsData?.find(l => l.id === item.lot_id);
        
        if (!lot || lot.status !== 'active') {
          alert(`❌ Lot "${item.name}" không còn mở bán!`);
          removeFromCart(item.id, item.shop_id);
          setIsValidating(false);
          return;
        }
        
        if (lot.available_quantity < item.quantity) {
          alert(`⚠️ Lot "${item.name}" chỉ còn ${lot.available_quantity} sản phẩm!`);
          if (lot.available_quantity === 0) {
            removeFromCart(item.id, item.shop_id);
          } else {
            updateQuantity(item.id, item.shop_id, lot.available_quantity);
          }
          setIsValidating(false);
          return;
        }
      }
      setIsValidating(false);
    }

    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('open-checkout-modal', { detail: { cartItems: [...cart] } }));
  }, [cart, lotsData, setIsValidating, setIsOpen, removeFromCart, updateQuantity]);

  return { updateQuantity, removeFromCart, addToCart, handleCheckout };
}

// ========== CART CALCULATIONS ==========

export function useCartCalculations(cart) {
  const getTotalItems = useCallback(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const getTotalPrice = useCallback(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  return { getTotalItems, getTotalPrice };
}

// ========== CART EVENT LISTENERS ==========

export function useCartEventListeners(setCart, setIsOpen, addToCart) {
  useEffect(() => {
    const handleAddToCart = async (event) => {
      await addToCart(event.detail);
    };
    const handleCartCleared = () => { setCart([]); setIsOpen(false); };
    const handleCartUpdated = () => {
      try {
        const saved = localStorage.getItem('zerofarm-cart');
        if (saved) setCart(JSON.parse(saved));
      } catch {}
    };
    const handleOpenCart = () => setIsOpen(true);

    window.addEventListener('add-to-cart', handleAddToCart);
    window.addEventListener('cart-cleared', handleCartCleared);
    window.addEventListener('cart-updated', handleCartUpdated);
    window.addEventListener('open-cart-widget', handleOpenCart);

    return () => {
      window.removeEventListener('add-to-cart', handleAddToCart);
      window.removeEventListener('cart-cleared', handleCartCleared);
      window.removeEventListener('cart-updated', handleCartUpdated);
      window.removeEventListener('open-cart-widget', handleOpenCart);
    };
  }, [setCart, setIsOpen, addToCart]);
}
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// ========== WISHLIST STATE ==========

export function useWishlistState(isOpen) {
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
      setWishlistIds(wishlist);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      const updated = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
      setWishlistIds(updated);
    };
    window.addEventListener('wishlist-updated', handleUpdate);
    return () => window.removeEventListener('wishlist-updated', handleUpdate);
  }, []);

  return { wishlistIds, setWishlistIds };
}

// ========== WISHLIST DATA ==========

export function useWishlistProducts(isOpen) {
  return useQuery({
    queryKey: ['products-wishlist-modal'],
    queryFn: () => base44.entities.Product.list('-created_date', 500),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen
  });
}

export function useWishlistLots(isOpen) {
  return useQuery({
    queryKey: ['lots-wishlist-modal'],
    queryFn: () => base44.entities.ProductLot.filter({ status: 'active' }, '-created_date', 500),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen
  });
}

// ========== WISHLIST ITEMS PROCESSING ==========

export function useWishlistItems(wishlistIds, allProducts = [], allLots = []) {
  return useMemo(() => {
    const items = [];
    
    wishlistIds.forEach(id => {
      if (id.startsWith('lot:')) {
        const lotId = id.replace('lot:', '');
        const lot = allLots.find(l => l.id === lotId);
        if (lot && lot.available_quantity > 0) {
          items.push({
            id: lot.id,
            type: 'lot',
            name: `${lot.product_name} - ${lot.lot_name}`,
            price: lot.current_price,
            image_url: lot.product_image,
            unit: 'kg',
            is_preorder: true,
            lot_id: lot.id,
            estimated_harvest_date: lot.estimated_harvest_date,
            moq: lot.moq,
            product_id: lot.product_id,
            available_quantity: lot.available_quantity
          });
        }
      } else {
        const product = allProducts.find(p => p.id === id);
        if (product && product.status === 'active') {
          items.push({
            id: product.id,
            type: 'product',
            name: product.name,
            price: product.sale_price || product.price,
            image_url: product.image_url,
            unit: product.unit,
            is_preorder: false,
            product_id: product.id
          });
        }
      }
    });
    
    return items;
  }, [wishlistIds, allProducts, allLots]);
}

// ========== WISHLIST ACTIONS ==========

export function useWishlistActions(wishlistIds, setWishlistIds) {
  const removeFromWishlist = useCallback((item) => {
    const wishlistKey = item.type === 'lot' ? `lot:${item.id}` : item.id;
    const updated = wishlistIds.filter(id => id !== wishlistKey);
    localStorage.setItem('zerofarm-wishlist', JSON.stringify(updated));
    setWishlistIds(updated);
    window.dispatchEvent(new Event('wishlist-updated'));
  }, [wishlistIds, setWishlistIds]);

  const addToCart = useCallback((item) => {
    window.dispatchEvent(new CustomEvent('add-to-cart', { 
      detail: { 
        id: item.id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        image_url: item.image_url,
        quantity: item.moq || 1,
        is_preorder: item.is_preorder,
        lot_id: item.lot_id,
        estimated_harvest_date: item.estimated_harvest_date,
        moq: item.moq,
        product_id: item.product_id
      } 
    }));
    
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 right-6 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] animate-slide-up';
    toast.innerHTML = `<span class="font-medium">✅ Đã thêm vào giỏ!</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }, []);

  const clearAll = useCallback(() => {
    if (confirm('Xóa toàn bộ danh sách yêu thích?')) {
      localStorage.setItem('zerofarm-wishlist', JSON.stringify([]));
      setWishlistIds([]);
      window.dispatchEvent(new Event('wishlist-updated'));
    }
  }, [setWishlistIds]);

  return { removeFromWishlist, addToCart, clearAll };
}
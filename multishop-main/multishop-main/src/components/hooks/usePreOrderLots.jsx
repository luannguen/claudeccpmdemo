import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function usePreOrders() {
  return useQuery({
    queryKey: ['public-preorders'],
    queryFn: async () => {
      const all = await base44.entities.PreOrderProduct.list('-created_date', 500);
      return all.filter(p => p.status === 'active' && p.display_on_preorder_page === true);
    }
  });
}

export function useProductLots() {
  return useQuery({
    queryKey: ['public-product-lots'],
    queryFn: async () => {
      const all = await base44.entities.ProductLot.list('estimated_harvest_date', 500);
      return all.filter(l => l.status === 'active');
    }
  });
}

// ✅ Fetch products for stable image fallback
export function useProducts() {
  return useQuery({
    queryKey: ['public-products-for-lots'],
    queryFn: async () => {
      return await base44.entities.Product.list('-created_date', 500);
    },
    staleTime: 5 * 60 * 1000
  });
}

export function useActiveLots(lots, preOrders, products = []) {
  return useMemo(() => {
    if (!lots?.length || !preOrders?.length) return [];
    
    return lots.filter(lot => {
      const preOrder = preOrders.find(p => String(p.id) === String(lot.preorder_product_id));
      return preOrder && lot.status === 'active' && lot.available_quantity > 0;
    }).map(lot => {
      const preOrder = preOrders.find(p => String(p.id) === String(lot.preorder_product_id));
      // ✅ Get product from Product entity for stable image
      const productId = lot.product_id || preOrder?.product_id;
      const product = productId ? products.find(p => String(p.id) === String(productId)) : null;
      
      // ✅ Fallback chain: lot -> product -> preOrder
      return { 
        ...lot, 
        preOrder,
        product,
        product_image: lot.product_image || product?.image_url || preOrder?.product_image,
        product_name: lot.product_name || product?.name || preOrder?.product_name,
        product_gallery: lot.product_gallery?.length ? lot.product_gallery : product?.gallery
      };
    });
  }, [lots, preOrders, products]);
}

export function useLotFilters() {
  const [categoryFilter, setCategoryFilter] = useState("all");
  return { categoryFilter, setCategoryFilter };
}

export function useLotDetail(lotId) {
  return useQuery({
    queryKey: ['lot-detail-all', lotId],
    queryFn: async () => {
      if (!lotId) return { lot: null, preOrder: null, product: null };
      
      const [allLots, allPreOrders, allProducts] = await Promise.all([
        base44.entities.ProductLot.list('-created_date', 500),
        base44.entities.PreOrderProduct.list('-created_date', 500),
        base44.entities.Product.list('-created_date', 500)
      ]);
      
      // ✅ Compare as strings to ensure matching
      const lot = allLots.find(l => String(l.id) === String(lotId));
      if (!lot) {
        console.warn('[useLotDetail] Lot not found:', lotId, 'Available IDs:', allLots.map(l => l.id));
        return { lot: null, preOrder: null, product: null };
      }
      
      const preOrder = allPreOrders.find(p => String(p.id) === String(lot.preorder_product_id));
      const productId = lot.product_id || preOrder?.product_id;
      const product = productId ? allProducts.find(p => String(p.id) === String(productId)) : null;
      
      // ✅ Enrich lot with preOrder and product data for complete info
      const enrichedLot = {
        ...lot,
        // Fallback image chain
        product_image: lot.product_image || product?.image_url || preOrder?.product_image,
        product_name: lot.product_name || product?.name || preOrder?.product_name,
        product_gallery: lot.product_gallery?.length ? lot.product_gallery : product?.gallery
      };
      
      return { lot: enrichedLot, preOrder, product };
    },
    enabled: !!lotId,
    staleTime: 30000
  });
}

export function useRelatedLots(lot, lotId) {
  return useQuery({
    queryKey: ['related-lots', lot?.preorder_product_id, lotId],
    queryFn: async () => {
      if (!lot?.preorder_product_id) return [];
      const allLots = await base44.entities.ProductLot.list('estimated_harvest_date', 500);
      return allLots.filter(l => 
        l.preorder_product_id === lot.preorder_product_id && 
        l.id !== lotId && 
        l.status === 'active' &&
        l.available_quantity > 0
      );
    },
    enabled: !!lot?.preorder_product_id
  });
}

// Utility functions
export function getDaysUntilHarvest(date) {
  return Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
}

export function getPriceIncreasePercentage(lot) {
  if (!lot?.initial_price || !lot?.current_price) return 0;
  return ((lot.current_price - lot.initial_price) / lot.initial_price * 100).toFixed(0);
}

export function getAvailablePercentage(lot) {
  if (!lot?.available_quantity || !lot?.total_yield) return 0;
  return ((lot.available_quantity / lot.total_yield) * 100).toFixed(0);
}

export function getSoldPercentage(lot) {
  if (!lot?.sold_quantity || !lot?.total_yield) return 0;
  return (((lot.sold_quantity || 0) / lot.total_yield) * 100).toFixed(0);
}

export function getDiscountPercent(lot) {
  if (!lot?.current_price || !lot?.max_price || lot.current_price >= lot.max_price) return 0;
  return Math.round(((lot.max_price - lot.current_price) / lot.max_price) * 100);
}

export function getLotGallery(lot, product, preOrder) {
  const images = [];
  if (lot?.product_image) images.push(lot.product_image);
  if (lot?.product_gallery?.length) images.push(...lot.product_gallery);
  if (images.length === 0 && product?.image_url) images.push(product.image_url);
  if (images.length === 0 && product?.gallery?.length) images.push(...product.gallery);
  if (images.length === 0 && preOrder?.product_image) images.push(preOrder.product_image);
  return [...new Set(images)];
}

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
 * useAddToCart - Hook thêm lot vào giỏ hàng
 * @param {Function} onSuccess - Callback khi thêm thành công
 * @param {Function} onError - Callback khi có lỗi
 */
export function useAddToCart(onSuccess, onError) {
  return useCallback((lot, displayName, displayImage, quantity = 1) => {
    if (lot.available_quantity < quantity) {
      onError?.(`Không đủ hàng! Chỉ còn ${lot.available_quantity} sản phẩm.`);
      return false;
    }

    // Calculate deposit info for this item
    const depositPct = lot.deposit_percentage || 100;
    const itemTotal = lot.current_price * quantity;
    const depositAmt = Math.round(itemTotal * depositPct / 100);

    window.dispatchEvent(new CustomEvent('add-to-cart', {
      detail: {
        id: lot.id,
        name: `${displayName} - ${lot.lot_name}`,
        price: lot.current_price,
        image_url: displayImage,
        quantity: quantity,
        unit: 'kg',
        is_preorder: true,
        lot_id: lot.id,
        estimated_harvest_date: lot.estimated_harvest_date,
        moq: lot.moq,
        product_id: lot.product_id || lot.preOrder?.product_id,
        available_quantity: lot.available_quantity,
        // Deposit info
        deposit_percentage: depositPct,
        deposit_amount: depositAmt
      }
    }));

    onSuccess?.(`Đã thêm ${quantity} sản phẩm vào giỏ!`);
    return true;
  }, [onSuccess, onError]);
}
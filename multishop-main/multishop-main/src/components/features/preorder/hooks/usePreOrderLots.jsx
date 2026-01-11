/**
 * usePreOrderLots - Hook for lot listing and filtering
 * 
 * Feature Logic Layer
 */

import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  lotRepository, 
  preOrderProductRepository 
} from '../data';
import { base44 } from '@/api/base44Client';
import { 
  getDaysUntilHarvest, 
  getDiscountPercent,
  getSoldPercent,
  getAvailablePercent,
  getPriceIncreasePercent,
  getLotGallery
} from '../domain';

/**
 * Hook for active preorder products
 */
export function usePreOrders() {
  return useQuery({
    queryKey: ['public-preorders'],
    queryFn: () => preOrderProductRepository.listActivePreOrderProducts(),
    staleTime: 60 * 1000
  });
}

/**
 * Hook for active product lots
 */
export function useProductLots() {
  return useQuery({
    queryKey: ['public-product-lots'],
    queryFn: () => lotRepository.listActiveLots(),
    staleTime: 60 * 1000
  });
}

/**
 * Hook for products (for image fallback)
 */
export function useProducts() {
  return useQuery({
    queryKey: ['public-products-for-lots'],
    queryFn: () => base44.entities.Product.list('-created_date', 500),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook to enrich lots with preorder and product data
 */
export function useActiveLots(lots, preOrders, products = []) {
  return useMemo(() => {
    if (!lots?.length || !preOrders?.length) return [];
    
    return lots.filter(lot => {
      const preOrder = preOrders.find(p => String(p.id) === String(lot.preorder_product_id));
      return preOrder && lot.status === 'active' && lot.available_quantity > 0;
    }).map(lot => {
      const preOrder = preOrders.find(p => String(p.id) === String(lot.preorder_product_id));
      const productId = lot.product_id || preOrder?.product_id;
      const product = productId ? products.find(p => String(p.id) === String(productId)) : null;
      
      return { 
        ...lot, 
        preOrder,
        product,
        product_image: lot.product_image || product?.image_url || preOrder?.product_image,
        product_name: lot.product_name || product?.name || preOrder?.product_name,
        product_gallery: getLotGallery(lot, product, preOrder)
      };
    });
  }, [lots, preOrders, products]);
}

/**
 * Hook for lot filters
 */
export function useLotFilters() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('harvest_date');
  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });
  
  const resetFilters = useCallback(() => {
    setCategoryFilter('all');
    setSortBy('harvest_date');
    setPriceRange({ min: 0, max: Infinity });
  }, []);
  
  return {
    categoryFilter,
    setCategoryFilter,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    resetFilters
  };
}

/**
 * Hook for single lot detail
 */
export function useLotDetail(lotId) {
  return useQuery({
    queryKey: ['lot-detail-all', lotId],
    queryFn: async () => {
      if (!lotId) return { lot: null, preOrder: null, product: null };
      
      const [allLots, allPreOrders, allProducts] = await Promise.all([
        lotRepository.listLots(),
        preOrderProductRepository.listPreOrderProducts(),
        base44.entities.Product.list('-created_date', 500)
      ]);
      
      const lot = allLots.find(l => String(l.id) === String(lotId));
      if (!lot) return { lot: null, preOrder: null, product: null };
      
      const preOrder = allPreOrders.find(p => String(p.id) === String(lot.preorder_product_id));
      const productId = lot.product_id || preOrder?.product_id;
      const product = productId ? allProducts.find(p => String(p.id) === String(productId)) : null;
      
      const enrichedLot = {
        ...lot,
        product_image: lot.product_image || product?.image_url || preOrder?.product_image,
        product_name: lot.product_name || product?.name || preOrder?.product_name,
        product_gallery: getLotGallery(lot, product, preOrder)
      };
      
      return { lot: enrichedLot, preOrder, product };
    },
    enabled: !!lotId,
    staleTime: 30000
  });
}

/**
 * Hook for related lots
 */
export function useRelatedLots(lot, excludeLotId) {
  return useQuery({
    queryKey: ['related-lots', lot?.preorder_product_id, excludeLotId],
    queryFn: () => lotRepository.getRelatedLots(lot, excludeLotId),
    enabled: !!lot?.preorder_product_id
  });
}

/**
 * Re-export utility functions for backward compatibility
 */
export { 
  getDaysUntilHarvest,
  getDiscountPercent,
  getSoldPercent,
  getSoldPercent as getSoldPercentage,
  getAvailablePercent,
  getAvailablePercent as getAvailablePercentage,
  getPriceIncreasePercent,
  getPriceIncreasePercent as getPriceIncreasePercentage,
  getLotGallery
};
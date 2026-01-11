/**
 * usePreOrderLots - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/preorder thay thế
 * 
 * @deprecated Use @/components/features/preorder instead
 */

import {
  usePreOrders,
  useProductLots,
  useProducts,
  useActiveLots,
  useLotFilters,
  useLotDetail,
  useRelatedLots,
  getDaysUntilHarvest,
  getPriceIncreasePercentage,
  getAvailablePercentage,
  getSoldPercentage,
  getDiscountPercent,
  getLotGallery,
  useWishlist,
  useAddToCart
} from '@/components/features/preorder';

// Re-export everything
export {
  usePreOrders,
  useProductLots as useProductLots,
  useProducts,
  useActiveLots,
  useLotFilters,
  useLotDetail,
  useRelatedLots,
  getDaysUntilHarvest,
  getPriceIncreasePercentage,
  getAvailablePercentage,
  getSoldPercentage,
  getDiscountPercent,
  getLotGallery,
  useWishlist,
  useAddToCart
};

export default {
  usePreOrders,
  useProductLots,
  useProducts,
  useActiveLots,
  useLotFilters,
  useLotDetail,
  useRelatedLots
};
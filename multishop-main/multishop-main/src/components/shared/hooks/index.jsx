/**
 * Shared Hooks - Central Exports
 * Base hooks that can be extended for specific features
 */

// Base entity hooks
export { useEntityList, useEntityListWithCRUD } from './useEntityList';
export { useEntityDetail, useEntityDetailWithForm } from './useEntityDetail';
export { useEntityMutation, useEntityFormSubmit } from './useEntityMutation';

// Product list hooks
export {
  useCategoriesBase,
  useProductListBase,
  useProductFilters,
  useFilteredProducts,
  useProductPagination,
  useProductListClient,
  useProductListAdmin
} from './useProductListBase';

// Order list hooks
export {
  useOrderListBase,
  useOrderFilters,
  useFilteredOrders,
  useOrderStats,
  useOrderSelection,
  useOrderListCustomer,
  useOrderListAdmin,
  ORDER_STATUS_CONFIG,
  STATUS_OPTIONS,
  DATE_RANGE_OPTIONS,
  filterByDateRange,
  canCancelOrder,
  canReturnOrder,
  getStatusInfo
} from './useOrderListBase';
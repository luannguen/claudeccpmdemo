/**
 * useAdminPreOrders - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/preorder thay thế
 * 
 * @deprecated Use @/components/features/preorder instead
 */

export {
  usePreOrdersData,
  useAdminPreOrderLots as usePreOrderLots,
  usePreOrderDetail,
  useFilteredPreOrders,
  usePreOrderStats,
  useDeletePreOrder,
  usePreOrderFilters,
  usePreOrderFormModal,
  preOrderStatusOptions,
  getPreOrderStatusColor,
  getPreOrderStatusText
} from '@/components/features/preorder';
/**
 * useAdminProductLots - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/preorder thay thế
 * 
 * @deprecated Use @/components/features/preorder instead
 */

export {
  useProductLotsData,
  useFilteredLots,
  useLotsStats,
  useDeleteLot,
  useAdminLotFilters as useLotFilters,
  useLotFormModal,
  lotStatusOptions,
  getLotStatusColor,
  getLotStatusText,
  getAdminDaysUntilHarvest as getDaysUntilHarvest,
  getSoldPercentage
} from '@/components/features/preorder';
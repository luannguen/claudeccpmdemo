/**
 * useCommission Adapter
 * 
 * Backward compatibility adapter for legacy code.
 * Re-exports from features/saas module.
 * 
 * @deprecated Use @/components/features/saas instead
 */

export {
  useCommissionList,
  useCommissionDetail,
  useShopCommissions,
  useCommissionSummary,
  usePlatformCommissionAnalytics,
  useProcessOrderCommission,
  useApproveCommission,
  useBulkApproveCommissions,
  useMarkCommissionPaid,
  useAdminCommissions,
  useMyShopCommissions,
  COMMISSION_QUERY_KEYS
} from '@/components/features/saas/hooks/useCommission';

export { COMMISSION_STATUS } from '@/components/features/saas';
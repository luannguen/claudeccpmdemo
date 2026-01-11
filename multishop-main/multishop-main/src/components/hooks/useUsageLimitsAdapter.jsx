/**
 * useUsageLimits Adapter
 * 
 * Backward compatibility adapter for legacy code.
 * Re-exports from features/saas module.
 * 
 * @deprecated Use @/components/features/saas instead
 */

export {
  useUsageSummary,
  useResourceLimit,
  useProductLimit,
  useOrderLimit,
  useCustomerLimit,
  useCanCreateProduct,
  useCanProcessOrder,
  useIncrementUsage,
  useDecrementUsage,
  useUsageManagement,
  USAGE_QUERY_KEYS
} from '@/components/features/saas/hooks/useUsageLimits';

export { PLAN_LIMITS, RESOURCE_TYPES } from '@/components/features/saas';
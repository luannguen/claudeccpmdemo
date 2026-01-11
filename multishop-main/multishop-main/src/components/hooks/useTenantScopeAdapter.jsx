/**
 * useTenantScope Adapter
 * 
 * Backward compatibility adapter for legacy code.
 * Re-exports from features/saas module.
 * 
 * @deprecated Use @/components/features/saas instead
 */

export {
  useTenantScope,
  useTenantOrders,
  useTenantProducts,
  useTenantCustomers
} from '@/components/features/saas/hooks/useTenantScope';

export {
  validateTenantAccess as validateTenantOperation
} from '@/components/features/saas/domain/tenantValidators';

// Legacy helper function
export function buildTenantQuery(tenantId, baseQuery = {}) {
  if (!tenantId) return baseQuery;
  return { ...baseQuery, shop_id: tenantId };
}

export default useTenantScope;
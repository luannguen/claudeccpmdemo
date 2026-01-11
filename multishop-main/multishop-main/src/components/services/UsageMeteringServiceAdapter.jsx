/**
 * UsageMeteringService Adapter
 * 
 * Backward compatibility adapter for legacy code.
 * Re-exports from features/saas module.
 * 
 * @deprecated Use @/components/features/saas instead
 */

export {
  PLAN_LIMITS,
  RESOURCE_TYPES
} from '@/components/features/saas';

export {
  checkResourceLimit as checkLimit,
  hasFeature,
  getPlanLimits,
  calculateOverallUsage,
  getUpgradeSuggestion
} from '@/components/features/saas/domain/usageLimits';

export {
  usageRepository
} from '@/components/features/saas/data';

// Legacy function signatures
export async function getUsageSummary(tenantId) {
  const { usageRepository } = await import('@/components/features/saas/data');
  return await usageRepository.getUsageSummary(tenantId);
}

export async function incrementUsage(tenantId, resource, amount) {
  const { usageRepository } = await import('@/components/features/saas/data');
  return await usageRepository.incrementUsage(tenantId, resource, amount);
}

export async function decrementUsage(tenantId, resource, amount) {
  const { usageRepository } = await import('@/components/features/saas/data');
  return await usageRepository.decrementUsage(tenantId, resource, amount);
}

export async function setUsage(tenantId, resource, value) {
  const { usageRepository } = await import('@/components/features/saas/data');
  return await usageRepository.setUsage(tenantId, resource, value);
}

export async function resetMonthlyUsage(tenantId) {
  const { usageRepository } = await import('@/components/features/saas/data');
  return await usageRepository.resetMonthlyUsage(tenantId);
}

// Legacy default export
export const UsageMeteringService = {
  PLAN_LIMITS,
  checkLimit: async (tenant, resource, increment) => {
    const { checkResourceLimit } = await import('@/components/features/saas/domain/usageLimits');
    return checkResourceLimit(tenant, resource, increment);
  },
  hasFeature,
  getPlanLimits,
  getUsageSummary,
  incrementUsage,
  decrementUsage,
  setUsage,
  resetMonthlyUsage,
  getUpgradeSuggestion
};

export default UsageMeteringService;

/**
 * SaaS Module - Hooks Index
 * 
 * React hooks for orchestration.
 * 
 * @module features/saas/hooks
 */

// Tenant hooks
export {
  useTenantList,
  useTenantDetail,
  useTenantBySlug,
  useActiveTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
  useSuspendTenant,
  useActivateTenant,
  useTenantMutations,
  TENANT_QUERY_KEYS
} from './useTenant';

// Billing hooks
export {
  useTenantInvoices,
  useInvoiceDetail,
  useBillingAnalytics,
  useCreateInvoice,
  useMarkInvoicePaid,
  useGenerateInvoices,
  useSendBillingReminders,
  useProcessSubscriptionRenewals,
  useAdminBilling,
  BILLING_QUERY_KEYS
} from './useBilling';

// Commission hooks
export {
  useCommissionList,
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
} from './useCommission';

// Usage hooks
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
} from './useUsageLimits';

// Subscription hooks
export {
  useSubscriptionByTenant,
  useSubscriptionDetail,
  useExpiringSubscriptions,
  useCreateSubscription,
  useRenewSubscription,
  useSuspendSubscription,
  useCancelSubscription,
  SUBSCRIPTION_QUERY_KEYS
} from './useSubscription';

// Tenant scope hooks
export {
  useTenantScope,
  useTenantOrders,
  useTenantProducts,
  useTenantCustomers
} from './useTenantScope';

// Marketplace hooks
export {
  useMarketplaceShops,
  useShopBySlug,
  useShopProducts,
  useFeaturedShops,
  useMarketplaceFilters,
  useMarketplaceBrowser,
  MARKETPLACE_QUERY_KEYS
} from './useMarketplace';

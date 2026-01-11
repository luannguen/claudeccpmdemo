/**
 * Hook Registry
 * 
 * Maps hooks to their consolidated implementations.
 * AI should check this before creating new hooks.
 */

// ========== CONSOLIDATED HOOKS ==========
export const consolidatedHooks = {
  // Product listing
  'useProducts': '@/components/hooks/useProducts',
  'useProductList': '@/components/hooks/useAdminProducts',
  'useAdminProducts': '@/components/hooks/useAdminProducts',
  'useProductDetail': '@/components/hooks/useProducts → getById',
  'useProductForm': '@/components/hooks/useAdminProducts → mutations',
  'useProductCRUD': '@/components/hooks/useAdminProducts → mutations',
  'useProductSearch': '@/components/hooks/useProducts → with search filter',
  'useLowStockProducts': '@/components/hooks/useAdminInventory',
  
  // Order listing
  'useMyOrders': '@/components/hooks/useMyOrders',
  'useAdminOrders': '@/components/hooks/useAdminOrders',
  'useOrderDetail': '@/components/hooks/useOrderDetail',
  'useOrderActions': '@/components/hooks/useAdminOrders → mutations',
  'useOrderCancel': '@/components/hooks/useOrderDetail → cancel',
  'useOrderStats': '@/components/hooks/useAdminOrders → stats',
  'useCheckout': '@/components/hooks/useCheckout',
  
  // Customer
  'useAdminCustomers': '@/components/hooks/useAdminCustomers',
  'useCustomerDetail': '@/components/hooks/useAdminCustomers → detail',
  'useCustomerSearch': '@/components/hooks/useAdminCustomers → with search',
  'useCustomerStats': '@/components/hooks/useCustomerInsights',
  
  // Referral
  'useReferralMembers': '@/components/hooks/useReferralSystem → members',
  'useMyReferralMember': '@/components/hooks/useReferralSystem → myMember',
  'useReferralStats': '@/components/hooks/useReferralSystem → stats',
  'useReferralSettings': '@/components/hooks/useReferralSystem → settings',
  
  // CMS
  'useAdminPages': '@/components/hooks/useCMSPages → admin',
  'usePublishedPages': '@/components/hooks/useCMSPages → published',
  'usePageBySlug': '@/components/hooks/useCMSPages → bySlug',
  'usePageMutations': '@/components/hooks/useCMSPages → mutations',
  'useSiteConfig': '@/components/hooks/useCMSPages → siteConfig',
  
  // Feature
  'useFeatures': '@/components/hooks/useFeatures',
  'useFeatureList': '@/components/hooks/useFeatures → list',
  'useFeatureDetail': '@/components/hooks/useFeatures → detail',
  'useFeatureMutations': '@/components/hooks/useFeatures → mutations',
  'useFeatureStats': '@/components/hooks/useFeatures → stats',
  
  // Notification
  'useRealTimeNotifications': '@/components/notifications/useRealTimeNotifications',
  'useAdminNotifications': '@/components/hooks/useAdminNotifications',
  
  // View Mode
  'useViewModeState': '@/components/shared/viewmode → useViewModeState',
  'useViewMode': '@/components/shared/viewmode → useViewMode (context)',
  
  // Utilities
  'useDebouncedSearch': '@/components/shared/utils → useDebouncedValue',
  'useDebouncedValue': '@/components/shared/utils/debounce'
};

// ========== HOOK CATEGORIES ==========
export const hookCategories = {
  entity: ['useProducts', 'useOrders', 'useCustomers', 'useFeatures'],
  mutation: ['useProductForm', 'useOrderActions', 'useFeatureMutations'],
  stats: ['useOrderStats', 'useCustomerStats', 'useFeatureStats'],
  ui: ['useViewModeState', 'useDebouncedValue'],
  realtime: ['useRealTimeNotifications']
};

/**
 * Get the recommended hook for a task
 */
export function getConsolidatedHook(hookName) {
  return consolidatedHooks[hookName] || null;
}

/**
 * Check if a hook exists in registry
 */
export function hasHook(hookName) {
  return hookName in consolidatedHooks;
}

/**
 * Get all hooks for a category
 */
export function getHooksByCategory(category) {
  return hookCategories[category] || [];
}
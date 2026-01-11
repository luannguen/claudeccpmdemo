/**
 * useMarketplace Adapter
 * 
 * Backward compatibility adapter for legacy code.
 * Re-exports from features/saas module.
 * 
 * @deprecated Use @/components/features/saas instead
 */

export {
  useMarketplaceShops,
  useShopBySlug,
  useShopProducts,
  useFeaturedShops,
  useMarketplaceFilters,
  useMarketplaceBrowser,
  MARKETPLACE_QUERY_KEYS
} from '@/components/features/saas/hooks/useMarketplace';

export default useMarketplaceBrowser;
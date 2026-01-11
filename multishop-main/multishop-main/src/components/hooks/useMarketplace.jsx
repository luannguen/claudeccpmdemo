/**
 * useMarketplace.js
 * Hooks for marketplace browsing and shop discovery
 * 
 * Phase 5 - Task 5.5 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// ========== QUERY KEYS ==========

export const MARKETPLACE_QUERY_KEYS = {
  shops: (filters) => ['marketplace-shops', filters],
  shop: (slug) => ['marketplace-shop', slug],
  shopProducts: (shopId) => ['marketplace-shop-products', shopId],
  shopReviews: (shopId) => ['marketplace-shop-reviews', shopId],
  featured: () => ['marketplace-featured']
};

// ========== MAIN HOOKS ==========

/**
 * Get all active shops for marketplace
 */
export function useMarketplaceShops(filters = {}, options = {}) {
  return useQuery({
    queryKey: MARKETPLACE_QUERY_KEYS.shops(filters),
    queryFn: async () => {
      const allTenants = await base44.entities.Tenant.list('-created_date', 500);
      
      // Filter active shops only
      let shops = allTenants.filter(t => 
        t.status === 'active' && 
        t.subscription_status === 'active'
      );
      
      // Apply filters
      if (filters.category && filters.category !== 'all') {
        shops = shops.filter(s => s.business_type === filters.category);
      }
      if (filters.industry && filters.industry !== 'all') {
        shops = shops.filter(s => s.industry === filters.industry);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        shops = shops.filter(s => 
          s.organization_name?.toLowerCase().includes(searchLower) ||
          s.description?.toLowerCase().includes(searchLower)
        );
      }
      
      // Sort
      if (filters.sortBy === 'rating') {
        shops.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      } else if (filters.sortBy === 'products') {
        shops.sort((a, b) => (b.products_count || 0) - (a.products_count || 0));
      } else if (filters.sortBy === 'newest') {
        shops.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      }
      
      return shops;
    },
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Get shop by slug
 */
export function useShopBySlug(slug, options = {}) {
  return useQuery({
    queryKey: MARKETPLACE_QUERY_KEYS.shop(slug),
    queryFn: async () => {
      if (!slug) return null;
      const tenants = await base44.entities.Tenant.list('-created_date', 500);
      return tenants.find(t => t.slug === slug || t.id === slug) || null;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Get shop products
 */
export function useShopProducts(shopId, options = {}) {
  return useQuery({
    queryKey: MARKETPLACE_QUERY_KEYS.shopProducts(shopId),
    queryFn: async () => {
      if (!shopId) return [];
      return await base44.entities.ShopProduct.filter(
        { shop_id: shopId, status: 'active' },
        '-created_date',
        100
      );
    },
    enabled: !!shopId,
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Get featured shops
 */
export function useFeaturedShops(options = {}) {
  return useQuery({
    queryKey: MARKETPLACE_QUERY_KEYS.featured(),
    queryFn: async () => {
      const tenants = await base44.entities.Tenant.list('-created_date', 500);
      return tenants
        .filter(t => t.status === 'active' && t.is_featured)
        .slice(0, 6);
    },
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

// ========== FILTER HOOK ==========

/**
 * Hook to manage marketplace filters
 */
export function useMarketplaceFilters() {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    industry: 'all',
    sortBy: 'rating'
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: 'all',
      industry: 'all',
      sortBy: 'rating'
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filters.search || (filters.category && filters.category !== 'all') || (filters.industry && filters.industry !== 'all');
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters
  };
}

// ========== COMBINED HOOK ==========

/**
 * Combined marketplace hook
 */
export function useMarketplaceBrowser() {
  const { filters, updateFilter, resetFilters, hasActiveFilters } = useMarketplaceFilters();
  const shopsQuery = useMarketplaceShops(filters);
  const featuredQuery = useFeaturedShops();

  return {
    shops: shopsQuery.data || [],
    featuredShops: featuredQuery.data || [],
    isLoading: shopsQuery.isLoading,
    error: shopsQuery.error,
    
    // Filters
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    
    // Stats
    totalShops: shopsQuery.data?.length || 0,
    
    refetch: shopsQuery.refetch
  };
}

export default useMarketplaceBrowser;
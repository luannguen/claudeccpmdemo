/**
 * SaaS Module - Marketplace Hooks
 * 
 * React hooks for marketplace browsing and shop discovery.
 * Orchestrates domain + data layers.
 * 
 * @module features/saas/hooks/useMarketplace
 */

import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tenantRepository } from '../data';
import { base44 } from '@/api/base44Client';

// ========== QUERY KEYS ==========

export const MARKETPLACE_QUERY_KEYS = {
  shops: (filters) => ['marketplace-shops', filters],
  shop: (slug) => ['marketplace-shop', slug],
  shopProducts: (shopId) => ['marketplace-shop-products', shopId],
  featured: () => ['marketplace-featured']
};

// ========== QUERY HOOKS ==========

/**
 * Get all active shops for marketplace
 */
export function useMarketplaceShops(filters = {}, options = {}) {
  return useQuery({
    queryKey: MARKETPLACE_QUERY_KEYS.shops(filters),
    queryFn: async () => {
      const allTenants = await tenantRepository.listActiveTenants();
      
      let shops = allTenants.filter(t => 
        t.status === 'active' && 
        t.subscription_status === 'active'
      );
      
      // Apply filters
      if (filters.category) {
        shops = shops.filter(s => s.business_type === filters.category);
      }
      if (filters.industry) {
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
    queryFn: () => tenantRepository.getTenantBySlug(slug),
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
      const tenants = await tenantRepository.listActiveTenants();
      return tenants
        .filter(t => t.is_featured)
        .slice(0, 6);
    },
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

// ========== FILTER HOOK ==========

/**
 * Manage marketplace filters
 */
export function useMarketplaceFilters() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    industry: '',
    sortBy: 'rating'
  });

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      industry: '',
      sortBy: 'rating'
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filters.search || filters.category || filters.industry;
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
 * Combined marketplace browsing hook
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
/**
 * SaaS Module - Tenant Scope Hooks
 * 
 * React hooks for multi-tenant data isolation.
 * Orchestrates domain + data layers.
 * 
 * @module features/saas/hooks/useTenantScope
 */

import { useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { tenantRepository } from '../data';
import { validateTenantAccess } from '../domain/tenantValidators';
import { base44 } from '@/api/base44Client';

// ========== MAIN HOOK ==========

/**
 * Get tenant scope for multi-tenant isolation
 */
export function useTenantScope() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  // Get tenant ID from URL
  const tenantId = useMemo(() => {
    return searchParams.get('tenant');
  }, [searchParams]);

  // Fetch tenant data
  const { data: tenant } = useQuery({
    queryKey: ['tenant-scope', tenantId],
    queryFn: () => tenantRepository.getTenantById(tenantId),
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000
  });

  // Check if SuperAdmin
  const isSuperAdmin = useMemo(() => {
    return user?.role === 'super_admin' || user?.role === 'admin';
  }, [user?.role]);

  // Build tenant scope
  const tenantScope = useMemo(() => {
    if (!tenantId) return null;
    return { shop_id: tenantId };
  }, [tenantId]);

  // Helper to scope a query
  const scopedQuery = useCallback((baseQuery = {}) => {
    if (!tenantScope) return baseQuery;
    return { ...baseQuery, ...tenantScope };
  }, [tenantScope]);

  // Helper to validate access
  const validateAccess = useCallback((resourceTenantId) => {
    return validateTenantAccess(tenantId, resourceTenantId);
  }, [tenantId]);

  return {
    tenantId,
    tenant,
    tenantScope,
    isSuperAdmin,
    scopedQuery,
    validateAccess,
    hasTenantContext: !!tenantId
  };
}

// ========== SCOPED DATA HOOKS ==========

/**
 * Get orders scoped by tenant
 */
export function useTenantOrders(additionalFilters = {}, options = {}) {
  const { tenantId, scopedQuery } = useTenantScope();

  return useQuery({
    queryKey: ['tenant-orders', tenantId, additionalFilters],
    queryFn: async () => {
      if (!tenantId) return [];
      const query = scopedQuery(additionalFilters);
      return await base44.entities.Order.filter(query, '-created_date', options.limit || 100);
    },
    enabled: !!tenantId,
    staleTime: 30 * 1000,
    ...options
  });
}

/**
 * Get products scoped by tenant
 */
export function useTenantProducts(additionalFilters = {}, options = {}) {
  const { tenantId, scopedQuery } = useTenantScope();

  return useQuery({
    queryKey: ['tenant-products', tenantId, additionalFilters],
    queryFn: async () => {
      if (!tenantId) return [];
      const query = scopedQuery(additionalFilters);
      return await base44.entities.ShopProduct.filter(query, '-created_date', options.limit || 100);
    },
    enabled: !!tenantId,
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Get customers scoped by tenant
 */
export function useTenantCustomers(additionalFilters = {}, options = {}) {
  const { tenantId, scopedQuery } = useTenantScope();

  return useQuery({
    queryKey: ['tenant-customers', tenantId, additionalFilters],
    queryFn: async () => {
      if (!tenantId) return [];
      const query = scopedQuery(additionalFilters);
      return await base44.entities.Customer.filter(query, '-created_date', options.limit || 100);
    },
    enabled: !!tenantId,
    staleTime: 60 * 1000,
    ...options
  });
}
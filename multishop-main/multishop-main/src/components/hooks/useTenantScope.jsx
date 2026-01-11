/**
 * useTenantScope.js
 * Hook để auto-inject tenant filter vào queries
 * 
 * Phase 3 - Task 3.2 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import { useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// ========== MAIN HOOK ==========

/**
 * Hook để lấy tenant scope và inject vào queries
 */
export function useTenantScope() {
  const location = useLocation();
  const { user } = useAuth();
  
  // Get tenant ID from URL
  const tenantId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tenant');
  }, [location.search]);

  // Fetch tenant data
  const { data: tenant } = useQuery({
    queryKey: ['tenant-scope', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const tenants = await base44.entities.Tenant.filter({ id: tenantId });
      return tenants[0] || null;
    },
    enabled: !!tenantId,
    staleTime: 10 * 60 * 1000
  });

  // Check if user is SuperAdmin (can view all tenants)
  const isSuperAdmin = useMemo(() => {
    return user?.role === 'super_admin' || user?.role === 'admin';
  }, [user?.role]);

  // Build tenant scope object
  const tenantScope = useMemo(() => {
    if (!tenantId) return null;
    return { shop_id: tenantId };
  }, [tenantId]);

  // Helper to scope a query
  const scopedQuery = useCallback((baseQuery = {}) => {
    if (!tenantScope) return baseQuery;
    return { ...baseQuery, ...tenantScope };
  }, [tenantScope]);

  // Helper to scope by created_by (for user-owned data)
  const scopedByOwner = useCallback((baseQuery = {}) => {
    if (!user?.email) return baseQuery;
    return { ...baseQuery, created_by: user.email };
  }, [user?.email]);

  return {
    tenantId,
    tenant,
    tenantScope,
    isSuperAdmin,
    scopedQuery,
    scopedByOwner,
    hasTenantContext: !!tenantId
  };
}

// ========== SPECIFIC DATA HOOKS ==========

/**
 * Hook để lấy orders scoped by tenant
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
 * Hook để lấy products scoped by tenant  
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
 * Hook để lấy customers scoped by tenant
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

/**
 * Hook để lấy commissions scoped by tenant
 */
export function useTenantCommissions(additionalFilters = {}, options = {}) {
  const { tenantId, scopedQuery } = useTenantScope();

  return useQuery({
    queryKey: ['tenant-commissions', tenantId, additionalFilters],
    queryFn: async () => {
      if (!tenantId) return [];
      const query = scopedQuery(additionalFilters);
      return await base44.entities.Commission.filter(query, '-created_date', options.limit || 100);
    },
    enabled: !!tenantId,
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Hook để lấy invoices scoped by tenant
 */
export function useTenantInvoices(additionalFilters = {}, options = {}) {
  const { tenantId } = useTenantScope();

  return useQuery({
    queryKey: ['tenant-invoices', tenantId, additionalFilters],
    queryFn: async () => {
      if (!tenantId) return [];
      return await base44.entities.Invoice.filter(
        { tenant_id: tenantId, ...additionalFilters }, 
        '-invoice_date', 
        options.limit || 100
      );
    },
    enabled: !!tenantId,
    staleTime: 60 * 1000,
    ...options
  });
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Validate that operation is within tenant scope
 */
export function validateTenantOperation(currentTenantId, resourceTenantId) {
  if (!currentTenantId) {
    return { valid: false, error: 'No tenant context' };
  }
  if (resourceTenantId && resourceTenantId !== currentTenantId) {
    return { valid: false, error: 'Cross-tenant access denied' };
  }
  return { valid: true };
}

/**
 * Build query with tenant filter
 */
export function buildTenantQuery(tenantId, baseQuery = {}) {
  if (!tenantId) return baseQuery;
  return { ...baseQuery, shop_id: tenantId };
}

export default useTenantScope;
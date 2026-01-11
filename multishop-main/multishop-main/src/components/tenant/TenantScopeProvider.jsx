/**
 * TenantScopeProvider.jsx
 * Context provider for tenant scope management
 * 
 * Phase 3 - Task 3.6 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// ========== CONTEXT ==========

const TenantScopeContext = createContext({
  currentTenant: null,
  tenantId: null,
  tenantScope: null,
  isSuperAdmin: false,
  isLoading: true,
  error: null,
  // Actions
  scopedQuery: (query) => query,
  validateAccess: (resourceTenantId) => ({ valid: false }),
  switchTenant: (tenantId) => {},
  clearScope: () => {}
});

// ========== PROVIDER ==========

export function TenantScopeProvider({ children }) {
  const location = useLocation();
  const { user } = useAuth();
  
  // Get tenant ID from URL
  const urlTenantId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tenant');
  }, [location.search]);

  // For SuperAdmin: allow switching to view as different tenant
  const [viewAsTenantId, setViewAsTenantId] = useState(null);
  
  const effectiveTenantId = viewAsTenantId || urlTenantId;

  // Fetch current tenant data
  const { 
    data: currentTenant, 
    isLoading: tenantLoading,
    error: tenantError 
  } = useQuery({
    queryKey: ['tenant-scope-provider', effectiveTenantId],
    queryFn: async () => {
      if (!effectiveTenantId) return null;
      const tenants = await base44.entities.Tenant.filter({ id: effectiveTenantId });
      return tenants[0] || null;
    },
    enabled: !!effectiveTenantId,
    staleTime: 10 * 60 * 1000
  });

  // Check super admin
  const isSuperAdmin = useMemo(() => 
    user?.role === 'super_admin' || user?.role === 'admin',
    [user?.role]
  );

  // Build tenant scope for queries
  const tenantScope = useMemo(() => {
    if (!effectiveTenantId) return null;
    return { shop_id: effectiveTenantId };
  }, [effectiveTenantId]);

  // Scoped query builder
  const scopedQuery = useCallback((baseQuery = {}) => {
    if (!tenantScope) return baseQuery;
    return { ...baseQuery, ...tenantScope };
  }, [tenantScope]);

  // Validate cross-tenant access
  const validateAccess = useCallback((resourceTenantId) => {
    // SuperAdmin can access anything
    if (isSuperAdmin) return { valid: true };
    
    // No tenant context
    if (!effectiveTenantId) {
      return { valid: false, error: 'NO_TENANT_CONTEXT' };
    }
    
    // Cross-tenant access attempt
    if (resourceTenantId && resourceTenantId !== effectiveTenantId) {
      return { valid: false, error: 'CROSS_TENANT_ACCESS_DENIED' };
    }
    
    return { valid: true };
  }, [effectiveTenantId, isSuperAdmin]);

  // Switch tenant (SuperAdmin only)
  const switchTenant = useCallback((newTenantId) => {
    if (!isSuperAdmin) return;
    setViewAsTenantId(newTenantId);
  }, [isSuperAdmin]);

  // Clear scope (return to own view)
  const clearScope = useCallback(() => {
    setViewAsTenantId(null);
  }, []);

  const value = useMemo(() => ({
    currentTenant,
    tenantId: effectiveTenantId,
    tenantScope,
    isSuperAdmin,
    isLoading: tenantLoading,
    error: tenantError,
    isViewingAs: !!viewAsTenantId,
    viewAsTenantId,
    // Actions
    scopedQuery,
    validateAccess,
    switchTenant,
    clearScope
  }), [
    currentTenant, 
    effectiveTenantId, 
    tenantScope, 
    isSuperAdmin, 
    tenantLoading, 
    tenantError,
    viewAsTenantId,
    scopedQuery, 
    validateAccess, 
    switchTenant, 
    clearScope
  ]);

  return (
    <TenantScopeContext.Provider value={value}>
      {children}
    </TenantScopeContext.Provider>
  );
}

// ========== HOOK ==========

export function useTenantScopeContext() {
  const context = useContext(TenantScopeContext);
  if (!context) {
    throw new Error('useTenantScopeContext must be used within TenantScopeProvider');
  }
  return context;
}

// ========== VIEW AS TENANT COMPONENT ==========

export function ViewAsTenantBanner() {
  const { isViewingAs, currentTenant, clearScope, isSuperAdmin } = useTenantScopeContext();

  if (!isSuperAdmin || !isViewingAs) return null;

  return (
    <div className="bg-purple-600 text-white px-4 py-2 flex items-center justify-between">
      <span className="text-sm">
        👁️ Đang xem với tư cách: <strong>{currentTenant?.organization_name}</strong>
      </span>
      <button
        onClick={clearScope}
        className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
      >
        Thoát chế độ xem
      </button>
    </div>
  );
}

// ========== HIGHER ORDER COMPONENT ==========

export function withTenantScope(WrappedComponent) {
  return function TenantScopedComponent(props) {
    const tenantContext = useTenantScopeContext();
    return <WrappedComponent {...props} tenantContext={tenantContext} />;
  };
}

export default TenantScopeProvider;
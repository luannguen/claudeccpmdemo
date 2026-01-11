/**
 * SaaS Module - Tenant Hooks
 * 
 * React hooks for tenant management.
 * Orchestrates domain + data layers.
 * 
 * @module features/saas/hooks/useTenant
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantRepository } from '../data';
import { validateTenantData, validateSlug } from '../domain/tenantValidators';

// ========== QUERY KEYS ==========

export const TENANT_QUERY_KEYS = {
  all: ['tenants'],
  list: (filters) => ['tenants', 'list', filters],
  detail: (id) => ['tenant', id],
  bySlug: (slug) => ['tenant', 'slug', slug],
  active: () => ['tenants', 'active']
};

// ========== QUERY HOOKS ==========

/**
 * Get tenant list with filters
 */
export function useTenantList(filters = {}, options = {}) {
  return useQuery({
    queryKey: TENANT_QUERY_KEYS.list(filters),
    queryFn: () => tenantRepository.listTenants(filters),
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Get tenant by ID
 */
export function useTenantDetail(tenantId, options = {}) {
  return useQuery({
    queryKey: TENANT_QUERY_KEYS.detail(tenantId),
    queryFn: () => tenantRepository.getTenantById(tenantId),
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Get tenant by slug
 */
export function useTenantBySlug(slug, options = {}) {
  return useQuery({
    queryKey: TENANT_QUERY_KEYS.bySlug(slug),
    queryFn: () => tenantRepository.getTenantBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    ...options
  });
}

/**
 * Get active tenants
 */
export function useActiveTenants(options = {}) {
  return useQuery({
    queryKey: TENANT_QUERY_KEYS.active(),
    queryFn: () => tenantRepository.listActiveTenants(),
    staleTime: 60 * 1000,
    ...options
  });
}

// ========== MUTATION HOOKS ==========

/**
 * Create tenant mutation
 */
export function useCreateTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tenantData) => {
      // Validate
      const validation = validateTenantData(tenantData);
      if (!validation.valid) {
        throw new Error(Object.values(validation.errors)[0]);
      }
      
      // Create
      return await tenantRepository.createTenant(tenantData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.all });
    }
  });
}

/**
 * Update tenant mutation
 */
export function useUpdateTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tenantId, updateData }) => {
      // Validate slug if updating
      if (updateData.slug) {
        const slugValidation = validateSlug(updateData.slug);
        if (!slugValidation.valid) {
          throw new Error(slugValidation.error);
        }
      }
      
      return await tenantRepository.updateTenant(tenantId, updateData);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.detail(variables.tenantId) });
    }
  });
}

/**
 * Delete tenant mutation
 */
export function useDeleteTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tenantId) => {
      return await tenantRepository.deleteTenant(tenantId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.all });
    }
  });
}

/**
 * Suspend tenant mutation
 */
export function useSuspendTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tenantId, reason }) => {
      return await tenantRepository.suspendTenant(tenantId, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.detail(variables.tenantId) });
    }
  });
}

/**
 * Activate tenant mutation
 */
export function useActivateTenant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tenantId) => {
      return await tenantRepository.activateTenant(tenantId);
    },
    onSuccess: (_, tenantId) => {
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TENANT_QUERY_KEYS.detail(tenantId) });
    }
  });
}

// ========== COMBINED HOOK ==========

/**
 * Combined tenant mutations
 */
export function useTenantMutations() {
  return {
    create: useCreateTenant(),
    update: useUpdateTenant(),
    delete: useDeleteTenant(),
    suspend: useSuspendTenant(),
    activate: useActivateTenant()
  };
}
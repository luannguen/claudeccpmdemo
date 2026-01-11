/**
 * useBilling.js
 * React hooks for billing and invoice management
 * 
 * Phase 2 - Task 2.5 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BillingService, INVOICE_STATUS } from '@/components/services/BillingService';

// ========== QUERY KEYS ==========

export const BILLING_QUERY_KEYS = {
  all: ['billing'],
  invoices: (filters) => ['invoices', filters],
  invoice: (id) => ['invoice', id],
  tenantInvoices: (tenantId) => ['invoices', 'tenant', tenantId],
  analytics: (period) => ['billing', 'analytics', period]
};

// ========== HOOKS ==========

/**
 * Get tenant invoices
 */
export function useTenantInvoices(tenantId, options = {}) {
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.tenantInvoices(tenantId),
    queryFn: () => BillingService.getInvoicesByTenant(tenantId),
    enabled: !!tenantId,
    staleTime: 30 * 1000,
    ...options
  });
}

/**
 * Get invoice detail
 */
export function useInvoiceDetail(invoiceId, options = {}) {
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.invoice(invoiceId),
    queryFn: async () => {
      const invoices = await base44.entities.Invoice.filter({ id: invoiceId });
      return invoices[0] || null;
    },
    enabled: !!invoiceId,
    ...options
  });
}

/**
 * Get billing analytics
 */
export function useBillingAnalytics(periodMonth = null, options = {}) {
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.analytics(periodMonth),
    queryFn: () => BillingService.getBillingAnalytics(periodMonth),
    staleTime: 60 * 1000,
    ...options
  });
}

/**
 * Mark invoice as paid
 */
export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ invoiceId, paymentInfo }) => {
      return await BillingService.markInvoicePaid(invoiceId, paymentInfo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.all });
    }
  });
}

/**
 * Generate invoices manually
 */
export function useGenerateInvoices() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('generateMonthlyInvoices', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.all });
    }
  });
}

/**
 * Send billing reminders manually
 */
export function useSendBillingReminders() {
  return useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('sendBillingReminders', {});
      return response.data;
    }
  });
}

/**
 * Process subscription renewals manually
 */
export function useProcessSubscriptionRenewals() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('processSubscriptionRenewal', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    }
  });
}

/**
 * Combined admin billing hook
 */
export function useAdminBilling(periodMonth = null) {
  const analyticsQuery = useBillingAnalytics(periodMonth);
  const generateInvoices = useGenerateInvoices();
  const sendReminders = useSendBillingReminders();
  const processRenewals = useProcessSubscriptionRenewals();
  const markPaid = useMarkInvoicePaid();
  
  return {
    analytics: analyticsQuery.data,
    isLoading: analyticsQuery.isLoading,
    error: analyticsQuery.error,
    
    // Actions
    generateInvoices: generateInvoices.mutateAsync,
    sendReminders: sendReminders.mutateAsync,
    processRenewals: processRenewals.mutateAsync,
    markPaid: markPaid.mutateAsync,
    
    // States
    isGenerating: generateInvoices.isPending,
    isSending: sendReminders.isPending,
    isProcessing: processRenewals.isPending,
    isMarkingPaid: markPaid.isPending,
    
    refetch: () => analyticsQuery.refetch()
  };
}

// ========== EXPORTS ==========

export { INVOICE_STATUS, BILLING_CYCLE } from '@/components/services/BillingService';
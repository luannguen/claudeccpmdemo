/**
 * SaaS Module - Billing Hooks
 * 
 * React hooks for billing and invoice management.
 * Orchestrates domain + data layers.
 * 
 * @module features/saas/hooks/useBilling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { invoiceRepository, subscriptionRepository, tenantRepository } from '../data';
import { 
  calculateInvoiceAmounts, 
  generateInvoiceNumber,
  calculateDueDate,
  isInvoiceOverdue 
} from '../domain/billingRules';
import { INVOICE_STATUS } from '../types';

// ========== QUERY KEYS ==========

export const BILLING_QUERY_KEYS = {
  all: ['billing'],
  invoices: (filters) => ['invoices', filters],
  invoice: (id) => ['invoice', id],
  tenantInvoices: (tenantId) => ['invoices', 'tenant', tenantId],
  analytics: (period) => ['billing', 'analytics', period]
};

// ========== QUERY HOOKS ==========

/**
 * Get tenant invoices
 */
export function useTenantInvoices(tenantId, options = {}) {
  return useQuery({
    queryKey: BILLING_QUERY_KEYS.tenantInvoices(tenantId),
    queryFn: () => invoiceRepository.getInvoicesByTenant(tenantId),
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
    queryFn: () => invoiceRepository.getInvoiceById(invoiceId),
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
    queryFn: async () => {
      const invoices = periodMonth
        ? await invoiceRepository.listInvoices({ invoice_date: { $regex: `^${periodMonth}` } })
        : await invoiceRepository.listInvoices({}, 1000);
      
      const totalRevenue = invoices
        .filter(inv => inv.status === INVOICE_STATUS.PAID)
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
      const totalPending = invoices
        .filter(inv => inv.status === INVOICE_STATUS.SENT)
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
      const totalOverdue = invoices
        .filter(inv => inv.status === INVOICE_STATUS.OVERDUE)
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      
      return {
        period: periodMonth || 'all',
        total_invoices: invoices.length,
        total_revenue: totalRevenue,
        total_pending: totalPending,
        total_overdue: totalOverdue,
        paid_count: invoices.filter(inv => inv.status === INVOICE_STATUS.PAID).length,
        pending_count: invoices.filter(inv => inv.status === INVOICE_STATUS.SENT).length,
        overdue_count: invoices.filter(inv => inv.status === INVOICE_STATUS.OVERDUE).length,
        collection_rate: invoices.length > 0 
          ? (invoices.filter(inv => inv.status === INVOICE_STATUS.PAID).length / invoices.length * 100)
          : 0
      };
    },
    staleTime: 60 * 1000,
    ...options
  });
}

// ========== MUTATION HOOKS ==========

/**
 * Create invoice mutation
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscription, tenant, billingAddress }) => {
      // Get plan price
      const planPrice = subscription.price || 0;
      
      // Calculate amounts using domain
      const amounts = calculateInvoiceAmounts(planPrice);
      
      // Generate invoice number
      const invoiceNumber = generateInvoiceNumber();
      
      // Calculate due date
      const dueDate = calculateDueDate(new Date(), 7);
      
      // Create invoice using repository
      return await invoiceRepository.createInvoice({
        tenant_id: tenant.id,
        subscription_id: subscription.id,
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        billing_period_start: subscription.current_period_start,
        billing_period_end: subscription.current_period_end,
        plan_name: subscription.plan_name,
        billing_cycle: subscription.billing_cycle || 'monthly',
        ...amounts,
        currency: 'VND',
        status: INVOICE_STATUS.DRAFT,
        billing_address: {
          organization_name: tenant.organization_name,
          address: tenant.address,
          email: tenant.owner_email,
          phone: tenant.phone,
          ...billingAddress
        },
        line_items: [{
          description: `${subscription.plan_name.toUpperCase()} Plan - Subscription`,
          quantity: 1,
          unit_price: planPrice,
          amount: planPrice
        }]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.all });
    }
  });
}

/**
 * Mark invoice as paid
 */
export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ invoiceId, paymentInfo }) => {
      const invoice = await invoiceRepository.markInvoicePaid(invoiceId, paymentInfo);
      
      // Update subscription status if invoice paid
      if (invoice.subscription_id) {
        await subscriptionRepository.updateSubscription(invoice.subscription_id, {
          status: 'active',
          last_payment_date: new Date().toISOString()
        });
      }
      
      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
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
      queryClient.invalidateQueries({ queryKey: BILLING_QUERY_KEYS.all });
    }
  });
}

// ========== COMBINED HOOK ==========

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
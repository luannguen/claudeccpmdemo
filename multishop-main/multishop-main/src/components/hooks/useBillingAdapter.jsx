/**
 * useBilling Adapter
 * 
 * Backward compatibility adapter for legacy code.
 * Re-exports from features/saas module.
 * 
 * @deprecated Use @/components/features/saas instead
 */

export {
  useTenantInvoices,
  useInvoiceDetail,
  useBillingAnalytics,
  useCreateInvoice,
  useMarkInvoicePaid,
  useGenerateInvoices,
  useSendBillingReminders,
  useProcessSubscriptionRenewals,
  useAdminBilling,
  BILLING_QUERY_KEYS
} from '@/components/features/saas/hooks/useBilling';

export { INVOICE_STATUS, BILLING_CYCLE } from '@/components/features/saas';
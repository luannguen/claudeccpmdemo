/**
 * BillingService Adapter
 * 
 * Backward compatibility adapter for legacy code.
 * Re-exports from features/saas module.
 * 
 * @deprecated Use @/components/features/saas instead
 */

export {
  INVOICE_STATUS,
  BILLING_CYCLE
} from '@/components/features/saas';

export {
  generateInvoiceNumber,
  calculateInvoiceAmounts,
  calculateDueDate,
  shouldSendReminder,
  isInvoiceOverdue,
  getDaysUntilDue,
  getInvoiceUrgency
} from '@/components/features/saas/domain/billingRules';

export {
  invoiceRepository as InvoiceRepo,
  subscriptionRepository as SubscriptionRepo
} from '@/components/features/saas/data';

// Legacy function signatures
export async function createSubscriptionInvoice(params) {
  const { invoiceRepository } = await import('@/components/features/saas/data');
  const { calculateInvoiceAmounts, generateInvoiceNumber, calculateDueDate } = 
    await import('@/components/features/saas/domain/billingRules');
  
  const { subscription, tenant, billingAddress = {} } = params;
  const planPrice = subscription.price || 0;
  const amounts = calculateInvoiceAmounts(planPrice);
  const invoiceNumber = generateInvoiceNumber();
  const dueDate = calculateDueDate(new Date(), 7);
  
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
    status: 'draft',
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
}

export async function markInvoiceSent(invoiceId, recipientEmail) {
  const { invoiceRepository } = await import('@/components/features/saas/data');
  return await invoiceRepository.markInvoiceSent(invoiceId, recipientEmail);
}

export async function markInvoicePaid(invoiceId, paymentInfo) {
  const { invoiceRepository } = await import('@/components/features/saas/data');
  return await invoiceRepository.markInvoicePaid(invoiceId, paymentInfo);
}

export async function markInvoiceOverdue(invoiceId) {
  const { invoiceRepository } = await import('@/components/features/saas/data');
  return await invoiceRepository.markInvoiceOverdue(invoiceId);
}

export async function getInvoicesByTenant(tenantId, limit) {
  const { invoiceRepository } = await import('@/components/features/saas/data');
  return await invoiceRepository.getInvoicesByTenant(tenantId, limit);
}

export async function getOverdueInvoices() {
  const { invoiceRepository } = await import('@/components/features/saas/data');
  return await invoiceRepository.getOverdueInvoices();
}

export async function getInvoicesNeedingReminder(daysBeforeDue) {
  const { invoiceRepository } = await import('@/components/features/saas/data');
  return await invoiceRepository.getInvoicesNeedingReminder(daysBeforeDue);
}

export async function incrementReminderCount(invoiceId) {
  const { invoiceRepository } = await import('@/components/features/saas/data');
  return await invoiceRepository.incrementReminderCount(invoiceId);
}

export async function renewSubscription(subscriptionId) {
  const { subscriptionRepository } = await import('@/components/features/saas/data');
  const { calculateNextPeriodEnd } = await import('@/components/features/saas/domain/billingRules');
  
  const subscription = await subscriptionRepository.getSubscriptionById(subscriptionId);
  if (!subscription) return null;
  
  const nextPeriodEnd = calculateNextPeriodEnd(
    subscription.current_period_end,
    subscription.billing_cycle
  );
  
  return await subscriptionRepository.renewSubscription(subscriptionId, nextPeriodEnd);
}

export async function suspendSubscription(subscriptionId, reason) {
  const { subscriptionRepository } = await import('@/components/features/saas/data');
  return await subscriptionRepository.suspendSubscription(subscriptionId, reason);
}

export async function getExpiringSubscriptions(daysThreshold) {
  const { subscriptionRepository } = await import('@/components/features/saas/data');
  const now = new Date();
  const threshold = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
  return await subscriptionRepository.getExpiringSubscriptions(threshold);
}

export async function getBillingAnalytics(periodMonth) {
  const { invoiceRepository } = await import('@/components/features/saas/data');
  const { INVOICE_STATUS } = await import('@/components/features/saas');
  
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
}

// Legacy default export
export const BillingService = {
  INVOICE_STATUS,
  BILLING_CYCLE,
  generateInvoiceNumber,
  calculateInvoiceAmounts,
  createSubscriptionInvoice,
  markInvoiceSent,
  markInvoicePaid,
  markInvoiceOverdue,
  getInvoicesByTenant,
  getOverdueInvoices,
  getInvoicesNeedingReminder,
  incrementReminderCount,
  renewSubscription,
  suspendSubscription,
  getExpiringSubscriptions,
  getBillingAnalytics
};

export default BillingService;
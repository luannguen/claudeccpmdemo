/**
 * BillingService.js
 * Core service quản lý billing, invoice, subscription
 * 
 * Phase 2 - Task 2.5 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import { base44 } from '@/api/base44Client';
import { eventBus } from '@/components/shared/events';
import { EMAIL_EVENT_TYPES } from '@/components/features/email/types/EventPayloads';

// ========== CONSTANTS ==========

export const INVOICE_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

export const BILLING_CYCLE = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};

export const SUBSCRIPTION_PLAN_PRICES = {
  free: 0,
  starter: 199000, // 199K/month
  pro: 499000,     // 499K/month
  enterprise: 1500000 // 1.5M/month
};

// ========== INVOICE OPERATIONS ==========

/**
 * Generate invoice number
 * Format: INV-YYYYMMDD-XXX
 */
export function generateInvoiceNumber() {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${dateStr}-${random}`;
}

/**
 * Calculate invoice amounts
 */
export function calculateInvoiceAmounts(subtotal, taxRate = 10, discountAmount = 0) {
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = Math.round(afterDiscount * (taxRate / 100));
  const total = afterDiscount + taxAmount;
  
  return {
    subtotal,
    discount_amount: discountAmount,
    tax_rate: taxRate,
    tax_amount: taxAmount,
    total_amount: total
  };
}

/**
 * Create invoice for subscription
 */
export async function createSubscriptionInvoice({ 
  subscription, 
  tenant, 
  billingAddress = {} 
}) {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const dueDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7); // 7 days
  
  // Get plan price
  const planPrice = SUBSCRIPTION_PLAN_PRICES[subscription.plan_name] || 0;
  
  // Calculate amounts
  const amounts = calculateInvoiceAmounts(planPrice);
  
  // Generate invoice
  const invoice = await base44.entities.Invoice.create({
    tenant_id: tenant.id,
    subscription_id: subscription.id,
    invoice_number: generateInvoiceNumber(),
    invoice_date: now.toISOString().split('T')[0],
    due_date: dueDate.toISOString().split('T')[0],
    billing_period_start: subscription.current_period_start,
    billing_period_end: subscription.current_period_end,
    plan_name: subscription.plan_name,
    billing_cycle: subscription.billing_cycle || 'monthly',
    subtotal: amounts.subtotal,
    tax_rate: amounts.tax_rate,
    tax_amount: amounts.tax_amount,
    discount_amount: amounts.discount_amount,
    total_amount: amounts.total_amount,
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
  
  return invoice;
}

/**
 * Mark invoice as sent
 */
export async function markInvoiceSent(invoiceId, recipientEmail) {
  const invoices = await base44.entities.Invoice.filter({ id: invoiceId });
  const invoice = invoices[0];
  
  const updated = await base44.entities.Invoice.update(invoiceId, {
    status: INVOICE_STATUS.SENT,
    sent_to_email: recipientEmail,
    sent_date: new Date().toISOString()
  });
  
  // 📧 Publish INVOICE_GENERATED event
  if (invoice) {
    // Get tenant for shop name
    const tenants = await base44.entities.Tenant.filter({ id: invoice.tenant_id });
    const tenant = tenants[0];
    
    eventBus.publish(EMAIL_EVENT_TYPES.INVOICE_GENERATED, {
      tenantEmail: recipientEmail,
      shopName: tenant?.organization_name || invoice.billing_address?.organization_name,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.total_amount,
      dueDate: invoice.due_date,
      invoiceLink: `/tenant/invoices?id=${invoiceId}`
    });
  }
  
  return updated;
}

/**
 * Mark invoice as paid
 */
export async function markInvoicePaid(invoiceId, paymentInfo = {}) {
  const invoice = await base44.entities.Invoice.update(invoiceId, {
    status: INVOICE_STATUS.PAID,
    paid_date: new Date().toISOString(),
    payment_method: paymentInfo.payment_method,
    payment_id: paymentInfo.payment_id
  });
  
  // Update subscription status
  if (invoice.subscription_id) {
    const subscriptions = await base44.entities.Subscription.filter({ 
      id: invoice.subscription_id 
    });
    const subscription = subscriptions[0];
    
    if (subscription) {
      await base44.entities.Subscription.update(subscription.id, {
        status: 'active',
        last_payment_date: new Date().toISOString()
      });
    }
  }
  
  return invoice;
}

/**
 * Mark invoice as overdue
 */
export async function markInvoiceOverdue(invoiceId) {
  return await base44.entities.Invoice.update(invoiceId, {
    status: INVOICE_STATUS.OVERDUE
  });
}

/**
 * Get invoices by tenant
 */
export async function getInvoicesByTenant(tenantId, limit = 100) {
  return await base44.entities.Invoice.filter({ tenant_id: tenantId }, '-invoice_date', limit);
}

/**
 * Get overdue invoices
 */
export async function getOverdueInvoices() {
  const allInvoices = await base44.entities.Invoice.list('-due_date', 500);
  const now = new Date();
  
  return allInvoices.filter(inv => 
    inv.status === INVOICE_STATUS.SENT && 
    new Date(inv.due_date) < now
  );
}

/**
 * Get invoices needing reminders
 * @param {number} daysBeforeDue - Number of days before due date
 */
export async function getInvoicesNeedingReminder(daysBeforeDue = 3) {
  const allInvoices = await base44.entities.Invoice.list('-due_date', 500);
  const now = new Date();
  const targetDate = new Date(now.getTime() + daysBeforeDue * 24 * 60 * 60 * 1000);
  
  return allInvoices.filter(inv => {
    if (inv.status !== INVOICE_STATUS.SENT) return false;
    
    const dueDate = new Date(inv.due_date);
    const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    // Send reminder at 7, 3, 1 days before due
    return daysDiff === daysBeforeDue;
  });
}

/**
 * Increment reminder count
 */
export async function incrementReminderCount(invoiceId) {
  const invoices = await base44.entities.Invoice.filter({ id: invoiceId });
  const invoice = invoices[0];
  
  if (!invoice) return null;
  
  return await base44.entities.Invoice.update(invoiceId, {
    reminder_sent_count: (invoice.reminder_sent_count || 0) + 1,
    last_reminder_date: new Date().toISOString()
  });
}

// ========== SUBSCRIPTION OPERATIONS ==========

/**
 * Renew subscription for next period
 */
export async function renewSubscription(subscriptionId) {
  const subscriptions = await base44.entities.Subscription.filter({ id: subscriptionId });
  const subscription = subscriptions[0];
  
  if (!subscription) return null;
  
  // Calculate next period
  const currentEnd = new Date(subscription.current_period_end);
  let nextEnd;
  
  if (subscription.billing_cycle === BILLING_CYCLE.YEARLY) {
    nextEnd = new Date(currentEnd.getFullYear() + 1, currentEnd.getMonth(), currentEnd.getDate());
  } else if (subscription.billing_cycle === BILLING_CYCLE.QUARTERLY) {
    nextEnd = new Date(currentEnd.getFullYear(), currentEnd.getMonth() + 3, currentEnd.getDate());
  } else {
    nextEnd = new Date(currentEnd.getFullYear(), currentEnd.getMonth() + 1, currentEnd.getDate());
  }
  
  return await base44.entities.Subscription.update(subscriptionId, {
    status: 'active',
    current_period_start: subscription.current_period_end,
    current_period_end: nextEnd.toISOString().split('T')[0]
  });
}

/**
 * Suspend subscription
 */
export async function suspendSubscription(subscriptionId, reason = '') {
  const subscription = await base44.entities.Subscription.update(subscriptionId, {
    status: 'suspended',
    suspended_date: new Date().toISOString(),
    suspension_reason: reason
  });
  
  // Update tenant status
  const subscriptions = await base44.entities.Subscription.filter({ id: subscriptionId });
  const sub = subscriptions[0];
  
  if (sub?.tenant_id) {
    await base44.entities.Tenant.update(sub.tenant_id, {
      subscription_status: 'suspended'
    });
    
    // Get tenant email
    const tenants = await base44.entities.Tenant.filter({ id: sub.tenant_id });
    const tenant = tenants[0];
    
    // 📧 Publish SUBSCRIPTION_PAYMENT_FAILED event
    if (tenant && reason.includes('payment')) {
      eventBus.publish(EMAIL_EVENT_TYPES.SUBSCRIPTION_PAYMENT_FAILED, {
        tenantEmail: tenant.owner_email,
        shopName: tenant.organization_name,
        amount: SUBSCRIPTION_PLAN_PRICES[sub.plan_name] || 0,
        retryLink: `/tenant/billing?retry=true`
      });
    }
  }
  
  return subscription;
}

/**
 * Get subscriptions expiring soon
 * @param {number} daysThreshold - Default 7 days
 */
export async function getExpiringSubscriptions(daysThreshold = 7) {
  const allSubs = await base44.entities.Subscription.list('-current_period_end', 500);
  const now = new Date();
  const threshold = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);
  
  return allSubs.filter(sub => 
    sub.status === 'active' && 
    new Date(sub.current_period_end) <= threshold
  );
}

/**
 * Send expiry warning emails for subscriptions
 * Call this from a scheduled job
 */
export async function sendExpiryWarnings(daysThreshold = 7) {
  const expiringSubs = await getExpiringSubscriptions(daysThreshold);
  
  for (const sub of expiringSubs) {
    // Get tenant info
    const tenants = await base44.entities.Tenant.filter({ id: sub.tenant_id });
    const tenant = tenants[0];
    
    if (tenant) {
      // 📧 Publish SUBSCRIPTION_EXPIRY_WARNING event
      eventBus.publish(EMAIL_EVENT_TYPES.SUBSCRIPTION_EXPIRY_WARNING, {
        tenantEmail: tenant.owner_email,
        shopName: tenant.organization_name,
        expiryDate: sub.current_period_end,
        renewLink: `/tenant/billing?renew=true`
      });
    }
  }
  
  return { sent: expiringSubs.length };
}

/**
 * Get billing analytics
 */
export async function getBillingAnalytics(periodMonth = null) {
  const invoices = await base44.entities.Invoice.list('-invoice_date', 1000);
  
  const filtered = periodMonth 
    ? invoices.filter(inv => inv.invoice_date?.startsWith(periodMonth))
    : invoices;
  
  const totalRevenue = filtered.filter(inv => inv.status === INVOICE_STATUS.PAID)
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  
  const totalPending = filtered.filter(inv => inv.status === INVOICE_STATUS.SENT)
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  
  const totalOverdue = filtered.filter(inv => inv.status === INVOICE_STATUS.OVERDUE)
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  
  return {
    period: periodMonth || 'all',
    total_invoices: filtered.length,
    total_revenue: totalRevenue,
    total_pending: totalPending,
    total_overdue: totalOverdue,
    paid_count: filtered.filter(inv => inv.status === INVOICE_STATUS.PAID).length,
    pending_count: filtered.filter(inv => inv.status === INVOICE_STATUS.SENT).length,
    overdue_count: filtered.filter(inv => inv.status === INVOICE_STATUS.OVERDUE).length,
    collection_rate: filtered.length > 0 
      ? (filtered.filter(inv => inv.status === INVOICE_STATUS.PAID).length / filtered.length * 100)
      : 0
  };
}

// ========== EXPORTS ==========

export const BillingService = {
  INVOICE_STATUS,
  BILLING_CYCLE,
  SUBSCRIPTION_PLAN_PRICES,
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
  sendExpiryWarnings,
  getBillingAnalytics
};

export default BillingService;
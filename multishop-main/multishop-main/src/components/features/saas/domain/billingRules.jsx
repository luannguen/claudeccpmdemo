/**
 * SaaS Module - Billing Rules
 * 
 * Pure functions for billing calculations and invoice logic.
 * NO side effects, NO API calls.
 * 
 * @module features/saas/domain/billingRules
 */

import { BILLING_CYCLE } from '../types';

// ========== INVOICE NUMBER GENERATION ==========

/**
 * Generate invoice number
 * Format: INV-YYYYMMDD-XXX
 * @param {Date} date - Invoice date
 * @returns {string} Invoice number
 */
export function generateInvoiceNumber(date = new Date()) {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${dateStr}-${random}`;
}

// ========== AMOUNT CALCULATIONS ==========

/**
 * Calculate invoice amounts with tax and discount
 * @param {number} subtotal - Subtotal before tax/discount
 * @param {number} taxRate - Tax rate percentage (default 10%)
 * @param {number} discountAmount - Discount amount (default 0)
 * @returns {Object} { subtotal, discount_amount, tax_rate, tax_amount, total_amount }
 */
export function calculateInvoiceAmounts(subtotal, taxRate = 10, discountAmount = 0) {
  if (subtotal < 0) throw new Error('Subtotal cannot be negative');
  if (taxRate < 0 || taxRate > 100) throw new Error('Tax rate must be between 0 and 100');
  if (discountAmount < 0) throw new Error('Discount cannot be negative');
  if (discountAmount > subtotal) throw new Error('Discount cannot exceed subtotal');
  
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

// ========== DUE DATE CALCULATIONS ==========

/**
 * Calculate due date from invoice date
 * @param {Date} invoiceDate - Invoice date
 * @param {number} daysToAdd - Days to add (default 7)
 * @returns {Date} Due date
 */
export function calculateDueDate(invoiceDate = new Date(), daysToAdd = 7) {
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + daysToAdd);
  return dueDate;
}

// ========== BILLING PERIOD CALCULATIONS ==========

/**
 * Calculate next billing period end date
 * @param {Date} currentPeriodEnd - Current period end date
 * @param {string} billingCycle - Billing cycle (monthly, quarterly, yearly)
 * @returns {Date} Next period end date
 */
export function calculateNextPeriodEnd(currentPeriodEnd, billingCycle = BILLING_CYCLE.MONTHLY) {
  const currentEnd = new Date(currentPeriodEnd);
  let nextEnd;
  
  switch (billingCycle) {
    case BILLING_CYCLE.YEARLY:
      nextEnd = new Date(currentEnd);
      nextEnd.setFullYear(currentEnd.getFullYear() + 1);
      break;
      
    case BILLING_CYCLE.QUARTERLY:
      nextEnd = new Date(currentEnd);
      nextEnd.setMonth(currentEnd.getMonth() + 3);
      break;
      
    case BILLING_CYCLE.MONTHLY:
    default:
      nextEnd = new Date(currentEnd);
      nextEnd.setMonth(currentEnd.getMonth() + 1);
      break;
  }
  
  return nextEnd;
}

// ========== REMINDER LOGIC ==========

/**
 * Check if invoice needs reminder
 * @param {Object} invoice - Invoice object
 * @param {number} daysBeforeDue - Days before due date to send reminder
 * @returns {boolean} Should send reminder
 */
export function shouldSendReminder(invoice, daysBeforeDue) {
  if (invoice.status !== 'sent') return false;
  
  const now = new Date();
  const dueDate = new Date(invoice.due_date);
  const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  
  return daysDiff === daysBeforeDue;
}

/**
 * Check if invoice is overdue
 * @param {Object} invoice - Invoice object
 * @returns {boolean} Is overdue
 */
export function isInvoiceOverdue(invoice) {
  if (invoice.status === 'paid') return false;
  
  const now = new Date();
  const dueDate = new Date(invoice.due_date);
  
  return now > dueDate;
}

/**
 * Get days until due
 * @param {string} dueDate - Due date string
 * @returns {number} Days until due (negative if overdue)
 */
export function getDaysUntilDue(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ========== INVOICE STATUS ==========

/**
 * Get invoice urgency level
 * @param {Object} invoice - Invoice object
 * @returns {string} 'critical' | 'urgent' | 'normal'
 */
export function getInvoiceUrgency(invoice) {
  if (invoice.status === 'overdue') return 'critical';
  
  const daysUntilDue = getDaysUntilDue(invoice.due_date);
  
  if (daysUntilDue <= 1) return 'critical';
  if (daysUntilDue <= 3) return 'urgent';
  return 'normal';
}
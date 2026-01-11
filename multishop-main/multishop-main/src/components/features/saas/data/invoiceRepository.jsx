/**
 * SaaS Module - Invoice Repository
 * 
 * Data access layer for Invoice entity.
 * ONLY API calls, NO business logic.
 * 
 * @module features/saas/data/invoiceRepository
 */

import { base44 } from '@/api/base44Client';
import { INVOICE_STATUS } from '../types';

// ========== INVOICE CRUD ==========

/**
 * Get invoice by ID
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object|null>} Invoice or null
 */
export async function getInvoiceById(invoiceId) {
  const invoices = await base44.entities.Invoice.filter({ id: invoiceId });
  return invoices[0] || null;
}

/**
 * Get invoices by tenant
 * @param {string} tenantId - Tenant ID
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Invoices
 */
export async function getInvoicesByTenant(tenantId, limit = 100) {
  return await base44.entities.Invoice.filter({ tenant_id: tenantId }, '-invoice_date', limit);
}

/**
 * List all invoices with filters
 * @param {Object} filters - Filter object
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Invoices
 */
export async function listInvoices(filters = {}, limit = 500) {
  return await base44.entities.Invoice.filter(filters, '-invoice_date', limit);
}

/**
 * Create new invoice
 * @param {Object} invoiceData - Invoice data
 * @returns {Promise<Object>} Created invoice
 */
export async function createInvoice(invoiceData) {
  return await base44.entities.Invoice.create(invoiceData);
}

/**
 * Update invoice
 * @param {string} invoiceId - Invoice ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated invoice
 */
export async function updateInvoice(invoiceId, updateData) {
  return await base44.entities.Invoice.update(invoiceId, updateData);
}

// ========== INVOICE STATUS UPDATES ==========

/**
 * Mark invoice as sent
 * @param {string} invoiceId - Invoice ID
 * @param {string} recipientEmail - Recipient email
 * @returns {Promise<Object>} Updated invoice
 */
export async function markInvoiceSent(invoiceId, recipientEmail) {
  return await updateInvoice(invoiceId, {
    status: INVOICE_STATUS.SENT,
    sent_to_email: recipientEmail,
    sent_date: new Date().toISOString()
  });
}

/**
 * Mark invoice as paid
 * @param {string} invoiceId - Invoice ID
 * @param {Object} paymentInfo - Payment information
 * @returns {Promise<Object>} Updated invoice
 */
export async function markInvoicePaid(invoiceId, paymentInfo = {}) {
  return await updateInvoice(invoiceId, {
    status: INVOICE_STATUS.PAID,
    paid_date: new Date().toISOString(),
    payment_method: paymentInfo.payment_method,
    payment_id: paymentInfo.payment_id
  });
}

/**
 * Mark invoice as overdue
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object>} Updated invoice
 */
export async function markInvoiceOverdue(invoiceId) {
  return await updateInvoice(invoiceId, {
    status: INVOICE_STATUS.OVERDUE
  });
}

/**
 * Cancel invoice
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object>} Updated invoice
 */
export async function cancelInvoice(invoiceId) {
  return await updateInvoice(invoiceId, {
    status: INVOICE_STATUS.CANCELLED
  });
}

// ========== REMINDER TRACKING ==========

/**
 * Increment reminder count
 * @param {string} invoiceId - Invoice ID
 * @returns {Promise<Object>} Updated invoice
 */
export async function incrementReminderCount(invoiceId) {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) throw new Error('Invoice not found');
  
  return await updateInvoice(invoiceId, {
    reminder_sent_count: (invoice.reminder_sent_count || 0) + 1,
    last_reminder_date: new Date().toISOString()
  });
}

// ========== QUERIES ==========

/**
 * Get overdue invoices
 * @returns {Promise<Array>} Overdue invoices
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
 * Get invoices needing reminder at specific days before due
 * @param {number} daysBeforeDue - Days before due date
 * @returns {Promise<Array>} Invoices needing reminder
 */
export async function getInvoicesNeedingReminder(daysBeforeDue = 3) {
  const allInvoices = await base44.entities.Invoice.list('-due_date', 500);
  const now = new Date();
  
  return allInvoices.filter(inv => {
    if (inv.status !== INVOICE_STATUS.SENT) return false;
    
    const dueDate = new Date(inv.due_date);
    const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    return daysDiff === daysBeforeDue;
  });
}

/**
 * Get invoices by status
 * @param {string} status - Invoice status
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Invoices
 */
export async function getInvoicesByStatus(status, limit = 100) {
  return await base44.entities.Invoice.filter({ status }, '-invoice_date', limit);
}

// ========== EXPORT ==========

export const invoiceRepository = {
  getInvoiceById,
  getInvoicesByTenant,
  listInvoices,
  createInvoice,
  updateInvoice,
  markInvoiceSent,
  markInvoicePaid,
  markInvoiceOverdue,
  cancelInvoice,
  incrementReminderCount,
  getOverdueInvoices,
  getInvoicesNeedingReminder,
  getInvoicesByStatus
};
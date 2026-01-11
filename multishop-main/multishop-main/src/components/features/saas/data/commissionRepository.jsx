/**
 * SaaS Module - Commission Repository
 * 
 * Data access layer for Commission entity.
 * ONLY API calls, NO business logic.
 * 
 * @module features/saas/data/commissionRepository
 */

import { base44 } from '@/api/base44Client';
import { COMMISSION_STATUS } from '../types';

// ========== COMMISSION CRUD ==========

/**
 * Get commission by ID
 * @param {string} commissionId - Commission ID
 * @returns {Promise<Object|null>} Commission or null
 */
export async function getCommissionById(commissionId) {
  const commissions = await base44.entities.Commission.filter({ id: commissionId });
  return commissions[0] || null;
}

/**
 * Get commission by order ID
 * @param {string} orderId - Order ID
 * @returns {Promise<Object|null>} Commission or null
 */
export async function getCommissionByOrderId(orderId) {
  const commissions = await base44.entities.Commission.filter({ order_id: orderId });
  return commissions[0] || null;
}

/**
 * List commissions with filters
 * @param {Object} filters - Filter object
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Commissions
 */
export async function listCommissions(filters = {}, limit = 500) {
  return await base44.entities.Commission.filter(filters, '-created_date', limit);
}

/**
 * Get commissions by shop
 * @param {string} shopId - Shop ID
 * @param {string} periodMonth - Optional period (YYYY-MM)
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Commissions
 */
export async function getCommissionsByShop(shopId, periodMonth = null, limit = 500) {
  const filter = { shop_id: shopId };
  if (periodMonth) {
    filter.period_month = periodMonth;
  }
  return await base44.entities.Commission.filter(filter, '-created_date', limit);
}

/**
 * Create new commission
 * @param {Object} commissionData - Commission data
 * @returns {Promise<Object>} Created commission
 */
export async function createCommission(commissionData) {
  return await base44.entities.Commission.create(commissionData);
}

/**
 * Update commission
 * @param {string} commissionId - Commission ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object>} Updated commission
 */
export async function updateCommission(commissionId, updateData) {
  return await base44.entities.Commission.update(commissionId, updateData);
}

// ========== COMMISSION STATUS UPDATES ==========

/**
 * Approve commission
 * @param {string} commissionId - Commission ID
 * @param {string} approvedBy - Approver email
 * @returns {Promise<Object>} Updated commission
 */
export async function approveCommission(commissionId, approvedBy) {
  return await updateCommission(commissionId, {
    status: COMMISSION_STATUS.APPROVED,
    approved_date: new Date().toISOString(),
    notes: `Approved by ${approvedBy}`
  });
}

/**
 * Mark commission as paid
 * @param {string} commissionId - Commission ID
 * @param {Object} paymentInfo - Payment info
 * @returns {Promise<Object>} Updated commission
 */
export async function markCommissionPaid(commissionId, paymentInfo = {}) {
  return await updateCommission(commissionId, {
    status: COMMISSION_STATUS.PAID,
    paid_date: new Date().toISOString(),
    payment_method: paymentInfo.payment_method,
    payment_reference: paymentInfo.payment_reference
  });
}

/**
 * Bulk approve commissions
 * @param {Array<string>} commissionIds - Commission IDs
 * @param {string} approvedBy - Approver email
 * @returns {Promise<Array>} Updated commissions
 */
export async function bulkApproveCommissions(commissionIds, approvedBy) {
  const results = [];
  for (const id of commissionIds) {
    const result = await approveCommission(id, approvedBy);
    results.push(result);
  }
  return results;
}

// ========== QUERIES ==========

/**
 * Get commissions by status
 * @param {string} status - Commission status
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Commissions
 */
export async function getCommissionsByStatus(status, limit = 500) {
  return await base44.entities.Commission.filter({ status }, '-created_date', limit);
}

/**
 * Check if commission exists for order
 * @param {string} orderId - Order ID
 * @returns {Promise<boolean>} Commission exists
 */
export async function hasCommissionForOrder(orderId) {
  const commission = await getCommissionByOrderId(orderId);
  return !!commission;
}

/**
 * Get commissions by period
 * @param {string} periodMonth - Period (YYYY-MM)
 * @param {number} limit - Max results
 * @returns {Promise<Array>} Commissions
 */
export async function getCommissionsByPeriod(periodMonth, limit = 500) {
  return await base44.entities.Commission.filter({ period_month: periodMonth }, '-created_date', limit);
}

// ========== EXPORT ==========

export const commissionRepository = {
  getCommissionById,
  getCommissionByOrderId,
  listCommissions,
  getCommissionsByShop,
  createCommission,
  updateCommission,
  approveCommission,
  markCommissionPaid,
  bulkApproveCommissions,
  getCommissionsByStatus,
  hasCommissionForOrder,
  getCommissionsByPeriod
};
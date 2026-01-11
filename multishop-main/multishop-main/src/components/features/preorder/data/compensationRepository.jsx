/**
 * Compensation Repository - Data Access Layer
 * 
 * CRUD operations for AutoCompensation entity
 */

import { base44 } from '@/api/base44Client';

/**
 * List all compensations
 */
export async function listCompensations(sort = '-created_date', limit = 100) {
  return await base44.entities.AutoCompensation.list(sort, limit);
}

/**
 * Get compensations by order ID
 */
export async function getCompensationsByOrderId(orderId) {
  return await base44.entities.AutoCompensation.filter(
    { order_id: orderId },
    '-created_date'
  );
}

/**
 * Get compensation by ID
 */
export async function getCompensationById(id) {
  const compensations = await base44.entities.AutoCompensation.filter({ id });
  return compensations[0] || null;
}

/**
 * Get pending compensations (for admin review)
 */
export async function getPendingCompensations() {
  return await base44.entities.AutoCompensation.filter(
    { status: 'pending', auto_approved: false },
    '-created_date'
  );
}

/**
 * Get compensations by trigger type
 */
export async function getCompensationsByTrigger(orderId, triggerType) {
  return await base44.entities.AutoCompensation.filter({
    order_id: orderId,
    trigger_type: triggerType
  });
}

/**
 * Create compensation
 */
export async function createCompensation(data) {
  return await base44.entities.AutoCompensation.create(data);
}

/**
 * Update compensation
 */
export async function updateCompensation(id, data) {
  return await base44.entities.AutoCompensation.update(id, data);
}

/**
 * Approve compensation
 */
export async function approveCompensation(id, approverEmail) {
  return await base44.entities.AutoCompensation.update(id, {
    status: 'approved',
    approved_by: approverEmail
  });
}

/**
 * Reject compensation
 */
export async function rejectCompensation(id, approverEmail, reason) {
  return await base44.entities.AutoCompensation.update(id, {
    status: 'rejected',
    approved_by: approverEmail,
    notes: `Rejected: ${reason}`
  });
}

/**
 * Mark compensation as applied
 */
export async function markCompensationApplied(id, metadata = {}) {
  return await base44.entities.AutoCompensation.update(id, {
    status: 'applied',
    applied_at: new Date().toISOString(),
    notification_sent: true,
    notification_date: new Date().toISOString(),
    ...metadata
  });
}

export const compensationRepository = {
  listCompensations,
  getCompensationsByOrderId,
  getCompensationById,
  getPendingCompensations,
  getCompensationsByTrigger,
  createCompensation,
  updateCompensation,
  approveCompensation,
  rejectCompensation,
  markCompensationApplied
};

export default compensationRepository;
/**
 * Cancellation Repository - Data Access Layer
 * 
 * CRUD operations for PreOrderCancellation entity
 */

import { base44 } from '@/api/base44Client';

/**
 * List all cancellations
 */
export async function listCancellations(sort = '-created_date', limit = 100) {
  return await base44.entities.PreOrderCancellation.list(sort, limit);
}

/**
 * Get cancellations by order ID
 */
export async function getCancellationByOrderId(orderId) {
  const cancellations = await base44.entities.PreOrderCancellation.filter(
    { order_id: orderId },
    '-created_date'
  );
  return cancellations[0] || null;
}

/**
 * Get cancellation by ID
 */
export async function getCancellationById(id) {
  const cancellations = await base44.entities.PreOrderCancellation.filter(
    { id },
    '-created_date'
  );
  return cancellations[0] || null;
}

/**
 * Get pending refund cancellations
 */
export async function getPendingRefundCancellations() {
  return await base44.entities.PreOrderCancellation.filter(
    { refund_status: 'pending' },
    '-created_date'
  );
}

/**
 * Create cancellation record
 */
export async function createCancellation(data) {
  return await base44.entities.PreOrderCancellation.create(data);
}

/**
 * Update cancellation
 */
export async function updateCancellation(id, data) {
  return await base44.entities.PreOrderCancellation.update(id, data);
}

/**
 * Add timeline entry to cancellation
 */
export async function addCancellationTimeline(id, timelineEntry) {
  const cancellation = await getCancellationById(id);
  if (!cancellation) throw new Error('Cancellation not found');
  
  const timeline = cancellation.timeline || [];
  timeline.push({
    ...timelineEntry,
    timestamp: new Date().toISOString()
  });
  
  return await base44.entities.PreOrderCancellation.update(id, { timeline });
}

export const cancellationRepository = {
  listCancellations,
  getCancellationByOrderId,
  getCancellationById,
  getPendingRefundCancellations,
  createCancellation,
  updateCancellation,
  addCancellationTimeline
};

export default cancellationRepository;
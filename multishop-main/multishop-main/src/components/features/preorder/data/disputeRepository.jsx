/**
 * Dispute Repository - Data Access Layer
 * 
 * CRUD operations for DisputeTicket entity
 */

import { base44 } from '@/api/base44Client';

/**
 * List all disputes
 */
export async function listDisputes(sort = '-created_date', limit = 100) {
  return await base44.entities.DisputeTicket.list(sort, limit);
}

/**
 * Get disputes by order ID
 */
export async function getDisputesByOrderId(orderId) {
  return await base44.entities.DisputeTicket.filter(
    { order_id: orderId },
    '-created_date'
  );
}

/**
 * Get dispute by ID
 */
export async function getDisputeById(id) {
  const disputes = await base44.entities.DisputeTicket.filter({ id });
  return disputes[0] || null;
}

/**
 * Get open disputes
 */
export async function getOpenDisputes() {
  return await base44.entities.DisputeTicket.filter(
    { status: 'open' },
    '-created_date'
  );
}

/**
 * Get disputes by status
 */
export async function getDisputesByStatus(status) {
  return await base44.entities.DisputeTicket.filter(
    { status },
    '-created_date'
  );
}

/**
 * Create dispute
 */
export async function createDispute(data) {
  const ticketNumber = `DIS-${Date.now().toString(36).toUpperCase()}`;
  
  return await base44.entities.DisputeTicket.create({
    ticket_number: ticketNumber,
    ...data,
    status: 'open',
    timeline: [{
      event: 'created',
      status: 'open',
      timestamp: new Date().toISOString(),
      actor: data.customer_email,
      note: 'Dispute được tạo'
    }]
  });
}

/**
 * Update dispute
 */
export async function updateDispute(id, data) {
  return await base44.entities.DisputeTicket.update(id, data);
}

/**
 * Update dispute status
 */
export async function updateDisputeStatus(id, status, actor, note) {
  const dispute = await getDisputeById(id);
  if (!dispute) throw new Error('Dispute not found');
  
  const timeline = dispute.timeline || [];
  timeline.push({
    event: 'status_changed',
    status,
    timestamp: new Date().toISOString(),
    actor,
    note
  });
  
  return await base44.entities.DisputeTicket.update(id, {
    status,
    timeline
  });
}

/**
 * Add resolution option to dispute
 */
export async function addResolutionOption(id, option) {
  const dispute = await getDisputeById(id);
  if (!dispute) throw new Error('Dispute not found');
  
  const options = dispute.resolution_options || [];
  options.push({
    option_id: `opt_${Date.now()}`,
    ...option
  });
  
  return await base44.entities.DisputeTicket.update(id, {
    resolution_options: options,
    status: 'resolution_proposed'
  });
}

/**
 * Resolve dispute
 */
export async function resolveDispute(id, resolution, actor) {
  const dispute = await getDisputeById(id);
  if (!dispute) throw new Error('Dispute not found');
  
  const timeline = dispute.timeline || [];
  timeline.push({
    event: 'resolved',
    status: 'resolved',
    timestamp: new Date().toISOString(),
    actor,
    note: `Giải quyết: ${resolution.type}`
  });
  
  return await base44.entities.DisputeTicket.update(id, {
    status: 'resolved',
    resolution_applied: {
      ...resolution,
      applied_at: new Date().toISOString()
    },
    resolved_date: new Date().toISOString(),
    timeline
  });
}

/**
 * Add internal note
 */
export async function addInternalNote(id, note, author) {
  const dispute = await getDisputeById(id);
  if (!dispute) throw new Error('Dispute not found');
  
  const notes = dispute.internal_notes || [];
  notes.push({
    note,
    author,
    timestamp: new Date().toISOString()
  });
  
  return await base44.entities.DisputeTicket.update(id, {
    internal_notes: notes
  });
}

export const disputeRepository = {
  listDisputes,
  getDisputesByOrderId,
  getDisputeById,
  getOpenDisputes,
  getDisputesByStatus,
  createDispute,
  updateDispute,
  updateDisputeStatus,
  addResolutionOption,
  resolveDispute,
  addInternalNote
};

export default disputeRepository;
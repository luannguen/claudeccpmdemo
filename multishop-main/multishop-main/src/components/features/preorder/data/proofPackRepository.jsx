/**
 * proofPackRepository - Order proof pack data access
 * Data Layer
 * 
 * Part of PreOrder Module
 */

import { base44 } from '@/api/base44Client';
import { 
  assembleProofPackData,
  buildReconciliationData,
  convertToCSV
} from '../domain/proofPackGenerator';

// ========== CRUD ==========

/**
 * Get proof pack by order ID
 */
export async function getProofPackByOrderId(orderId) {
  const packs = await base44.entities.OrderProofPack.filter({ order_id: orderId });
  return packs[0] || null;
}

/**
 * Create proof pack
 */
export async function createProofPack(data) {
  return await base44.entities.OrderProofPack.create(data);
}

/**
 * Update proof pack
 */
export async function updateProofPack(proofPackId, data) {
  return await base44.entities.OrderProofPack.update(proofPackId, {
    ...data,
    last_updated: new Date().toISOString()
  });
}

// ========== PROOF PACK GENERATION ==========

/**
 * Generate complete proof pack for an order
 */
export async function generateProofPack(orderId) {
  // Fetch all related data
  const orders = await base44.entities.Order.filter({ id: orderId });
  const order = orders[0];
  if (!order) throw new Error('Order not found');

  const lotId = order.items?.[0]?.lot_id;
  let lot = null;
  if (lotId) {
    const lots = await base44.entities.ProductLot.filter({ id: lotId });
    lot = lots[0];
  }

  const policies = await base44.entities.PreOrderPolicy.filter({ is_default: true });
  const policy = policies[0];

  const wallets = await base44.entities.PaymentWallet.filter({ order_id: orderId });
  const wallet = wallets[0];
  
  let transactions = [];
  if (wallet?.id) {
    transactions = await base44.entities.WalletTransaction.filter(
      { wallet_id: wallet.id },
      '-created_date'
    );
  }

  const [fulfillments, disputes, refunds, cancellations] = await Promise.all([
    base44.entities.FulfillmentRecord.filter({ order_id: orderId }, 'sequence'),
    base44.entities.DisputeTicket.filter({ order_id: orderId }),
    base44.entities.RefundRequest.filter({ order_id: orderId }),
    base44.entities.PreOrderCancellation.filter({ order_id: orderId })
  ]);

  // Assemble using domain logic
  const proofPackData = assembleProofPackData(
    order, lot, policy, wallet, transactions, 
    fulfillments, disputes, refunds, cancellations
  );

  // Save to database
  return await createProofPack(proofPackData);
}

/**
 * Regenerate proof pack with latest data
 */
export async function regenerateProofPack(proofPackId) {
  const packs = await base44.entities.OrderProofPack.filter({ id: proofPackId });
  const pack = packs[0];
  if (!pack || pack.is_finalized) return pack;

  const newPack = await generateProofPack(pack.order_id);
  
  await updateProofPack(proofPackId, newPack);

  return newPack;
}

// ========== EXPORT FUNCTIONS ==========

/**
 * Export reconciliation data
 */
export async function exportReconciliationData(filters = {}) {
  const { startDate, endDate, status } = filters;

  let orderFilter = { has_preorder_items: true };
  if (status) orderFilter.order_status = status;

  const orders = await base44.entities.Order.filter(orderFilter);
  
  const filtered = orders.filter(o => {
    if (startDate && new Date(o.created_date) < new Date(startDate)) return false;
    if (endDate && new Date(o.created_date) > new Date(endDate)) return false;
    return true;
  });

  const refunds = await base44.entities.RefundRequest.filter({});

  // Build using domain logic
  return buildReconciliationData(filtered, refunds);
}

/**
 * Export as CSV
 */
export async function exportAsCSV(filters = {}) {
  const exportData = await exportReconciliationData(filters);
  return convertToCSV(exportData);
}
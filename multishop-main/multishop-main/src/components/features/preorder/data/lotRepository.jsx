/**
 * Lot Repository - Data Access Layer
 * 
 * CRUD operations for ProductLot entity
 */

import { base44 } from '@/api/base44Client';

/**
 * List all lots
 */
export async function listLots(sort = 'estimated_harvest_date', limit = 500) {
  return await base44.entities.ProductLot.list(sort, limit);
}

/**
 * List active lots only
 */
export async function listActiveLots() {
  const all = await base44.entities.ProductLot.list('estimated_harvest_date', 500);
  return all.filter(l => l.status === 'active');
}

/**
 * Get lot by ID
 */
export async function getLotById(lotId) {
  const lots = await base44.entities.ProductLot.filter({ id: lotId });
  return lots[0] || null;
}

/**
 * Get lots by preorder product ID
 */
export async function getLotsByPreOrderId(preorderProductId) {
  return await base44.entities.ProductLot.filter(
    { preorder_product_id: preorderProductId },
    'estimated_harvest_date'
  );
}

/**
 * Create new lot
 */
export async function createLot(data) {
  return await base44.entities.ProductLot.create(data);
}

/**
 * Update lot
 */
export async function updateLot(lotId, data) {
  return await base44.entities.ProductLot.update(lotId, data);
}

/**
 * Delete lot
 */
export async function deleteLot(lotId) {
  return await base44.entities.ProductLot.delete(lotId);
}

/**
 * Update lot inventory after purchase
 */
export async function updateLotInventory(lotId, quantitySold) {
  const lot = await getLotById(lotId);
  if (!lot) throw new Error('Lot not found');
  
  const newAvailable = Math.max(0, (lot.available_quantity || 0) - quantitySold);
  const newSold = (lot.sold_quantity || 0) + quantitySold;
  
  return await base44.entities.ProductLot.update(lotId, {
    available_quantity: newAvailable,
    sold_quantity: newSold,
    status: newAvailable === 0 ? 'sold_out' : lot.status
  });
}

/**
 * Restore lot inventory after cancellation
 */
export async function restoreLotInventory(lotId, quantity) {
  const lot = await getLotById(lotId);
  if (!lot) throw new Error('Lot not found');
  
  return await base44.entities.ProductLot.update(lotId, {
    available_quantity: (lot.available_quantity || 0) + quantity,
    sold_quantity: Math.max(0, (lot.sold_quantity || 0) - quantity),
    status: 'active' // Re-activate if was sold out
  });
}

/**
 * Get related lots (same preorder product, different lot)
 */
export async function getRelatedLots(lot, excludeLotId) {
  if (!lot?.preorder_product_id) return [];
  
  const allLots = await base44.entities.ProductLot.list('estimated_harvest_date', 500);
  return allLots.filter(l => 
    l.preorder_product_id === lot.preorder_product_id && 
    l.id !== excludeLotId && 
    l.status === 'active' &&
    l.available_quantity > 0
  );
}

export const lotRepository = {
  listLots,
  listActiveLots,
  getLotById,
  getLotsByPreOrderId,
  createLot,
  updateLot,
  deleteLot,
  updateLotInventory,
  restoreLotInventory,
  getRelatedLots
};

export default lotRepository;
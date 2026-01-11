/**
 * Lot Repository - Product lot data access
 * Data Layer - API calls only
 * 
 * @module features/checkout/data/lotRepository
 */

import { base44 } from '@/api/base44Client';

/**
 * Get lot by ID
 * @param {string} lotId
 * @returns {Promise<Object|null>}
 */
export async function getLotById(lotId) {
  if (!lotId) return null;
  const lots = await base44.entities.ProductLot.filter({ id: lotId }, '-created_date', 1);
  return lots[0] || null;
}

/**
 * Get multiple lots by IDs
 * @param {string[]} lotIds
 * @returns {Promise<Object[]>}
 */
export async function getLotsByIds(lotIds) {
  if (!lotIds || lotIds.length === 0) return [];
  
  const allLots = await base44.entities.ProductLot.list('-created_date', 200);
  return allLots.filter(lot => lotIds.includes(lot.id));
}

/**
 * Check lot availability
 * @param {string} lotId
 * @param {number} requestedQuantity
 * @returns {Promise<Object>} { available: boolean, lot: Object|null, message: string }
 */
export async function checkLotAvailability(lotId, requestedQuantity) {
  const lot = await getLotById(lotId);
  
  if (!lot) {
    return { available: false, lot: null, message: 'Lot không tồn tại' };
  }
  
  if (lot.status !== 'active') {
    return { available: false, lot, message: 'Lot không còn mở bán' };
  }
  
  if (lot.available_quantity < requestedQuantity) {
    return { 
      available: false, 
      lot, 
      message: `Chỉ còn ${lot.available_quantity} sản phẩm` 
    };
  }
  
  return { available: true, lot, message: 'OK' };
}

/**
 * Get active lots
 * @param {number} limit
 * @returns {Promise<Object[]>}
 */
export async function getActiveLots(limit = 50) {
  return await base44.entities.ProductLot.filter({ status: 'active' }, '-created_date', limit);
}

export default {
  getLotById,
  getLotsByIds,
  checkLotAvailability,
  getActiveLots
};
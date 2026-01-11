/**
 * PreOrder Product Repository - Data Access Layer
 * 
 * CRUD operations for PreOrderProduct entity
 */

import { base44 } from '@/api/base44Client';

/**
 * List all preorder products
 */
export async function listPreOrderProducts(sort = '-created_date', limit = 500) {
  return await base44.entities.PreOrderProduct.list(sort, limit);
}

/**
 * List active preorder products for display
 */
export async function listActivePreOrderProducts() {
  const all = await base44.entities.PreOrderProduct.list('-created_date', 500);
  return all.filter(p => p.status === 'active' && p.display_on_preorder_page === true);
}

/**
 * Get preorder product by ID
 */
export async function getPreOrderProductById(id) {
  const products = await base44.entities.PreOrderProduct.filter({ id });
  return products[0] || null;
}

/**
 * Create preorder product
 */
export async function createPreOrderProduct(data) {
  return await base44.entities.PreOrderProduct.create(data);
}

/**
 * Update preorder product
 */
export async function updatePreOrderProduct(id, data) {
  return await base44.entities.PreOrderProduct.update(id, data);
}

/**
 * Delete preorder product
 */
export async function deletePreOrderProduct(id) {
  return await base44.entities.PreOrderProduct.delete(id);
}

export const preOrderProductRepository = {
  listPreOrderProducts,
  listActivePreOrderProducts,
  getPreOrderProductById,
  createPreOrderProduct,
  updatePreOrderProduct,
  deletePreOrderProduct
};

export default preOrderProductRepository;
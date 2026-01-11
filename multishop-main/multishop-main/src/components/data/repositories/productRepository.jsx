/**
 * Product Repository
 * Handles all product-related data operations
 */

import { createRepository } from './baseRepository';
import { success, failure, ErrorCodes, ProductStatus } from '../types';

export const productRepository = createRepository('Product', (base) => ({
  /**
   * List active products only
   * @param {string} [sortBy]
   * @param {number} [limit]
   */
  async listActive(sortBy = '-created_date', limit = 100) {
    return base.filter({ status: ProductStatus.ACTIVE }, sortBy, limit);
  },

  /**
   * List products by category
   * @param {string} category
   * @param {number} [limit]
   */
  async listByCategory(category, limit = 50) {
    return base.filter({ category, status: ProductStatus.ACTIVE }, '-created_date', limit);
  },

  /**
   * List featured products
   * @param {number} [limit]
   */
  async listFeatured(limit = 10) {
    return base.filter({ featured: true, status: ProductStatus.ACTIVE }, '-created_date', limit);
  },

  /**
   * Search products by name (optimized - filter active first)
   * @param {string} searchTerm
   * @param {number} [limit]
   */
  async search(searchTerm, limit = 50) {
    // Get active products only instead of all 500
    const result = await base.filter({ status: ProductStatus.ACTIVE }, '-created_date', 200);
    if (!result.success) return result;
    
    const filtered = result.data.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, limit);
    
    return success(filtered);
  },

  /**
   * Get low stock products (optimized)
   * @param {number} [threshold=10]
   */
  async getLowStock(threshold = 10) {
    // Get active products only
    const result = await base.filter({ status: ProductStatus.ACTIVE }, 'stock_quantity', 200);
    if (!result.success) return result;
    
    const lowStock = result.data.filter(p => 
      p.stock_quantity <= (p.low_stock_threshold || threshold)
    );
    
    return success(lowStock);
  },

  /**
   * Update stock quantity
   * @param {string} id
   * @param {number} quantity
   * @param {'add'|'subtract'|'set'} operation
   */
  async updateStock(id, quantity, operation = 'set') {
    const getResult = await base.getById(id);
    if (!getResult.success) return getResult;
    
    const product = getResult.data;
    let newQuantity;
    
    switch (operation) {
      case 'add':
        newQuantity = (product.stock_quantity || 0) + quantity;
        break;
      case 'subtract':
        newQuantity = Math.max(0, (product.stock_quantity || 0) - quantity);
        break;
      default:
        newQuantity = quantity;
    }
    
    return base.update(id, { stock_quantity: newQuantity });
  },

  /**
   * Create product with validation
   * @param {Object} data
   */
  async createWithValidation(data) {
    // Validation
    if (!data.name?.trim()) {
      return failure('Tên sản phẩm không được trống', ErrorCodes.VALIDATION_ERROR);
    }
    if (!data.category) {
      return failure('Vui lòng chọn danh mục', ErrorCodes.VALIDATION_ERROR);
    }
    if (!data.price || data.price <= 0) {
      return failure('Giá phải lớn hơn 0', ErrorCodes.VALIDATION_ERROR);
    }
    if (!data.unit) {
      return failure('Vui lòng nhập đơn vị', ErrorCodes.VALIDATION_ERROR);
    }

    // Generate slug if not provided
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    return base.create({
      ...data,
      status: data.status || ProductStatus.ACTIVE,
      stock_quantity: data.stock_quantity || 0,
      rating_average: 5,
      rating_count: 0,
      total_sold: 0
    });
  }
}));

export default productRepository;
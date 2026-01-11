/**
 * Customer Repository
 * Handles all customer-related data operations
 */

import { createRepository } from './baseRepository';
import { success, failure, ErrorCodes } from '../types';

export const customerRepository = createRepository('Customer', (base) => ({
  /**
   * Get customer by email
   * @param {string} email
   */
  async getByEmail(email) {
    if (!email) {
      return failure('Email không được trống', ErrorCodes.VALIDATION_ERROR);
    }
    
    const result = await base.filter({ email: email.toLowerCase() });
    if (!result.success) return result;
    
    if (!result.data || result.data.length === 0) {
      return failure('Khách hàng không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    return success(result.data[0]);
  },

  /**
   * Get customer by phone
   * @param {string} phone
   */
  async getByPhone(phone) {
    if (!phone) {
      return failure('Số điện thoại không được trống', ErrorCodes.VALIDATION_ERROR);
    }
    
    const result = await base.filter({ phone });
    if (!result.success) return result;
    
    if (!result.data || result.data.length === 0) {
      return failure('Khách hàng không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    return success(result.data[0]);
  },

  /**
   * List active customers
   * @param {number} [limit]
   */
  async listActive(limit = 100) {
    return base.filter({ status: 'active' }, '-created_date', limit);
  },

  /**
   * List referred customers
   * @param {string} referrerId
   * @param {number} [limit]
   */
  async listByReferrer(referrerId, limit = 100) {
    return base.filter({ referrer_id: referrerId }, '-created_date', limit);
  },

  /**
   * Search customers
   * @param {string} searchTerm
   * @param {number} [limit]
   */
  async search(searchTerm, limit = 50) {
    const result = await base.list('-created_date', 500);
    if (!result.success) return result;
    
    const term = searchTerm.toLowerCase();
    const filtered = result.data.filter(c => 
      c.full_name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.includes(searchTerm)
    ).slice(0, limit);
    
    return success(filtered);
  },

  /**
   * Get top customers by spend
   * @param {number} [limit]
   */
  async getTopBySpend(limit = 10) {
    const result = await base.list('-total_spent', limit);
    return result;
  },

  /**
   * Update customer stats after order
   * @param {string} customerId
   * @param {number} orderAmount
   */
  async updateOrderStats(customerId, orderAmount) {
    const getResult = await base.getById(customerId);
    if (!getResult.success) return getResult;
    
    const customer = getResult.data;
    const newTotalOrders = (customer.total_orders || 0) + 1;
    const newTotalSpent = (customer.total_spent || 0) + orderAmount;
    
    return base.update(customerId, {
      total_orders: newTotalOrders,
      total_spent: newTotalSpent,
      avg_order_value: newTotalSpent / newTotalOrders,
      last_order_date: new Date().toISOString()
    });
  },

  /**
   * Create or get customer
   * @param {Object} data
   */
  async createOrGet(data) {
    if (!data.email && !data.phone) {
      return failure('Email hoặc số điện thoại là bắt buộc', ErrorCodes.VALIDATION_ERROR);
    }
    
    // Try to find existing customer
    let existingResult;
    if (data.email) {
      existingResult = await base.filter({ email: data.email.toLowerCase() });
    } else {
      existingResult = await base.filter({ phone: data.phone });
    }
    
    if (existingResult.success && existingResult.data.length > 0) {
      return success(existingResult.data[0]);
    }
    
    // Create new customer
    return base.create({
      ...data,
      email: data.email?.toLowerCase(),
      status: 'active',
      total_orders: 0,
      total_spent: 0,
      customer_source: data.customer_source || 'manual'
    });
  },

  /**
   * Get customer statistics
   */
  async getStats() {
    const result = await base.list('-created_date', 1000);
    if (!result.success) return result;
    
    const customers = result.data;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const stats = {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      newThisMonth: customers.filter(c => new Date(c.created_date) >= startOfMonth).length,
      withOrders: customers.filter(c => (c.total_orders || 0) > 0).length,
      totalRevenue: customers.reduce((sum, c) => sum + (c.total_spent || 0), 0),
      avgOrderValue: customers.length > 0 
        ? customers.reduce((sum, c) => sum + (c.avg_order_value || 0), 0) / customers.filter(c => c.total_orders > 0).length 
        : 0,
      referred: customers.filter(c => c.is_referred_customer).length
    };
    
    return success(stats);
  }
}));

export default customerRepository;
/**
 * orderRepository - Data access cho Order entity
 * Repository Layer - Chỉ truy cập database
 */

import { createRepository } from './baseRepository';
import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

const baseRepo = createRepository('Order');

/**
 * List orders với sort và limit
 */
export async function list(sortField = '-created_date', limit = 500) {
  try {
    const orders = await base44.entities.Order.list(sortField, limit);
    return success(orders);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Filter orders với conditions
 */
export async function filter(filters = {}, sortField = '-created_date', limit = 500) {
  try {
    const orders = await base44.entities.Order.filter(filters, sortField, limit);
    return success(orders);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * List orders by customer email
 */
export async function listByCustomer(email) {
  try {
    const orders = await base44.entities.Order.filter({ customer_email: email }, '-created_date', 100);
    return success(orders);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get order by ID
 */
export async function getById(id) {
  try {
    const orders = await base44.entities.Order.filter({ id });
    if (orders.length === 0) {
      return failure('Không tìm thấy đơn hàng', ErrorCodes.NOT_FOUND);
    }
    return success(orders[0]);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Create order với validation
 */
export async function createWithValidation(orderData) {
  try {
    if (!orderData.customer_email) {
      return failure('Email khách hàng là bắt buộc', ErrorCodes.VALIDATION_ERROR);
    }
    
    if (!orderData.items || orderData.items.length === 0) {
      return failure('Đơn hàng phải có ít nhất 1 sản phẩm', ErrorCodes.VALIDATION_ERROR);
    }

    const order = await base44.entities.Order.create(orderData);
    return success(order);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Update order status
 */
export async function updateStatus(id, status, note = '') {
  try {
    const updates = {
      order_status: status,
      ...(note && { internal_note: note })
    };
    
    const updated = await base44.entities.Order.update(id, updates);
    return success(updated);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Cancel order
 */
export async function cancel(id, reason) {
  try {
    const updated = await base44.entities.Order.update(id, {
      order_status: 'cancelled',
      internal_note: `Hủy: ${reason}`
    });
    return success(updated);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get order stats
 */
export async function getStats() {
  try {
    const orders = await base44.entities.Order.list('-created_date', 1000);
    
    const total = orders.length;
    const pending = orders.filter(o => o.order_status === 'pending').length;
    const processing = orders.filter(o => o.order_status === 'processing').length;
    const delivered = orders.filter(o => o.order_status === 'delivered').length;
    const totalRevenue = orders.filter(o => o.order_status === 'delivered').reduce((sum, o) => sum + (o.total_amount || 0), 0);
    
    return success({
      total,
      pending,
      processing,
      delivered,
      totalRevenue
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// Named export cho data/index.jsx
export const orderRepository = {
  ...baseRepo,
  list,
  filter,
  listByCustomer,
  getById,
  createWithValidation,
  updateStatus,
  cancel,
  getStats
};

// Default export cho backward compatibility
export default orderRepository;
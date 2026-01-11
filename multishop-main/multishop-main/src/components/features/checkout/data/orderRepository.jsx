/**
 * Order Repository - Order data access
 * Data Layer - API calls only
 * 
 * @module features/checkout/data/orderRepository
 */

import { base44 } from '@/api/base44Client';

/**
 * Create a new order
 * @param {Object} orderData
 * @returns {Promise<Object>}
 */
export async function createOrder(orderData) {
  return await base44.entities.Order.create(orderData);
}

/**
 * Update an existing order
 * @param {string} orderId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateOrder(orderId, data) {
  return await base44.entities.Order.update(orderId, data);
}

/**
 * Get order by ID
 * @param {string} orderId
 * @returns {Promise<Object|null>}
 */
export async function getOrderById(orderId) {
  const orders = await base44.entities.Order.filter({ id: orderId });
  return orders[0] || null;
}

/**
 * List orders with sorting
 * @param {string} sort
 * @param {number} limit
 * @returns {Promise<Object[]>}
 */
export async function listOrders(sort = '-created_date', limit = 100) {
  return await base44.entities.Order.list(sort, limit);
}

/**
 * Get orders by customer email
 * @param {string} email
 * @param {number} limit
 * @returns {Promise<Object[]>}
 */
export async function getOrdersByCustomer(email, limit = 50) {
  return await base44.entities.Order.filter({ customer_email: email }, '-created_date', limit);
}

/**
 * Create preorder checkout via backend function
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
export async function createPreOrderCheckout(payload) {
  const response = await base44.functions.invoke('createPreOrderCheckout', payload);
  return response.data;
}

export default {
  createOrder,
  updateOrder,
  getOrderById,
  listOrders,
  getOrdersByCustomer,
  createPreOrderCheckout
};
/**
 * Gift Order Repository - Data Access Layer
 * Handles GiftOrder CRUD operations
 */

import { base44 } from '@/api/base44Client';

/**
 * Create draft gift order
 */
export const createDraft = async (buyerUserId, items, options = {}) => {
  const user = await base44.auth.me();
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = options.discount || 0;
  const total = subtotal - discount;

  return base44.entities.GiftOrder.create({
    buyer_user_id: buyerUserId,
    buyer_email: user.email,
    buyer_name: user.full_name,
    status: 'draft',
    items,
    subtotal,
    discount,
    total_amount: total,
    gift_transaction_ids: []
  });
};

/**
 * Update order to pending payment
 */
export const markPendingPayment = async (orderId, paymentMethod) => {
  return base44.entities.GiftOrder.update(orderId, {
    status: 'pending_payment',
    payment_method: paymentMethod
  });
};

/**
 * Mark order as paid
 */
export const markPaid = async (orderId, paymentId) => {
  return base44.entities.GiftOrder.update(orderId, {
    status: 'paid',
    payment_id: paymentId,
    paid_at: new Date().toISOString()
  });
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId) => {
  return base44.entities.GiftOrder.update(orderId, {
    status: 'cancelled'
  });
};

/**
 * Get order by ID
 */
export const getById = async (orderId) => {
  return base44.entities.GiftOrder.filter({ id: orderId });
};

/**
 * List user's gift orders
 */
export const listByUser = async (userId) => {
  return base44.entities.GiftOrder.filter({ buyer_user_id: userId });
};
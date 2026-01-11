/**
 * Payment Repository - Payment methods data access
 * Data Layer - API calls only
 * 
 * @module features/checkout/data/paymentRepository
 */

import { base44 } from '@/api/base44Client';

/**
 * Get active payment methods
 * @returns {Promise<Object[]>}
 */
export async function getActivePaymentMethods() {
  try {
    const methods = await base44.entities.PaymentMethod.list('display_order', 50);
    return methods.filter(m => m.is_active);
  } catch {
    return [];
  }
}

/**
 * Get payment method by ID
 * @param {string} methodId
 * @returns {Promise<Object|null>}
 */
export async function getPaymentMethodById(methodId) {
  const methods = await base44.entities.PaymentMethod.filter({ id: methodId });
  return methods[0] || null;
}

/**
 * Get payment method by key
 * @param {string} key - e.g., 'bank_transfer', 'cod'
 * @returns {Promise<Object|null>}
 */
export async function getPaymentMethodByKey(key) {
  const methods = await base44.entities.PaymentMethod.filter({ method_key: key });
  return methods[0] || null;
}

export default {
  getActivePaymentMethods,
  getPaymentMethodById,
  getPaymentMethodByKey
};
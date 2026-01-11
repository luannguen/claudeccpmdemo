/**
 * Customer Repository - Customer data access
 * Data Layer - API calls only
 * 
 * @module features/checkout/data/customerRepository
 */

import { base44 } from '@/api/base44Client';

/**
 * Find customer by email (excluding tenant customers)
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export async function findByEmail(email) {
  if (!email) return null;
  const customers = await base44.entities.Customer.list('-created_date', 500);
  return customers.find(c => c.email === email && !c.tenant_id) || null;
}

/**
 * Create a new customer
 * @param {Object} customerData
 * @returns {Promise<Object>}
 */
export async function createCustomer(customerData) {
  return await base44.entities.Customer.create({
    tenant_id: null,
    customer_source: 'cart',
    status: 'active',
    ...customerData
  });
}

/**
 * Update an existing customer
 * @param {string} customerId
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export async function updateCustomer(customerId, data) {
  return await base44.entities.Customer.update(customerId, data);
}

/**
 * Get customer by ID
 * @param {string} customerId
 * @returns {Promise<Object|null>}
 */
export async function getCustomerById(customerId) {
  const customers = await base44.entities.Customer.filter({ id: customerId });
  return customers[0] || null;
}

/**
 * Save or update customer info
 * @param {Object} customerInfo
 * @param {Object|null} existingCustomer
 * @returns {Promise<Object>}
 */
export async function saveCustomerInfo(customerInfo, existingCustomer) {
  if (existingCustomer) {
    await updateCustomer(existingCustomer.id, {
      full_name: customerInfo.name,
      phone: customerInfo.phone,
      address: customerInfo.address,
      city: customerInfo.city,
      district: customerInfo.district,
      ward: customerInfo.ward
    });
    return { ...existingCustomer, ...customerInfo };
  }
  
  return await createCustomer({
    full_name: customerInfo.name,
    email: customerInfo.email,
    phone: customerInfo.phone,
    address: customerInfo.address,
    city: customerInfo.city,
    district: customerInfo.district,
    ward: customerInfo.ward
  });
}

export default {
  findByEmail,
  createCustomer,
  updateCustomer,
  getCustomerById,
  saveCustomerInfo
};
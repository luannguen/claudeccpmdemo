/**
 * Customer Repository (Referral context)
 * Data Layer - Customer data access for referral operations
 * 
 * @module features/referral/data/customerRepository
 */

import { base44 } from '@/api/base44Client';

export const customerRepository = {
  /**
   * Get customer by email
   */
  async getByEmail(email) {
    if (!email) return null;
    const customers = await base44.entities.Customer.filter({ email });
    return customers[0] || null;
  },

  /**
   * Get customer by phone
   */
  async getByPhone(phone) {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    const customers = await base44.entities.Customer.filter({ phone: cleanPhone });
    return customers[0] || null;
  },

  /**
   * List customers by referrer
   */
  async listByReferrer(referrerId, limit = 500) {
    return await base44.entities.Customer.filter(
      { referrer_id: referrerId },
      '-created_date',
      limit
    );
  },

  /**
   * Get F1 emails for a referrer
   */
  async getF1Emails(referrerId) {
    const customers = await this.listByReferrer(referrerId);
    return customers.map(c => c.email).filter(Boolean);
  },

  /**
   * Create new customer
   */
  async create(customerData) {
    return await base44.entities.Customer.create(customerData);
  },

  /**
   * Update customer
   */
  async update(customerId, data) {
    return await base44.entities.Customer.update(customerId, data);
  },

  /**
   * Assign referrer to customer
   */
  async assignReferrer(customerId, referrerId, referralCode) {
    return await this.update(customerId, {
      referrer_id: referrerId,
      referral_code_used: referralCode,
      referred_date: new Date().toISOString(),
      is_referred_customer: true,
      customer_source: 'referral'
    });
  },

  /**
   * Lock customer to referrer
   */
  async lockToReferrer(customerId) {
    return await this.update(customerId, {
      referral_locked: true
    });
  },

  /**
   * Check if customer is locked
   */
  async isLocked(customerId) {
    const customers = await base44.entities.Customer.filter({ id: customerId });
    return customers[0]?.referral_locked === true;
  },

  /**
   * Reassign customer to new referrer (admin only)
   */
  async reassign(customerId, newReferrerId, newReferralCode) {
    return await this.update(customerId, {
      referrer_id: newReferrerId,
      referral_code_used: newReferralCode,
      referral_locked: true // Lock when admin intervenes
    });
  },

  /**
   * Count customers with delivered orders by referrer
   */
  async countF1WithPurchases(referrerId, minOrders = 1) {
    const customers = await this.listByReferrer(referrerId);
    return customers.filter(c => (c.total_orders || 0) >= minOrders).length;
  },

  /**
   * Get customers with same address
   */
  async listWithSameAddress(referrerId, address) {
    const customers = await this.listByReferrer(referrerId);
    return customers.filter(c => c.address === address);
  }
};

export default customerRepository;
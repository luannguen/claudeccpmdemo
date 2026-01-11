/**
 * Member Repository
 * Data Layer - ReferralMember data access
 * 
 * @module features/referral/data/memberRepository
 */

import { base44 } from '@/api/base44Client';
import { REFERRAL_STATUS } from '../types';

export const memberRepository = {
  /**
   * Get member by ID
   */
  async getById(memberId) {
    const members = await base44.entities.ReferralMember.filter({ id: memberId });
    return members[0] || null;
  },

  /**
   * Get member by email
   */
  async getByEmail(email) {
    if (!email) return null;
    const members = await base44.entities.ReferralMember.filter({ user_email: email });
    return members[0] || null;
  },

  /**
   * Get member by referral code
   */
  async getByCode(code) {
    if (!code) return null;
    const members = await base44.entities.ReferralMember.filter({ 
      referral_code: code.toUpperCase() 
    });
    return members[0] || null;
  },

  /**
   * Get active member by code
   */
  async getActiveByCode(code) {
    if (!code) return null;
    const members = await base44.entities.ReferralMember.filter({ 
      referral_code: code.toUpperCase(),
      status: REFERRAL_STATUS.ACTIVE
    });
    return members[0] || null;
  },

  /**
   * Check if code exists
   */
  async codeExists(code) {
    const member = await this.getByCode(code);
    return !!member;
  },

  /**
   * Create new member
   */
  async create(memberData) {
    return await base44.entities.ReferralMember.create(memberData);
  },

  /**
   * Update member
   */
  async update(memberId, data) {
    return await base44.entities.ReferralMember.update(memberId, data);
  },

  /**
   * List all members
   */
  async list(limit = 500) {
    return await base44.entities.ReferralMember.list('-created_date', limit);
  },

  /**
   * List active members
   */
  async listActive(limit = 500) {
    return await base44.entities.ReferralMember.filter(
      { status: REFERRAL_STATUS.ACTIVE },
      '-created_date',
      limit
    );
  },

  /**
   * List pending members
   */
  async listPending(limit = 100) {
    return await base44.entities.ReferralMember.filter(
      { status: REFERRAL_STATUS.PENDING },
      '-created_date',
      limit
    );
  },

  /**
   * Approve member
   */
  async approve(memberId) {
    return await this.update(memberId, {
      status: REFERRAL_STATUS.ACTIVE,
      activation_date: new Date().toISOString(),
      is_eligible: true
    });
  },

  /**
   * Suspend member
   */
  async suspend(memberId, reason) {
    return await this.update(memberId, {
      status: REFERRAL_STATUS.SUSPENDED,
      suspension_reason: reason
    });
  },

  /**
   * Reactivate member
   */
  async reactivate(memberId) {
    return await this.update(memberId, {
      status: REFERRAL_STATUS.ACTIVE,
      suspension_reason: null
    });
  },

  /**
   * Update commission stats after order
   */
  async updateCommissionStats(memberId, commissionAmount, revenueAmount, currentMonthRevenue) {
    const member = await this.getById(memberId);
    if (!member) return null;
    
    return await this.update(memberId, {
      unpaid_commission: (member.unpaid_commission || 0) + commissionAmount,
      total_referral_revenue: (member.total_referral_revenue || 0) + revenueAmount,
      current_month_revenue: currentMonthRevenue
    });
  },

  /**
   * Process payout
   */
  async processPayout(memberId, amount) {
    const member = await this.getById(memberId);
    if (!member) return null;
    
    return await this.update(memberId, {
      unpaid_commission: Math.max(0, (member.unpaid_commission || 0) - amount),
      total_paid_commission: (member.total_paid_commission || 0) + amount,
      last_commission_payout: new Date().toISOString()
    });
  },

  /**
   * Update rank
   */
  async updateRank(memberId, newRank, bonus) {
    return await this.update(memberId, {
      seeder_rank: newRank,
      seeder_rank_bonus: bonus,
      seeder_rank_upgraded_date: new Date().toISOString()
    });
  },

  /**
   * Update referred customer count
   */
  async incrementReferredCount(memberId) {
    const member = await this.getById(memberId);
    if (!member) return null;
    
    return await this.update(memberId, {
      total_referred_customers: (member.total_referred_customers || 0) + 1
    });
  },

  /**
   * Set custom commission rate
   */
  async setCustomRate(memberId, rate, adminEmail, note) {
    return await this.update(memberId, {
      custom_commission_rate: rate,
      custom_rate_enabled: true,
      custom_rate_note: note || `Set bởi ${adminEmail}`,
      custom_rate_set_by: adminEmail,
      custom_rate_set_date: new Date().toISOString()
    });
  },

  /**
   * Disable custom rate
   */
  async disableCustomRate(memberId) {
    return await this.update(memberId, {
      custom_rate_enabled: false
    });
  },

  /**
   * Update fraud score
   */
  async updateFraudScore(memberId, newScore, flags) {
    const member = await this.getById(memberId);
    if (!member) return null;
    
    return await this.update(memberId, {
      fraud_score: newScore,
      fraud_flags: [...(member.fraud_flags || []), ...flags]
    });
  }
};

export default memberRepository;
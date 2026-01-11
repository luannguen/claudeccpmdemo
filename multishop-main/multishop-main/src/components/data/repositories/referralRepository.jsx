/**
 * Referral Repository
 * Handles all referral-related data operations
 */

import { createRepository } from './baseRepository';
import { success, failure, ErrorCodes, ReferralStatus, SeederRank } from '../types';

export const referralMemberRepository = createRepository('ReferralMember', (base) => ({
  /**
   * Get member by email
   * @param {string} email
   */
  async getByEmail(email) {
    if (!email) {
      return failure('Email không được trống', ErrorCodes.VALIDATION_ERROR);
    }
    
    const result = await base.filter({ user_email: email });
    if (!result.success) return result;
    
    if (!result.data || result.data.length === 0) {
      return failure('Thành viên không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    return success(result.data[0]);
  },

  /**
   * Get member by referral code
   * @param {string} code
   */
  async getByCode(code) {
    if (!code) {
      return failure('Mã giới thiệu không được trống', ErrorCodes.VALIDATION_ERROR);
    }
    
    const result = await base.filter({ referral_code: code.toUpperCase() });
    if (!result.success) return result;
    
    if (!result.data || result.data.length === 0) {
      return failure('Mã giới thiệu không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    return success(result.data[0]);
  },

  /**
   * Validate referral code
   * @param {string} code
   */
  async validateCode(code) {
    const result = await this.getByCode(code);
    if (!result.success) {
      return { valid: false, error: result.message };
    }
    
    const member = result.data;
    if (member.status !== ReferralStatus.ACTIVE) {
      return { valid: false, error: 'Mã giới thiệu không còn hoạt động' };
    }
    
    return { valid: true, member };
  },

  /**
   * List active members
   * @param {number} [limit]
   */
  async listActive(limit = 100) {
    return base.filter({ status: ReferralStatus.ACTIVE }, '-created_date', limit);
  },

  /**
   * List pending approval members
   * @param {number} [limit]
   */
  async listPending(limit = 100) {
    return base.filter({ status: ReferralStatus.PENDING }, '-created_date', limit);
  },

  /**
   * List by rank
   * @param {string} rank
   * @param {number} [limit]
   */
  async listByRank(rank, limit = 100) {
    return base.filter({ seeder_rank: rank, status: ReferralStatus.ACTIVE }, '-created_date', limit);
  },

  /**
   * Approve member
   * @param {string} id
   */
  async approve(id) {
    return base.update(id, {
      status: ReferralStatus.ACTIVE,
      activation_date: new Date().toISOString(),
      is_eligible: true
    });
  },

  /**
   * Suspend member
   * @param {string} id
   * @param {string} reason
   */
  async suspend(id, reason) {
    return base.update(id, {
      status: ReferralStatus.SUSPENDED,
      suspension_reason: reason
    });
  },

  /**
   * Reactivate member
   * @param {string} id
   */
  async reactivate(id) {
    return base.update(id, {
      status: ReferralStatus.ACTIVE,
      suspension_reason: null
    });
  },

  /**
   * Update rank
   * @param {string} id
   * @param {string} newRank
   * @param {number} bonus
   */
  async updateRank(id, newRank, bonus = 0) {
    return base.update(id, {
      seeder_rank: newRank,
      seeder_rank_bonus: bonus,
      seeder_rank_upgraded_date: new Date().toISOString()
    });
  },

  /**
   * Update commission stats
   * @param {string} id
   * @param {number} commissionAmount
   * @param {number} revenueAmount
   */
  async updateCommissionStats(id, commissionAmount, revenueAmount) {
    const getResult = await base.getById(id);
    if (!getResult.success) return getResult;
    
    const member = getResult.data;
    
    return base.update(id, {
      unpaid_commission: (member.unpaid_commission || 0) + commissionAmount,
      total_referral_revenue: (member.total_referral_revenue || 0) + revenueAmount,
      current_month_revenue: (member.current_month_revenue || 0) + revenueAmount
    });
  },

  /**
   * Process payout
   * @param {string} id
   * @param {number} amount
   */
  async processPayout(id, amount) {
    const getResult = await base.getById(id);
    if (!getResult.success) return getResult;
    
    const member = getResult.data;
    
    if ((member.unpaid_commission || 0) < amount) {
      return failure('Số tiền thanh toán vượt quá hoa hồng chờ', ErrorCodes.VALIDATION_ERROR);
    }
    
    return base.update(id, {
      unpaid_commission: (member.unpaid_commission || 0) - amount,
      total_paid_commission: (member.total_paid_commission || 0) + amount,
      last_commission_payout: new Date().toISOString()
    });
  },

  /**
   * Set custom commission rate (Admin only)
   * @param {string} id
   * @param {number} rate - % hoa hồng cố định
   * @param {string} adminEmail
   * @param {string} note
   */
  async setCustomRate(id, rate, adminEmail, note) {
    if (rate < 0 || rate > 100) {
      return failure('Tỉ lệ hoa hồng phải từ 0-100%', ErrorCodes.VALIDATION_ERROR);
    }
    
    return base.update(id, {
      custom_commission_rate: rate,
      custom_rate_enabled: true,
      custom_rate_note: note || `Set bởi ${adminEmail}`,
      custom_rate_set_by: adminEmail,
      custom_rate_set_date: new Date().toISOString()
    });
  },

  /**
   * Disable custom rate
   * @param {string} id
   */
  async disableCustomRate(id) {
    return base.update(id, {
      custom_rate_enabled: false
    });
  },

  /**
   * Get referral statistics
   */
  async getStats() {
    const result = await base.list('-created_date', 1000);
    if (!result.success) return result;
    
    const members = result.data;
    
    const stats = {
      total: members.length,
      active: members.filter(m => m.status === ReferralStatus.ACTIVE).length,
      pending: members.filter(m => m.status === ReferralStatus.PENDING).length,
      suspended: members.filter(m => m.status === ReferralStatus.SUSPENDED).length,
      totalRevenue: members.reduce((sum, m) => sum + (m.total_referral_revenue || 0), 0),
      totalCommission: members.reduce((sum, m) => sum + (m.total_paid_commission || 0) + (m.unpaid_commission || 0), 0),
      unpaidCommission: members.reduce((sum, m) => sum + (m.unpaid_commission || 0), 0),
      totalReferred: members.reduce((sum, m) => sum + (m.total_referred_customers || 0), 0),
      rankDistribution: {
        [SeederRank.NGUOI_GIEO_HAT]: members.filter(m => m.seeder_rank === SeederRank.NGUOI_GIEO_HAT).length,
        [SeederRank.HAT_GIONG_KHOE]: members.filter(m => m.seeder_rank === SeederRank.HAT_GIONG_KHOE).length,
        [SeederRank.MAM_KHOE]: members.filter(m => m.seeder_rank === SeederRank.MAM_KHOE).length,
        [SeederRank.CHOI_KHOE]: members.filter(m => m.seeder_rank === SeederRank.CHOI_KHOE).length,
        [SeederRank.CANH_KHOE]: members.filter(m => m.seeder_rank === SeederRank.CANH_KHOE).length,
        [SeederRank.CAY_KHOE]: members.filter(m => m.seeder_rank === SeederRank.CAY_KHOE).length,
        [SeederRank.DANH_HIEU]: members.filter(m => m.seeder_rank === SeederRank.DANH_HIEU).length
      }
    };
    
    return success(stats);
  }
}));

export const referralEventRepository = createRepository('ReferralEvent', (base) => ({
  /**
   * List events by referrer
   * @param {string} referrerId
   * @param {number} [limit]
   */
  async listByReferrer(referrerId, limit = 100) {
    return base.filter({ referrer_id: referrerId }, '-created_date', limit);
  },

  /**
   * List events by status
   * @param {string} status
   * @param {number} [limit]
   */
  async listByStatus(status, limit = 100) {
    return base.filter({ status }, '-created_date', limit);
  },

  /**
   * List events by period
   * @param {string} periodMonth - Format: YYYY-MM
   * @param {number} [limit]
   */
  async listByPeriod(periodMonth, limit = 500) {
    return base.filter({ period_month: periodMonth }, '-created_date', limit);
  },

  /**
   * Mark as paid
   * @param {string} id
   * @param {string} payoutBatchId
   */
  async markAsPaid(id, payoutBatchId) {
    return base.update(id, {
      status: 'paid',
      payout_date: new Date().toISOString(),
      payout_batch_id: payoutBatchId
    });
  },

  /**
   * Mark as fraudulent
   * @param {string} id
   * @param {string} reason
   */
  async markAsFraudulent(id, reason) {
    return base.update(id, {
      status: 'fraudulent',
      fraud_suspect: true,
      fraud_reason: reason
    });
  }
}));

export const referralSettingRepository = createRepository('ReferralSetting', (base) => ({
  /**
   * Get main settings
   */
  async getMainSettings() {
    const result = await base.filter({ setting_key: 'main' });
    if (!result.success) return result;
    
    if (!result.data || result.data.length === 0) {
      // Return default settings
      return success({
        setting_key: 'main',
        is_program_enabled: true,
        min_orders_for_referrer: 1,
        commission_tiers: [
          { min_revenue: 0, max_revenue: 10000000, rate: 1, label: '0 - 10 triệu' },
          { min_revenue: 10000000, max_revenue: null, rate: 2, label: '> 10 triệu' }
        ],
        seeder_rank_config: {
          nguoi_gieo_hat: { label: 'Người Gieo Hạt', f1_required: 0, bonus: 0 },
          hat_giong_khoe: { label: 'Hạt Giống Khỏe', f1_required: 7, bonus: 0.1 },
          mam_khoe: { label: 'Mầm Khỏe', f1_required: 7, f1_rank_required: 'hat_giong_khoe', bonus: 0.2 },
          choi_khoe: { label: 'Chồi Khỏe', f1_required: 7, f1_rank_required: 'mam_khoe', bonus: 0.3 },
          canh_khoe: { label: 'Cành Khỏe', f1_required: 7, f1_rank_required: 'choi_khoe', bonus: 0.4 },
          cay_khoe: { label: 'Cây Khỏe', f1_required: 7, f1_rank_required: 'canh_khoe', bonus: 0.5 },
          danh_hieu: { label: 'Danh Hiệu', f1_required: 1, f1_rank_required: 'cay_khoe', bonus: 0.5 }
        }
      });
    }
    
    return success(result.data[0]);
  },

  /**
   * Update settings
   * @param {string} id
   * @param {Object} updates
   */
  async updateSettings(id, updates) {
    return base.update(id, updates);
  }
}));

export default {
  member: referralMemberRepository,
  event: referralEventRepository,
  setting: referralSettingRepository
};
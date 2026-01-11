/**
 * Audit Repository
 * Data Layer - ReferralAuditLog and ReferralCommissionLog data access
 * 
 * @module features/referral/data/auditRepository
 */

import { base44 } from '@/api/base44Client';

export const auditRepository = {
  /**
   * Create audit log entry
   */
  async createAuditLog(data) {
    try {
      const user = await base44.auth.me().catch(() => null);
      
      return await base44.entities.ReferralAuditLog.create({
        ...data,
        actor_email: data.actor_email || user?.email || 'system',
        actor_role: data.actor_role || (user?.role === 'admin' ? 'admin' : 'user')
      });
    } catch (error) {
      console.error('Error creating audit log:', error);
      return null;
    }
  },

  /**
   * Create commission log entry
   */
  async createCommissionLog(data) {
    try {
      return await base44.entities.ReferralCommissionLog.create({
        ...data,
        triggered_by: data.triggered_by || 'system',
        triggered_by_role: data.triggered_by_role || 'system'
      });
    } catch (error) {
      console.error('Error creating commission log:', error);
      return null;
    }
  },

  /**
   * List audit logs
   */
  async listAuditLogs(limit = 200) {
    return await base44.entities.ReferralAuditLog.list('-created_date', limit);
  },

  /**
   * List audit logs by action type
   */
  async listByActionType(actionType, limit = 100) {
    return await base44.entities.ReferralAuditLog.filter(
      { action_type: actionType },
      '-created_date',
      limit
    );
  },

  /**
   * List audit logs by target
   */
  async listByTarget(targetType, targetId, limit = 50) {
    return await base44.entities.ReferralAuditLog.filter(
      { target_type: targetType, target_id: targetId },
      '-created_date',
      limit
    );
  },

  /**
   * List commission logs by referrer
   */
  async listCommissionLogsByReferrer(referrerId, limit = 100) {
    return await base44.entities.ReferralCommissionLog.filter(
      { referrer_id: referrerId },
      '-created_date',
      limit
    );
  },

  // ========== HELPER LOG METHODS ==========

  /**
   * Log member registration
   */
  async logMemberRegistration(memberId, memberEmail, memberName) {
    return this.createAuditLog({
      action_type: 'member_joined',
      target_type: 'referral_member',
      target_id: memberId,
      target_email: memberEmail,
      description: `${memberName} đăng ký tham gia chương trình giới thiệu`
    });
  },

  /**
   * Log member approval
   */
  async logMemberApproval(memberId, memberEmail, memberName, adminEmail) {
    return this.createAuditLog({
      action_type: 'member_activated',
      actor_email: adminEmail,
      actor_role: 'admin',
      target_type: 'referral_member',
      target_id: memberId,
      target_email: memberEmail,
      description: `Admin đã duyệt thành viên ${memberName}`
    });
  },

  /**
   * Log member suspension
   */
  async logMemberSuspension(memberId, memberEmail, memberName, adminEmail, reason) {
    return this.createAuditLog({
      action_type: 'member_suspended',
      actor_email: adminEmail,
      actor_role: 'admin',
      target_type: 'referral_member',
      target_id: memberId,
      target_email: memberEmail,
      new_value: { reason },
      description: `Admin đình chỉ thành viên ${memberName}: ${reason}`
    });
  },

  /**
   * Log commission calculation
   */
  async logCommissionCalculation(eventId, referrer, orderNumber, commissionAmount) {
    return this.createAuditLog({
      action_type: 'commission_calculated',
      target_type: 'referral_event',
      target_id: eventId,
      target_email: referrer.user_email,
      description: `Tính hoa hồng ${commissionAmount.toLocaleString('vi-VN')}đ cho ${referrer.full_name} từ đơn #${orderNumber}`
    });
  },

  /**
   * Log payout
   */
  async logPayout(batchId, adminEmail, successCount) {
    return this.createAuditLog({
      action_type: 'payout_processed',
      actor_email: adminEmail,
      actor_role: 'admin',
      target_type: 'payout',
      target_id: batchId,
      description: `Admin xử lý thanh toán hoa hồng cho ${successCount} thành viên`
    });
  },

  /**
   * Log rank upgrade
   */
  async logRankUpgrade(memberId, memberEmail, memberName, oldRank, newRank, newRankLabel) {
    return this.createAuditLog({
      action_type: 'rank_upgraded',
      target_type: 'referral_member',
      target_id: memberId,
      target_email: memberEmail,
      old_value: { rank: oldRank },
      new_value: { rank: newRank },
      description: `${memberName} đã lên cấp ${newRankLabel}`
    });
  },

  /**
   * Log fraud detection
   */
  async logFraudDetection(eventId, adminEmail, reason) {
    return this.createAuditLog({
      action_type: 'fraud_detected',
      actor_email: adminEmail,
      actor_role: 'admin',
      target_type: 'referral_event',
      target_id: eventId,
      new_value: { reason },
      description: `Admin đánh dấu giao dịch gian lận: ${reason}`
    });
  },

  /**
   * Log customer registration by referrer
   */
  async logCustomerRegistration(customerId, customerEmail, referrerName, customerName, phone) {
    return this.createAuditLog({
      action_type: 'customer_registered',
      target_type: 'customer',
      target_id: customerId,
      target_email: customerEmail,
      description: `CTV ${referrerName} đăng ký KH mới: ${customerName} (${phone})`
    });
  },

  /**
   * Log customer reassignment
   */
  async logCustomerReassignment(customerId, customerName, oldReferrerId, newReferrerName, adminEmail, reason) {
    return this.createAuditLog({
      action_type: 'customer_reassigned',
      actor_email: adminEmail,
      actor_role: 'admin',
      target_type: 'customer',
      target_id: customerId,
      old_value: { referrer_id: oldReferrerId },
      new_value: { referrer_name: newReferrerName },
      description: `Admin chuyển KH ${customerName} sang CTV ${newReferrerName}. Lý do: ${reason}`
    });
  }
};

export default auditRepository;
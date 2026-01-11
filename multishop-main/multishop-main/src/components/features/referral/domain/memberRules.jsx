/**
 * Member Rules
 * Domain Layer - Business rules for referral membership
 * 
 * @module features/referral/domain/memberRules
 */

import { REFERRAL_STATUS } from '../types';

/**
 * Check if user is eligible to become a referral member
 * @param {number} deliveredOrderCount - Number of delivered orders
 * @param {number} minRequired - Minimum required
 * @param {boolean} checkEnabled - Is this check enabled
 * @returns {{ eligible: boolean, message: string }}
 */
export function checkEligibility(deliveredOrderCount, minRequired = 1, checkEnabled = true) {
  if (!checkEnabled) {
    return {
      eligible: true,
      orderCount: deliveredOrderCount,
      message: 'Bạn đủ điều kiện tham gia chương trình giới thiệu!'
    };
  }
  
  const eligible = deliveredOrderCount >= minRequired;
  
  return {
    eligible,
    orderCount: deliveredOrderCount,
    message: eligible
      ? 'Bạn đủ điều kiện tham gia chương trình giới thiệu!'
      : `Bạn cần có ít nhất ${minRequired} đơn hàng thành công để tham gia`
  };
}

/**
 * Determine initial status for new member
 * @param {boolean} requireAdminApproval
 * @returns {string}
 */
export function getInitialMemberStatus(requireAdminApproval = true) {
  return requireAdminApproval ? REFERRAL_STATUS.PENDING : REFERRAL_STATUS.ACTIVE;
}

/**
 * Check if member can receive commission
 * @param {Object} member
 * @returns {{ canReceive: boolean, reason?: string }}
 */
export function canReceiveCommission(member) {
  if (!member) {
    return { canReceive: false, reason: 'Không tìm thấy thông tin thành viên' };
  }
  
  if (member.status !== REFERRAL_STATUS.ACTIVE) {
    return { canReceive: false, reason: 'Tài khoản giới thiệu không hoạt động' };
  }
  
  if (member.fraud_score && member.fraud_score >= 50) {
    return { canReceive: false, reason: 'Tài khoản bị đánh dấu nghi vấn' };
  }
  
  return { canReceive: true };
}

/**
 * Check if member can withdraw commission
 * @param {Object} member
 * @param {number} minPayoutAmount
 * @returns {{ canWithdraw: boolean, reason?: string }}
 */
export function canWithdrawCommission(member, minPayoutAmount = 100000) {
  const receiveCheck = canReceiveCommission(member);
  if (!receiveCheck.canReceive) {
    return { canWithdraw: false, reason: receiveCheck.reason };
  }
  
  const unpaid = member.unpaid_commission || 0;
  if (unpaid < minPayoutAmount) {
    return { 
      canWithdraw: false, 
      reason: `Chưa đạt mức rút tối thiểu (${minPayoutAmount.toLocaleString('vi-VN')}đ)` 
    };
  }
  
  return { canWithdraw: true };
}

/**
 * Check if member can be suspended
 * @param {Object} member
 * @returns {{ canSuspend: boolean, reason?: string }}
 */
export function canSuspendMember(member) {
  if (!member) {
    return { canSuspend: false, reason: 'Không tìm thấy thành viên' };
  }
  
  if (member.status === REFERRAL_STATUS.SUSPENDED) {
    return { canSuspend: false, reason: 'Thành viên đã bị đình chỉ' };
  }
  
  return { canSuspend: true };
}

/**
 * Check if member can be reactivated
 * @param {Object} member
 * @returns {{ canReactivate: boolean, reason?: string }}
 */
export function canReactivateMember(member) {
  if (!member) {
    return { canReactivate: false, reason: 'Không tìm thấy thành viên' };
  }
  
  if (member.status === REFERRAL_STATUS.ACTIVE) {
    return { canReactivate: false, reason: 'Thành viên đang hoạt động' };
  }
  
  return { canReactivate: true };
}

/**
 * Build referral link from code
 * @param {string} code
 * @param {string} [baseUrl]
 * @returns {string}
 */
export function buildReferralLink(code, baseUrl = null) {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/?ref=${code}`;
}

/**
 * Check if customer can be registered by referrer
 * @param {Object} existingCustomer
 * @param {string} referrerId
 * @returns {{ canRegister: boolean, isNew: boolean, reason?: string }}
 */
export function canRegisterCustomer(existingCustomer, referrerId) {
  if (!existingCustomer) {
    return { canRegister: true, isNew: true };
  }
  
  // Already locked to different referrer
  if (existingCustomer.referral_locked && existingCustomer.referrer_id !== referrerId) {
    return { 
      canRegister: false, 
      isNew: false, 
      reason: 'Khách hàng đã được gán cố định cho CTV khác' 
    };
  }
  
  // Has different referrer (not locked)
  if (existingCustomer.referrer_id && existingCustomer.referrer_id !== referrerId) {
    return { 
      canRegister: false, 
      isNew: false, 
      reason: 'Khách hàng đã thuộc về CTV khác' 
    };
  }
  
  // Same referrer or no referrer yet
  return { canRegister: true, isNew: false };
}

export default {
  checkEligibility,
  getInitialMemberStatus,
  canReceiveCommission,
  canWithdrawCommission,
  canSuspendMember,
  canReactivateMember,
  buildReferralLink,
  canRegisterCustomer
};
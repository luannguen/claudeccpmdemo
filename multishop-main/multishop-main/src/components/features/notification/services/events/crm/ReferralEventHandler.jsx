/**
 * Referral Event Handler - CRM domain
 * 
 * Handles: referral.commission_earned, referral.rank_upgraded, referral.member_approved, etc.
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { ReferralEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle commission earned
 */
export const handleCommissionEarned = async (payload) => {
  const { referrer, order, commission } = payload;
  const orderNumber = order.order_number || order.id?.slice(-8);
  const amount = commission.amount?.toLocaleString('vi-VN');

  console.log('💰 [ReferralEventHandler] referral.commission_earned:', referrer.referral_code);

  if (referrer.user_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'referral_commission',
      recipients: referrer.user_email,
      payload: {
        title: '💰 Nhận Hoa Hồng Mới!',
        message: `Bạn nhận được ${amount}đ hoa hồng từ đơn hàng #${orderNumber}`,
        link: createPageUrl('MyReferrals'),
        priority: 'high',
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
          commission_amount: commission.amount,
          commission_rate: commission.rate
        }
      }
    });
  }
};

/**
 * Handle rank upgraded
 */
export const handleRankUpgraded = async (payload) => {
  const { member, oldRank, newRank } = payload;

  console.log('🚀 [ReferralEventHandler] referral.rank_upgraded:', member.referral_code);

  if (member.user_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'referral_rank_up',
      recipients: member.user_email,
      payload: {
        title: `🚀 Chúc Mừng Thăng Cấp ${newRank}!`,
        message: `Bạn đã được thăng cấp từ ${oldRank} lên ${newRank}. Tận hưởng tỷ lệ hoa hồng cao hơn!`,
        link: createPageUrl('MyReferrals'),
        priority: 'high',
        metadata: {
          old_rank: oldRank,
          new_rank: newRank,
          member_id: member.id
        }
      }
    });
  }

  // Admin notification
  await notificationEngine.create({
    actor: 'admin',
    type: 'referral_rank_change',
    recipients: null,
    payload: {
      title: `🚀 CTV Thăng Cấp: ${member.full_name}`,
      message: `${member.full_name} (${member.referral_code}) đã lên ${newRank}`,
      link: createPageUrl('AdminReferralMembers'),
      priority: 'normal',
      metadata: {
        member_id: member.id,
        old_rank: oldRank,
        new_rank: newRank
      }
    }
  });
};

/**
 * Handle member approved
 */
export const handleMemberApproved = async (payload) => {
  const { member } = payload;

  console.log('✅ [ReferralEventHandler] referral.member_approved:', member.referral_code);

  if (member.user_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'referral_approved',
      recipients: member.user_email,
      payload: {
        title: '✅ Đã Duyệt Đăng Ký CTV',
        message: `Chúc mừng! Bạn đã trở thành CTV với mã giới thiệu: ${member.referral_code}`,
        link: createPageUrl('MyReferrals'),
        priority: 'high',
        metadata: {
          member_id: member.id,
          referral_code: member.referral_code
        }
      }
    });
  }
};

/**
 * Handle member suspended
 */
export const handleMemberSuspended = async (payload) => {
  const { member, reason } = payload;

  console.log('⚠️ [ReferralEventHandler] referral.member_suspended:', member.referral_code);

  if (member.user_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'referral_suspended',
      recipients: member.user_email,
      payload: {
        title: '⚠️ Tài Khoản CTV Bị Tạm Dừng',
        message: reason || 'Tài khoản CTV của bạn đã bị tạm dừng. Vui lòng liên hệ hỗ trợ.',
        link: createPageUrl('MyReferrals'),
        priority: 'high',
        metadata: {
          member_id: member.id,
          reason
        }
      }
    });
  }
};

/**
 * Handle commission paid
 */
export const handleCommissionPaid = async (payload) => {
  const { member, amount, period } = payload;
  const formattedAmount = amount?.toLocaleString('vi-VN');

  console.log('💵 [ReferralEventHandler] referral.commission_paid:', member.referral_code);

  if (member.user_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'referral_payout',
      recipients: member.user_email,
      payload: {
        title: '💵 Đã Thanh Toán Hoa Hồng',
        message: `Bạn đã nhận được ${formattedAmount}đ hoa hồng${period ? ` (${period})` : ''}`,
        link: createPageUrl('MyReferrals'),
        priority: 'high',
        metadata: {
          amount,
          period
        }
      }
    });
  }
};

/**
 * Handle customer claimed
 */
export const handleCustomerClaimed = async (payload) => {
  const { member, customer } = payload;

  console.log('🎯 [ReferralEventHandler] referral.customer_claimed:', member.referral_code);

  if (member.user_email) {
    await notificationEngine.create({
      actor: 'client',
      type: 'referral_customer_claimed',
      recipients: member.user_email,
      payload: {
        title: '🎯 Claim Khách Hàng Thành Công',
        message: `Khách hàng ${customer.full_name} đã được gán cho bạn`,
        link: createPageUrl('MyReferrals'),
        priority: 'normal',
        metadata: {
          customer_id: customer.id,
          customer_name: customer.full_name
        }
      }
    });
  }
};

/**
 * Register all referral event handlers
 */
export const registerReferralHandlers = (registry) => {
  registry.register(ReferralEvents.COMMISSION_EARNED, handleCommissionEarned, { priority: 8 });
  registry.register(ReferralEvents.RANK_UPGRADED, handleRankUpgraded, { priority: 8 });
  registry.register(ReferralEvents.MEMBER_APPROVED, handleMemberApproved, { priority: 8 });
  registry.register(ReferralEvents.MEMBER_SUSPENDED, handleMemberSuspended, { priority: 8 });
  registry.register(ReferralEvents.COMMISSION_PAID, handleCommissionPaid, { priority: 8 });
  registry.register(ReferralEvents.CUSTOMER_CLAIMED, handleCustomerClaimed, { priority: 6 });
  
  console.log('✅ Referral event handlers registered');
};

export default {
  handleCommissionEarned,
  handleRankUpgraded,
  handleMemberApproved,
  handleMemberSuspended,
  handleCommissionPaid,
  handleCustomerClaimed,
  registerReferralHandlers
};
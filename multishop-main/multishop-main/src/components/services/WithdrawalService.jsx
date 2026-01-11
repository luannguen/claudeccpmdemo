/**
 * WithdrawalService - Xử lý yêu cầu rút tiền
 * Data/Service Layer - Trả về Result<T>
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';
import { createPageUrl } from '@/utils';

const MIN_WITHDRAWAL_AMOUNT = 100000; // 100k VNĐ

/**
 * CTV request withdrawal
 */
export async function requestWithdrawal(referrerId, amount, bankInfo) {
  try {
    // Get referrer
    const referrers = await base44.entities.ReferralMember.filter({ id: referrerId });
    if (referrers.length === 0) {
      return failure('CTV không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    const referrer = referrers[0];
    
    // Validate amount
    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      return failure(`Số tiền rút tối thiểu là ${MIN_WITHDRAWAL_AMOUNT.toLocaleString('vi-VN')}đ`, ErrorCodes.VALIDATION_ERROR);
    }
    
    if (amount > (referrer.unpaid_commission || 0)) {
      return failure('Số tiền rút vượt quá số dư khả dụng', ErrorCodes.VALIDATION_ERROR);
    }

    // Validate bank info
    if (!bankInfo.name || !bankInfo.account || !bankInfo.account_name) {
      return failure('Vui lòng nhập đầy đủ thông tin ngân hàng', ErrorCodes.VALIDATION_ERROR);
    }

    // Check pending withdrawal
    const pending = await base44.entities.ReferralWithdrawal.filter({
      referrer_id: referrerId,
      status: 'pending'
    });
    
    if (pending.length > 0) {
      return failure('Bạn đang có yêu cầu rút tiền chưa xử lý', ErrorCodes.VALIDATION_ERROR);
    }

    // Create withdrawal request
    const withdrawal = await base44.entities.ReferralWithdrawal.create({
      referrer_id: referrerId,
      referrer_email: referrer.user_email,
      referrer_name: referrer.full_name,
      requested_amount: amount,
      available_balance: referrer.unpaid_commission,
      bank_name: bankInfo.name,
      bank_account: bankInfo.account,
      bank_account_name: bankInfo.account_name,
      status: 'pending',
      request_date: new Date().toISOString()
    });

    // Admin notification
    await base44.entities.AdminNotification.create({
      type: 'new_referral_member',
      title: '💰 Yêu cầu rút tiền hoa hồng',
      message: `${referrer.full_name} yêu cầu rút ${amount.toLocaleString('vi-VN')}đ`,
      link: createPageUrl('AdminReferralMembers'),
      priority: 'high',
      related_entity_type: 'ReferralWithdrawal',
      related_entity_id: withdrawal.id,
      requires_action: true,
      metadata: {
        referrer_name: referrer.full_name,
        amount: amount,
        bank: bankInfo.name
      }
    });

    return success(withdrawal);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Admin approve withdrawal
 */
export async function approveWithdrawal(withdrawalId, adminEmail, note = '') {
  try {
    const withdrawals = await base44.entities.ReferralWithdrawal.filter({ id: withdrawalId });
    if (withdrawals.length === 0) {
      return failure('Yêu cầu không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    const withdrawal = withdrawals[0];
    
    if (withdrawal.status !== 'pending') {
      return failure('Yêu cầu đã được xử lý', ErrorCodes.VALIDATION_ERROR);
    }

    // Update withdrawal
    await base44.entities.ReferralWithdrawal.update(withdrawalId, {
      status: 'approved',
      admin_reviewed_by: adminEmail,
      admin_review_date: new Date().toISOString(),
      approval_note: note
    });

    // Notify referrer
    await base44.entities.Notification.create({
      recipient_email: withdrawal.referrer_email,
      type: 'referral_commission_paid',
      title: '✅ Yêu cầu rút tiền đã được duyệt',
      message: `Yêu cầu rút ${withdrawal.requested_amount.toLocaleString('vi-VN')}đ đã được duyệt. Chúng tôi sẽ chuyển khoản trong 24h.`,
      link: createPageUrl('MyReferrals'),
      priority: 'high'
    });

    return success(withdrawal);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Admin reject withdrawal
 */
export async function rejectWithdrawal(withdrawalId, adminEmail, reason) {
  try {
    const withdrawals = await base44.entities.ReferralWithdrawal.filter({ id: withdrawalId });
    if (withdrawals.length === 0) {
      return failure('Yêu cầu không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    const withdrawal = withdrawals[0];

    await base44.entities.ReferralWithdrawal.update(withdrawalId, {
      status: 'rejected',
      admin_reviewed_by: adminEmail,
      admin_review_date: new Date().toISOString(),
      rejection_reason: reason
    });

    await base44.entities.Notification.create({
      recipient_email: withdrawal.referrer_email,
      type: 'referral_status_update',
      title: '❌ Yêu cầu rút tiền bị từ chối',
      message: `Yêu cầu rút tiền bị từ chối. Lý do: ${reason}`,
      link: createPageUrl('MyReferrals'),
      priority: 'normal'
    });

    return success(withdrawal);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Admin mark as paid (upload proof)
 */
export async function markWithdrawalPaid(withdrawalId, adminEmail, paymentData) {
  try {
    const withdrawals = await base44.entities.ReferralWithdrawal.filter({ id: withdrawalId });
    if (withdrawals.length === 0) {
      return failure('Yêu cầu không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    const withdrawal = withdrawals[0];
    
    if (withdrawal.status !== 'approved') {
      return failure('Yêu cầu phải được duyệt trước khi thanh toán', ErrorCodes.VALIDATION_ERROR);
    }

    const actualAmount = withdrawal.requested_amount - (paymentData.transaction_fee || 0);

    // Update withdrawal
    await base44.entities.ReferralWithdrawal.update(withdrawalId, {
      status: 'paid',
      payment_date: new Date().toISOString(),
      payment_proof_url: paymentData.proof_url,
      payment_reference: paymentData.reference,
      transaction_fee: paymentData.transaction_fee || 0,
      actual_amount_paid: actualAmount
    });

    // Update referrer
    const referrers = await base44.entities.ReferralMember.filter({ id: withdrawal.referrer_id });
    if (referrers.length > 0) {
      const referrer = referrers[0];
      await base44.entities.ReferralMember.update(referrer.id, {
        unpaid_commission: Math.max(0, (referrer.unpaid_commission || 0) - withdrawal.requested_amount),
        total_paid_commission: (referrer.total_paid_commission || 0) + withdrawal.requested_amount,
        last_commission_payout: new Date().toISOString()
      });

      // Commission log
      await base44.entities.ReferralCommissionLog.create({
        referrer_id: referrer.id,
        referrer_email: referrer.user_email,
        withdrawal_id: withdrawalId,
        change_type: 'withdrawal_approved',
        old_value: { balance: referrer.unpaid_commission },
        new_value: { balance: referrer.unpaid_commission - withdrawal.requested_amount },
        affected_amount: -withdrawal.requested_amount,
        balance_before: referrer.unpaid_commission || 0,
        balance_after: Math.max(0, (referrer.unpaid_commission || 0) - withdrawal.requested_amount),
        triggered_by: adminEmail,
        triggered_by_role: 'admin',
        reason: 'Withdrawal approved and paid',
        metadata: {
          withdrawal_id: withdrawalId,
          payment_reference: paymentData.reference
        }
      });
    }

    // Notify referrer
    await base44.entities.Notification.create({
      recipient_email: withdrawal.referrer_email,
      type: 'referral_commission_paid',
      title: '💵 Đã chuyển khoản hoa hồng!',
      message: `Chúng tôi đã chuyển ${actualAmount.toLocaleString('vi-VN')}đ vào tài khoản ${withdrawal.bank_account}. Mã GD: ${paymentData.reference}`,
      link: createPageUrl('MyReferrals'),
      priority: 'high'
    });

    return success(withdrawal);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

export default {
  requestWithdrawal,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalPaid,
  MIN_WITHDRAWAL_AMOUNT
};
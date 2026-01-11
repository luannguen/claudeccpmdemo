/**
 * BulkReferralActionsService - Xử lý bulk actions cho admin
 * Data/Service Layer - Trả về Result<T>
 * 
 * KHÔNG import ReferralService (tránh circular)
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';
import { createPageUrl } from '@/utils';

/**
 * Bulk approve members
 */
export async function bulkApproveMembers(memberIds, adminEmail) {
  try {
    const results = [];
    
    for (const id of memberIds) {
      const members = await base44.entities.ReferralMember.filter({ id });
      if (members.length === 0) {
        results.push({ id, success: false, error: 'Không tìm thấy' });
        continue;
      }
      
      const member = members[0];
      
      if (member.status !== 'pending_approval') {
        results.push({ id, success: false, error: 'Không ở trạng thái chờ duyệt' });
        continue;
      }

      await base44.entities.ReferralMember.update(id, {
        status: 'active',
        activation_date: new Date().toISOString()
      });

      // Audit log
      await base44.entities.ReferralAuditLog.create({
        action_type: 'member_activated',
        actor_email: adminEmail,
        actor_role: 'admin',
        target_type: 'referral_member',
        target_id: id,
        target_email: member.user_email,
        description: `Admin bulk approve ${member.full_name}`
      });

      // Notify
      await base44.entities.Notification.create({
        recipient_email: member.user_email,
        type: 'referral_welcome',
        title: '🎉 Chào mừng bạn đến với chương trình giới thiệu!',
        message: `Tài khoản của bạn đã được kích hoạt. Mã: ${member.referral_code}`,
        link: createPageUrl('MyReferrals'),
        priority: 'high'
      });

      results.push({ id, success: true, name: member.full_name });
    }

    const successCount = results.filter(r => r.success).length;
    return success({ results, successCount, totalCount: memberIds.length });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Bulk suspend members
 */
export async function bulkSuspendMembers(memberIds, adminEmail, reason) {
  try {
    const results = [];
    
    for (const id of memberIds) {
      const members = await base44.entities.ReferralMember.filter({ id });
      if (members.length === 0) {
        results.push({ id, success: false, error: 'Không tìm thấy' });
        continue;
      }
      
      const member = members[0];

      await base44.entities.ReferralMember.update(id, {
        status: 'suspended',
        suspension_reason: reason
      });

      await base44.entities.ReferralAuditLog.create({
        action_type: 'member_suspended',
        actor_email: adminEmail,
        actor_role: 'admin',
        target_type: 'referral_member',
        target_id: id,
        target_email: member.user_email,
        new_value: { reason },
        description: `Admin bulk suspend ${member.full_name}`
      });

      results.push({ id, success: true, name: member.full_name });
    }

    const successCount = results.filter(r => r.success).length;
    return success({ results, successCount, totalCount: memberIds.length });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Bulk payout
 */
export async function bulkPayoutMembers(memberIds, adminEmail) {
  try {
    const results = [];
    const batchId = `BULK-${Date.now()}`;
    
    for (const id of memberIds) {
      const members = await base44.entities.ReferralMember.filter({ id });
      if (members.length === 0) {
        results.push({ id, success: false, error: 'Không tìm thấy' });
        continue;
      }
      
      const member = members[0];
      const amount = member.unpaid_commission || 0;
      
      if (amount <= 0) {
        results.push({ id, success: false, error: 'Không có hoa hồng chờ thanh toán' });
        continue;
      }

      await base44.entities.ReferralMember.update(id, {
        unpaid_commission: 0,
        total_paid_commission: (member.total_paid_commission || 0) + amount,
        last_commission_payout: new Date().toISOString()
      });

      // Update events
      const unpaidEvents = await base44.entities.ReferralEvent.filter({
        referrer_id: id,
        status: 'calculated'
      });
      
      for (const event of unpaidEvents) {
        await base44.entities.ReferralEvent.update(event.id, {
          status: 'paid',
          payout_date: new Date().toISOString(),
          payout_batch_id: batchId
        });
      }

      // Commission log
      await base44.entities.ReferralCommissionLog.create({
        referrer_id: id,
        referrer_email: member.user_email,
        change_type: 'payout_processed',
        affected_amount: -amount,
        balance_before: amount,
        balance_after: 0,
        triggered_by: adminEmail,
        triggered_by_role: 'admin',
        reason: `Bulk payout batch ${batchId}`,
        metadata: { batch_id: batchId }
      });

      // Notify
      await base44.entities.Notification.create({
        recipient_email: member.user_email,
        type: 'referral_commission_paid',
        title: '💵 Hoa hồng đã được thanh toán!',
        message: `Bạn đã nhận ${amount.toLocaleString('vi-VN')}đ hoa hồng`,
        link: createPageUrl('MyReferrals'),
        priority: 'high',
        metadata: { amount, batch_id: batchId }
      });

      results.push({ id, success: true, name: member.full_name, amount });
    }

    const successCount = results.filter(r => r.success).length;
    const totalAmount = results.filter(r => r.success).reduce((sum, r) => sum + (r.amount || 0), 0);
    
    return success({ results, successCount, totalCount: memberIds.length, totalAmount, batchId });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

export default {
  bulkApproveMembers,
  bulkSuspendMembers,
  bulkPayoutMembers
};
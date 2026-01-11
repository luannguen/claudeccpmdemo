/**
 * ReferralClaimService - Xử lý claim KH cũ
 * Data/Service Layer - Trả về Result<T>
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';
import { createPageUrl } from '@/utils';

/**
 * Claim existing customer (CTV request)
 * @param {string} referrerId - ID CTV
 * @param {string} customerEmail - Email KH muốn claim
 */
export async function requestClaimCustomer(referrerId, customerEmail) {
  try {
    // Validate referrer
    const referrerResult = await base44.entities.ReferralMember.filter({ id: referrerId });
    if (referrerResult.length === 0) {
      return failure('CTV không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    const referrer = referrerResult[0];
    if (referrer.status !== 'active') {
      return failure('Tài khoản CTV chưa được kích hoạt', ErrorCodes.FORBIDDEN);
    }

    // Check customer exists
    const customers = await base44.entities.Customer.filter({ email: customerEmail });
    if (customers.length === 0) {
      return failure('Không tìm thấy khách hàng với email này', ErrorCodes.NOT_FOUND);
    }
    
    const customer = customers[0];

    // Check already has referrer
    if (customer.referrer_id) {
      if (customer.referrer_id === referrerId) {
        return failure('Khách hàng này đã là F1 của bạn', ErrorCodes.VALIDATION_ERROR);
      }
      
      const existingReferrer = await base44.entities.ReferralMember.filter({ id: customer.referrer_id });
      const existingName = existingReferrer.length > 0 ? existingReferrer[0].full_name : 'CTV khác';
      return failure(`Khách hàng đã thuộc về ${existingName}`, ErrorCodes.FORBIDDEN);
    }

    // Check if locked
    if (customer.referral_locked) {
      return failure('Khách hàng đã bị khóa, không thể claim', ErrorCodes.FORBIDDEN);
    }

    // Check self-claim
    if (customer.email === referrer.user_email) {
      return failure('Bạn không thể claim chính mình', ErrorCodes.VALIDATION_ERROR);
    }

    // Create claim request (using AdminNotification as pending claim)
    const claimRequest = await base44.entities.AdminNotification.create({
      type: 'new_referral_member',
      title: `🙋 Yêu cầu claim khách hàng`,
      message: `${referrer.full_name} muốn claim khách hàng ${customer.full_name} (${customer.email})`,
      link: createPageUrl('AdminCustomers'),
      priority: 'normal',
      related_entity_type: 'Customer',
      related_entity_id: customer.id,
      requires_action: true,
      metadata: {
        claim_type: 'retroactive',
        referrer_id: referrerId,
        referrer_name: referrer.full_name,
        referrer_email: referrer.user_email,
        customer_id: customer.id,
        customer_name: customer.full_name,
        customer_email: customer.email,
        pre_claim_orders: customer.total_orders || 0,
        pre_claim_spent: customer.total_spent || 0
      }
    });

    return success({ claimRequest, customer, referrer });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Admin approve claim (execute)
 * @param {string} claimRequestId - AdminNotification ID
 * @param {string} adminEmail
 */
export async function approveCustomerClaim(claimRequestId, adminEmail) {
  try {
    // Get claim request
    const claimRequests = await base44.entities.AdminNotification.filter({ id: claimRequestId });
    if (claimRequests.length === 0) {
      return failure('Yêu cầu claim không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    const claim = claimRequests[0];
    const metadata = claim.metadata;

    // Get customer & referrer
    const customers = await base44.entities.Customer.filter({ id: metadata.customer_id });
    const referrers = await base44.entities.ReferralMember.filter({ id: metadata.referrer_id });

    if (customers.length === 0 || referrers.length === 0) {
      return failure('Dữ liệu không hợp lệ', ErrorCodes.NOT_FOUND);
    }

    const customer = customers[0];
    const referrer = referrers[0];

    // Double check
    if (customer.referrer_id && customer.referrer_id !== metadata.referrer_id) {
      return failure('Khách hàng đã thuộc về CTV khác', ErrorCodes.FORBIDDEN);
    }

    // Execute claim
    const claimDate = new Date().toISOString();
    
    await base44.entities.Customer.update(customer.id, {
      referrer_id: referrer.id,
      referral_code_used: referrer.referral_code,
      referred_date: claimDate,
      is_referred_customer: true,
      customer_source: 'claimed',
      claimed_by_referrer_date: claimDate,
      pre_referral_orders_count: metadata.pre_claim_orders || 0,
      pre_referral_total_spent: metadata.pre_claim_spent || 0,
      referral_locked: true // Lock ngay sau claim
    });

    // Update referrer stats
    await base44.entities.ReferralMember.update(referrer.id, {
      total_referred_customers: (referrer.total_referred_customers || 0) + 1
    });

    // Recalculate rank
    const ReferralService = await import('./ReferralService').then(m => m.default);
    await ReferralService.updateMemberRank(referrer.id);

    // Mark claim as resolved
    await base44.entities.AdminNotification.update(claimRequestId, {
      is_read: true,
      read_date: new Date().toISOString()
    });

    // Audit log
    await base44.entities.ReferralAuditLog.create({
      action_type: 'customer_claimed',
      actor_email: adminEmail,
      actor_role: 'admin',
      target_type: 'customer',
      target_id: customer.id,
      target_email: customer.email,
      old_value: { referrer_id: null },
      new_value: { referrer_id: referrer.id, claim_date: claimDate },
      description: `Admin duyệt claim KH ${customer.full_name} → CTV ${referrer.full_name}. Đơn cũ: ${metadata.pre_claim_orders}`
    });

    // Notify referrer
    await base44.entities.Notification.create({
      recipient_email: referrer.user_email,
      type: 'referral_status_update',
      title: '✅ Yêu cầu claim được duyệt',
      message: `Admin đã duyệt claim khách hàng ${customer.full_name}. Đơn hàng mới sẽ tính hoa hồng.`,
      link: createPageUrl('MyReferrals'),
      priority: 'high'
    });

    return success({ customer, referrer });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Admin reject claim
 * @param {string} claimRequestId
 * @param {string} adminEmail
 * @param {string} reason
 */
export async function rejectCustomerClaim(claimRequestId, adminEmail, reason) {
  try {
    const claimRequests = await base44.entities.AdminNotification.filter({ id: claimRequestId });
    if (claimRequests.length === 0) {
      return failure('Yêu cầu claim không tồn tại', ErrorCodes.NOT_FOUND);
    }
    
    const claim = claimRequests[0];
    const metadata = claim.metadata;

    // Mark as resolved
    await base44.entities.AdminNotification.update(claimRequestId, {
      is_read: true,
      read_date: new Date().toISOString()
    });

    // Audit log
    await base44.entities.ReferralAuditLog.create({
      action_type: 'customer_claim_rejected',
      actor_email: adminEmail,
      actor_role: 'admin',
      target_type: 'customer',
      target_id: metadata.customer_id,
      target_email: metadata.customer_email,
      description: `Admin từ chối claim KH ${metadata.customer_name} cho CTV ${metadata.referrer_name}. Lý do: ${reason}`
    });

    // Notify referrer
    const referrers = await base44.entities.ReferralMember.filter({ id: metadata.referrer_id });
    if (referrers.length > 0) {
      await base44.entities.Notification.create({
        recipient_email: referrers[0].user_email,
        type: 'referral_status_update',
        title: '❌ Yêu cầu claim bị từ chối',
        message: `Yêu cầu claim khách hàng ${metadata.customer_name} không được duyệt. Lý do: ${reason}`,
        link: createPageUrl('MyReferrals'),
        priority: 'normal'
      });
    }

    return success({ claimRequestId });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

export default {
  requestClaimCustomer,
  approveCustomerClaim,
  rejectCustomerClaim
};
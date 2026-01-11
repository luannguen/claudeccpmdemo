/**
 * 🎯 ReferralService - Core business logic cho hệ thống giới thiệu
 * 
 * Single Goal: Cung cấp tất cả logic nghiệp vụ liên quan đến referral
 * - Đăng ký thành viên
 * - Tạo/validate mã giới thiệu
 * - Tính hoa hồng
 * - Chống gian lận
 * - Audit log
 */

import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import referralCore from './referralCore';

// Re-export constants cho backward compatibility
export const DEFAULT_COMMISSION_TIERS = referralCore.DEFAULT_COMMISSION_TIERS;

// ========== SETTINGS ==========

export async function getReferralSettings() {
  try {
    const settings = await base44.entities.ReferralSetting.filter({ setting_key: 'main' });
    if (settings.length > 0) {
      return settings[0];
    }
    // Tạo settings mặc định nếu chưa có
    return await base44.entities.ReferralSetting.create({
      setting_key: 'main',
      is_program_enabled: true,
      commission_tiers: DEFAULT_COMMISSION_TIERS
    });
  } catch (error) {
    console.error('Error getting referral settings:', error);
    return {
      is_program_enabled: true,
      commission_tiers: DEFAULT_COMMISSION_TIERS,
      min_orders_for_referrer: 1,
      enable_referrer_order_check: true,
      require_admin_approval: true,
      enable_fraud_detection: true,
      fraud_threshold_score: 50
    };
  }
}

export async function updateReferralSettings(settingId, updates) {
  const result = await base44.entities.ReferralSetting.update(settingId, updates);
  
  // Audit log
  await createAuditLog({
    action_type: 'settings_updated',
    target_type: 'referral_setting',
    target_id: settingId,
    new_value: updates,
    description: 'Cập nhật cài đặt chương trình giới thiệu'
  });
  
  return result;
}

// ========== REFERRAL CODE ==========

export async function validateReferralCode(code) {
  return referralCore.validateReferralCode(code);
}

// ========== MEMBER REGISTRATION ==========

export async function checkEligibility(userEmail) {
  // Lấy settings để check rule
  const settings = await getReferralSettings();
  
  // Nếu tắt rule check order -> eligible luôn
  if (!settings.enable_referrer_order_check) {
    return {
      eligible: true,
      orderCount: 0,
      message: 'Bạn đủ điều kiện tham gia chương trình giới thiệu!'
    };
  }
  
  // Nếu bật rule -> kiểm tra đã có đơn hàng thành công chưa
  const orders = await base44.entities.Order.filter({
    customer_email: userEmail,
    order_status: 'delivered'
  });
  
  const minOrders = settings.min_orders_for_referrer || 1;
  
  return {
    eligible: orders.length >= minOrders,
    orderCount: orders.length,
    message: orders.length >= minOrders
      ? 'Bạn đủ điều kiện tham gia chương trình giới thiệu!'
      : `Bạn cần có ít nhất ${minOrders} đơn hàng thành công để tham gia`
  };
}

export async function registerReferralMember(userData) {
  const { email, fullName, phone } = userData;
  
  // Kiểm tra đã đăng ký chưa
  const existing = await base44.entities.ReferralMember.filter({ user_email: email });
  if (existing.length > 0) {
    return { success: false, error: 'Bạn đã đăng ký chương trình giới thiệu', member: existing[0] };
  }
  
  // Kiểm tra điều kiện
  const settings = await getReferralSettings();
  if (settings.enable_referrer_order_check) {
    const eligibility = await checkEligibility(email);
    if (!eligibility.eligible) {
      return { success: false, error: eligibility.message };
    }
  }
  
  // Tạo mã giới thiệu unique
  let referralCode = referralCore.generateReferralCode(fullName);
  let attempts = 0;
  while (attempts < 5) {
    const existingCode = await base44.entities.ReferralMember.filter({ referral_code: referralCode });
    if (existingCode.length === 0) break;
    referralCode = referralCore.generateReferralCode(fullName);
    attempts++;
  }
  
  // Tạo link và QR
  const baseUrl = window.location.origin;
  const referralLink = `${baseUrl}/?ref=${referralCode}`;
  
  // Tạo member
  const member = await base44.entities.ReferralMember.create({
    user_email: email,
    full_name: fullName,
    phone: phone,
    referral_code: referralCode,
    referral_link: referralLink,
    status: settings.require_admin_approval ? 'pending_approval' : 'active',
    is_eligible: true,
    qualifying_order_count: 1,
    activation_date: settings.require_admin_approval ? null : new Date().toISOString()
  });
  
  // Audit log
  await referralCore.createAuditLog({
    action_type: 'member_joined',
    target_type: 'referral_member',
    target_id: member.id,
    target_email: email,
    description: `${fullName} đăng ký tham gia chương trình giới thiệu`
  });
  
  // Admin notification
  if (settings.require_admin_approval) {
    await base44.entities.AdminNotification.create({
      type: 'referral_member_pending',
      title: '👤 Thành viên giới thiệu mới cần duyệt',
      message: `${fullName} (${email}) đã đăng ký tham gia chương trình giới thiệu`,
      link: createPageUrl('AdminReferralMembers'),
      priority: 'normal',
      related_entity_type: 'ReferralMember',
      related_entity_id: member.id,
      requires_action: true,
      metadata: { member_name: fullName, member_email: email }
    });
  }
  
  return { success: true, member };
}

// ========== MEMBER MANAGEMENT (Admin) ==========

export async function approveMember(memberId, adminEmail) {
  const member = await base44.entities.ReferralMember.update(memberId, {
    status: 'active',
    activation_date: new Date().toISOString()
  });
  
  // Audit log
  await referralCore.createAuditLog({
    action_type: 'member_activated',
    actor_email: adminEmail,
    actor_role: 'admin',
    target_type: 'referral_member',
    target_id: memberId,
    target_email: member.user_email,
    description: `Admin đã duyệt thành viên ${member.full_name}`
  });
  
  // Thông báo cho user
  await base44.entities.Notification.create({
    recipient_email: member.user_email,
    type: 'referral_welcome',
    title: '🎉 Chào mừng bạn đến với chương trình giới thiệu!',
    message: `Tài khoản giới thiệu của bạn đã được kích hoạt. Mã của bạn: ${member.referral_code}`,
    link: createPageUrl('MyReferrals'),
    priority: 'high'
  });
  
  return member;
}

export async function suspendMember(memberId, reason, adminEmail) {
  const members = await base44.entities.ReferralMember.filter({ id: memberId });
  if (members.length === 0) return null;
  
  const member = await base44.entities.ReferralMember.update(memberId, {
    status: 'suspended',
    suspension_reason: reason
  });
  
  await referralCore.createAuditLog({
    action_type: 'member_suspended',
    actor_email: adminEmail,
    actor_role: 'admin',
    target_type: 'referral_member',
    target_id: memberId,
    target_email: member.user_email,
    new_value: { reason },
    description: `Admin đình chỉ thành viên ${member.full_name}: ${reason}`
  });
  
  await base44.entities.Notification.create({
    recipient_email: member.user_email,
    type: 'referral_status_update',
    title: '⚠️ Tài khoản giới thiệu bị đình chỉ',
    message: `Tài khoản giới thiệu của bạn đã bị đình chỉ. Lý do: ${reason}`,
    link: createPageUrl('MyReferrals'),
    priority: 'high'
  });
  
  return member;
}

export async function reactivateMember(memberId, adminEmail) {
  const members = await base44.entities.ReferralMember.filter({ id: memberId });
  if (members.length === 0) return null;
  
  const member = await base44.entities.ReferralMember.update(memberId, {
    status: 'active',
    suspension_reason: null
  });
  
  await referralCore.createAuditLog({
    action_type: 'member_reactivated',
    actor_email: adminEmail,
    actor_role: 'admin',
    target_type: 'referral_member',
    target_id: memberId,
    target_email: member.user_email,
    description: `Admin kích hoạt lại thành viên ${member.full_name}`
  });
  
  return member;
}

// ========== COMMISSION CALCULATION (delegated to core) ==========

export function getCommissionRate(monthlyRevenue, tiers) {
  return referralCore.getCommissionRate(monthlyRevenue, tiers);
}

export async function calculateOrderCommission(order, referrer, settings) {
  return referralCore.calculateOrderCommission(order, referrer, settings);
}

export async function processOrderReferral(order) {
  // Kiểm tra đơn hàng có referral code không
  if (!order.referral_code_applied || order.referral_commission_calculated) {
    return null;
  }
  

  
  // Validate referral code
  const validation = await validateReferralCode(order.referral_code_applied);
  if (!validation.valid) {
    return null;
  }
  
  const referrer = validation.referrer;
  const settings = await getReferralSettings();
  
  // Kiểm tra self-referral
  if (settings.block_self_referral && order.customer_email === referrer.user_email) {
    console.warn('Self-referral blocked:', order.customer_email);
    return null;
  }
  
  // Kiểm tra validity days
  if (settings.referral_validity_days > 0) {
    const customer = await base44.entities.Customer.filter({ email: order.customer_email });
    if (customer.length > 0 && customer[0].referred_date) {
      const referredDate = new Date(customer[0].referred_date);
      const daysSinceReferred = Math.floor((new Date() - referredDate) / (1000 * 60 * 60 * 24));
      if (daysSinceReferred > settings.referral_validity_days) {
        console.warn('Referral validity expired:', order.customer_email);
        return null;
      }
    }
  }
  
  // Tính hoa hồng
  const commission = await calculateOrderCommission(order, referrer, settings);
  if (!commission) return null;
  
  // Kiểm tra gian lận
  let fraudCheck = { suspect: false, reason: null };
  if (settings.enable_fraud_detection) {
    fraudCheck = await referralCore.checkFraudRules(order, referrer, settings.fraud_rules);
  }
  
  // Tạo ReferralEvent
  const event = await base44.entities.ReferralEvent.create({
    referrer_id: referrer.id,
    referrer_email: referrer.user_email,
    referrer_name: referrer.full_name,
    referred_customer_email: order.customer_email,
    referred_customer_name: order.customer_name,
    referred_customer_phone: order.customer_phone,
    order_id: order.id,
    order_number: order.order_number,
    order_amount: order.total_amount,
    commission_tier: commission.commission_tier,
    commission_rate: commission.commission_rate,
    commission_amount: commission.commission_amount,
    event_type: 'subsequent_purchase',
    status: fraudCheck.suspect ? 'pending' : 'calculated',
    calculation_date: new Date().toISOString(),
    fraud_suspect: fraudCheck.suspect,
    fraud_reason: fraudCheck.reason,
    period_month: new Date().toISOString().slice(0, 7)
  });
  
  // Cập nhật ReferralMember
  await base44.entities.ReferralMember.update(referrer.id, {
    total_referral_revenue: (referrer.total_referral_revenue || 0) + order.total_amount,
    current_month_revenue: commission.current_month_revenue,
    unpaid_commission: (referrer.unpaid_commission || 0) + commission.commission_amount
  });
  
  // Đánh dấu order đã tính hoa hồng
  await base44.entities.Order.update(order.id, {
    referral_commission_calculated: true
  });
  
  // Audit log
  await referralCore.createAuditLog({
    action_type: 'commission_calculated',
    target_type: 'referral_event',
    target_id: event.id,
    target_email: referrer.user_email,
    description: `Tính hoa hồng ${commission.commission_amount.toLocaleString('vi-VN')}đ cho ${referrer.full_name} từ đơn #${order.order_number}`
  });

  // 🔥 NEW: Commission log
  await base44.entities.ReferralCommissionLog.create({
    referrer_id: referrer.id,
    referrer_email: referrer.user_email,
    event_id: event.id,
    order_id: order.id,
    change_type: 'commission_earned',
    old_value: { balance: referrer.unpaid_commission || 0 },
    new_value: { balance: (referrer.unpaid_commission || 0) + commission.commission_amount },
    affected_amount: commission.commission_amount,
    balance_before: referrer.unpaid_commission || 0,
    balance_after: (referrer.unpaid_commission || 0) + commission.commission_amount,
    triggered_by: 'system',
    triggered_by_role: 'system',
    reason: 'Order commission calculated',
    metadata: {
      order_number: order.order_number,
      customer_name: order.customer_name,
      commission_rate: commission.commission_rate
    }
  });
  
  // Thông báo cho referrer
  await base44.entities.Notification.create({
    recipient_email: referrer.user_email,
    type: 'referral_commission_earned',
    title: '💰 Bạn có hoa hồng mới!',
    message: `Khách hàng ${order.customer_name} đã mua hàng. Hoa hồng: ${commission.commission_amount.toLocaleString('vi-VN')}đ`,
    link: createPageUrl('MyReferrals'),
    priority: 'high',
    referral_event_id: event.id,
    metadata: {
      order_number: order.order_number,
      order_amount: order.total_amount,
      commission_amount: commission.commission_amount,
      commission_rate: commission.commission_rate
    }
  });
  
  // Nếu nghi ngờ gian lận, thông báo admin
  if (fraudCheck.suspect) {
    await base44.entities.AdminNotification.create({
      type: 'referral_fraud_suspect',
      title: '🚨 Nghi ngờ gian lận Referral',
      message: `Đơn #${order.order_number} của ${referrer.full_name} có dấu hiệu bất thường: ${fraudCheck.reason}`,
      link: createPageUrl('AdminReferralMembers'),
      priority: 'urgent',
      related_entity_type: 'ReferralEvent',
      related_entity_id: event.id,
      requires_action: true,
      metadata: {
        referrer_name: referrer.full_name,
        fraud_reason: fraudCheck.reason
      }
    });
  }
  
  return event;
}



export async function markFraudulent(eventId, adminEmail, reason) {
  const event = await base44.entities.ReferralEvent.update(eventId, {
    status: 'fraudulent',
    fraud_suspect: true,
    fraud_reason: reason,
    admin_notes: `Đánh dấu gian lận bởi ${adminEmail}: ${reason}`
  });
  
  // Trừ hoa hồng khỏi unpaid
  const referrer = await base44.entities.ReferralMember.filter({ id: event.referrer_id });
  if (referrer.length > 0) {
    await base44.entities.ReferralMember.update(referrer[0].id, {
      unpaid_commission: Math.max(0, (referrer[0].unpaid_commission || 0) - event.commission_amount),
      fraud_score: Math.min(100, (referrer[0].fraud_score || 0) + 25)
    });
  }
  
  await referralCore.createAuditLog({
    action_type: 'fraud_detected',
    actor_email: adminEmail,
    actor_role: 'admin',
    target_type: 'referral_event',
    target_id: eventId,
    new_value: { reason },
    description: `Admin đánh dấu giao dịch gian lận: ${reason}`
  });
  
  return event;
}

// ========== PAYOUT ==========

export async function processPayoutBatch(memberIds, adminEmail) {
  const results = [];
  const settings = await getReferralSettings();
  const batchId = `PAY-${Date.now()}`;
  
  for (const memberId of memberIds) {
    const members = await base44.entities.ReferralMember.filter({ id: memberId });
    if (members.length === 0) continue;
    
    const member = members[0];
    if (member.unpaid_commission < (settings.min_payout_amount || 100000)) {
      results.push({ memberId, success: false, error: 'Chưa đạt mức thanh toán tối thiểu' });
      continue;
    }
    
    const payoutAmount = member.unpaid_commission;
    
    // Cập nhật member
    await base44.entities.ReferralMember.update(memberId, {
      unpaid_commission: 0,
      total_paid_commission: (member.total_paid_commission || 0) + payoutAmount,
      last_commission_payout: new Date().toISOString()
    });
    
    // Cập nhật các event thành paid
    const unpaidEvents = await base44.entities.ReferralEvent.filter({
      referrer_id: memberId,
      status: 'calculated'
    });
    
    for (const event of unpaidEvents) {
      await base44.entities.ReferralEvent.update(event.id, {
        status: 'paid',
        payout_date: new Date().toISOString(),
        payout_batch_id: batchId
      });
    }
    
    // Thông báo cho member
    await base44.entities.Notification.create({
      recipient_email: member.user_email,
      type: 'referral_commission_paid',
      title: '💵 Hoa hồng đã được thanh toán!',
      message: `Bạn đã nhận được ${payoutAmount.toLocaleString('vi-VN')}đ hoa hồng giới thiệu`,
      link: createPageUrl('MyReferrals'),
      priority: 'high',
      metadata: { amount: payoutAmount, batch_id: batchId }
    });
    
    results.push({ memberId, success: true, amount: payoutAmount });
  }
  
  // Audit log
  await referralCore.createAuditLog({
    action_type: 'payout_processed',
    actor_email: adminEmail,
    actor_role: 'admin',
    target_type: 'payout',
    target_id: batchId,
    description: `Admin xử lý thanh toán hoa hồng cho ${results.filter(r => r.success).length} thành viên`,
    metadata: { batch_id: batchId, results }
  });
  
  return { batchId, results };
}

// ========== RANK MANAGEMENT ==========

export async function updateMemberRank(memberId) {
  const members = await base44.entities.ReferralMember.filter({ id: memberId });
  if (members.length === 0) return null;

  const member = members[0];
  const settings = await getReferralSettings();
  const rankConfig = settings.seeder_rank_config;

  const f1Customers = await base44.entities.Customer.filter({ referrer_id: member.id });
  const f1Emails = f1Customers.map(c => c.email);
  const f1Members = await base44.entities.ReferralMember.filter({ user_email: { $in: f1Emails } });

  const f1Stats = {
    f1_with_purchases: f1Customers.filter(c => (c.total_orders || 0) >= (settings.min_f1_orders_for_rank || 1)).length,
    f1_at_hat_giong_khoe: f1Members.filter(m => m.seeder_rank === 'hat_giong_khoe').length,
    f1_at_mam_khoe: f1Members.filter(m => m.seeder_rank === 'mam_khoe').length,
    f1_at_choi_khoe: f1Members.filter(m => m.seeder_rank === 'choi_khoe').length,
    f1_at_canh_khoe: f1Members.filter(m => m.seeder_rank === 'canh_khoe').length,
    f1_at_cay_khoe: f1Members.filter(m => m.seeder_rank === 'cay_khoe').length
  };

  // Cập nhật các counter F1
  await base44.entities.ReferralMember.update(member.id, f1Stats);

  let newRank = 'nguoi_gieo_hat';
  const rankOrder = ['nguoi_gieo_hat', 'hat_giong_khoe', 'mam_khoe', 'choi_khoe', 'canh_khoe', 'cay_khoe', 'danh_hieu'];

  for (const rank of rankOrder.slice().reverse()) { // Check từ cao xuống thấp
    const config = rankConfig[rank];
    if (!config) continue;

    let achieved = true;
    if (config.f1_required > 0) {
      if (config.f1_rank_required) {
        const f1RankCount = f1Members.filter(m => rankOrder.indexOf(m.seeder_rank) >= rankOrder.indexOf(config.f1_rank_required)).length;
        if (f1RankCount < config.f1_required) {
          achieved = false;
        }
      } else { // Chỉ yêu cầu F1 có đơn hàng
        if (f1Stats.f1_with_purchases < config.f1_required) {
          achieved = false;
        }
      }
    }

    if (achieved) {
      newRank = rank;
      break; // Dừng lại khi tìm thấy cấp bậc cao nhất đạt được
    }
  }

  if (newRank !== member.seeder_rank) {
    const newRankConfig = rankConfig[newRank];
    const updates = {
      seeder_rank: newRank,
      seeder_rank_bonus: newRankConfig.bonus || 0,
      seeder_rank_upgraded_date: new Date().toISOString(),
      has_certificate: member.has_certificate || newRankConfig.certificate,
      is_region_representative: member.is_region_representative || newRankConfig.region_rep
    };
    
    await base44.entities.ReferralMember.update(memberId, updates);

    if (rankOrder.indexOf(newRank) > rankOrder.indexOf(member.seeder_rank)) {
      await base44.entities.Notification.create({
        recipient_email: member.user_email,
        type: 'referral_rank_up',
        title: `🏆 Chúc mừng bạn đã đạt cấp bậc ${newRankConfig.label}!`,
        message: `Hành trình Người Gieo Hạt của bạn đã đạt một cột mốc mới. Cố lên!`,
        link: createPageUrl('MyReferrals'),
        priority: 'high'
      });

      await referralCore.createAuditLog({
        action_type: 'rank_upgraded',
        target_type: 'referral_member',
        target_id: memberId,
        target_email: member.user_email,
        old_value: { rank: member.seeder_rank },
        new_value: { rank: newRank },
        description: `${member.full_name} đã lên cấp ${newRankConfig.label}`
      });
    }
  }

  return newRank;
}

// ========== CUSTOMER REFERRAL ==========

export async function applyReferralToCustomer(customerEmail, referralCode) {
  // Validate code
  const validation = await validateReferralCode(referralCode);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  const referrer = validation.referrer;
  
  // Kiểm tra self-referral
  if (customerEmail === referrer.user_email) {
    return { success: false, error: 'Bạn không thể sử dụng mã giới thiệu của chính mình' };
  }
  
  // Kiểm tra customer đã được giới thiệu chưa
  const customers = await base44.entities.Customer.filter({ email: customerEmail });
  if (customers.length > 0 && customers[0].referral_locked) {
    return { success: false, error: 'Bạn đã sử dụng mã giới thiệu trước đó' };
  }
  
  // Cập nhật hoặc tạo customer
  if (customers.length > 0) {
    await base44.entities.Customer.update(customers[0].id, {
      referrer_id: referrer.id,
      referral_code_used: referralCode,
      referred_date: new Date().toISOString(),
      is_referred_customer: true,
      customer_source: 'referral'
    });
  }
  
  // Tăng số khách được giới thiệu
  await base44.entities.ReferralMember.update(referrer.id, {
    total_referred_customers: (referrer.total_referred_customers || 0) + 1
  });
  
  return { 
    success: true, 
    referrer: {
      name: referrer.full_name,
      code: referrer.referral_code
    }
  };
}

/**
 * CTV chủ động đăng ký KH mới (Manual Registration)
 * @param {string} referrerId - ID của CTV
 * @param {string} customerPhone - SĐT KH (bắt buộc)
 * @param {string} customerName - Tên KH
 * @param {string} customerEmail - Email KH (tùy chọn)
 */
export async function registerCustomerForReferrer(referrerId, customerPhone, customerName, customerEmail = null) {
  // Validate phone
  const cleanPhone = customerPhone.replace(/\s/g, '');
  if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
    return { success: false, error: 'Số điện thoại không hợp lệ' };
  }

  // Kiểm tra CTV có active không
  const referrers = await base44.entities.ReferralMember.filter({ id: referrerId });
  if (referrers.length === 0 || referrers[0].status !== 'active') {
    return { success: false, error: 'Tài khoản CTV không hợp lệ' };
  }
  const referrer = referrers[0];

  // Kiểm tra SĐT đã tồn tại chưa
  const existingByPhone = await base44.entities.Customer.filter({ phone: cleanPhone });
  
  if (existingByPhone.length > 0) {
    const existing = existingByPhone[0];
    
    // Đã có CTV khác
    if (existing.referrer_id && existing.referrer_id !== referrerId) {
      const ownerMembers = await base44.entities.ReferralMember.filter({ id: existing.referrer_id });
      const ownerName = ownerMembers.length > 0 ? ownerMembers[0].full_name : 'CTV khác';
      return { 
        success: false, 
        error: `Khách hàng này đã thuộc về ${ownerName}` 
      };
    }
    
    // Đã locked
    if (existing.referral_locked) {
      return { 
        success: false, 
        error: 'Khách hàng đã được gán cố định cho CTV khác' 
      };
    }
    
    // Chưa có CTV → gán cho referrer này
    await base44.entities.Customer.update(existing.id, {
      referrer_id: referrerId,
      referral_code_used: referrer.referral_code,
      referred_date: new Date().toISOString(),
      is_referred_customer: true,
      customer_source: 'manual_registration',
      full_name: customerName || existing.full_name,
      email: customerEmail || existing.email
    });
    
    // Tăng counter
    await base44.entities.ReferralMember.update(referrerId, {
      total_referred_customers: (referrer.total_referred_customers || 0) + 1
    });
    
    return { 
      success: true, 
      customer: existing,
      isNew: false
    };
  }

  // Tạo KH mới
  const newCustomer = await base44.entities.Customer.create({
    full_name: customerName,
    email: customerEmail,
    phone: cleanPhone,
    referrer_id: referrerId,
    referral_code_used: referrer.referral_code,
    referred_date: new Date().toISOString(),
    is_referred_customer: true,
    customer_source: 'manual_registration',
    status: 'active',
    referral_locked: false
  });

  // Tăng counter
  await base44.entities.ReferralMember.update(referrerId, {
    total_referred_customers: (referrer.total_referred_customers || 0) + 1
  });

  // Audit log
  await referralCore.createAuditLog({
    action_type: 'customer_registered',
    target_type: 'customer',
    target_id: newCustomer.id,
    target_email: customerEmail,
    description: `CTV ${referrer.full_name} đăng ký KH mới: ${customerName} (${cleanPhone})`
  });

  return { 
    success: true, 
    customer: newCustomer,
    isNew: true
  };
}

/**
 * Admin reassign KH sang CTV khác
 */
export async function reassignCustomer(customerId, newReferrerId, adminEmail, reason) {
  const customers = await base44.entities.Customer.filter({ id: customerId });
  if (customers.length === 0) {
    return { success: false, error: 'Không tìm thấy khách hàng' };
  }
  
  const customer = customers[0];
  const oldReferrerId = customer.referrer_id;

  // Validate new referrer
  const newReferrers = await base44.entities.ReferralMember.filter({ id: newReferrerId });
  if (newReferrers.length === 0) {
    return { success: false, error: 'CTV mới không hợp lệ' };
  }

  const newReferrer = newReferrers[0];

  // Update customer
  await base44.entities.Customer.update(customerId, {
    referrer_id: newReferrerId,
    referral_code_used: newReferrer.referral_code,
    referral_locked: true // Lock luôn khi admin can thiệp
  });

  // Update counters
  if (oldReferrerId) {
    const oldReferrers = await base44.entities.ReferralMember.filter({ id: oldReferrerId });
    if (oldReferrers.length > 0) {
      await base44.entities.ReferralMember.update(oldReferrerId, {
        total_referred_customers: Math.max(0, (oldReferrers[0].total_referred_customers || 0) - 1)
      });
    }
  }

  await base44.entities.ReferralMember.update(newReferrerId, {
    total_referred_customers: (newReferrer.total_referred_customers || 0) + 1
  });

  // Audit log
  await referralCore.createAuditLog({
    action_type: 'customer_reassigned',
    actor_email: adminEmail,
    actor_role: 'admin',
    target_type: 'customer',
    target_id: customerId,
    old_value: { referrer_id: oldReferrerId },
    new_value: { referrer_id: newReferrerId },
    description: `Admin chuyển KH ${customer.full_name} sang CTV ${newReferrer.full_name}. Lý do: ${reason}`
  });

  return { success: true };
}

/**
 * Lock customer ownership sau đơn đầu tiên
 */
export async function lockCustomerAfterFirstOrder(customerId) {
  const customers = await base44.entities.Customer.filter({ id: customerId });
  if (customers.length === 0) return;

  const customer = customers[0];
  
  // Chỉ lock nếu có referrer và chưa lock
  if (customer.referrer_id && !customer.referral_locked) {
    await base44.entities.Customer.update(customerId, {
      referral_locked: true
    });
    console.log('🔒 Customer locked to referrer:', customerId);
  }
}

// ========== STATS ==========

export async function getReferralStats() {
  const [members, events, settings] = await Promise.all([
    base44.entities.ReferralMember.list('-created_date', 500),
    base44.entities.ReferralEvent.list('-created_date', 1000),
    getReferralSettings()
  ]);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentMonthEvents = events.filter(e => e.period_month === currentMonth);
  
  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.status === 'active').length;
  const pendingMembers = members.filter(m => m.status === 'pending_approval').length;
  const suspectedFraud = members.filter(m => m.status === 'fraud_suspect' || m.fraud_score >= (settings.fraud_threshold_score || 50)).length;
  
  const totalRevenue = events.filter(e => e.status !== 'fraudulent').reduce((sum, e) => sum + (e.order_amount || 0), 0);
  const currentMonthRevenue = currentMonthEvents.filter(e => e.status !== 'fraudulent').reduce((sum, e) => sum + (e.order_amount || 0), 0);
  
  const totalCommission = events.filter(e => e.status !== 'fraudulent').reduce((sum, e) => sum + (e.commission_amount || 0), 0);
  const unpaidCommission = members.reduce((sum, m) => sum + (m.unpaid_commission || 0), 0);
  const paidCommission = members.reduce((sum, m) => sum + (m.total_paid_commission || 0), 0);
  
  const topReferrers = [...members]
    .filter(m => m.status === 'active')
    .sort((a, b) => (b.total_referral_revenue || 0) - (a.total_referral_revenue || 0))
    .slice(0, 10);
  
  return {
    totalMembers,
    activeMembers,
    pendingMembers,
    suspectedFraud,
    totalRevenue,
    currentMonthRevenue,
    totalCommission,
    unpaidCommission,
    paidCommission,
    topReferrers,
    currentMonth
  };
}

/**
 * Set custom commission rate (Admin)
 */
export async function setCustomCommissionRate(memberId, rate, adminEmail, note) {
  if (rate < 0 || rate > 100) {
    return { success: false, error: 'Tỉ lệ hoa hồng phải từ 0-100%' };
  }

  const members = await base44.entities.ReferralMember.filter({ id: memberId });
  if (members.length === 0) {
    return { success: false, error: 'Không tìm thấy CTV' };
  }

  await base44.entities.ReferralMember.update(memberId, {
    custom_commission_rate: rate,
    custom_rate_enabled: true,
    custom_rate_note: note || `Set bởi ${adminEmail}`,
    custom_rate_set_by: adminEmail,
    custom_rate_set_date: new Date().toISOString()
  });

  await referralCore.createAuditLog({
    action_type: 'custom_rate_set',
    actor_email: adminEmail,
    actor_role: 'admin',
    target_type: 'referral_member',
    target_id: memberId,
    new_value: { rate, note },
    description: `Admin set custom rate ${rate}% cho ${members[0].full_name}`
  });

  return { success: true };
}

export async function disableCustomRate(memberId, adminEmail) {
  await base44.entities.ReferralMember.update(memberId, {
    custom_rate_enabled: false
  });

  await referralCore.createAuditLog({
    action_type: 'custom_rate_disabled',
    actor_email: adminEmail,
    actor_role: 'admin',
    target_type: 'referral_member',
    target_id: memberId,
    description: `Admin tắt custom rate`
  });

  return { success: true };
}

export default {
  getReferralSettings,
  updateReferralSettings,
  validateReferralCode,
  checkEligibility,
  registerReferralMember,
  approveMember,
  suspendMember,
  reactivateMember,
  processOrderReferral,
  markFraudulent,
  processPayoutBatch,
  updateMemberRank,
  applyReferralToCustomer,
  getReferralStats,
  getCommissionRate,
  registerCustomerForReferrer,
  reassignCustomer,
  lockCustomerAfterFirstOrder,
  setCustomCommissionRate,
  disableCustomRate
};
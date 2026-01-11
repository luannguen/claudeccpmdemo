/**
 * Referral Validators
 * Domain Layer - Pure validation logic
 * 
 * @module features/referral/domain/validators
 */

import { REFERRAL_STATUS } from '../types';

/**
 * Validate email format
 * @param {string} email
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEmail(email) {
  if (!email) {
    return { valid: false, error: 'Email không được trống' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Email không hợp lệ' };
  }
  
  return { valid: true };
}

/**
 * Validate phone number (Vietnam)
 * @param {string} phone
 * @returns {{ valid: boolean, cleanPhone?: string, error?: string }}
 */
export function validatePhone(phone) {
  if (!phone) {
    return { valid: false, error: 'Số điện thoại không được trống' };
  }
  
  const cleanPhone = phone.replace(/[\s.-]/g, '');
  
  if (!/^(0|\+84)[0-9]{9,10}$/.test(cleanPhone)) {
    return { valid: false, error: 'Số điện thoại không hợp lệ' };
  }
  
  // Normalize to 0xxx format
  const normalized = cleanPhone.startsWith('+84') 
    ? '0' + cleanPhone.slice(3) 
    : cleanPhone;
  
  return { valid: true, cleanPhone: normalized };
}

/**
 * Validate member for commission eligibility
 * @param {Object} member
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateMemberForCommission(member) {
  if (!member) {
    return { valid: false, error: 'Không tìm thấy thành viên' };
  }
  
  if (member.status !== REFERRAL_STATUS.ACTIVE) {
    return { valid: false, error: 'Tài khoản giới thiệu không hoạt động' };
  }
  
  return { valid: true };
}

/**
 * Validate self-referral prevention
 * @param {string} referrerEmail
 * @param {string} customerEmail
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateNotSelfReferral(referrerEmail, customerEmail) {
  if (!referrerEmail || !customerEmail) {
    return { valid: true }; // Skip if either missing
  }
  
  if (referrerEmail.toLowerCase() === customerEmail.toLowerCase()) {
    return { valid: false, error: 'Không thể sử dụng mã giới thiệu của chính mình' };
  }
  
  return { valid: true };
}

/**
 * Validate customer can be assigned referrer
 * @param {Object} customer - Customer record
 * @param {string} newReferrerId
 * @returns {{ valid: boolean, canOverride: boolean, error?: string }}
 */
export function validateCustomerReferralAssignment(customer, newReferrerId) {
  if (!customer) {
    return { valid: true, canOverride: false }; // New customer
  }
  
  // Already locked
  if (customer.referral_locked) {
    return { 
      valid: false, 
      canOverride: false, 
      error: 'Khách hàng đã được gán cố định cho CTV khác' 
    };
  }
  
  // Has different referrer (not locked)
  if (customer.referrer_id && customer.referrer_id !== newReferrerId) {
    return { 
      valid: false, 
      canOverride: true, 
      error: 'Khách hàng đã được gán cho CTV khác (có thể ghi đè)' 
    };
  }
  
  return { valid: true, canOverride: false };
}

/**
 * Validate payout eligibility
 * @param {Object} member
 * @param {number} minPayoutAmount
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePayoutEligibility(member, minPayoutAmount = 100000) {
  if (!member) {
    return { valid: false, error: 'Không tìm thấy thành viên' };
  }
  
  if (member.status !== REFERRAL_STATUS.ACTIVE) {
    return { valid: false, error: 'Tài khoản không hoạt động, không thể thanh toán' };
  }
  
  const unpaid = member.unpaid_commission || 0;
  if (unpaid < minPayoutAmount) {
    return { 
      valid: false, 
      error: `Chưa đạt mức thanh toán tối thiểu (${minPayoutAmount.toLocaleString('vi-VN')}đ)` 
    };
  }
  
  return { valid: true };
}

/**
 * Validate referral validity period
 * @param {Date|string} referredDate
 * @param {number} validityDays
 * @returns {{ valid: boolean, daysRemaining?: number }}
 */
export function validateReferralValidity(referredDate, validityDays) {
  if (!validityDays || validityDays <= 0) {
    return { valid: true }; // No expiry
  }
  
  if (!referredDate) {
    return { valid: true }; // New referral
  }
  
  const refDate = new Date(referredDate);
  const now = new Date();
  const daysSinceReferred = Math.floor((now - refDate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceReferred > validityDays) {
    return { valid: false, daysRemaining: 0 };
  }
  
  return { valid: true, daysRemaining: validityDays - daysSinceReferred };
}

export default {
  validateEmail,
  validatePhone,
  validateMemberForCommission,
  validateNotSelfReferral,
  validateCustomerReferralAssignment,
  validatePayoutEligibility,
  validateReferralValidity
};
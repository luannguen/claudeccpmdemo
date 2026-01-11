/**
 * Customer Validation Service
 * Service Layer - Validation & security checks
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

export const customerValidationService = {
  /**
   * Validate phone format
   */
  validatePhone: (phone) => {
    const cleaned = phone.replace(/\s/g, '');
    
    if (!cleaned) {
      return failure('Vui lòng nhập số điện thoại', ErrorCodes.VALIDATION_ERROR);
    }
    
    if (!/^(0|\+84)[0-9]{9,10}$/.test(cleaned)) {
      return failure('Số điện thoại không hợp lệ (10-11 số)', ErrorCodes.VALIDATION_ERROR);
    }
    
    // Check for suspicious patterns
    if (/^(\d)\1{9,}$/.test(cleaned)) { // All same digit
      return failure('Số điện thoại không hợp lệ', ErrorCodes.VALIDATION_ERROR);
    }
    
    return success(cleaned);
  },
  
  /**
   * Validate email format
   */
  validateEmail: (email) => {
    if (!email) return success(null); // Email is optional
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return failure('Email không hợp lệ', ErrorCodes.VALIDATION_ERROR);
    }
    
    return success(email.toLowerCase().trim());
  },
  
  /**
   * Validate name
   */
  validateName: (name) => {
    const trimmed = name?.trim();
    
    if (!trimmed) {
      return failure('Vui lòng nhập họ tên', ErrorCodes.VALIDATION_ERROR);
    }
    
    if (trimmed.length < 3) {
      return failure('Họ tên quá ngắn (tối thiểu 3 ký tự)', ErrorCodes.VALIDATION_ERROR);
    }
    
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(trimmed)) {
      return failure('Họ tên chỉ chứa chữ cái', ErrorCodes.VALIDATION_ERROR);
    }
    
    return success(trimmed);
  },
  
  /**
   * Validate address fields
   */
  validateAddress: (province, district, ward, detail) => {
    const errors = {};
    
    if (!province?.trim()) errors.province = 'Vui lòng chọn tỉnh/thành phố';
    if (!district?.trim()) errors.district = 'Vui lòng chọn quận/huyện';
    if (!ward?.trim()) errors.ward = 'Vui lòng chọn phường/xã';
    if (!detail?.trim()) errors.detail = 'Vui lòng nhập địa chỉ cụ thể';
    else if (detail.trim().length < 10) errors.detail = 'Địa chỉ quá ngắn (tối thiểu 10 ký tự)';
    
    if (Object.keys(errors).length > 0) {
      return failure('Vui lòng điền đầy đủ thông tin địa chỉ', ErrorCodes.VALIDATION_ERROR, errors);
    }
    
    return success({ province, district, ward, detail });
  },
  
  /**
   * Check if phone exists (duplicate check)
   */
  checkPhoneDuplicate: async (phone) => {
    try {
      const customers = await base44.entities.Customer.filter({ phone });
      
      if (customers.length > 0) {
        return failure(
          `Số điện thoại đã tồn tại (KH: ${customers[0].full_name})`,
          ErrorCodes.DUPLICATE_ENTRY,
          { existingCustomer: customers[0] }
        );
      }
      
      return success(true);
    } catch (error) {
      return failure('Không thể kiểm tra số điện thoại', ErrorCodes.NETWORK_ERROR);
    }
  },
  
  /**
   * Check if email exists (duplicate check)
   */
  checkEmailDuplicate: async (email) => {
    if (!email) return success(true); // Email optional
    
    try {
      const customers = await base44.entities.Customer.filter({ email });
      
      if (customers.length > 0) {
        return failure(
          `Email đã tồn tại (KH: ${customers[0].full_name})`,
          ErrorCodes.DUPLICATE_ENTRY,
          { existingCustomer: customers[0] }
        );
      }
      
      return success(true);
    } catch (error) {
      return failure('Không thể kiểm tra email', ErrorCodes.NETWORK_ERROR);
    }
  },
  
  /**
   * Format phone number for display
   */
  formatPhoneDisplay: (phone) => {
    const cleaned = phone.replace(/\s/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
    return phone;
  },
  
  /**
   * Detect potential fraud patterns
   */
  detectFraudPatterns: async (customerData) => {
    const flags = [];
    
    // Check suspicious name patterns
    if (/test|fake|demo|abc|xyz|123/i.test(customerData.name)) {
      flags.push('suspicious_name');
    }
    
    // Check if same address used too many times
    if (customerData.shipping_address) {
      const sameAddress = await base44.entities.Customer.filter({
        shipping_address: customerData.shipping_address
      });
      
      if (sameAddress.length >= 3) {
        flags.push('address_reuse');
      }
    }
    
    return { flags, score: flags.length * 10 };
  }
};
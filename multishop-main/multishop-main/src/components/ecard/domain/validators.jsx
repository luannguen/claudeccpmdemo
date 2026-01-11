/**
 * E-Card Domain - Validators
 * Business validation rules
 */

import { CARE_LEVELS } from '../types';

/**
 * Validate profile data
 */
export const validateProfile = (data) => {
  const errors = {};

  if (!data.display_name || data.display_name.trim().length < 2) {
    errors.display_name = 'Tên hiển thị phải có ít nhất 2 ký tự';
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Email không hợp lệ';
  }

  if (data.phone && !/^[0-9]{10,11}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Số điện thoại không hợp lệ';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate care level
 */
export const isValidCareLevel = (level) => {
  return Object.values(CARE_LEVELS).includes(level);
};

/**
 * Validate gift value
 */
export const validateGiftValue = (value) => {
  if (typeof value !== 'number' || value <= 0) {
    return { isValid: false, error: 'Giá trị quà phải lớn hơn 0' };
  }

  if (value > 50000000) {
    return { isValid: false, error: 'Giá trị quà không được vượt quá 50 triệu' };
  }

  return { isValid: true };
};
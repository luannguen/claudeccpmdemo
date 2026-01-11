/**
 * Referral Code Generator
 * Domain Layer - Pure business logic
 * 
 * @module features/referral/domain/codeGenerator
 */

/**
 * Generate referral code from name
 * @param {string} name - Full name
 * @returns {string} Generated code (e.g., "NPK5X2A")
 */
export function generateCode(name) {
  if (!name || typeof name !== 'string') {
    return `REF${generateRandom(4)}`;
  }
  
  const prefix = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3) || 'REF';
  
  const random = generateRandom(4);
  return `${prefix}${random}`;
}

/**
 * Generate random alphanumeric string
 * @param {number} length
 * @returns {string}
 */
function generateRandom(length) {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
    .toUpperCase();
}

/**
 * Validate referral code format
 * @param {string} code
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateCodeFormat(code) {
  if (!code) {
    return { valid: false, error: 'Mã giới thiệu không được trống' };
  }
  
  if (code.length < 4) {
    return { valid: false, error: 'Mã giới thiệu quá ngắn (tối thiểu 4 ký tự)' };
  }
  
  if (code.length > 12) {
    return { valid: false, error: 'Mã giới thiệu quá dài (tối đa 12 ký tự)' };
  }
  
  if (!/^[A-Z0-9]+$/i.test(code)) {
    return { valid: false, error: 'Mã giới thiệu chỉ được chứa chữ và số' };
  }
  
  return { valid: true };
}

/**
 * Normalize code to uppercase
 * @param {string} code
 * @returns {string}
 */
export function normalizeCode(code) {
  return (code || '').trim().toUpperCase();
}

export default {
  generateCode,
  validateCodeFormat,
  normalizeCode
};
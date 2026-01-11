/**
 * PII (Personally Identifiable Information) Detector
 * 
 * ENHANCEMENT #8: Tự động phát hiện và che thông tin nhạy cảm
 * Bảo mật dữ liệu người dùng
 * 
 * Architecture: Service Layer (AI-CODING-RULES compliant)
 */

import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== CONFIG ==========

const PII_CONFIG = {
  maskChar: '*',
  minMaskLength: 3,
  patterns: {
    // Vietnam phone: 10-11 digits starting with 0 or +84
    phone: /(?:\+84|0)(?:\d{9,10})/g,
    
    // Email
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    
    // Vietnam ID: 9 or 12 digits
    nationalId: /\b\d{9}\b|\b\d{12}\b/g,
    
    // Credit card: 16 digits with optional spaces/dashes
    creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    
    // Bank account: 8-20 digits
    bankAccount: /\b\d{8,20}\b/g,
    
    // Address patterns (Vietnamese)
    address: /(?:số|đường|phố|ngõ|hẻm|quận|phường|xã|huyện|tỉnh|thành phố)[^\n,]{5,50}/gi,
    
    // Date of birth: DD/MM/YYYY or DD-MM-YYYY
    dob: /\b(?:0[1-9]|[12]\d|3[01])[\/\-](?:0[1-9]|1[0-2])[\/\-](?:19|20)\d{2}\b/g,
    
    // Passport
    passport: /\b[A-Z]\d{7}\b/g,
    
    // Tax code
    taxCode: /\b\d{10}(?:-\d{3})?\b/g
  }
};

// ========== DETECTION FUNCTIONS ==========

/**
 * Detect all PII in text
 * @returns {{ type: string, value: string, index: number, length: number }[]}
 */
export function detectPII(text) {
  if (!text || typeof text !== 'string') return [];
  
  const found = [];
  
  for (const [type, pattern] of Object.entries(PII_CONFIG.patterns)) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      found.push({
        type,
        value: match[0],
        index: match.index,
        length: match[0].length
      });
    }
  }
  
  // Sort by index
  found.sort((a, b) => a.index - b.index);
  
  return found;
}

/**
 * Check if text contains any PII
 */
export function containsPII(text) {
  return detectPII(text).length > 0;
}

/**
 * Get PII types found in text
 */
export function getPIITypes(text) {
  const found = detectPII(text);
  return [...new Set(found.map(p => p.type))];
}

// ========== MASKING FUNCTIONS ==========

/**
 * Mask a value partially (show first and last chars)
 */
function partialMask(value, showFirst = 2, showLast = 2) {
  if (value.length <= showFirst + showLast) {
    return PII_CONFIG.maskChar.repeat(Math.max(value.length, PII_CONFIG.minMaskLength));
  }
  
  const first = value.substring(0, showFirst);
  const last = value.substring(value.length - showLast);
  const middle = PII_CONFIG.maskChar.repeat(Math.max(value.length - showFirst - showLast, PII_CONFIG.minMaskLength));
  
  return first + middle + last;
}

/**
 * Full mask
 */
function fullMask(value) {
  return PII_CONFIG.maskChar.repeat(Math.max(value.length, PII_CONFIG.minMaskLength));
}

/**
 * Mask PII based on type
 */
function maskByType(type, value) {
  switch (type) {
    case 'phone':
      // Show first 3 and last 2: 098***4321
      return partialMask(value.replace(/\D/g, ''), 3, 2);
      
    case 'email':
      // Mask local part, show domain: u***@gmail.com
      const [local, domain] = value.split('@');
      return partialMask(local, 1, 0) + '@' + domain;
      
    case 'nationalId':
    case 'creditCard':
    case 'bankAccount':
    case 'taxCode':
      // Show last 4 only
      return PII_CONFIG.maskChar.repeat(value.length - 4) + value.slice(-4);
      
    case 'passport':
      // Show first letter only
      return value[0] + PII_CONFIG.maskChar.repeat(value.length - 1);
      
    case 'dob':
      // Show year only
      const parts = value.split(/[\/\-]/);
      return `**/**/${parts[2]}`;
      
    case 'address':
      // Mask most of it
      return partialMask(value, 5, 0);
      
    default:
      return fullMask(value);
  }
}

/**
 * Mask all PII in text
 * @param {string} text - Input text
 * @param {Object} options - Masking options
 * @returns {{ masked: string, piiFound: Object[] }}
 */
export function maskPII(text, options = {}) {
  const {
    types = null, // null = all types
    partialMask: usePartial = true
  } = options;
  
  if (!text || typeof text !== 'string') {
    return { masked: text, piiFound: [] };
  }
  
  const piiFound = detectPII(text);
  
  if (piiFound.length === 0) {
    return { masked: text, piiFound: [] };
  }
  
  // Filter by types if specified
  const toMask = types 
    ? piiFound.filter(p => types.includes(p.type))
    : piiFound;
  
  // Mask from end to preserve indices
  let masked = text;
  for (const pii of [...toMask].reverse()) {
    const replacement = usePartial 
      ? maskByType(pii.type, pii.value)
      : fullMask(pii.value);
    
    masked = masked.substring(0, pii.index) + replacement + masked.substring(pii.index + pii.length);
  }
  
  return { masked, piiFound: toMask };
}

/**
 * Sanitize message before storing/logging
 */
export function sanitizeMessage(message) {
  if (typeof message === 'string') {
    return maskPII(message).masked;
  }
  
  if (typeof message === 'object' && message !== null) {
    const sanitized = { ...message };
    
    if (typeof sanitized.content === 'string') {
      sanitized.content = maskPII(sanitized.content).masked;
    }
    
    // Sanitize common fields
    const sensitiveFields = ['customer_phone', 'customer_email', 'phone', 'email', 'address'];
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = maskPII(String(sanitized[field])).masked;
      }
    }
    
    return sanitized;
  }
  
  return message;
}

/**
 * Check if message is safe to log
 */
export function isSafeToLog(text) {
  const pii = detectPII(text);
  // Consider safe if only contains email (common in usernames)
  const sensitiveTypes = pii.filter(p => p.type !== 'email');
  return sensitiveTypes.length === 0;
}

/**
 * Generate PII report for message
 */
export function generatePIIReport(text) {
  const pii = detectPII(text);
  
  if (pii.length === 0) {
    return { hasPII: false, types: [], count: 0, risk: 'none' };
  }
  
  const types = [...new Set(pii.map(p => p.type))];
  
  // Calculate risk level
  const highRiskTypes = ['creditCard', 'nationalId', 'bankAccount', 'passport'];
  const mediumRiskTypes = ['phone', 'dob', 'address'];
  
  let risk = 'low';
  if (pii.some(p => highRiskTypes.includes(p.type))) {
    risk = 'high';
  } else if (pii.some(p => mediumRiskTypes.includes(p.type))) {
    risk = 'medium';
  }
  
  return {
    hasPII: true,
    types,
    count: pii.length,
    risk,
    details: pii.map(p => ({ type: p.type, masked: maskByType(p.type, p.value) }))
  };
}

export default {
  detectPII,
  containsPII,
  getPIITypes,
  maskPII,
  sanitizeMessage,
  isSafeToLog,
  generatePIIReport,
  PII_CONFIG
};
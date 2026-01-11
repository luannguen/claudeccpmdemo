/**
 * Formatters - Common data formatting utilities
 */

/**
 * Format currency in VND
 * @param {number} amount
 * @param {boolean} [showSymbol=true]
 * @returns {string}
 */
export function formatCurrency(amount, showSymbol = true) {
  if (amount == null || isNaN(amount)) return showSymbol ? '0đ' : '0';
  
  const formatted = Math.round(amount).toLocaleString('vi-VN');
  return showSymbol ? `${formatted}đ` : formatted;
}

/**
 * Format currency in short form (K, M, B)
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrencyShort(amount) {
  if (amount == null || isNaN(amount)) return '0đ';
  
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}Bđ`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}Mđ`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}Kđ`;
  }
  return `${amount}đ`;
}

/**
 * Format date in Vietnamese locale
 * @param {string|Date} date
 * @param {'short'|'medium'|'long'|'full'} [format='medium']
 * @returns {string}
 */
export function formatDate(date, format = 'medium') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const options = {
    short: { day: '2-digit', month: '2-digit' },
    medium: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
  };

  return d.toLocaleDateString('vi-VN', options[format]);
}

/**
 * Format date and time
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateTime(date) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  
  return formatDate(d, 'medium');
}

/**
 * Format phone number
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return '';
  
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Format Vietnamese phone
  if (digits.length === 10 && digits.startsWith('0')) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 11 && digits.startsWith('84')) {
    return `+84 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }
  
  return phone;
}

/**
 * Format number with separators
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num == null || isNaN(num)) return '0';
  return num.toLocaleString('vi-VN');
}

/**
 * Format percentage
 * @param {number} value
 * @param {number} [decimals=0]
 * @returns {string}
 */
export function formatPercent(value, decimals = 0) {
  if (value == null || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Generate slug from text
 * @param {string} text
 * @returns {string}
 */
export function generateSlug(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default {
  formatCurrency,
  formatCurrencyShort,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatPhone,
  formatNumber,
  formatPercent,
  truncateText,
  generateSlug
};
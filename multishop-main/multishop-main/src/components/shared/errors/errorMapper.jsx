/**
 * Error Mapper - Enhanced
 * Maps error codes to user-friendly messages with severity and display config
 */

import { ErrorCodes } from '@/components/data/types';

// ========== SEVERITY LEVELS ==========
export const ErrorSeverity = {
  INFO: 'info',         // Informational, can be ignored
  WARNING: 'warning',   // Should be addressed but not critical
  ERROR: 'error',       // Must be addressed
  CRITICAL: 'critical'  // Immediate attention required
};

// ========== DISPLAY TYPES ==========
export const ErrorDisplayType = {
  TOAST: 'toast',      // Show in toast notification
  INLINE: 'inline',    // Show inline in form
  MODAL: 'modal',      // Show in modal dialog
  PAGE: 'page',        // Show as error page
  BANNER: 'banner'     // Show as banner at top
};

// ========== ERROR CONFIGURATIONS ==========
/**
 * Complete error configuration with messages, severity, and display type
 */
const errorConfig = {
  // === GENERIC ERRORS ===
  generic: {
    [ErrorCodes.VALIDATION_ERROR]: {
      message: 'Dữ liệu không hợp lệ',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    },
    [ErrorCodes.REQUIRED_FIELD]: {
      message: 'Vui lòng điền đầy đủ thông tin',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    },
    [ErrorCodes.INVALID_FORMAT]: {
      message: 'Định dạng không hợp lệ',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    },
    [ErrorCodes.UNAUTHORIZED]: {
      message: 'Vui lòng đăng nhập để tiếp tục',
      severity: ErrorSeverity.ERROR,
      displayType: ErrorDisplayType.MODAL
    },
    [ErrorCodes.FORBIDDEN]: {
      message: 'Bạn không có quyền thực hiện thao tác này',
      severity: ErrorSeverity.ERROR,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.SESSION_EXPIRED]: {
      message: 'Phiên đăng nhập đã hết hạn',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.MODAL
    },
    [ErrorCodes.NOT_FOUND]: {
      message: 'Không tìm thấy dữ liệu',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.ALREADY_EXISTS]: {
      message: 'Dữ liệu đã tồn tại',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    },
    [ErrorCodes.CONFLICT]: {
      message: 'Dữ liệu bị xung đột',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.NETWORK_ERROR]: {
      message: 'Lỗi kết nối mạng',
      severity: ErrorSeverity.ERROR,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.SERVER_ERROR]: {
      message: 'Lỗi hệ thống, vui lòng thử lại sau',
      severity: ErrorSeverity.CRITICAL,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.TIMEOUT]: {
      message: 'Yêu cầu hết thời gian',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.UNKNOWN]: {
      message: 'Đã xảy ra lỗi không xác định',
      severity: ErrorSeverity.ERROR,
      displayType: ErrorDisplayType.TOAST
    }
  },

  // === PRODUCT ERRORS ===
  product: {
    [ErrorCodes.NOT_FOUND]: {
      message: 'Sản phẩm không tồn tại',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.VALIDATION_ERROR]: {
      message: 'Thông tin sản phẩm không hợp lệ',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    },
    [ErrorCodes.INSUFFICIENT_STOCK]: {
      message: 'Sản phẩm không đủ số lượng trong kho',
      severity: ErrorSeverity.ERROR,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.ALREADY_EXISTS]: {
      message: 'Sản phẩm với SKU này đã tồn tại',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    }
  },

  // === ORDER ERRORS ===
  order: {
    [ErrorCodes.NOT_FOUND]: {
      message: 'Đơn hàng không tồn tại',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.VALIDATION_ERROR]: {
      message: 'Thông tin đơn hàng không hợp lệ',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    },
    [ErrorCodes.ORDER_CANCELLED]: {
      message: 'Đơn hàng đã bị hủy',
      severity: ErrorSeverity.INFO,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.PAYMENT_FAILED]: {
      message: 'Thanh toán thất bại',
      severity: ErrorSeverity.ERROR,
      displayType: ErrorDisplayType.MODAL
    },
    [ErrorCodes.FORBIDDEN]: {
      message: 'Không thể thực hiện thao tác với đơn hàng này',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.TOAST
    }
  },

  // === CUSTOMER/USER ERRORS ===
  customer: {
    [ErrorCodes.NOT_FOUND]: {
      message: 'Khách hàng không tồn tại',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.ALREADY_EXISTS]: {
      message: 'Email hoặc số điện thoại đã được sử dụng',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    },
    [ErrorCodes.VALIDATION_ERROR]: {
      message: 'Thông tin khách hàng không hợp lệ',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    }
  },

  // === USER/AUTH ERRORS ===
  user: {
    [ErrorCodes.UNAUTHORIZED]: {
      message: 'Email hoặc mật khẩu không đúng',
      severity: ErrorSeverity.ERROR,
      displayType: ErrorDisplayType.INLINE
    },
    [ErrorCodes.FORBIDDEN]: {
      message: 'Tài khoản đã bị khóa',
      severity: ErrorSeverity.CRITICAL,
      displayType: ErrorDisplayType.MODAL
    },
    [ErrorCodes.SESSION_EXPIRED]: {
      message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.MODAL
    },
    [ErrorCodes.NOT_FOUND]: {
      message: 'Tài khoản không tồn tại',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    }
  },

  // === REFERRAL ERRORS ===
  referral: {
    [ErrorCodes.NOT_FOUND]: {
      message: 'Mã giới thiệu không tồn tại',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    },
    [ErrorCodes.REFERRAL_INELIGIBLE]: {
      message: 'Bạn chưa đủ điều kiện tham gia',
      severity: ErrorSeverity.INFO,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.ALREADY_EXISTS]: {
      message: 'Bạn đã đăng ký chương trình giới thiệu',
      severity: ErrorSeverity.INFO,
      displayType: ErrorDisplayType.TOAST
    },
    [ErrorCodes.VALIDATION_ERROR]: {
      message: 'Mã giới thiệu không hợp lệ',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.INLINE
    }
  },

  // === AUTH (alias for user) ===
  auth: {
    [ErrorCodes.UNAUTHORIZED]: {
      message: 'Email hoặc mật khẩu không đúng',
      severity: ErrorSeverity.ERROR,
      displayType: ErrorDisplayType.INLINE
    },
    [ErrorCodes.FORBIDDEN]: {
      message: 'Tài khoản đã bị khóa',
      severity: ErrorSeverity.CRITICAL,
      displayType: ErrorDisplayType.MODAL
    },
    [ErrorCodes.SESSION_EXPIRED]: {
      message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại',
      severity: ErrorSeverity.WARNING,
      displayType: ErrorDisplayType.MODAL
    }
  }
};

// ========== MAIN MAPPING FUNCTION ==========

/**
 * Map error code to full error display config
 * @param {string} code - ErrorCode
 * @param {Object} options
 * @param {string} [options.domain] - Domain for domain-specific messages (product, order, user, customer, referral)
 * @param {string} [options.details] - Additional details to append
 * @param {string} [options.fallback] - Fallback message if not found
 * @returns {{ userMessage: string, severity: string, displayType: string }}
 */
export function mapError(code, options = {}) {
  const { domain, details, fallback } = options;

  // Get config from domain or generic
  let config = domain && errorConfig[domain]?.[code];
  if (!config) {
    config = errorConfig.generic[code];
  }
  if (!config) {
    config = errorConfig.generic[ErrorCodes.UNKNOWN];
  }

  // Build user message
  let userMessage = config.message;
  if (details) {
    userMessage = `${userMessage}: ${details}`;
  }
  if (!userMessage && fallback) {
    userMessage = fallback;
  }

  return {
    userMessage,
    severity: config.severity || ErrorSeverity.ERROR,
    displayType: config.displayType || ErrorDisplayType.TOAST
  };
}

// ========== DOMAIN ERROR HANDLERS ==========

/**
 * Create error handler for a specific domain
 * @param {string} domain
 * @returns {Function}
 */
export function createErrorHandler(domain) {
  return (code, details) => mapError(code, { domain, details });
}

// Pre-built domain handlers
export const productErrorHandler = createErrorHandler('product');
export const orderErrorHandler = createErrorHandler('order');
export const userErrorHandler = createErrorHandler('user');
export const customerErrorHandler = createErrorHandler('customer');
export const referralErrorHandler = createErrorHandler('referral');

// ========== RESULT HANDLER ==========

/**
 * Handle error result and show appropriate message
 * @param {Object} result - Result from repository
 * @param {Object} options
 * @param {string} [options.domain]
 * @param {string} [options.details]
 * @param {Function} [options.onToast] - Toast handler
 * @param {Function} [options.onInline] - Inline error handler
 * @param {Function} [options.onModal] - Modal error handler
 * @param {Function} [options.onBanner] - Banner error handler
 * @returns {{ userMessage: string, severity: string, displayType: string } | null}
 */
export function handleErrorResult(result, options = {}) {
  if (result.success) return null;

  const errorInfo = mapError(result.code, {
    domain: options.domain,
    details: options.details,
    fallback: result.message
  });

  // Call appropriate handler based on display type
  switch (errorInfo.displayType) {
    case ErrorDisplayType.TOAST:
      if (options.onToast) options.onToast(errorInfo.userMessage, errorInfo.severity);
      break;
    case ErrorDisplayType.INLINE:
      if (options.onInline) options.onInline(errorInfo.userMessage);
      break;
    case ErrorDisplayType.MODAL:
      if (options.onModal) options.onModal(errorInfo.userMessage, errorInfo.severity);
      break;
    case ErrorDisplayType.BANNER:
      if (options.onBanner) options.onBanner(errorInfo.userMessage, errorInfo.severity);
      break;
    default:
      if (options.onToast) options.onToast(errorInfo.userMessage, errorInfo.severity);
  }

  return errorInfo;
}

// ========== SEVERITY HELPERS ==========

/**
 * Check if error is critical
 */
export function isCriticalError(code, domain) {
  const { severity } = mapError(code, { domain });
  return severity === ErrorSeverity.CRITICAL;
}

/**
 * Check if error needs immediate attention
 */
export function needsImmediateAction(code, domain) {
  const { severity } = mapError(code, { domain });
  return severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.ERROR;
}

/**
 * Get severity class for styling
 */
export function getSeverityClass(severity) {
  switch (severity) {
    case ErrorSeverity.INFO:
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case ErrorSeverity.WARNING:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case ErrorSeverity.ERROR:
      return 'bg-red-50 text-red-700 border-red-200';
    case ErrorSeverity.CRITICAL:
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export default mapError;
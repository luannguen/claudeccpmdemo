/**
 * useErrorHandler - Unified Error Handling Hook
 * 
 * Provides:
 * - Consistent error display based on ErrorDisplayType
 * - Integration with Toast, Modal, Inline errors
 * - Logging integration
 */

import { useCallback } from 'react';
import { useToast } from '@/components/NotificationToast';
import { 
  mapError, 
  ErrorDisplayType, 
  ErrorSeverity,
  handleErrorResult 
} from './errorMapper';
import { logError, logWarning, trackAction } from './ErrorLogger';

/**
 * Hook for unified error handling
 * @param {Object} options
 * @param {string} [options.domain] - Error domain (product, order, user, etc.)
 * @param {Function} [options.onInlineError] - Handler for inline errors
 * @param {Function} [options.onModalError] - Handler for modal errors
 */
export function useErrorHandler(options = {}) {
  const { domain, onInlineError, onModalError } = options;
  const { addToast } = useToast();

  /**
   * Handle error code with proper display
   */
  const handleError = useCallback((code, details) => {
    const errorInfo = mapError(code, { domain, details });
    
    // Log error
    logError(new Error(errorInfo.userMessage), { code, domain, details });

    // Display based on type
    switch (errorInfo.displayType) {
      case ErrorDisplayType.TOAST:
        const toastType = severityToToastType(errorInfo.severity);
        addToast(errorInfo.userMessage, toastType);
        break;
      
      case ErrorDisplayType.INLINE:
        if (onInlineError) {
          onInlineError(errorInfo.userMessage);
        } else {
          addToast(errorInfo.userMessage, 'warning');
        }
        break;
      
      case ErrorDisplayType.MODAL:
        if (onModalError) {
          onModalError(errorInfo.userMessage, errorInfo.severity);
        } else {
          addToast(errorInfo.userMessage, 'error', 5000);
        }
        break;
      
      case ErrorDisplayType.BANNER:
        // Banner is typically handled at page level
        addToast(errorInfo.userMessage, 'error', 0); // Persist
        break;
      
      default:
        addToast(errorInfo.userMessage, 'error');
    }

    return errorInfo;
  }, [domain, addToast, onInlineError, onModalError]);

  /**
   * Handle Result<T> from repository
   */
  const handleResult = useCallback((result) => {
    if (result.success) return null;

    return handleError(result.code, result.message);
  }, [handleError]);

  /**
   * Handle caught exception
   */
  const handleException = useCallback((error, context = {}) => {
    logError(error, { domain, ...context });
    
    const message = error?.message || 'Đã xảy ra lỗi không xác định';
    addToast(message, 'error');
    
    return { userMessage: message, severity: ErrorSeverity.ERROR };
  }, [domain, addToast]);

  /**
   * Show success message
   */
  const showSuccess = useCallback((message) => {
    trackAction('success', { message, domain });
    addToast(message, 'success');
  }, [domain, addToast]);

  /**
   * Show warning message
   */
  const showWarning = useCallback((message) => {
    logWarning(message, { domain });
    addToast(message, 'warning');
  }, [domain, addToast]);

  /**
   * Show info message
   */
  const showInfo = useCallback((message) => {
    addToast(message, 'info');
  }, [addToast]);

  return {
    handleError,
    handleResult,
    handleException,
    showSuccess,
    showWarning,
    showInfo
  };
}

/**
 * Convert severity to toast type
 */
function severityToToastType(severity) {
  switch (severity) {
    case ErrorSeverity.INFO:
      return 'info';
    case ErrorSeverity.WARNING:
      return 'warning';
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      return 'error';
    default:
      return 'error';
  }
}

export default useErrorHandler;
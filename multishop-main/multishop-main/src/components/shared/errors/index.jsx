
/**
 * Shared Errors - Central Exports
 */

export { 
  mapError, 
  createErrorHandler, 
  handleErrorResult,
  ErrorDisplayType,
  ErrorSeverity,
  // Pre-built domain handlers
  productErrorHandler,
  orderErrorHandler,
  userErrorHandler,
  customerErrorHandler,
  referralErrorHandler,
  // Severity helpers
  isCriticalError,
  needsImmediateAction,
  getSeverityClass
} from './errorMapper';

// Error Logger
export {
  logError,
  logWarning,
  logInfo,
  addBreadcrumb,
  getBreadcrumbs,
  setUserContext,
  getUserContext,
  trackAction,
  trackNavigation,
  trackApiCall
} from './ErrorLogger';

// Error Handler Hook
export { useErrorHandler } from './useErrorHandler';

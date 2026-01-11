/**
 * Error Handling Registry
 * 
 * Central registry for error handling patterns and utilities.
 */

// ========== ERROR MAPPING ==========
export const errorHandlingRegistry = {
  // Error mapper usage
  mapError: {
    path: '@/components/shared/errors/errorMapper',
    usage: 'mapError(code, { domain, details })',
    description: 'Convert error code to user-friendly message'
  },
  handleErrorResult: {
    path: '@/components/shared/errors/errorMapper',
    usage: 'handleErrorResult(result, options)',
    description: 'Handle Result failure with toast/alert'
  },
  
  // Domain-specific handlers
  productError: {
    path: '@/components/shared/errors',
    usage: 'productErrorHandler(code, details)',
    description: 'Product-specific error messages'
  },
  orderError: {
    path: '@/components/shared/errors',
    usage: 'orderErrorHandler(code, details)',
    description: 'Order-specific error messages'
  },
  userError: {
    path: '@/components/shared/errors',
    usage: 'userErrorHandler(code, details)',
    description: 'User/auth error messages'
  },
  
  // Hooks
  useErrorHandler: {
    path: '@/components/shared/errors/useErrorHandler',
    usage: 'useErrorHandler({ domain })',
    description: 'Hook for handling errors in components'
  },
  
  // Logging
  logError: {
    path: '@/components/shared/errors/ErrorLogger',
    usage: 'logError(error, context)',
    description: 'Log error to console/remote'
  },
  trackAction: {
    path: '@/components/shared/errors/ErrorLogger',
    usage: 'trackAction(action, data)',
    description: 'Track user action for debugging'
  },
  
  // UI Components
  ErrorBoundary: {
    path: '@/components/ErrorBoundary',
    usage: '<ErrorBoundary>{children}</ErrorBoundary>',
    description: 'Catch and display errors gracefully'
  },
  ErrorSection: {
    path: '@/components/ErrorBoundary',
    usage: '<ErrorSection fallback={...}>{children}</ErrorSection>',
    description: 'Error boundary for specific sections'
  }
};

/**
 * Get error handler info by name
 */
export function getErrorHandler(name) {
  return errorHandlingRegistry[name] || null;
}

/**
 * Get all error handlers for a category
 */
export function getErrorHandlersByType(type) {
  const types = {
    mapper: ['mapError', 'handleErrorResult'],
    domain: ['productError', 'orderError', 'userError'],
    hook: ['useErrorHandler'],
    logging: ['logError', 'trackAction'],
    ui: ['ErrorBoundary', 'ErrorSection']
  };
  return types[type]?.map(name => ({ name, ...errorHandlingRegistry[name] })) || [];
}
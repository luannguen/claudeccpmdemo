/**
 * Centralized Error Logging Service
 * 
 * Provides:
 * - Console logging (dev)
 * - Remote logging ready (Sentry/Datadog integration placeholder)
 * - Error categorization & sampling
 * - User context tracking
 */

import { ErrorCodes } from '@/components/data/types';
import { ErrorSeverity } from './errorMapper';

// ========== CONFIG ==========
const CONFIG = {
  enableRemoteLogging: false, // Set to true when Sentry/Datadog is configured
  sampleRate: 1.0, // 1.0 = log everything, 0.1 = log 10%
  maxBreadcrumbs: 50,
  environment: typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'development' : 'production'
};

// ========== BREADCRUMBS ==========
const breadcrumbs = [];

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(category, message, data = {}) {
  breadcrumbs.push({
    timestamp: new Date().toISOString(),
    category,
    message,
    data
  });

  // Keep only last N breadcrumbs
  if (breadcrumbs.length > CONFIG.maxBreadcrumbs) {
    breadcrumbs.shift();
  }
}

/**
 * Get recent breadcrumbs
 */
export function getBreadcrumbs() {
  return [...breadcrumbs];
}

// ========== USER CONTEXT ==========
let userContext = null;

/**
 * Set user context for error tracking
 */
export function setUserContext(user) {
  if (user) {
    userContext = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.full_name
    };
  } else {
    userContext = null;
  }
}

/**
 * Get current user context
 */
export function getUserContext() {
  return userContext;
}

// ========== ERROR LOGGING ==========

/**
 * Log error to console and remote service
 * @param {Error|string} error
 * @param {Object} context
 */
export function logError(error, context = {}) {
  const errorData = normalizeError(error);
  const fullContext = {
    ...context,
    user: userContext,
    breadcrumbs: getBreadcrumbs().slice(-10),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    timestamp: new Date().toISOString(),
    environment: CONFIG.environment
  };

  // Console logging (always in dev)
  if (CONFIG.environment === 'development') {
    console.group(`🔴 Error: ${errorData.message}`);
    console.error('Error:', errorData);
    console.log('Context:', fullContext);
    console.groupEnd();
  } else {
    console.error('[Error]', errorData.message);
  }

  // Remote logging
  if (CONFIG.enableRemoteLogging && shouldSample()) {
    sendToRemote(errorData, fullContext);
  }

  return errorData;
}

/**
 * Log warning
 */
export function logWarning(message, context = {}) {
  if (CONFIG.environment === 'development') {
    console.warn(`⚠️ Warning: ${message}`, context);
  }
  
  addBreadcrumb('warning', message, context);
}

/**
 * Log info/debug
 */
export function logInfo(message, context = {}) {
  if (CONFIG.environment === 'development') {
    console.log(`ℹ️ Info: ${message}`, context);
  }
  
  addBreadcrumb('info', message, context);
}

// ========== ERROR NORMALIZATION ==========

/**
 * Normalize different error types to consistent format
 */
function normalizeError(error) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code || ErrorCodes.UNKNOWN
    };
  }

  if (typeof error === 'string') {
    return {
      name: 'Error',
      message: error,
      stack: new Error().stack,
      code: ErrorCodes.UNKNOWN
    };
  }

  if (error && typeof error === 'object') {
    return {
      name: error.name || 'Error',
      message: error.message || JSON.stringify(error),
      stack: error.stack || new Error().stack,
      code: error.code || ErrorCodes.UNKNOWN
    };
  }

  return {
    name: 'UnknownError',
    message: 'An unknown error occurred',
    stack: new Error().stack,
    code: ErrorCodes.UNKNOWN
  };
}

// ========== SAMPLING ==========

function shouldSample() {
  return Math.random() < CONFIG.sampleRate;
}

// ========== REMOTE LOGGING (Placeholder) ==========

/**
 * Send error to remote service
 * Replace this with actual Sentry/Datadog integration
 */
async function sendToRemote(errorData, context) {
  // Sentry integration example:
  // if (window.Sentry) {
  //   Sentry.withScope((scope) => {
  //     scope.setExtras(context);
  //     scope.setUser(context.user);
  //     Sentry.captureException(new Error(errorData.message));
  //   });
  // }

  // Datadog integration example:
  // if (window.DD_LOGS) {
  //   DD_LOGS.logger.error(errorData.message, {
  //     error: errorData,
  //     ...context
  //   });
  // }

  // For now, just log that we would send
  if (CONFIG.environment === 'development') {
    console.log('[Would send to remote]', { errorData, context });
  }
}

// ========== ERROR TRACKING HOOKS ==========

/**
 * Track user action for debugging
 */
export function trackAction(action, data = {}) {
  addBreadcrumb('user_action', action, data);
}

/**
 * Track navigation for debugging
 */
export function trackNavigation(from, to) {
  addBreadcrumb('navigation', `${from} → ${to}`, { from, to });
}

/**
 * Track API call for debugging
 */
export function trackApiCall(method, endpoint, status) {
  addBreadcrumb('api', `${method} ${endpoint}`, { method, endpoint, status });
}

// ========== EXPORT ==========

export default {
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
};
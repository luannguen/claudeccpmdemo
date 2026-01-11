/**
 * Middleware - Public API
 * 
 * Pipeline order: logging → validation → dedupe → rateLimit → preferences → handler
 */

export { loggingMiddleware } from './loggingMiddleware';
export { validationMiddleware } from './validationMiddleware';
export { dedupeMiddleware, clearDedupeCache } from './dedupeMiddleware';
export { rateLimitMiddleware, getRateLimitStats, resetRateLimits } from './rateLimitMiddleware';
export { preferencesMiddleware, updateUserPreferences, clearPreferencesCache } from './preferencesMiddleware';

import { eventMiddleware } from '../../core/eventMiddleware';
import { loggingMiddleware } from './loggingMiddleware';
import { validationMiddleware } from './validationMiddleware';
import { dedupeMiddleware } from './dedupeMiddleware';
import { rateLimitMiddleware } from './rateLimitMiddleware';
import { preferencesMiddleware } from './preferencesMiddleware';

/**
 * Initialize middleware pipeline (call once on app start)
 */
export const initializeMiddleware = () => {
  // Clear existing
  eventMiddleware.clear();
  
  // Add middlewares in order
  eventMiddleware
    .use(loggingMiddleware)
    .use(validationMiddleware)
    .use(dedupeMiddleware)
    .use(rateLimitMiddleware)
    .use(preferencesMiddleware);
  
  console.log('✅ Middleware pipeline initialized:', eventMiddleware.getCount(), 'middlewares');
};

/**
 * Get middleware stats
 */
export const getMiddlewareStats = () => ({
  count: eventMiddleware.getCount(),
  order: [
    'logging',
    'validation', 
    'dedupe',
    'rateLimit',
    'preferences'
  ]
});
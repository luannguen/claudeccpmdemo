/**
 * Rate Limit Middleware - Prevent notification spam
 * 
 * Limits:
 * - Per recipient: 30 notifications/minute
 * - Per event type: 100/minute
 * - Global: 500/minute
 */

const rateLimits = {
  perRecipient: new Map(),
  perEventType: new Map(),
  global: { count: 0, resetAt: 0 }
};

const LIMITS = {
  perRecipient: 30,
  perEventType: 100,
  global: 500,
  windowMs: 60000 // 1 minute
};

const checkLimit = (map, key, limit, windowMs) => {
  const now = Date.now();
  const record = map.get(key) || { count: 0, resetAt: now + windowMs };
  
  // Reset if window expired
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }
  
  if (record.count >= limit) {
    return false; // Rate limited
  }
  
  record.count++;
  map.set(key, record);
  return true;
};

export const rateLimitMiddleware = async (context, next) => {
  const { eventName, payload } = context;
  const recipient = payload.recipientEmail || payload.order?.customer_email || 'broadcast';
  const now = Date.now();
  
  // Check global limit
  if (now > rateLimits.global.resetAt) {
    rateLimits.global.count = 0;
    rateLimits.global.resetAt = now + LIMITS.windowMs;
  }
  
  if (rateLimits.global.count >= LIMITS.global) {
    console.warn(`🚫 Rate limit: Global limit reached (${LIMITS.global}/min)`);
    context.skipped = true;
    context.skipReason = 'rate_limit_global';
    return;
  }
  rateLimits.global.count++;
  
  // Check per-event-type limit
  if (!checkLimit(rateLimits.perEventType, eventName, LIMITS.perEventType, LIMITS.windowMs)) {
    console.warn(`🚫 Rate limit: Event ${eventName} limit reached (${LIMITS.perEventType}/min)`);
    context.skipped = true;
    context.skipReason = 'rate_limit_event';
    return;
  }
  
  // Check per-recipient limit (skip for broadcasts)
  if (recipient !== 'broadcast') {
    if (!checkLimit(rateLimits.perRecipient, recipient, LIMITS.perRecipient, LIMITS.windowMs)) {
      console.warn(`🚫 Rate limit: Recipient ${recipient} limit reached (${LIMITS.perRecipient}/min)`);
      context.skipped = true;
      context.skipReason = 'rate_limit_recipient';
      return;
    }
  }
  
  await next();
};

/**
 * Get current rate limit stats
 */
export const getRateLimitStats = () => ({
  global: rateLimits.global.count,
  eventTypes: rateLimits.perEventType.size,
  recipients: rateLimits.perRecipient.size
});

/**
 * Reset rate limits (for testing)
 */
export const resetRateLimits = () => {
  rateLimits.perRecipient.clear();
  rateLimits.perEventType.clear();
  rateLimits.global = { count: 0, resetAt: 0 };
};

export default rateLimitMiddleware;
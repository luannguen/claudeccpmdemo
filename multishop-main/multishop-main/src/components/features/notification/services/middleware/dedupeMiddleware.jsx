/**
 * Dedupe Middleware - Prevent duplicate notifications within time window
 */

// Simple in-memory cache (replace with Redis in production)
const recentEvents = new Map();
const DEFAULT_WINDOW_MS = 60000; // 1 minute

/**
 * Generate dedupe key from event
 */
const generateKey = (eventName, payload) => {
  const recipient = payload.recipientEmail || payload.order?.customer_email || 'broadcast';
  const entityId = payload.order?.id || payload.review?.id || payload.member?.id || '';
  return `${eventName}:${recipient}:${entityId}`;
};

export const dedupeMiddleware = async (context, next) => {
  const { eventName, payload } = context;
  
  // Skip dedupe for certain event types that should always go through
  const skipDedupe = ['system.maintenance', 'system.alert', 'price.fomo'];
  if (skipDedupe.includes(eventName)) {
    return next();
  }
  
  const key = generateKey(eventName, payload);
  const now = Date.now();
  
  // Check if recently emitted
  const lastEmit = recentEvents.get(key);
  if (lastEmit && (now - lastEmit) < DEFAULT_WINDOW_MS) {
    console.log(`🔄 Dedupe: Skipping duplicate ${eventName} (last: ${Math.round((now - lastEmit) / 1000)}s ago)`);
    context.skipped = true;
    context.skipReason = 'duplicate';
    return; // Skip without calling next
  }
  
  // Record this emit
  recentEvents.set(key, now);
  
  // Cleanup old entries periodically
  if (recentEvents.size > 1000) {
    const cutoff = now - DEFAULT_WINDOW_MS * 5;
    for (const [k, v] of recentEvents) {
      if (v < cutoff) recentEvents.delete(k);
    }
  }
  
  await next();
};

/**
 * Clear dedupe cache (for testing)
 */
export const clearDedupeCache = () => {
  recentEvents.clear();
};

export default dedupeMiddleware;
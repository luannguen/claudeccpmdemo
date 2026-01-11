/**
 * Preferences Middleware - Check user notification preferences
 * 
 * Allows users to opt-out of specific notification types
 */

// In-memory cache for user preferences
// In production, this should query from database
const preferencesCache = new Map();

/**
 * Get user preferences (cached)
 */
const getUserPreferences = async (email) => {
  if (!email) return null;
  
  // Check cache
  if (preferencesCache.has(email)) {
    return preferencesCache.get(email);
  }
  
  // TODO: Query from database/User entity
  // For now, return null (all enabled)
  return null;
};

/**
 * Check if notification type is enabled for user
 */
const isEventEnabled = (preferences, eventName) => {
  if (!preferences) return true; // Default: all enabled
  
  // Check if specific event is disabled
  if (preferences.disabledEvents?.includes(eventName)) {
    return false;
  }
  
  // Check category
  const category = eventName.split('.')[0];
  if (preferences.disabledCategories?.includes(category)) {
    return false;
  }
  
  return true;
};

export const preferencesMiddleware = async (context, next) => {
  const { eventName, payload } = context;
  const recipient = payload.recipientEmail || payload.order?.customer_email;
  
  // Skip for admin/broadcast notifications
  if (!recipient || context.isAdminNotification) {
    return next();
  }
  
  // Skip for critical events that should always go through
  const criticalEvents = [
    'order.created', 'order.cancelled',
    'payment.confirmed', 'payment.failed',
    'system.maintenance', 'system.alert',
    'security.suspicious_activity'
  ];
  
  if (criticalEvents.includes(eventName)) {
    return next();
  }
  
  // Check user preferences
  const preferences = await getUserPreferences(recipient);
  
  if (!isEventEnabled(preferences, eventName)) {
    console.log(`🔕 User ${recipient} has disabled ${eventName}`);
    context.skipped = true;
    context.skipReason = 'user_preference';
    return;
  }
  
  await next();
};

/**
 * Update user preferences (call from settings page)
 */
export const updateUserPreferences = (email, preferences) => {
  preferencesCache.set(email, {
    ...preferencesCache.get(email),
    ...preferences,
    updatedAt: new Date().toISOString()
  });
};

/**
 * Clear preferences cache
 */
export const clearPreferencesCache = () => {
  preferencesCache.clear();
};

export default preferencesMiddleware;
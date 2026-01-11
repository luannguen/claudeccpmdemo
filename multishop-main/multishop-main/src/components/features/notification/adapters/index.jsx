/**
 * Notification Adapters - Backward Compatibility Layer
 */

export { NotificationServiceAdapter } from './NotificationServiceAdapter';
export { useRealTimeNotificationsAdapter } from './useRealTimeNotificationsAdapter';

// Convenience aliases for drop-in replacement
export { NotificationServiceAdapter as NotificationService } from './NotificationServiceAdapter';
export { useRealTimeNotificationsAdapter as useRealTimeNotifications } from './useRealTimeNotificationsAdapter';
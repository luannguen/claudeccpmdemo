/**
 * useRealTimeNotifications Adapter
 * Backward compatibility with legacy hook
 * 
 * USAGE: Replace imports of old hook with this adapter
 * import { useRealTimeNotifications } from '@/components/notifications/useRealTimeNotifications';
 * →
 * import { useRealTimeNotificationsAdapter as useRealTimeNotifications } from '@/components/features/notification';
 */

import { useClientNotifications, useAdminNotifications } from '../hooks';

/**
 * Adapter hook that wraps new hooks with legacy API
 */
export function useRealTimeNotificationsAdapter({
  userEmail,
  isAdmin = false,
  pollingInterval = null,
  enabled = true
}) {
  // Use appropriate hook based on user type
  const clientHook = useClientNotifications(userEmail, {
    pollingInterval: pollingInterval || 10000,
    enabled: enabled && !isAdmin && !!userEmail
  });

  const adminHook = useAdminNotifications(userEmail, {
    pollingInterval: pollingInterval || 3000,
    enabled: enabled && isAdmin && !!userEmail
  });

  const activeHook = isAdmin ? adminHook : clientHook;

  // Return legacy-compatible API
  return {
    // Data
    notifications: activeHook.notifications,
    unreadCount: activeHook.unreadCount,
    urgentCount: activeHook.urgentCount,
    
    // Loading states
    isLoading: activeHook.isLoading,
    error: activeHook.error,
    
    // Actions
    markAsRead: activeHook.markAsRead,
    markAllAsRead: activeHook.markAllAsRead,
    
    // Legacy aliases
    data: activeHook.notifications,
    loading: activeHook.isLoading,
    
    // Browser notifications
    requestPermission: activeHook.requestPermission,
    hasNotificationPermission: activeHook.hasNotificationPermission
  };
}

export default useRealTimeNotificationsAdapter;
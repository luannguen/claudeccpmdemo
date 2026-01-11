/**
 * Real-time Poller
 * Abstraction for notification polling logic
 */

import { priorityManager } from './priorityManager';

/**
 * Create polling config based on actor and notifications
 */
export const createPollingConfig = ({ actor, notifications = [], customInterval = null }) => {
  // Actor-specific defaults
  const actorDefaults = {
    client: 10000,  // 10s
    admin: 3000,    // 3s
    tenant: 5000,   // 5s
    tester: 10000   // 10s
  };
  
  // Use custom interval if provided
  if (customInterval) {
    return {
      refetchInterval: customInterval,
      refetchIntervalInBackground: true
    };
  }
  
  // Use priority-based interval
  const priorityInterval = priorityManager.getRecommendedPollingInterval(notifications);
  const actorDefault = actorDefaults[actor] || 10000;
  
  // Pick the more aggressive interval (shorter)
  const interval = Math.min(priorityInterval, actorDefault);
  
  return {
    refetchInterval: interval,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 0 // Always fresh
  };
};

/**
 * Should trigger sound alert
 */
export const shouldTriggerSound = (newNotifications, oldNotifications) => {
  if (!newNotifications || newNotifications.length === 0) return false;
  if (!oldNotifications) return newNotifications.length > 0;
  
  // Check if there are new unread notifications
  const newUnreadIds = newNotifications
    .filter(n => !n.is_read)
    .map(n => n.id);
  
  const oldUnreadIds = oldNotifications
    .filter(n => !n.is_read)
    .map(n => n.id);
  
  // Find truly new notifications (not in old list)
  const hasNewNotifications = newUnreadIds.some(id => !oldUnreadIds.includes(id));
  
  return hasNewNotifications;
};

/**
 * Should show browser notification
 */
export const shouldShowBrowserNotif = (notification) => {
  // Only if not focused on app
  if (document.hasFocus()) return false;
  
  // Only for high priority
  return priorityManager.shouldShowBrowserNotification(notification);
};

export const realtimePoller = {
  createPollingConfig,
  shouldTriggerSound,
  shouldShowBrowserNotif
};

export default realtimePoller;
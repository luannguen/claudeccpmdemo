/**
 * Priority Manager
 * Manages notification priority queue and scheduling
 */

import { NotificationPriority, PriorityLevels, PriorityConfig } from '../types';

/**
 * Sort notifications by priority
 */
export const sortByPriority = (notifications) => {
  return [...notifications].sort((a, b) => {
    const priorityA = PriorityLevels[a.priority] || 0;
    const priorityB = PriorityLevels[b.priority] || 0;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    
    // Same priority -> sort by date (newest first)
    return new Date(b.created_date) - new Date(a.created_date);
  });
};

/**
 * Filter by priority threshold
 */
export const filterByPriority = (notifications, minPriority = NotificationPriority.NORMAL) => {
  const minLevel = PriorityLevels[minPriority] || 0;
  
  return notifications.filter(n => {
    const level = PriorityLevels[n.priority] || 0;
    return level >= minLevel;
  });
};

/**
 * Get urgent notifications
 */
export const getUrgentNotifications = (notifications) => {
  return notifications.filter(n => n.priority === NotificationPriority.URGENT);
};

/**
 * Get high priority notifications
 */
export const getHighPriorityNotifications = (notifications) => {
  return filterByPriority(notifications, NotificationPriority.HIGH);
};

/**
 * Check if should play sound
 */
export const shouldPlaySound = (notification) => {
  const config = PriorityConfig[notification.priority];
  return config?.soundEnabled || false;
};

/**
 * Check if should show browser notification
 */
export const shouldShowBrowserNotification = (notification) => {
  const config = PriorityConfig[notification.priority];
  return config?.browserNotification || false;
};

/**
 * Get recommended polling interval for notifications list
 */
export const getRecommendedPollingInterval = (notifications) => {
  if (!notifications || notifications.length === 0) {
    return 10000; // 10s default
  }
  
  const urgentCount = getUrgentNotifications(notifications).length;
  if (urgentCount > 0) return 2000; // 2s for urgent
  
  const highCount = getHighPriorityNotifications(notifications).length;
  if (highCount > 0) return 3000; // 3s for high
  
  return 5000; // 5s for normal
};

export const priorityManager = {
  sortByPriority,
  filterByPriority,
  getUrgentNotifications,
  getHighPriorityNotifications,
  shouldPlaySound,
  shouldShowBrowserNotification,
  getRecommendedPollingInterval
};

export default priorityManager;
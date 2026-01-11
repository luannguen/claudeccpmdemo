/**
 * Notification Priority - Constants and Rules
 */

export const NotificationPriority = {
  URGENT: 'urgent',
  HIGH: 'high',
  NORMAL: 'normal',
  LOW: 'low'
};

export const PriorityLevels = {
  [NotificationPriority.URGENT]: 4,
  [NotificationPriority.HIGH]: 3,
  [NotificationPriority.NORMAL]: 2,
  [NotificationPriority.LOW]: 1
};

export const PriorityConfig = {
  [NotificationPriority.URGENT]: {
    label: 'Khẩn Cấp',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    textColor: 'text-red-600',
    pollingInterval: 2000, // 2s
    soundEnabled: true,
    browserNotification: true
  },
  [NotificationPriority.HIGH]: {
    label: 'Cao',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-600',
    pollingInterval: 3000, // 3s
    soundEnabled: true,
    browserNotification: true
  },
  [NotificationPriority.NORMAL]: {
    label: 'Bình Thường',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
    pollingInterval: 5000, // 5s
    soundEnabled: false,
    browserNotification: false
  },
  [NotificationPriority.LOW]: {
    label: 'Thấp',
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-600',
    pollingInterval: 10000, // 10s
    soundEnabled: false,
    browserNotification: false
  }
};

/**
 * Get polling interval based on highest priority notification
 */
export const getOptimalPollingInterval = (notifications) => {
  if (!notifications || notifications.length === 0) return 10000;
  
  const highestPriority = notifications.reduce((max, n) => {
    const level = PriorityLevels[n.priority] || 0;
    return level > max ? level : max;
  }, 0);
  
  const priorityKey = Object.keys(PriorityLevels).find(
    key => PriorityLevels[key] === highestPriority
  );
  
  return PriorityConfig[priorityKey]?.pollingInterval || 10000;
};
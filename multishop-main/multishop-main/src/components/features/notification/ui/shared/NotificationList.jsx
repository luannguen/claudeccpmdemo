/**
 * Notification List Component
 * Renders list of notifications
 */

import React, { useState } from 'react';
import { NotificationItem } from './NotificationItem';

export function NotificationList({ notifications, onNotificationClick }) {
  const [readingIds, setReadingIds] = useState(new Set());

  const handleClick = async (notification) => {
    if (!notification.is_read) {
      setReadingIds(prev => new Set(prev).add(notification.id));
    }
    
    await onNotificationClick(notification);
    
    // Remove from reading set after action
    setTimeout(() => {
      setReadingIds(prev => {
        const next = new Set(prev);
        next.delete(notification.id);
        return next;
      });
    }, 300);
  };

  return (
    <div className="divide-y divide-gray-100">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClick={handleClick}
          isReading={readingIds.has(notification.id)}
        />
      ))}
    </div>
  );
}

export default NotificationList;
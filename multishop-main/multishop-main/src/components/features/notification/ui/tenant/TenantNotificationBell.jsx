/**
 * Tenant Notification Bell (NEW)
 * For shop owners/tenant admins
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationBellBase, NotificationList } from '../shared';
import { useTenantNotifications } from '../../hooks';

export function TenantNotificationBell({ userEmail, tenantId }) {
  const navigate = useNavigate();
  
  const {
    notifications,
    unreadCount,
    urgentCount,
    isLoading,
    markAsRead,
    markAllAsRead
  } = useTenantNotifications(userEmail, tenantId);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate
    if (notification.link) {
      if (notification.link.startsWith('/')) {
        navigate(notification.link);
      } else {
        window.location.href = notification.link;
      }
    }
  };

  if (!userEmail || !tenantId) return null;

  return (
    <NotificationBellBase
      notifications={notifications}
      unreadCount={unreadCount}
      urgentCount={urgentCount}
      isLoading={isLoading}
      theme="tenant"
      onNotificationClick={handleNotificationClick}
      onMarkAllAsRead={() => markAllAsRead(userEmail, tenantId)}
    >
      {({ notifications, onNotificationClick }) => (
        <NotificationList
          notifications={notifications}
          onNotificationClick={onNotificationClick}
        />
      )}
    </NotificationBellBase>
  );
}

export default TenantNotificationBell;
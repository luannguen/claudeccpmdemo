/**
 * Client Notification Bell - v2.1
 * Click bell to dispatch event → LayoutModals handles modal
 * NO local modal state to avoid duplicate modals
 */

import React from 'react';
import { NotificationBellBase } from '../shared';
import { useClientNotifications } from '../../hooks';

export function ClientNotificationBell({ currentUser }) {
  const {
    unreadCount,
    urgentCount,
    isLoading
  } = useClientNotifications(currentUser?.email);

  const handleOpenFullModal = () => {
    // Dispatch event to LayoutModals (single source of truth for modals)
    window.dispatchEvent(new CustomEvent('open-user-notifications-modal'));
  };

  if (!currentUser) return null;

  return (
    <NotificationBellBase
      unreadCount={unreadCount}
      urgentCount={urgentCount}
      isLoading={isLoading}
      theme="client"
      onOpenFullModal={handleOpenFullModal}
    />
  );
}

export default ClientNotificationBell;
/**
 * Admin Notification Bell - v2.0
 * Click to open full modal (no dropdown)
 */

import React, { useState } from 'react';
import { NotificationBellBase } from '../shared';
import { useAdminNotifications } from '../../hooks';
import { AdminNotificationModal } from './AdminNotificationModal';

export function AdminNotificationBell({ user }) {
  const [showModal, setShowModal] = useState(false);
  
  const {
    unreadCount,
    urgentCount,
    isLoading
  } = useAdminNotifications(user?.email);

  const handleOpenFullModal = () => {
    setShowModal(true);
  };

  return (
    <>
      <NotificationBellBase
        unreadCount={unreadCount}
        urgentCount={urgentCount}
        isLoading={isLoading}
        theme="admin"
        onOpenFullModal={handleOpenFullModal}
      />

      {/* Full Notification Modal */}
      <AdminNotificationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={user}
      />
    </>
  );
}

export default AdminNotificationBell;
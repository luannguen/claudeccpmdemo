import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';
import AdminNotificationDetailModal from '@/components/notifications/AdminNotificationDetailModal';
import { createPageUrl } from '@/utils';

// Hooks
import {
  useAdminUser,
  useAdminNotificationsList,
  useNotificationStats,
  useFilteredNotifications,
  useNotificationMutations,
  useNotificationsState
} from '@/components/hooks/useAdminNotifications';

// Components
import NotificationsStats from '@/components/admin/notifications/NotificationsStats';
import NotificationsFilters from '@/components/admin/notifications/NotificationsFilters';
import NotificationsList from '@/components/admin/notifications/NotificationsList';

function AdminNotificationsContent() {
  const navigate = useNavigate();
  
  // State
  const {
    filters,
    setFilterType,
    setFilterRead,
    setFilterPriority,
    selectedIds,
    toggleSelect,
    clearSelection,
    selectedNotification,
    setSelectedNotification
  } = useNotificationsState();

  // Data
  const { data: user } = useAdminUser();
  const { data: notifications = [], isLoading } = useAdminNotificationsList(user?.email);
  const stats = useNotificationStats(notifications);
  const filteredNotifications = useFilteredNotifications(notifications, filters);

  // Mutations
  const {
    markAsReadMutation,
    deleteMutation,
    markAllAsReadMutation,
    bulkDeleteMutation
  } = useNotificationMutations();

  // Handlers
  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate(notifications);
  };

  const handleBulkDelete = () => {
    if (confirm(`Xóa ${selectedIds.length} thông báo?`)) {
      bulkDeleteMutation.mutate(selectedIds);
      clearSelection();
    }
  };

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
  };

  const handleMarkAsReadFromModal = (notificationId) => {
    markAsReadMutation.mutate(notificationId);
  };

  const hasFilters = filters.filterType !== 'all' || filters.filterRead !== 'all' || filters.filterPriority !== 'all';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Bell className="w-8 h-8 text-[#7CB342]" />
          Quản Lý Thông Báo
        </h1>
        <p className="text-gray-600">Theo dõi và quản lý tất cả thông báo hệ thống</p>
      </div>

      {/* Stats */}
      <NotificationsStats stats={stats} />

      {/* Filters */}
      <NotificationsFilters
        filters={filters}
        setFilterType={setFilterType}
        setFilterRead={setFilterRead}
        setFilterPriority={setFilterPriority}
        stats={stats}
        totalCount={notifications.length}
        filteredCount={filteredNotifications.length}
        selectedCount={selectedIds.length}
        onMarkAllAsRead={handleMarkAllAsRead}
        onBulkDelete={handleBulkDelete}
      />

      {/* List */}
      <NotificationsList
        notifications={filteredNotifications}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onViewDetails={handleViewDetails}
        onDelete={(id) => deleteMutation.mutate(id)}
        hasFilters={hasFilters}
      />

      {/* Detail Modal */}
      <AdminNotificationDetailModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
        onMarkAsRead={handleMarkAsReadFromModal}
        onNavigateToOrder={(orderId) => {
          setSelectedNotification(null);
          navigate(createPageUrl(`AdminOrders?orderId=${orderId}`));
        }}
      />
    </div>
  );
}

export default function AdminNotifications() {
  return (
    <AdminGuard requiredModule="notifications" requiredPermission="notifications.view">
      <AdminLayout>
        <AdminNotificationsContent />
      </AdminLayout>
    </AdminGuard>
  );
}
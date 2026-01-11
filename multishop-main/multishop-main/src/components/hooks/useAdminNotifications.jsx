import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Bell, Package, CreditCard, DollarSign, AlertCircle,
  TrendingDown, Users, Star
} from 'lucide-react';

// ✅ Notification Config
export const NOTIFICATION_CONFIG = {
  new_order: { icon: Package, color: 'blue', label: 'Đơn mới' },
  payment_verification_needed: { icon: CreditCard, color: 'orange', label: 'Xác minh TT' },
  payment_received: { icon: DollarSign, color: 'green', label: 'Đã thanh toán' },
  payment_failed: { icon: AlertCircle, color: 'red', label: 'TT thất bại' },
  low_stock: { icon: TrendingDown, color: 'orange', label: 'Sắp hết hàng' },
  out_of_stock: { icon: AlertCircle, color: 'red', label: 'Hết hàng' },
  new_customer: { icon: Users, color: 'green', label: 'KH mới' },
  new_review: { icon: Star, color: 'yellow', label: 'Đánh giá mới' },
  order_status_change: { icon: Package, color: 'purple', label: 'Cập nhật đơn' },
  system_alert: { icon: Bell, color: 'gray', label: 'Hệ thống' }
};

export const PRIORITY_BADGE = {
  urgent: { bg: 'bg-red-500', text: 'text-white', label: 'KHẨN CẤP' },
  high: { bg: 'bg-orange-500', text: 'text-white', label: 'CAO' },
  normal: { bg: 'bg-blue-500', text: 'text-white', label: 'BÌNH THƯỜNG' },
  low: { bg: 'bg-gray-400', text: 'text-white', label: 'THẤP' }
};

/**
 * Hook fetch current admin user
 */
export function useAdminUser() {
  return useQuery({
    queryKey: ['admin-noti-user'],
    queryFn: () => base44.auth.me(),
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook fetch admin notifications
 */
export function useAdminNotificationsList(userEmail) {
  return useQuery({
    queryKey: ['admin-all-notifications', userEmail],
    queryFn: async () => {
      const all = await base44.entities.AdminNotification.list('-created_date', 200);
      return all.filter(n => !n.recipient_email || n.recipient_email === userEmail);
    },
    enabled: !!userEmail,
    staleTime: 0,
    refetchInterval: 5000
  });
}

/**
 * Hook tính stats cho notifications
 */
export function useNotificationStats(notifications = []) {
  return useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    urgent: notifications.filter(n => n.priority === 'urgent' && !n.is_read).length,
    requiresAction: notifications.filter(n => n.requires_action && !n.is_read).length
  }), [notifications]);
}

/**
 * Hook filter notifications
 */
export function useFilteredNotifications(notifications, filters) {
  const { filterType, filterRead, filterPriority } = filters;

  return useMemo(() => {
    let result = [...notifications];

    if (filterType !== 'all') {
      result = result.filter(n => n.type === filterType);
    }

    if (filterRead === 'unread') {
      result = result.filter(n => !n.is_read);
    } else if (filterRead === 'read') {
      result = result.filter(n => n.is_read);
    }

    if (filterPriority !== 'all') {
      result = result.filter(n => n.priority === filterPriority);
    }

    return result;
  }, [notifications, filterType, filterRead, filterPriority]);
}

/**
 * Hook mutations cho notifications
 */
export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.AdminNotification.update(id, {
      is_read: true,
      read_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all-notifications']);
      queryClient.invalidateQueries(['admin-notifications-realtime']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AdminNotification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all-notifications']);
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async (notifications) => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n =>
        base44.entities.AdminNotification.update(n.id, {
          is_read: true,
          read_date: new Date().toISOString()
        })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all-notifications']);
      queryClient.invalidateQueries(['admin-notifications-realtime']);
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map(id =>
        base44.entities.AdminNotification.delete(id)
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-all-notifications']);
    }
  });

  return {
    markAsReadMutation,
    deleteMutation,
    markAllAsReadMutation,
    bulkDeleteMutation
  };
}

/**
 * Hook quản lý state filters và selection
 */
export function useNotificationsState() {
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (notifications) => {
    setSelectedIds(prev =>
      prev.length === notifications.length ? [] : notifications.map(n => n.id)
    );
  };

  const clearSelection = () => setSelectedIds([]);

  return {
    filters: { filterType, filterRead, filterPriority },
    setFilterType,
    setFilterRead,
    setFilterPriority,
    selectedIds,
    setSelectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    selectedNotification,
    setSelectedNotification
  };
}

export default useAdminNotificationsList;
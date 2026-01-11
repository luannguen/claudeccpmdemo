/**
 * 📱 User Notifications Page - Mobile-optimized
 */

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Bell, Heart, MessageCircle, UserPlus, Award,
  Package, CheckCircle, AlertCircle, Trash2, Eye,
  Filter, Calendar, Clock
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const NOTIFICATION_ICONS = {
  like: { icon: Heart, color: 'red', label: 'Thích' },
  comment: { icon: MessageCircle, color: 'blue', label: 'Bình luận' },
  mention: { icon: MessageCircle, color: 'blue', label: 'Nhắc đến' },
  follow: { icon: UserPlus, color: 'green', label: 'Theo dõi' },
  reply: { icon: MessageCircle, color: 'purple', label: 'Trả lời' },
  achievement: { icon: Award, color: 'yellow', label: 'Thành tựu' },
  order_confirmed: { icon: CheckCircle, color: 'green', label: 'Đơn hàng' },
  order_shipping: { icon: Package, color: 'blue', label: 'Đang giao' },
  order_delivered: { icon: CheckCircle, color: 'green', label: 'Đã giao' },
  order_cancelled: { icon: AlertCircle, color: 'red', label: 'Đã hủy' },
  payment_success: { icon: CheckCircle, color: 'green', label: 'Thanh toán' },
  payment_failed: { icon: AlertCircle, color: 'red', label: 'TT thất bại' },
  promo: { icon: Award, color: 'yellow', label: 'Khuyến mãi' },
  system: { icon: Bell, color: 'gray', label: 'Hệ thống' }
};

export default function MyNotifications() {
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['my-noti-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['my-all-notifications', user?.email],
    queryFn: async () => {
      const all = await base44.entities.Notification.list('-created_date', 200);
      return all.filter(n => n.recipient_email === user?.email);
    },
    enabled: !!user?.email,
    staleTime: 0,
    refetchInterval: 10000 // Real-time
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, {
      is_read: true,
      read_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-all-notifications']);
      queryClient.invalidateQueries(['user-notifications-realtime']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-all-notifications']);
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n =>
        base44.entities.Notification.update(n.id, {
          is_read: true,
          read_date: new Date().toISOString()
        })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-all-notifications']);
      queryClient.invalidateQueries(['user-notifications-realtime']);
    }
  });

  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    if (filterType !== 'all') {
      result = result.filter(n => n.type === filterType);
    }

    if (filterRead === 'unread') {
      result = result.filter(n => !n.is_read);
    } else if (filterRead === 'read') {
      result = result.filter(n => n.is_read);
    }

    return result;
  }, [notifications, filterType, filterRead]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-[#7CB342]" />
            Thông Báo Của Tôi
          </h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Bạn đã đọc tất cả thông báo'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <select
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="flex-1 min-w-[150px] px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
            >
              <option value="all">Tất cả ({notifications.length})</option>
              <option value="unread">Chưa đọc ({unreadCount})</option>
              <option value="read">Đã đọc ({notifications.length - unreadCount})</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 min-w-[150px] px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
            >
              <option value="all">Tất cả loại</option>
              {Object.entries(NOTIFICATION_ICONS).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              className="w-full bg-green-500 text-white py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Đọc Tất Cả ({unreadCount})
            </button>
          )}
        </div>

        {/* Notifications */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Đang tải thông báo...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system;
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all ${
                    !notification.is_read ? 'bg-blue-50 border-2 border-blue-200' : 'border border-gray-200'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-12 h-12 rounded-full bg-${config.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 text-${config.color}-600`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        {notification.title && (
                          <p className={`text-sm mb-1 ${!notification.is_read ? 'font-bold' : 'font-medium'} text-gray-900`}>
                            {notification.title}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 mb-2">
                          {notification.actor_name && (
                            <strong>{notification.actor_name} </strong>
                          )}
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.created_date), {
                            addSuffix: true,
                            locale: vi
                          })}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          {notification.link && (
                            <button
                              onClick={() => handleNotificationClick(notification)}
                              className="px-3 py-1.5 bg-[#7CB342] text-white rounded-lg text-xs font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              Xem
                            </button>
                          )}
                          {!notification.is_read && (
                            <button
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                              className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Đánh dấu đã đọc
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Xóa thông báo này?')) {
                                deleteMutation.mutate(notification.id);
                              }
                            }}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-red-100 hover:text-red-600 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Xóa
                          </button>
                        </div>
                      </div>

                      {!notification.is_read && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Bell className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Không Có Thông Báo
            </h3>
            <p className="text-gray-600">
              {filterType !== 'all' || filterRead !== 'all'
                ? 'Thử thay đổi bộ lọc'
                : 'Các thông báo mới sẽ xuất hiện tại đây'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
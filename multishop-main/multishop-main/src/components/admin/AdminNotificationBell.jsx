
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, CheckCircle, AlertCircle, Package, Users, Star } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const getNotificationIcon = (type) => {
  switch (type) {
    case 'new_order':
      return <Package className="w-5 h-5 text-blue-600" />;
    case 'low_stock':
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    case 'new_customer':
      return <Users className="w-5 h-5 text-green-600" />;
    case 'new_review':
      return <Star className="w-5 h-5 text-yellow-600" />;
    default:
      return <Bell className="w-5 h-5 text-gray-600" />;
  }
};

export default React.memo(function AdminNotificationBell({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['admin-notifications', user?.email],
    queryFn: async () => {
      const allNotifications = await base44.entities.AdminNotification.list('-created_date', 50);
      return allNotifications.filter(n => n.recipient_email === user?.email);
    },
    enabled: !!user?.email,
    refetchInterval: 30000 // Refetch every 30s
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.AdminNotification.update(id, { 
      is_read: true,
      read_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notifications']);
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => 
          base44.entities.AdminNotification.update(n.id, { 
            is_read: true,
            read_date: new Date().toISOString()
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-notifications']);
    }
  });

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsReadMutation.mutate(notification.id);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-300" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">Thông Báo</h3>
                  <p className="text-xs text-gray-500">{unreadCount} chưa đọc</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsReadMutation.mutate()}
                    className="text-xs text-[#7CB342] hover:text-[#FF9800] font-medium"
                  >
                    Đọc tất cả
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Chưa có thông báo</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.is_read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.is_read ? 'font-bold' : 'font-medium'} text-gray-900 mb-1`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(notification.created_date).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100 text-center">
                  <Link
                    to="/admin-notifications"
                    onClick={() => setIsOpen(false)}
                    className="text-sm text-[#7CB342] hover:text-[#FF9800] font-medium"
                  >
                    Xem tất cả thông báo
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

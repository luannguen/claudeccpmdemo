/**
 * @deprecated since v2.0.0
 * 
 * ⚠️ This file is deprecated and will be removed in future versions.
 * 
 * Migration:
 * ```
 * // OLD:
 * import AdminNotificationBellEnhanced from '@/components/notifications/AdminNotificationBellEnhanced';
 * 
 * // NEW:
 * import { AdminNotificationBell } from '@/components/features/notification';
 * ```
 * 
 * See: components/features/notification/README.md
 * 
 * 👨‍💼 Enhanced Admin Notification Bell - Real-time, Priority-based
 */

console.warn('[DEPRECATED] AdminNotificationBellEnhanced is deprecated. Use AdminNotificationBell from @/components/features/notification instead.');

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, X, Package, Users, Star, AlertCircle, 
  DollarSign, ShoppingCart, TrendingDown, AlertTriangle, CreditCard
} from "lucide-react";
import { useRealTimeNotifications } from './useRealTimeNotifications';
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const NOTIFICATION_CONFIG = {
  new_order: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Đơn mới' },
  payment_verification_needed: { icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Xác minh TT' },
  payment_received: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', label: 'Đã TT' },
  payment_failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'TT thất bại' },
  low_stock: { icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Sắp hết' },
  out_of_stock: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Hết hàng' },
  new_customer: { icon: Users, color: 'text-green-600', bg: 'bg-green-100', label: 'KH mới' },
  new_review: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Đánh giá' },
  order_status_change: { icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Đơn hàng' },
  system_alert: { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Hệ thống' }
};

const PRIORITY_COLORS = {
  urgent: 'border-l-4 border-red-500 bg-red-50',
  high: 'border-l-4 border-orange-500 bg-orange-50',
  normal: 'border-l-4 border-blue-500',
  low: 'border-l-4 border-gray-300'
};

export default React.memo(function AdminNotificationBellEnhanced({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // all, unread, priority
  const [readingIds, setReadingIds] = useState(new Set());
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  } = useRealTimeNotifications(user?.email, {
    enabled: !!user,
    isAdmin: true,
    refetchInterval: 1500, // ⚡ 1.5s for instant admin updates
    maxNotifications: 100
  });

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'priority') return ['high', 'urgent'].includes(n.priority);
    return true;
  });

  const urgentCount = notifications.filter(n => !n.is_read && n.priority === 'urgent').length;

  const handleNotificationClick = async (notification) => {
    // ✅ 1. OPTIMISTIC UI - Mark as "reading" immediately
    if (!notification.is_read) {
      setReadingIds(prev => new Set(prev).add(notification.id));
      
      // ✅ 2. Mark as read (async, no await)
      markAsRead(notification.id).then(() => {
        // Show success toast
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-xl shadow-2xl z-[9999] animate-slide-up flex items-center gap-2';
        toast.innerHTML = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> <span class="text-sm font-medium">Đã đọc</span>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      });
    }

    // ✅ 3. SPA Navigation (NO page reload)
    if (notification.link) {
      setIsOpen(false);
      setTimeout(() => {
        // Use React Router for smooth navigation
        if (notification.link.startsWith('/')) {
          navigate(notification.link);
        } else {
          window.location.href = notification.link;
        }
      }, 150);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/10 rounded-lg transition-colors active:scale-95"
        aria-label="Admin notifications"
      >
        <Bell className={`w-6 h-6 ${urgentCount > 0 ? 'text-red-400 animate-bounce' : 'text-gray-300'}`} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center ${
              urgentCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'
            } text-white`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
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

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-[450px] max-w-[95vw] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[600px]"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Thông Báo Admin</h3>
                    <p className="text-xs text-gray-500">
                      {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Đã đọc tất cả'}
                      {urgentCount > 0 && <span className="text-red-600 font-bold"> • {urgentCount} khẩn cấp</span>}
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#7CB342] hover:text-[#FF9800] font-medium px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Đọc tất cả
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filter === 'all' ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tất cả ({notifications.length})
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Chưa đọc ({unreadCount})
                  </button>
                  <button
                    onClick={() => setFilter('priority')}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filter === 'priority' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Ưu tiên
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-10 h-10 border-3 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Đang tải thông báo...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      {filter === 'all' ? 'Chưa có thông báo' :
                       filter === 'unread' ? 'Đã đọc tất cả' :
                       'Không có thông báo ưu tiên'}
                    </p>
                  </div>
                ) : (
                  <div>
                    {filteredNotifications.map((notification) => {
                      const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.system_alert;
                      const Icon = config.icon;
                      const priorityClass = PRIORITY_COLORS[notification.priority] || '';
                      const isReading = readingIds.has(notification.id);

                      return (
                        <motion.button
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: isReading ? 0.5 : 1, 
                            x: 0,
                            scale: isReading ? 0.98 : 1
                          }}
                          transition={{ duration: 0.3 }}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full p-4 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 transition-all duration-300 text-left ${
                            !notification.is_read ? 'bg-blue-50' : ''
                          } ${priorityClass} ${isReading ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                              <Icon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <p className={`text-sm ${!notification.is_read ? 'font-bold' : 'font-medium'} text-gray-900`}>
                                  {notification.title}
                                </p>
                                {notification.priority === 'urgent' && (
                                  <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase flex-shrink-0">
                                    KHẨN
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-gray-500">
                                  {new Date(notification.created_date).toLocaleString('vi-VN')}
                                </span>
                                {notification.requires_action && (
                                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-medium rounded">
                                    Cần xử lý
                                  </span>
                                )}
                              </div>
                            </div>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {filteredNotifications.length > 0 && (
                <div className="p-3 border-t border-gray-100 text-center flex-shrink-0">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(new CustomEvent('open-admin-notifications-modal'));
                    }}
                    className="text-sm text-[#7CB342] hover:text-[#FF9800] font-medium"
                  >
                    Xem tất cả thông báo
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});
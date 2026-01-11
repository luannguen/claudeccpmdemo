/**
 * @deprecated since v2.0.0
 * 
 * ⚠️ This file is deprecated and will be removed in future versions.
 * 
 * Migration:
 * ```
 * // OLD:
 * import NotificationBellEnhanced from '@/components/notifications/NotificationBellEnhanced';
 * 
 * // NEW:
 * import { ClientNotificationBell } from '@/components/features/notification';
 * ```
 * 
 * See: components/features/notification/README.md
 * 
 * 🔔 Enhanced Notification Bell - Real-time, Mobile-optimized
 */

// @deprecated - Use ClientNotificationBell from @/components/features/notification instead

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Heart, MessageCircle, UserPlus, Award, X, 
  ShoppingCart, Package, CreditCard, CheckCircle, AlertCircle,
  Settings
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useRealTimeNotifications } from './useRealTimeNotifications';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';

const NOTIFICATION_ICONS = {
  like: { icon: Heart, color: 'text-red-600', bg: 'bg-red-100' },
  comment: { icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  mention: { icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  follow: { icon: UserPlus, color: 'text-green-600', bg: 'bg-green-100' },
  reply: { icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  achievement: { icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  order_confirmed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  order_shipping: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
  order_delivered: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  order_cancelled: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  payment_success: { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100' },
  payment_failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  promo: { icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  system: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100' }
};

export default function NotificationBellEnhanced({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [readingIds, setReadingIds] = useState(new Set());
  const navigate = useNavigate();
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    requestPermission,
    hasNotificationPermission
  } = useRealTimeNotifications(currentUser?.email, {
    enabled: !!currentUser,
    isAdmin: false,
    refetchInterval: 10000 // 10s
  });

  const handleNotificationClick = async (notification) => {
    // ✅ 1. OPTIMISTIC UI - Mark as "reading" immediately
    if (!notification.is_read) {
      setReadingIds(prev => new Set(prev).add(notification.id));
      
      // ✅ 2. Mark as read (async, no await)
      markAsRead(notification.id).then(() => {
        // Show toast feedback
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-xl shadow-2xl z-[9999] animate-slide-up flex items-center gap-2';
        toast.innerHTML = `<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg> <span class="text-sm font-medium">Đã đánh dấu đã đọc</span>`;
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

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      alert('✅ Bạn sẽ nhận thông báo ngay cả khi không mở trang!');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full bg-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center active:scale-95"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center animate-pulse"
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
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed sm:absolute right-0 sm:right-auto sm:top-12 bottom-0 sm:bottom-auto w-full sm:w-[400px] bg-white sm:rounded-2xl shadow-2xl z-50 flex flex-col max-h-[80vh] sm:max-h-[600px]"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Thông báo</h3>
                  <p className="text-xs text-gray-500">
                    {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Đã đọc tất cả'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#7CB342] hover:text-[#FF9800] font-medium px-3 py-1 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Đọc tất cả
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Browser Notification Permission */}
              {!hasNotificationPermission && (
                <div className="p-3 bg-yellow-50 border-b border-yellow-100 flex-shrink-0">
                  <button
                    onClick={handleRequestPermission}
                    className="w-full flex items-center gap-2 text-xs text-yellow-800 hover:text-yellow-900"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="flex-1 text-left">
                      Bật thông báo trình duyệt để không bỏ lỡ
                    </span>
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-3 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Đang tải...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Chưa có thông báo</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Các thông báo quan trọng sẽ xuất hiện tại đây
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => {
                      const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system;
                      const Icon = config.icon;
                      const isReading = readingIds.has(notification.id);

                      return (
                        <motion.button
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ 
                            opacity: isReading ? 0.5 : 1, 
                            x: 0 
                          }}
                          transition={{ duration: 0.3 }}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full p-4 hover:bg-gray-50 active:bg-gray-100 transition-all duration-300 text-left ${
                            !notification.is_read ? 'bg-blue-50' : ''
                          } ${isReading ? 'opacity-50' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                              <Icon className={`w-5 h-5 ${config.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              {notification.title && (
                                <p className={`text-sm mb-1 ${!notification.is_read ? 'font-bold' : 'font-medium'} text-gray-900`}>
                                  {notification.title}
                                </p>
                              )}
                              <p className="text-sm text-gray-700 line-clamp-2">
                                {notification.actor_name && (
                                  <strong>{notification.actor_name} </strong>
                                )}
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(notification.created_date), { 
                                  addSuffix: true, 
                                  locale: vi 
                                })}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-100 text-center flex-shrink-0">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.dispatchEvent(new CustomEvent('open-user-notifications-modal'));
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
}
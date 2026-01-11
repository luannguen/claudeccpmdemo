/**
 * 🔔 Enhanced User Notification Modal - Premium UI with EnhancedModal
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Check, AlertCircle, Package, ShoppingCart, 
  DollarSign, Heart, MessageCircle, TrendingUp,
  CheckCircle, XCircle, Clock, Truck
} from 'lucide-react';
import { useRealTimeNotifications } from './useRealTimeNotifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import EnhancedModal from '../EnhancedModal';
import SearchBar from '../SearchBar';

const NOTIFICATION_ICONS = {
  order_confirmed: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  order_shipping: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  order_delivered: { icon: Package, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  order_cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  payment_success: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  payment_failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  review_response: { icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  like: { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' },
  comment: { icon: MessageCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  promo: { icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  system: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' }
};

export default function NotificationModalEnhanced({ isOpen, onClose, currentUser }) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useRealTimeNotifications(
    currentUser?.email,
    { isAdmin: false, enabled: isOpen }
  );

  // Filter and search notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Apply type filter
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filter === 'order') {
      filtered = filtered.filter(n => 
        ['order_confirmed', 'order_shipping', 'order_delivered', 'order_cancelled', 'payment_success', 'payment_failed'].includes(n.type)
      );
    } else if (filter === 'social') {
      filtered = filtered.filter(n => 
        ['like', 'comment', 'review_response'].includes(n.type)
      );
    }

    // Apply search
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(n =>
        n.title?.toLowerCase().includes(search) ||
        n.message?.toLowerCase().includes(search) ||
        n.metadata?.order_number?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [notifications, filter, searchTerm]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Thông Báo"
      subtitle={`${unreadCount} chưa đọc`}
      icon={Bell}
      maxWidth="2xl"
      persistPosition={true}
      positionKey="user-notifications-modal"
    >
      <div className="flex flex-col h-[70vh]">
        {/* Search & Filters */}
        <div className="border-b border-gray-200 p-4 space-y-3 bg-gray-50">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm thông báo..."
            className="mb-3"
          />

          <div className="flex items-center justify-between mb-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-[#7CB342] hover:text-[#FF9800] font-medium flex items-center gap-1 transition-colors"
              >
                <Check className="w-4 h-4" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { value: 'all', label: 'Tất cả', count: notifications.length },
              { value: 'unread', label: 'Chưa đọc', count: unreadCount },
              { value: 'order', label: 'Đơn hàng', count: notifications.filter(n => ['order_confirmed', 'order_shipping', 'order_delivered', 'order_cancelled', 'payment_success'].includes(n.type)).length },
              { value: 'social', label: 'Tương tác', count: notifications.filter(n => ['like', 'comment', 'review_response'].includes(n.type)).length }
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  filter === f.value
                    ? 'bg-[#7CB342] text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800 mb-2">Không có thông báo</h3>
              <p className="text-sm text-gray-600">
                {filter === 'unread' ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo nào'}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification, index) => {
                const config = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.system;
                const Icon = config.icon;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                      notification.is_read 
                        ? 'bg-white border-gray-100 hover:border-gray-200' 
                        : `${config.bg} ${config.border} hover:shadow-lg`
                    }`}
                  >
                    {/* Unread Indicator */}
                    {!notification.is_read && (
                      <div className="absolute top-4 right-4 w-3 h-3 bg-[#FF9800] rounded-full animate-pulse" />
                    )}

                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} border-2 ${config.border}`}>
                        <Icon className={`w-6 h-6 ${config.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-bold mb-1 ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm mb-2 ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.created_date).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>

                        {/* Metadata */}
                        {notification.metadata?.order_number && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-gray-200 text-xs font-mono text-gray-700">
                            <Package className="w-3 h-3" />
                            #{notification.metadata.order_number}
                          </div>
                        )}
                        {notification.metadata?.amount && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-green-50 rounded-lg border border-green-200 text-xs font-bold text-green-700">
                            <DollarSign className="w-3 h-3" />
                            {notification.metadata.amount.toLocaleString('vi-VN')}đ
                          </div>
                        )}
                      </div>

                      {/* Mark as read button */}
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border-2 border-gray-200 hover:border-[#7CB342] hover:bg-green-50 flex items-center justify-center transition-colors group-hover:opacity-100 opacity-0"
                        >
                          <Check className="w-4 h-4 text-[#7CB342]" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-600">
              {searchTerm ? `Tìm thấy ${filteredNotifications.length}` : `Hiển thị ${filteredNotifications.length}`} / {notifications.length} thông báo
            </p>
            <button
              onClick={onClose}
              className="text-[#7CB342] hover:text-[#FF9800] font-medium transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </EnhancedModal>
  );
}
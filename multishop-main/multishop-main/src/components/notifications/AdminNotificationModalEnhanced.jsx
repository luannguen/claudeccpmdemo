/**
 * 👨‍💼 Admin Notification Modal - Kế thừa EnhancedModal
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Bell, Package, Users, Star, AlertCircle, DollarSign,
  ShoppingCart, TrendingDown, AlertTriangle, CreditCard,
  Trash2, Filter, Clock, ExternalLink, MessageSquare
} from 'lucide-react';
import EnhancedModal from '@/components/EnhancedModal';
import { useRealTimeNotifications } from './useRealTimeNotifications';

const NOTIFICATION_CONFIG = {
  new_order: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Đơn mới', category: 'orders' },
  payment_verification_needed: { icon: CreditCard, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Xác minh TT', category: 'orders' },
  payment_received: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', label: 'Đã TT', category: 'orders' },
  payment_failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'TT thất bại', category: 'orders' },
  customer_inquiry: { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Tin nhắn', category: 'messages' },
  low_stock: { icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Sắp hết', category: 'other' },
  out_of_stock: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', label: 'Hết hàng', category: 'other' },
  new_customer: { icon: Users, color: 'text-green-600', bg: 'bg-green-100', label: 'KH mới', category: 'other' },
  new_review: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Đánh giá', category: 'other' },
  order_status_change: { icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Đơn hàng', category: 'orders' },
  system_alert: { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Hệ thống', category: 'other' }
};

const PRIORITY_STYLES = {
  urgent: { border: 'border-l-4 border-red-500', bg: 'bg-red-50' },
  high: { border: 'border-l-4 border-orange-500', bg: 'bg-orange-50' },
  normal: { border: 'border-l-4 border-blue-500', bg: '' },
  low: { border: 'border-l-4 border-gray-300', bg: '' }
};

export default function AdminNotificationModalEnhanced({ isOpen, onClose, currentUser }) {
  const [activeTab, setActiveTab] = useState('all'); // all, orders, messages, other
  const [filter, setFilter] = useState('all'); // all, unread, priority
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  } = useRealTimeNotifications(currentUser?.email, {
    enabled: !!currentUser && isOpen,
    isAdmin: true,
    maxNotifications: 200
  });

  // Filter & Sort
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    // Tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(n => {
        const config = NOTIFICATION_CONFIG[n.type];
        return config?.category === activeTab;
      });
    }

    if (filter === 'unread') filtered = filtered.filter(n => !n.is_read);
    if (filter === 'priority') filtered = filtered.filter(n => ['high', 'urgent'].includes(n.priority));
    if (typeFilter !== 'all') filtered = filtered.filter(n => n.type === typeFilter);

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_date).getTime();
      const dateB = new Date(b.created_date).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [notifications, activeTab, filter, typeFilter, sortBy]);

  const urgentCount = notifications.filter(n => !n.is_read && n.priority === 'urgent').length;
  
  const tabCounts = useMemo(() => ({
    all: notifications.length,
    orders: notifications.filter(n => NOTIFICATION_CONFIG[n.type]?.category === 'orders').length,
    messages: notifications.filter(n => NOTIFICATION_CONFIG[n.type]?.category === 'messages').length,
    other: notifications.filter(n => NOTIFICATION_CONFIG[n.type]?.category === 'other').length
  }), [notifications]);

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    if (notification.link) {
      onClose();
      window.location.href = notification.link;
    }
  };

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Thông Báo Admin"
      size="large"
    >
      <div className="flex flex-col h-[75vh]">
        {/* Tabs */}
        <div className="border-b border-gray-200 flex-shrink-0">
          <div className="flex gap-2 px-4 pt-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === 'all' ? 'text-[#7CB342]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tất cả ({tabCounts.all})
              {activeTab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7CB342]" />}
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === 'orders' ? 'text-[#7CB342]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đơn hàng ({tabCounts.orders})
              {activeTab === 'orders' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7CB342]" />}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative flex items-center gap-1 ${
                activeTab === 'messages' ? 'text-[#7CB342]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Tin nhắn ({tabCounts.messages})
              {activeTab === 'messages' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7CB342]" />}
            </button>
            <button
              onClick={() => setActiveTab('other')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === 'other' ? 'text-[#7CB342]' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Khác ({tabCounts.other})
              {activeTab === 'other' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7CB342]" />}
            </button>
          </div>
        </div>

        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className={`w-5 h-5 ${urgentCount > 0 ? 'text-red-500 animate-bounce' : 'text-[#7CB342]'}`} />
              <span className="text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount} chưa đọc` : 'Đã đọc tất cả'}
                {urgentCount > 0 && <span className="text-red-600 font-bold ml-1">• {urgentCount} khẩn</span>}
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-[#7CB342] hover:text-[#FF9800] font-medium"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Filters Row 1 */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Chưa đọc
            </button>
            <button
              onClick={() => setFilter('priority')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'priority' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Ưu tiên
            </button>
          </div>

          {/* Filters Row 2 */}
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7CB342]"
            >
              <option value="all">Tất cả loại</option>
              <option value="new_order">Đơn mới</option>
              <option value="payment_verification_needed">Xác minh TT</option>
              <option value="low_stock">Sắp hết hàng</option>
              <option value="new_review">Đánh giá</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7CB342]"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Đang tải thông báo...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium text-lg">Không có thông báo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.system_alert;
                const Icon = config.icon;
                const priorityStyle = PRIORITY_STYLES[notification.priority] || PRIORITY_STYLES.normal;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-xl p-4 border-2 transition-all cursor-pointer ${
                      !notification.is_read ? 'border-blue-200 shadow-md hover:shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    } ${priorityStyle.border} ${priorityStyle.bg}`}
                    onClick={() => handleNotificationClick(notification)}
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
                          <div className="flex items-center gap-2">
                            {notification.priority === 'urgent' && (
                              <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded uppercase">
                                KHẨN
                              </span>
                            )}
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(notification.created_date).toLocaleString('vi-VN')}</span>
                          </div>
                          {notification.requires_action && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-medium rounded">
                              Cần xử lý
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0 text-center">
          <p className="text-xs text-gray-500">
            Hiển thị {filteredNotifications.length} / {notifications.length} thông báo
          </p>
        </div>
      </div>
    </EnhancedModal>
  );
}
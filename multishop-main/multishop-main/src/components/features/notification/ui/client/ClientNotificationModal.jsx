/**
 * Client Notification Modal - v3.1
 * Simple centered modal (no drag/resize)
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import {
  Bell, Package, DollarSign, CheckCircle,
  Truck, XCircle, AlertCircle, Heart, MessageSquare, Star, 
  UserPlus, Clock, ExternalLink, X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useClientNotifications } from '../../hooks';

const NOTIFICATION_CONFIG = {
  // Orders
  order_confirmed: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', category: 'orders' },
  order_shipping: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100', category: 'orders' },
  order_delivered: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-100', category: 'orders' },
  order_cancelled: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', category: 'orders' },
  order_chat: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100', category: 'orders' },
  
  // Payment
  payment_success: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', category: 'orders' },
  payment_failed: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100', category: 'orders' },
  
  // Social / Community
  like: { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100', category: 'social' },
  comment: { icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-100', category: 'social' },
  mention: { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100', category: 'social' },
  follow: { icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-100', category: 'social' },
  reply: { icon: MessageSquare, color: 'text-cyan-600', bg: 'bg-cyan-100', category: 'social' },
  
  // E-Card / Messages
  new_message: { icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-100', category: 'messages' },
  gift: { icon: Heart, color: 'text-pink-600', bg: 'bg-pink-100', category: 'messages' },
  new_connection: { icon: UserPlus, color: 'text-indigo-600', bg: 'bg-indigo-100', category: 'messages' },
  
  // Achievements & Promos
  achievement: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100', category: 'other' },
  promo: { icon: Star, color: 'text-orange-600', bg: 'bg-orange-100', category: 'other' },
  
  // Pre-order / Harvest
  harvest_reminder: { icon: Package, color: 'text-green-600', bg: 'bg-green-100', category: 'orders' },
  harvest_ready: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', category: 'orders' },
  deposit_reminder: { icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-100', category: 'orders' },
  final_payment_reminder: { icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-100', category: 'orders' },
  preorder_update: { icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', category: 'orders' },
  
  // Referral
  referral_welcome: { icon: Star, color: 'text-green-600', bg: 'bg-green-100', category: 'referral' },
  referral_commission_earned: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', category: 'referral' },
  referral_commission_paid: { icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', category: 'referral' },
  referral_rank_up: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100', category: 'referral' },
  referral_status_update: { icon: Bell, color: 'text-blue-600', bg: 'bg-blue-100', category: 'referral' },
  
  // System
  system: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100', category: 'other' },
  default: { icon: Bell, color: 'text-gray-600', bg: 'bg-gray-100', category: 'other' }
};

const CONNECTION_NOTIFICATION_TYPES = ['new_message', 'gift', 'new_connection'];

const TABS = [
  { key: 'all', label: 'Tất cả', icon: Bell },
  { key: 'unread', label: 'Chưa đọc', icon: AlertCircle },
  { key: 'orders', label: 'Đơn hàng', icon: Package },
  { key: 'messages', label: 'Tin nhắn', icon: MessageSquare },
  { key: 'social', label: 'Cộng đồng', icon: Heart },
  { key: 'referral', label: 'Giới thiệu', icon: Star }
];

export function ClientNotificationModal({ isOpen, onClose, currentUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead
  } = useClientNotifications(currentUser?.email, {
    enabled: !!currentUser && isOpen
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const categoryCounts = useMemo(() => {
    const counts = { all: notifications.length, unread: 0, orders: 0, messages: 0, social: 0, referral: 0 };
    notifications.forEach(n => {
      if (!n.is_read) counts.unread++;
      const config = NOTIFICATION_CONFIG[n.type] || NOTIFICATION_CONFIG.default;
      if (config.category) counts[config.category] = (counts[config.category] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications];

    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (['orders', 'social', 'messages', 'referral'].includes(activeTab)) {
      filtered = filtered.filter(n => {
        const nConfig = NOTIFICATION_CONFIG[n.type] || NOTIFICATION_CONFIG.default;
        return nConfig.category === activeTab;
      });
    }

    return filtered.sort((a, b) => 
      new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
    );
  }, [notifications, activeTab]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    if (CONNECTION_NOTIFICATION_TYPES.includes(notification.type)) {
      onClose();
      const connectionId = notification.metadata?.connection_id;
      const targetUserId = notification.metadata?.sender_user_id || notification.metadata?.target_user_id;
      const modalTab = notification.type === 'new_message' ? 'chat' : 'info';
      
      // Navigate with state so MyEcard can open modal when it mounts
      navigate('/MyEcard?tab=connections', {
        state: {
          openConnectionDetail: true,
          connectionId,
          targetUserId,
          modalTab,
          notificationType: notification.type
        }
      });
      return;
    }

    if (notification.link) {
      onClose();
      const invalidLinks = ['my-ecard', 'My-Ecard', 'myecard'];
      const isInvalidLink = invalidLinks.some(invalid => 
        notification.link.toLowerCase().includes(invalid.toLowerCase())
      );
      
      if (isInvalidLink) {
        navigate('/MyEcard?tab=connections');
        return;
      }
      
      if (notification.link.startsWith('/')) {
        navigate(notification.link);
      } else {
        window.location.href = notification.link;
      }
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Thông Báo</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Stats & Tabs */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#7CB342]/5 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7CB342]/10 flex items-center justify-center">
                <Icon.Bell className="w-5 h-5 text-[#7CB342]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Đã đọc tất cả'}
                </h3>
                <p className="text-xs text-gray-500">
                  Tổng: {notifications.length} thông báo
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-[#7CB342] border-[#7CB342] hover:bg-[#7CB342] hover:text-white"
              >
                <Icon.CheckCircle className="w-4 h-4 mr-1" />
                Đọc tất cả
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {TABS.map((tab) => {
              const count = categoryCounts[tab.key] || 0;
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.key;
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#7CB342] text-white shadow-lg shadow-[#7CB342]/30'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {count > 0 && (
                    <Badge 
                      variant="secondary" 
                      className={`ml-1 px-1.5 py-0.5 text-xs font-bold ${
                        isActive ? 'bg-white/30 text-white' : 'bg-[#7CB342]/10 text-[#7CB342]'
                      }`}
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {isLoading ? (
            <div className="text-center py-16">
              <Icon.Spinner className="w-10 h-10 text-[#7CB342] mx-auto mb-4" />
              <p className="text-gray-500">Đang tải thông báo...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium mb-2">Chưa có thông báo</p>
              <p className="text-sm text-gray-400">
                {activeTab !== 'all' ? 'Thử chọn tab khác' : 'Các thông báo mới sẽ hiển thị ở đây'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => {
                const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.default;
                const IconComp = config.icon;
                const isConnectionType = CONNECTION_NOTIFICATION_TYPES.includes(notification.type);

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                      !notification.is_read 
                        ? 'bg-white border-[#7CB342]/30 shadow-md hover:shadow-lg hover:border-[#7CB342]' 
                        : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} group-hover:scale-110 transition-transform`}>
                        <IconComp className={`w-6 h-6 ${config.color}`} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className={`text-sm ${!notification.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="w-3 h-3 bg-[#7CB342] rounded-full flex-shrink-0 mt-1 animate-pulse" />
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(notification.created_date)}</span>
                          </div>
                          <span className="text-xs text-[#7CB342] flex items-center gap-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            {isConnectionType ? 'Xem tin nhắn' : 'Xem chi tiết'}
                            {isConnectionType ? <MessageSquare className="w-3 h-3" /> : <ExternalLink className="w-3 h-3" />}
                          </span>
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
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Hiển thị {filteredNotifications.length} / {notifications.length} thông báo
            </p>
            <Button variant="ghost" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ClientNotificationModal;
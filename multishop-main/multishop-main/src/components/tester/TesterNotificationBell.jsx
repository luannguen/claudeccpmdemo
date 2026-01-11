/**
 * TesterNotificationBell - Bell thông báo cho Tester
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, RefreshCw, MessageSquare, UserPlus, Clock, ExternalLink } from "lucide-react";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

const typeIcons = {
  ready_for_retest: RefreshCw,
  dev_response: MessageSquare,
  feature_assigned: UserPlus,
  test_case_assigned: UserPlus,
  deadline_reminder: Clock,
  version_updated: RefreshCw
};

const typeColors = {
  ready_for_retest: 'bg-blue-500',
  dev_response: 'bg-green-500',
  feature_assigned: 'bg-purple-500',
  test_case_assigned: 'bg-violet-500',
  deadline_reminder: 'bg-orange-500',
  version_updated: 'bg-cyan-500'
};

function NotificationItem({ notification, onMarkAsRead, onNavigate }) {
  const Icon = typeIcons[notification.type] || Bell;
  const colorClass = typeColors[notification.type] || 'bg-gray-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 border-b last:border-0 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.is_read ? 'bg-blue-50/50' : ''
      }`}
      onClick={() => {
        if (!notification.is_read) onMarkAsRead(notification.id);
        if (notification.feature_id) onNavigate(notification.feature_id, notification.test_case_id);
      }}
    >
      <div className="flex gap-3">
        <div className={`w-8 h-8 ${colorClass} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm ${!notification.is_read ? 'font-semibold' : 'font-medium'} text-gray-900`}>
              {notification.title}
            </p>
            {!notification.is_read && (
              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true, locale: vi })}
            </span>
            {notification.feature_name && (
              <Badge variant="outline" className="text-xs">
                {notification.feature_name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TesterNotificationBell({ 
  notifications = [], 
  unreadCount = 0, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onNavigateToFeature 
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (featureId, testCaseId) => {
    setIsOpen(false);
    if (onNavigateToFeature) {
      onNavigateToFeature(featureId, testCaseId);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Icon.Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-violet-600" />
                  <h3 className="font-semibold text-gray-900">Thông báo</h3>
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white">{unreadCount} mới</Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onMarkAllAsRead?.()}
                      className="text-xs"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Đọc tất cả
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="max-h-[400px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Chưa có thông báo nào</p>
                  </div>
                ) : (
                  notifications.map(notification => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onNavigate={handleNavigate}
                    />
                  ))
                )}
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
/**
 * Notification Item Component
 * Reusable notification card
 */

import React from 'react';
import { motion } from 'framer-motion';
import { NotificationTypeConfig } from '../../types';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const ICON_MAP = {
  CheckCircle: Icon.CheckCircle,
  Package: Icon.Package,
  CreditCard: Icon.CreditCard,
  ShoppingCart: Icon.ShoppingCart,
  TrendingDown: Icon.TrendingDown,
  AlertCircle: Icon.AlertCircle,
  AlertTriangle: Icon.AlertTriangle,
  Store: Icon.Store,
  DollarSign: Icon.DollarSign,
  Heart: Icon.Heart,
  MessageCircle: Icon.MessageCircle,
  UserPlus: Icon.UserPlus,
  Award: Icon.Award,
  Bell: Icon.Bell
};

const COLOR_MAP = {
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-600' }
};

const PRIORITY_BORDERS = {
  urgent: 'border-l-4 border-red-500 bg-red-50',
  high: 'border-l-4 border-orange-500 bg-orange-50',
  normal: 'border-l-4 border-blue-500',
  low: 'border-l-4 border-gray-300'
};

export function NotificationItem({ notification, onClick, isReading = false }) {
  const config = NotificationTypeConfig[notification.type] || {
    icon: 'Bell',
    color: 'gray'
  };
  
  const IconComponent = ICON_MAP[config.icon] || Icon.Bell;
  const colors = COLOR_MAP[config.color] || COLOR_MAP.gray;
  const priorityClass = PRIORITY_BORDERS[notification.priority] || '';

  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ 
        opacity: isReading ? 0.5 : 1, 
        x: 0,
        scale: isReading ? 0.98 : 1
      }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(notification)}
      className={`w-full p-4 border-b border-gray-50 hover:bg-gray-50 active:bg-gray-100 transition-all duration-300 text-left ${
        !notification.is_read ? 'bg-blue-50' : ''
      } ${priorityClass}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colors.bg}`}>
          <IconComponent className={`w-5 h-5 ${colors.text}`} />
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
            {notification.actor_name && (
              <strong>{notification.actor_name} </strong>
            )}
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">
              {formatDistanceToNow(new Date(notification.created_date), { 
                addSuffix: true, 
                locale: vi 
              })}
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
}

export default NotificationItem;
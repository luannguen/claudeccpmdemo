/**
 * PreOrderNotificationScheduler - UI hiển thị và quản lý notification timeline
 * Module 3: Automated Notification Timeline
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Clock, Mail, MessageSquare, Calendar,
  CheckCircle2, AlertTriangle, Wallet, Truck, Leaf
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';

// Notification types for preorder
export const NOTIFICATION_TYPES = {
  DEPOSIT_REMINDER_3D: {
    key: 'deposit_reminder_3d',
    label: 'Nhắc cọc (3 ngày)',
    icon: Wallet,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    triggerDays: -3, // 3 days before deadline
    channels: ['email', 'push', 'sms']
  },
  DEPOSIT_REMINDER_1D: {
    key: 'deposit_reminder_1d',
    label: 'Nhắc cọc (1 ngày)',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    triggerDays: -1,
    channels: ['email', 'push', 'sms']
  },
  PRODUCTION_UPDATE: {
    key: 'production_update',
    label: 'Cập nhật chăm sóc',
    icon: Leaf,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    triggerDays: null, // Manual trigger
    channels: ['email', 'push']
  },
  HARVEST_UPCOMING_7D: {
    key: 'harvest_upcoming_7d',
    label: 'Sắp thu hoạch (7 ngày)',
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    triggerDays: -7, // 7 days before harvest
    channels: ['email', 'push']
  },
  HARVEST_READY: {
    key: 'harvest_ready',
    label: 'Sẵn sàng thu hoạch',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    triggerDays: 0,
    channels: ['email', 'push', 'sms']
  },
  DELAY_ALERT: {
    key: 'delay_alert',
    label: 'Thông báo chậm trễ',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    triggerDays: null,
    channels: ['email', 'push', 'sms']
  },
  SHIPPING_UPDATE: {
    key: 'shipping_update',
    label: 'Cập nhật vận chuyển',
    icon: Truck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    triggerDays: null,
    channels: ['email', 'push']
  },
  REMAINING_PAYMENT: {
    key: 'remaining_payment',
    label: 'Nhắc thanh toán còn lại',
    icon: Wallet,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    triggerDays: null,
    channels: ['email', 'push', 'sms']
  }
};

function NotificationTimelineItem({ 
  notification, 
  isCompleted, 
  isPending, 
  scheduledDate,
  sentDate 
}) {
  const { label, icon: Icon, color, bgColor } = notification;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-start gap-4 p-4 rounded-xl border ${
        isCompleted ? 'bg-gray-50 border-gray-200' :
        isPending ? `${bgColor} border-${color.replace('text-', '')}/30` :
        'bg-white border-gray-100'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isCompleted ? 'bg-gray-200' : bgColor
      }`}>
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-gray-500" />
        ) : (
          <Icon className={`w-5 h-5 ${color}`} />
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
            {label}
          </p>
          {isPending && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
              Sắp gửi
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mt-1">
          {isCompleted && sentDate 
            ? `Đã gửi: ${format(new Date(sentDate), 'HH:mm dd/MM', { locale: vi })}`
            : scheduledDate 
              ? `Dự kiến: ${format(new Date(scheduledDate), 'dd/MM/yyyy', { locale: vi })}`
              : 'Khi có sự kiện'
          }
        </p>

        {/* Channels */}
        <div className="flex gap-2 mt-2">
          {notification.channels.map(channel => (
            <span 
              key={channel}
              className={`px-2 py-0.5 text-xs rounded-full ${
                isCompleted ? 'bg-gray-100 text-gray-500' : 'bg-white text-gray-600 border'
              }`}
            >
              {channel === 'email' ? '📧 Email' : 
               channel === 'push' ? '🔔 Push' : '📱 SMS'}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function PreOrderNotificationScheduler({
  orderCreatedDate,
  depositDeadline,
  estimatedHarvestDate,
  sentNotifications = [], // Array of { type, sent_at }
  variant = 'default', // default, compact
  className = ''
}) {
  const today = new Date();
  const harvestDate = estimatedHarvestDate ? new Date(estimatedHarvestDate) : null;
  const daysToHarvest = harvestDate ? differenceInDays(harvestDate, today) : null;

  // Build notification timeline
  const buildTimeline = () => {
    const timeline = [];

    // Deposit reminders
    if (depositDeadline) {
      const deadline = new Date(depositDeadline);
      timeline.push({
        ...NOTIFICATION_TYPES.DEPOSIT_REMINDER_3D,
        scheduledDate: addDays(deadline, -3),
        isCompleted: sentNotifications.some(n => n.type === 'deposit_reminder_3d')
      });
      timeline.push({
        ...NOTIFICATION_TYPES.DEPOSIT_REMINDER_1D,
        scheduledDate: addDays(deadline, -1),
        isCompleted: sentNotifications.some(n => n.type === 'deposit_reminder_1d')
      });
    }

    // Harvest notifications
    if (harvestDate) {
      timeline.push({
        ...NOTIFICATION_TYPES.HARVEST_UPCOMING_7D,
        scheduledDate: addDays(harvestDate, -7),
        isCompleted: sentNotifications.some(n => n.type === 'harvest_upcoming_7d'),
        isPending: daysToHarvest <= 10 && daysToHarvest > 7
      });
      timeline.push({
        ...NOTIFICATION_TYPES.HARVEST_READY,
        scheduledDate: harvestDate,
        isCompleted: sentNotifications.some(n => n.type === 'harvest_ready'),
        isPending: daysToHarvest <= 3 && daysToHarvest >= 0
      });
    }

    // Sort by scheduled date
    return timeline.sort((a, b) => {
      if (!a.scheduledDate) return 1;
      if (!b.scheduledDate) return -1;
      return new Date(a.scheduledDate) - new Date(b.scheduledDate);
    });
  };

  const timeline = buildTimeline();
  const completedCount = timeline.filter(n => n.isCompleted).length;

  if (variant === 'compact') {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <Bell className="w-5 h-5 text-[#7CB342]" />
          <h3 className="font-semibold text-gray-800">Thông báo tự động</h3>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
            {completedCount}/{timeline.length}
          </span>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {timeline.slice(0, 4).map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs ${
                  item.isCompleted ? 'bg-gray-100 text-gray-500' :
                  item.isPending ? `${item.bgColor} ${item.color}` :
                  'bg-gray-50 text-gray-600'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white border-2 border-gray-100 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#7CB342]/10 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-[#7CB342]" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Lịch thông báo tự động</h3>
            <p className="text-sm text-gray-500">
              Bạn sẽ nhận thông báo về tiến độ đơn hàng
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-2xl font-bold text-[#7CB342]">{completedCount}</p>
          <p className="text-xs text-gray-500">/{timeline.length} đã gửi</p>
        </div>
      </div>

      <div className="space-y-3">
        {timeline.map((item, index) => {
          const sentData = sentNotifications.find(n => n.type === item.key);
          return (
            <NotificationTimelineItem
              key={index}
              notification={item}
              isCompleted={item.isCompleted}
              isPending={item.isPending}
              scheduledDate={item.scheduledDate}
              sentDate={sentData?.sent_at}
            />
          );
        })}

        {/* Manual notifications info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>
              Ngoài ra, bạn sẽ nhận thông báo khi có cập nhật về chăm sóc, 
              vận chuyển hoặc thay đổi lịch trình.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
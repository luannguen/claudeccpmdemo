/**
 * NotificationPreferences - UI cho khách hàng tùy chỉnh thông báo preorder
 * Module 3: Automated Notification Timeline
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Mail, MessageSquare, Smartphone, 
  Check, X, Settings, ChevronDown, ChevronUp
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const DEFAULT_PREFERENCES = {
  email: true,
  push: true,
  sms: false,
  notification_types: {
    deposit_reminder: true,
    production_update: true,
    harvest_alert: true,
    shipping_update: true,
    delay_alert: true,
    price_change: true
  }
};

const NOTIFICATION_CATEGORIES = [
  {
    key: 'deposit_reminder',
    label: 'Nhắc thanh toán cọc',
    description: 'Nhận nhắc nhở trước hạn thanh toán cọc',
    icon: '💰'
  },
  {
    key: 'production_update',
    label: 'Cập nhật chăm sóc',
    description: 'Thông tin về quá trình nuôi trồng sản phẩm',
    icon: '🌱'
  },
  {
    key: 'harvest_alert',
    label: 'Thông báo thu hoạch',
    description: 'Khi sản phẩm sẵn sàng và bắt đầu giao hàng',
    icon: '🌾'
  },
  {
    key: 'shipping_update',
    label: 'Cập nhật vận chuyển',
    description: 'Theo dõi trạng thái giao hàng',
    icon: '🚚'
  },
  {
    key: 'delay_alert',
    label: 'Cảnh báo chậm trễ',
    description: 'Thông báo khi có thay đổi lịch trình',
    icon: '⚠️'
  },
  {
    key: 'price_change',
    label: 'Biến động giá',
    description: 'Khi giá sản phẩm quan tâm tăng/giảm',
    icon: '📈'
  }
];

const CHANNELS = [
  { key: 'email', label: 'Email', icon: Mail, description: 'Nhận qua email đã đăng ký' },
  { key: 'push', label: 'Đẩy (Push)', icon: Bell, description: 'Thông báo trên trình duyệt/app' },
  { key: 'sms', label: 'SMS', icon: Smartphone, description: 'Tin nhắn điện thoại' }
];

export default function NotificationPreferences({
  initialPreferences,
  onSave,
  lotId,
  variant = 'default', // default, compact, modal
  className = ''
}) {
  const [preferences, setPreferences] = useState(
    initialPreferences || DEFAULT_PREFERENCES
  );
  const [isExpanded, setIsExpanded] = useState(variant !== 'compact');
  const [hasChanges, setHasChanges] = useState(false);

  // Load from localStorage if no initial
  useEffect(() => {
    if (!initialPreferences && lotId) {
      const saved = localStorage.getItem(`preorder-notif-prefs-${lotId}`);
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
    }
  }, [initialPreferences, lotId]);

  const handleChannelToggle = (channel) => {
    setPreferences(prev => ({
      ...prev,
      [channel]: !prev[channel]
    }));
    setHasChanges(true);
  };

  const handleTypeToggle = (type) => {
    setPreferences(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: !prev.notification_types[type]
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save to localStorage
    if (lotId) {
      localStorage.setItem(`preorder-notif-prefs-${lotId}`, JSON.stringify(preferences));
    }
    onSave?.(preferences);
    setHasChanges(false);
  };

  const enabledChannels = CHANNELS.filter(c => preferences[c.key]).length;
  const enabledTypes = Object.values(preferences.notification_types).filter(Boolean).length;

  if (variant === 'compact') {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-500" />
            <div className="text-left">
              <p className="font-medium text-gray-800">Cài đặt thông báo</p>
              <p className="text-xs text-gray-500">
                {enabledChannels} kênh • {enabledTypes} loại thông báo
              </p>
            </div>
          </div>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-4 pb-4 border-t"
          >
            {/* Quick toggles */}
            <div className="py-3 space-y-3">
              {CHANNELS.map(channel => {
                const Icon = channel.icon;
                return (
                  <div key={channel.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{channel.label}</span>
                    </div>
                    <Switch
                      checked={preferences[channel.key]}
                      onCheckedChange={() => handleChannelToggle(channel.key)}
                    />
                  </div>
                );
              })}
            </div>

            {hasChanges && (
              <Button onClick={handleSave} className="w-full mt-2 bg-[#7CB342] hover:bg-[#558B2F]">
                Lưu thay đổi
              </Button>
            )}
          </motion.div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white border-2 border-gray-100 rounded-2xl p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#7CB342]/10 rounded-xl flex items-center justify-center">
          <Bell className="w-5 h-5 text-[#7CB342]" />
        </div>
        <div>
          <h3 className="font-bold text-gray-800">Tùy chọn thông báo</h3>
          <p className="text-sm text-gray-500">Chọn cách bạn muốn nhận thông báo</p>
        </div>
      </div>

      {/* Channels */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Kênh nhận thông báo</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CHANNELS.map(channel => {
            const Icon = channel.icon;
            const isEnabled = preferences[channel.key];
            
            return (
              <button
                key={channel.key}
                onClick={() => handleChannelToggle(channel.key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  isEnabled 
                    ? 'border-[#7CB342] bg-[#7CB342]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${isEnabled ? 'text-[#7CB342]' : 'text-gray-400'}`} />
                  {isEnabled ? (
                    <Check className="w-5 h-5 text-[#7CB342]" />
                  ) : (
                    <X className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <p className={`font-medium ${isEnabled ? 'text-gray-800' : 'text-gray-500'}`}>
                  {channel.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification types */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Loại thông báo</h4>
        <div className="space-y-2">
          {NOTIFICATION_CATEGORIES.map(category => {
            const isEnabled = preferences.notification_types[category.key];
            
            return (
              <div
                key={category.key}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{category.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">{category.label}</p>
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => handleTypeToggle(category.key)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Save button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button onClick={handleSave} className="w-full bg-[#7CB342] hover:bg-[#558B2F]">
            <Check className="w-4 h-4 mr-2" />
            Lưu cài đặt thông báo
          </Button>
        </motion.div>
      )}
    </div>
  );
}
/**
 * NotificationPreferencePanel - UI for managing notification preferences
 * NOTIF-F06: Smart Notification Batching & Digest
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useNotificationPreference } from '../hooks/useNotificationPreference';
import { Bell, Clock, Mail, Smartphone, ShoppingCart, CreditCard, Users, Gift, Star, MessageCircle, Megaphone, Settings } from 'lucide-react';

const FREQUENCY_OPTIONS = [
  { value: 'realtime', label: 'Realtime (Ngay lập tức)', icon: '⚡' },
  { value: 'hourly', label: 'Mỗi giờ', icon: '⏰' },
  { value: 'daily', label: 'Hàng ngày', icon: '📅' },
  { value: 'weekly', label: 'Hàng tuần', icon: '📆' }
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: `${String(i).padStart(2, '0')}:00`,
  label: `${String(i).padStart(2, '0')}:00`
}));

const DAY_OPTIONS = [
  { value: 0, label: 'Chủ nhật' },
  { value: 1, label: 'Thứ 2' },
  { value: 2, label: 'Thứ 3' },
  { value: 3, label: 'Thứ 4' },
  { value: 4, label: 'Thứ 5' },
  { value: 5, label: 'Thứ 6' },
  { value: 6, label: 'Thứ 7' }
];

const CHANNEL_OPTIONS = [
  { value: 'realtime', label: 'Ngay lập tức' },
  { value: 'digest', label: 'Gộp vào digest' },
  { value: 'off', label: 'Tắt' }
];

const CHANNELS = [
  { key: 'orders', label: 'Đơn hàng', icon: ShoppingCart, description: 'Cập nhật trạng thái đơn hàng' },
  { key: 'payments', label: 'Thanh toán', icon: CreditCard, description: 'Xác nhận thanh toán, hoàn tiền' },
  { key: 'social', label: 'Kết nối', icon: Users, description: 'Kết nối mới, tin nhắn' },
  { key: 'gifts', label: 'Quà tặng', icon: Gift, description: 'Nhận quà, đổi quà' },
  { key: 'reviews', label: 'Đánh giá', icon: Star, description: 'Đánh giá mới, phản hồi' },
  { key: 'community', label: 'Cộng đồng', icon: MessageCircle, description: 'Comment, like, follow' },
  { key: 'system', label: 'Hệ thống', icon: Settings, description: 'Thông báo hệ thống, nhắc nhở' }
];

export default function NotificationPreferencePanel({ className = '' }) {
  const {
    preference,
    isLoading,
    isSaving,
    updateField,
    updateChannelPreference
  } = useNotificationPreference();

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Icon.Spinner size={24} className="text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-100">
          <Bell className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Cài đặt thông báo</h3>
          <p className="text-sm text-gray-500">Tùy chỉnh cách nhận thông báo</p>
        </div>
        {isSaving && (
          <Badge className="ml-auto bg-blue-100 text-blue-700">
            <Icon.Spinner size={12} className="mr-1" /> Đang lưu...
          </Badge>
        )}
      </div>

      {/* Digest Toggle */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">📬 Gộp thông báo (Digest)</CardTitle>
              <CardDescription>
                Gộp nhiều thông báo thành 1 email/push tóm tắt
              </CardDescription>
            </div>
            <Switch
              checked={preference.digest_enabled}
              onCheckedChange={(v) => updateField('digest_enabled', v)}
            />
          </div>
        </CardHeader>

        {preference.digest_enabled && (
          <CardContent className="space-y-4">
            {/* Frequency */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Tần suất</Label>
                <Select
                  value={preference.digest_frequency}
                  onValueChange={(v) => updateField('digest_frequency', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.icon} {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time (for daily/weekly) */}
              {['daily', 'weekly'].includes(preference.digest_frequency) && (
                <div>
                  <Label className="text-sm text-gray-600 mb-2 block">Giờ nhận</Label>
                  <Select
                    value={preference.digest_time}
                    onValueChange={(v) => updateField('digest_time', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Day (for weekly) */}
            {preference.digest_frequency === 'weekly' && (
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">Ngày nhận</Label>
                <Select
                  value={String(preference.digest_day)}
                  onValueChange={(v) => updateField('digest_day', Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Delivery methods */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={preference.email_digest}
                  onCheckedChange={(v) => updateField('email_digest', v)}
                  id="email-digest"
                />
                <Label htmlFor="email-digest" className="flex items-center gap-1 cursor-pointer">
                  <Mail className="w-4 h-4" /> Email
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={preference.push_digest}
                  onCheckedChange={(v) => updateField('push_digest', v)}
                  id="push-digest"
                />
                <Label htmlFor="push-digest" className="flex items-center gap-1 cursor-pointer">
                  <Smartphone className="w-4 h-4" /> Push
                </Label>
              </div>
            </div>

            {/* Critical bypass */}
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-amber-800">⚡ Thông báo quan trọng</p>
                <p className="text-xs text-amber-600">Luôn gửi ngay (thanh toán lỗi, bảo mật...)</p>
              </div>
              <Switch
                checked={preference.critical_bypass}
                onCheckedChange={(v) => updateField('critical_bypass', v)}
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Channel Preferences */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📢 Cài đặt theo loại</CardTitle>
          <CardDescription>
            Chọn cách nhận thông báo cho từng loại
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {CHANNELS.map(channel => {
            const IconComp = channel.icon;
            const currentValue = preference.channel_preferences?.[channel.key] || 'digest';
            
            return (
              <div 
                key={channel.key}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <IconComp className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{channel.label}</p>
                    <p className="text-xs text-gray-500">{channel.description}</p>
                  </div>
                </div>
                <Select
                  value={currentValue}
                  onValueChange={(v) => updateChannelPreference(channel.key, v)}
                >
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CHANNEL_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Info */}
      <div className="p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700">
          <strong>💡 Tip:</strong> Chọn "Gộp vào digest" cho các thông báo không cấp bách 
          để tránh bị làm phiền. Thông báo quan trọng như thanh toán lỗi vẫn sẽ được gửi ngay.
        </p>
      </div>
    </div>
  );
}

export { NotificationPreferencePanel };
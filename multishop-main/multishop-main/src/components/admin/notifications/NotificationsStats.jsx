import React from 'react';
import { Bell, Eye, AlertCircle, CheckCircle } from 'lucide-react';

const STATS_CONFIG = [
  { key: 'total', label: 'Tổng Thông Báo', icon: Bell, borderClass: 'border-blue-200', iconClass: 'text-blue-600', valueClass: 'text-blue-600' },
  { key: 'unread', label: 'Chưa Đọc', icon: Eye, borderClass: 'border-orange-200', iconClass: 'text-orange-600', valueClass: 'text-orange-600' },
  { key: 'urgent', label: 'Khẩn Cấp', icon: AlertCircle, borderClass: 'border-red-200', iconClass: 'text-red-600', valueClass: 'text-red-600' },
  { key: 'requiresAction', label: 'Cần Xử Lý', icon: CheckCircle, borderClass: 'border-purple-200', iconClass: 'text-purple-600', valueClass: 'text-purple-600' }
];

export default function NotificationsStats({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {STATS_CONFIG.map((config) => {
        const Icon = config.icon;
        const value = stats[config.key] || 0;

        return (
          <div key={config.key} className={`bg-white rounded-xl p-6 shadow-lg border-2 ${config.borderClass}`}>
            <div className="flex items-center gap-3">
              <Icon className={`w-10 h-10 ${config.iconClass}`} />
              <div>
                <p className="text-sm text-gray-600">{config.label}</p>
                <p className={`text-3xl font-bold ${config.valueClass}`}>{value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
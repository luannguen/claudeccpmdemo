import React from 'react';
import { Users, CheckCircle, UserMinus, Send, TrendingUp } from 'lucide-react';

const STATS_CONFIG = [
  { key: 'total', label: 'Tổng subscribers', icon: Users, bgClass: 'bg-white border-gray-100', iconClass: 'text-[#7CB342]', valueClass: 'text-[#0F0F0F]' },
  { key: 'active', label: 'Đang hoạt động', icon: CheckCircle, bgClass: 'bg-green-50 border-green-200', iconClass: 'text-green-600', valueClass: 'text-green-600' },
  { key: 'unsubscribed', label: 'Đã hủy', icon: UserMinus, bgClass: 'bg-red-50 border-red-200', iconClass: 'text-red-600', valueClass: 'text-red-600' },
  { key: 'totalSent', label: 'Email đã gửi', icon: Send, bgClass: 'bg-blue-50 border-blue-200', iconClass: 'text-blue-600', valueClass: 'text-blue-600' },
  { key: 'avgOpenRate', label: 'Tỷ lệ mở email', icon: TrendingUp, bgClass: 'bg-purple-50 border-purple-200', iconClass: 'text-purple-600', valueClass: 'text-purple-600', suffix: '%' }
];

export default function NewsletterStats({ stats }) {
  return (
    <div className="grid md:grid-cols-5 gap-4 mb-6">
      {STATS_CONFIG.map((config) => {
        const Icon = config.icon;
        const value = stats[config.key] || 0;

        return (
          <div key={config.key} className={`${config.bgClass} rounded-xl p-4 shadow-lg border`}>
            <Icon className={`w-8 h-8 ${config.iconClass} mb-2`} />
            <p className={`text-2xl font-bold ${config.valueClass}`}>
              {value}{config.suffix || ''}
            </p>
            <p className="text-sm text-gray-600">{config.label}</p>
          </div>
        );
      })}
    </div>
  );
}
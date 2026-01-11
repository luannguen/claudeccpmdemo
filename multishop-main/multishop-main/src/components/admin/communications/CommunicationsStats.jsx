import React from 'react';
import { Mail, MessageSquare, TrendingUp, Users } from 'lucide-react';

const STATS_CONFIG = [
  { key: 'total', label: 'Tổng tin', icon: MessageSquare, bgClass: 'bg-white', iconClass: 'text-blue-600', valueClass: 'text-gray-900' },
  { key: 'email', label: 'Email', icon: Mail, bgClass: 'bg-blue-50', iconClass: 'text-blue-600', valueClass: 'text-blue-600' },
  { key: 'sms', label: 'SMS', icon: MessageSquare, bgClass: 'bg-green-50', iconClass: 'text-green-600', valueClass: 'text-green-600' },
  { key: 'delivered', label: 'Đã nhận', icon: TrendingUp, bgClass: 'bg-purple-50', iconClass: 'text-purple-600', valueClass: 'text-purple-600' },
  { key: 'uniqueCustomers', label: 'Khách hàng', icon: Users, bgClass: 'bg-orange-50', iconClass: 'text-orange-600', valueClass: 'text-orange-600' }
];

export default function CommunicationsStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {STATS_CONFIG.map((config) => {
        const Icon = config.icon;
        const value = stats[config.key] || 0;

        return (
          <div key={config.key} className={`${config.bgClass} rounded-xl p-4 shadow-md`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-5 h-5 ${config.iconClass}`} />
              <p className="text-sm text-gray-600">{config.label}</p>
            </div>
            <p className={`text-2xl font-bold ${config.valueClass}`}>{value}</p>
          </div>
        );
      })}
    </div>
  );
}
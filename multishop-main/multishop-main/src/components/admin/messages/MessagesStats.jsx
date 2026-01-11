import React from 'react';
import { Mail, AlertCircle, Eye, CheckCircle, Star } from 'lucide-react';

const STATS_CONFIG = [
  { key: 'total', label: 'Tổng tin nhắn', icon: Mail, bgClass: 'bg-white border-gray-100', textClass: 'text-gray-500', valueClass: '' },
  { key: 'unread', label: 'Tin mới', icon: AlertCircle, bgClass: 'bg-blue-50 border-blue-200', textClass: 'text-blue-600', valueClass: 'text-blue-600' },
  { key: 'read', label: 'Đã đọc', icon: Eye, bgClass: 'bg-gray-50 border-gray-200', textClass: 'text-gray-600', valueClass: 'text-gray-600' },
  { key: 'answered', label: 'Đã trả lời', icon: CheckCircle, bgClass: 'bg-green-50 border-green-200', textClass: 'text-green-600', valueClass: 'text-green-600', useKey: 'read' },
  { key: 'urgent', label: 'Khẩn cấp', icon: Star, bgClass: 'bg-red-50 border-red-200', textClass: 'text-red-600', valueClass: 'text-red-600' }
];

export default function MessagesStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {STATS_CONFIG.map((config) => {
        const Icon = config.icon;
        const value = stats[config.useKey || config.key] || 0;
        
        return (
          <div key={config.key} className={`${config.bgClass} rounded-xl p-4 shadow-md border-2`}>
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`w-6 h-6 ${config.textClass}`} />
              <p className={`text-sm ${config.textClass}`}>{config.label}</p>
            </div>
            <p className={`text-3xl font-bold ${config.valueClass}`}>{value}</p>
          </div>
        );
      })}
    </div>
  );
}
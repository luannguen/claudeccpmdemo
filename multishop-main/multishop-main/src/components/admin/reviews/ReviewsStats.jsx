import React from 'react';
import { Shield, ImageIcon, Star } from 'lucide-react';

const statItems = [
  { key: 'total', label: 'Tổng' },
  { key: 'approved', label: 'Duyệt', color: 'green' },
  { key: 'pending', label: 'Chờ', color: 'yellow' },
  { key: 'rejected', label: 'Từ chối', color: 'red' },
  { key: 'verified', label: 'Verified', color: 'blue', icon: Shield },
  { key: 'withPhotos', label: 'Photos', color: 'purple', icon: ImageIcon },
  { key: 'avgRating', label: 'TB', color: 'orange', icon: Star, isRating: true },
];

export default function ReviewsStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {statItems.map(({ key, label, color, icon: Icon, isRating }) => (
        <div key={key} className={`rounded-xl p-3 sm:p-4 shadow-lg ${color ? `bg-${color}-50 border border-${color}-200` : 'bg-white border border-gray-100'}`}>
          <p className={`text-xs sm:text-sm mb-1 ${color ? `text-${color}-700` : 'text-gray-600'} flex items-center gap-1`}>
            {Icon && <Icon className="w-3 h-3" />}
            {label}
          </p>
          <p className={`text-xl sm:text-2xl font-bold ${color ? `text-${color}-600` : 'text-[#0F0F0F]'} flex items-center gap-1`}>
            {isRating && <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
            {stats[key]}
          </p>
        </div>
      ))}
    </div>
  );
}
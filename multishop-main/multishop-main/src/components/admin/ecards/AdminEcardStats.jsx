/**
 * AdminEcardStats - Overview stats for admin
 * UI Layer - Presentation only
 * 
 * @module admin/ecards
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { motion } from 'framer-motion';

export default function AdminEcardStats({ stats }) {
  const items = [
    { icon: 'CreditCard', label: 'Tổng E-Card', value: stats.totalProfiles || 0, color: 'blue' },
    { icon: 'CheckCircle', label: 'Đang hoạt động', value: stats.activeProfiles || 0, color: 'green' },
    { icon: 'Users', label: 'Tổng kết nối', value: stats.totalConnections || 0, color: 'purple' },
    { icon: 'Gift', label: 'Tổng quà tặng', value: stats.totalGifts || 0, color: 'amber' },
    { icon: 'Eye', label: 'Lượt xem (30 ngày)', value: stats.totalViews30d || 0, color: 'cyan' },
    { icon: 'TrendingUp', label: 'Tỷ lệ kết nối', value: `${stats.conversionRate || 0}%`, color: 'emerald' }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {items.map((item, idx) => {
        const IconComp = Icon[item.icon];
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[item.color]}`}>
                <IconComp size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{item.label}</p>
                <p className="text-lg font-bold text-gray-900">{item.value.toLocaleString?.() || item.value}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
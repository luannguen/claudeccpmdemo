import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Package, TrendingUp, Users } from 'lucide-react';

const kpiCards = [
  { key: 'totalRevenue', label: 'Tổng Doanh Thu', icon: DollarSign, color: 'green', format: (val) => `${val.toLocaleString('vi-VN')}đ` },
  { key: 'totalOrders', label: 'Tổng Đơn Hàng', icon: Package, color: 'blue', format: (val) => val },
  { key: 'avgOrderValue', label: 'AOV', icon: TrendingUp, color: 'orange', format: (val) => `${Math.round(val).toLocaleString('vi-VN')}đ` },
  { key: 'customerCount', label: 'Khách Hàng', icon: Users, color: 'purple', format: (val) => val },
];

export default function ReportStats({ analytics }) {
  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {kpiCards.map((card, index) => {
        const Icon = card.icon;
        const value = card.key === 'customerCount' ? analytics.topCustomers.length : analytics[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br from-${card.color}-500 to-${card.color}-600 text-white rounded-2xl p-6 shadow-lg`}
          >
            <Icon className="w-8 h-8 mb-3 opacity-80" />
            <p className="text-sm opacity-80 mb-1">{card.label}</p>
            <p className="text-3xl font-bold">{card.format(value)}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
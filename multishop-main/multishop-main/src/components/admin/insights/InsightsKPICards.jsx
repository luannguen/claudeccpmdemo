import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingBag, TrendingUp, Target } from 'lucide-react';

const CARD_CONFIG = [
  {
    key: 'avgClv',
    label: 'Avg CLV',
    icon: DollarSign,
    gradient: 'from-purple-500 to-purple-600',
    format: (val) => `${Math.round(val).toLocaleString('vi-VN')}đ`
  },
  {
    key: 'avgOrderValue',
    label: 'Avg Order Value',
    icon: ShoppingBag,
    gradient: 'from-blue-500 to-blue-600',
    format: (val) => `${Math.round(val).toLocaleString('vi-VN')}đ`
  },
  {
    key: 'avgFrequency',
    label: 'Avg Frequency',
    icon: TrendingUp,
    gradient: 'from-green-500 to-green-600',
    format: (val) => `${val.toFixed(1)} đơn`
  },
  {
    key: 'churnRate',
    label: 'Churn Rate',
    icon: Target,
    gradient: 'from-red-500 to-red-600',
    format: (val) => `${val.toFixed(1)}%`
  }
];

export default function InsightsKPICards({ insights }) {
  return (
    <div className="grid md:grid-cols-4 gap-6 mb-8">
      {CARD_CONFIG.map((card, index) => {
        const Icon = card.icon;
        const value = insights[card.key] || 0;
        
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${card.gradient} text-white rounded-2xl p-6 shadow-lg`}
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
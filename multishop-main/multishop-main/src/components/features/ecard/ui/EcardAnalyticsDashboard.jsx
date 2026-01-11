/**
 * EcardAnalyticsDashboard - Analytics overview widget
 * UI Layer - Presentation only
 * 
 * @module features/ecard/ui
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { useEcardAnalytics } from '../hooks/useEcardAnalytics';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

export default function EcardAnalyticsDashboard({ compact = false }) {
  const [period, setPeriod] = useState(30);
  const { stats, dailyData, conversionRate, trend, isLoading } = useEcardAnalytics(period);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex justify-center py-8">
          <Icon.Spinner size={32} className="text-[#7CB342]" />
        </div>
      </div>
    );
  }

  const trendIcon = {
    up: <Icon.TrendingUp size={14} className="text-green-500" />,
    down: <Icon.TrendingDown size={14} className="text-red-500" />,
    stable: <Icon.Activity size={14} className="text-gray-400" />
  };

  const statCards = [
    { icon: 'Eye', label: 'Lượt xem', value: stats.views, color: 'blue' },
    { icon: 'Users', label: 'Kết nối mới', value: stats.connections, color: 'green' },
    { icon: 'Gift', label: 'Quà nhận', value: stats.gifts, color: 'purple' },
    { icon: 'TrendingUp', label: 'Chuyển đổi', value: `${conversionRate}%`, color: 'amber' }
  ];

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Icon.BarChart size={18} className="text-[#7CB342]" />
            Thống kê
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            {trendIcon[trend]}
            <span>{period} ngày</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {statCards.map((stat, idx) => (
            <StatCardCompact key={idx} {...stat} />
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Icon.BarChart size={20} className="text-[#7CB342]" />
          Thống kê E-Card
        </h3>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            {trendIcon[trend]}
            <span className="text-xs">{trend === 'up' ? 'Tăng' : trend === 'down' ? 'Giảm' : 'Ổn định'}</span>
          </div>
          
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-[#7CB342]"
          >
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
            <option value={90}>90 ngày</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Chart */}
      {dailyData.length > 0 && (
        <div className="h-48 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7CB342" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7CB342" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                tickFormatter={(d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                stroke="#9CA3AF"
              />
              <YAxis tick={{ fontSize: 10 }} stroke="#9CA3AF" />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleDateString('vi-VN')}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#7CB342"
                strokeWidth={2}
                fill="url(#colorViews)"
                name="Lượt xem"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon, label, value, color }) {
  const IconComp = Icon[icon];
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className={`w-9 h-9 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-2`}>
        <IconComp size={18} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function StatCardCompact({ icon, label, value, color }) {
  const IconComp = Icon[icon];
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    amber: 'text-amber-600'
  };

  return (
    <div className="text-center">
      <div className={`w-8 h-8 rounded-lg bg-gray-50 ${colorClasses[color]} flex items-center justify-center mx-auto mb-1`}>
        <IconComp size={14} />
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-[10px] text-gray-500 truncate">{label}</p>
    </div>
  );
}
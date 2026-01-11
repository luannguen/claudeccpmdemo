import React from 'react';
import { BarChart3, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';

export default function AnalyticsStats({ analytics }) {
  const stats = [
    {
      label: 'Tổng đơn',
      value: analytics?.overview?.total_orders || 0,
      subtext: `Đã thanh toán: ${analytics?.overview?.paid_orders || 0}`,
      icon: BarChart3,
      bgClass: 'bg-blue-100',
      iconClass: 'text-blue-600'
    },
    {
      label: 'Doanh thu',
      value: `${((analytics?.overview?.total_revenue || 0) / 1000000).toFixed(1)}M`,
      subtext: 'VNĐ',
      icon: DollarSign,
      bgClass: 'bg-green-100',
      iconClass: 'text-green-600',
      valueClass: 'text-[#7CB342]'
    },
    {
      label: 'Tỷ lệ thành công',
      value: `${analytics?.overview?.success_rate || 0}%`,
      subtext: `${analytics?.overview?.paid_orders || 0} / ${analytics?.overview?.total_orders || 0} đơn`,
      icon: CheckCircle,
      bgClass: 'bg-purple-100',
      iconClass: 'text-purple-600',
      valueClass: 'text-purple-600'
    },
    {
      label: 'Giá trị TB',
      value: `${((analytics?.overview?.average_order_value || 0) / 1000).toFixed(0)}K`,
      subtext: 'VNĐ/đơn',
      icon: TrendingUp,
      bgClass: 'bg-orange-100',
      iconClass: 'text-orange-600',
      valueClass: 'text-orange-600'
    }
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bgClass} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${stat.iconClass}`} />
              </div>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className={`text-3xl font-bold ${stat.valueClass || ''}`}>{stat.value}</p>
            <p className="text-sm text-gray-600 mt-1">{stat.subtext}</p>
          </div>
        );
      })}
    </div>
  );
}
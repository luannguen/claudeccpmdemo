import React from 'react';
import { Sprout, TrendingUp, ShoppingCart, Calendar, Wallet, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function PreOrderAnalyticsCards({ analytics }) {
  if (!analytics) return null;

  const cards = [
    {
      title: 'Doanh Thu Pre-Order',
      value: analytics.preorderRevenue,
      format: 'currency',
      icon: Sprout,
      color: 'amber',
      subtext: `${analytics.revenueComparison.preorderPercent}% tổng doanh thu`,
      trend: analytics.preorderRevenue > analytics.regularRevenue ? 'up' : 'down'
    },
    {
      title: 'Đơn Pre-Order',
      value: analytics.preorderCount,
      format: 'number',
      icon: ShoppingCart,
      color: 'green',
      subtext: `${analytics.preorderPercentage}% tổng đơn`
    },
    {
      title: 'Tiền Cọc Đã Thu',
      value: analytics.preorderDeposits,
      format: 'currency',
      icon: Wallet,
      color: 'blue',
      subtext: `Còn lại: ${analytics.preorderRemaining.toLocaleString('vi-VN')}đ`
    },
    {
      title: 'Tỷ Lệ Chuyển Đổi',
      value: analytics.conversionRate,
      format: 'percent',
      icon: TrendingUp,
      color: 'purple',
      subtext: `${analytics.totalLotSold} / ${analytics.totalLotViews} lot`
    },
    {
      title: 'Lot Đang Active',
      value: analytics.lotStatusSummary.active,
      format: 'number',
      icon: Package,
      color: 'teal',
      subtext: `Sold out: ${analytics.lotStatusSummary.sold_out}`
    },
    {
      title: 'Thu Hoạch Sắp Tới',
      value: analytics.upcomingHarvests.length,
      format: 'number',
      icon: Calendar,
      color: 'orange',
      subtext: 'Trong 30 ngày tới'
    }
  ];

  const colorClasses = {
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-600', border: 'border-amber-200' },
    green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-600', border: 'border-green-200' },
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-600', border: 'border-purple-200' },
    teal: { bg: 'bg-teal-50', icon: 'bg-teal-100 text-teal-600', border: 'border-teal-200' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-100 text-orange-600', border: 'border-orange-200' }
  };

  const formatValue = (value, format) => {
    switch (format) {
      case 'currency':
        return value >= 1000000 
          ? `${(value / 1000000).toFixed(1)}M` 
          : `${(value / 1000).toFixed(0)}K`;
      case 'percent':
        return `${value}%`;
      default:
        return value.toLocaleString('vi-VN');
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card, index) => {
        const colors = colorClasses[card.color];
        const Icon = card.icon;
        
        return (
          <div
            key={index}
            className={`${colors.bg} border ${colors.border} rounded-xl p-4 transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              {card.trend && (
                <div className={`flex items-center text-xs ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {card.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {formatValue(card.value, card.format)}
            </p>
            <p className="text-xs text-gray-600 font-medium">{card.title}</p>
            {card.subtext && (
              <p className="text-xs text-gray-500 mt-1">{card.subtext}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
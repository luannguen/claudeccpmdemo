/**
 * GiftAnalyticsWidget - Dashboard widget showing gift analytics
 * UI Layer - Presentation only
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { formatCurrency } from '@/components/shared/utils/formatters';

export default function GiftAnalyticsWidget({ analytics, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Icon.Gift size={20} className="text-[#7CB342]" />
        Gift Analytics
      </h3>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#7CB342]/10 to-[#7CB342]/5 rounded-xl p-4">
          <p className="text-sm text-gray-600">Tổng quà</p>
          <p className="text-2xl font-bold text-[#7CB342]">{analytics.totalGifts}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4">
          <p className="text-sm text-gray-600">Doanh thu</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(analytics.totalRevenue)}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-xl p-4">
          <p className="text-sm text-gray-600">Chờ đổi</p>
          <p className="text-2xl font-bold text-amber-600">{analytics.redeemable}</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4">
          <p className="text-sm text-gray-600">Đã giao</p>
          <p className="text-2xl font-bold text-purple-600">{analytics.delivered}</p>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Trạng thái quà tặng</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <StatusBadge label="Chờ TT" count={analytics.pendingPayment} color="gray" />
          <StatusBadge label="Chờ đổi" count={analytics.redeemable} color="amber" />
          <StatusBadge label="Đã đổi" count={analytics.redeemed} color="blue" />
          <StatusBadge label="Đã giao" count={analytics.delivered} color="green" />
          <StatusBadge label="Hết hạn" count={analytics.expired} color="red" />
        </div>
      </div>

      {/* Top Products */}
      {analytics.topProducts?.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Quà được tặng nhiều nhất</h4>
          <div className="space-y-2">
            {analytics.topProducts.slice(0, 3).map((product, idx) => (
              <div key={product.productId} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-bold text-gray-400 w-6">#{idx + 1}</span>
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Icon.Package size={16} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.count} lần tặng</p>
                </div>
                <p className="text-sm font-medium text-[#7CB342]">
                  {formatCurrency(product.totalValue)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ label, count, color }) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-2 text-center`}>
      <p className="text-lg font-bold">{count}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
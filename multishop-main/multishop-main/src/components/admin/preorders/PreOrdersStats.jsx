import React from "react";
import { Package, TrendingUp, DollarSign, Calendar } from "lucide-react";

export default function PreOrdersStats({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <Package className="w-8 h-8 opacity-80" />
        </div>
        <div className="text-3xl font-bold mb-1">{stats.total}</div>
        <div className="text-sm opacity-90">Tổng phiên bán trước</div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <TrendingUp className="w-8 h-8 opacity-80" />
        </div>
        <div className="text-3xl font-bold mb-1">{stats.active}</div>
        <div className="text-sm opacity-90">Đang hoạt động</div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <DollarSign className="w-8 h-8 opacity-80" />
        </div>
        <div className="text-3xl font-bold mb-1">
          {(stats.totalRevenue / 1000000).toFixed(1)}M
        </div>
        <div className="text-sm opacity-90">Tổng doanh thu</div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <Calendar className="w-8 h-8 opacity-80" />
        </div>
        <div className="text-3xl font-bold mb-1">{stats.activeLots}</div>
        <div className="text-sm opacity-90">Lot đang bán</div>
      </div>
    </div>
  );
}
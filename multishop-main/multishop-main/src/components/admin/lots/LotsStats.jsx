import React from "react";
import { Package, TrendingUp, DollarSign } from "lucide-react";

export default function LotsStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 shadow-lg">
        <Package className="w-6 h-6 opacity-80 mb-2" />
        <div className="text-2xl font-bold mb-1">{stats.total}</div>
        <div className="text-xs opacity-90">Tổng lot</div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-4 shadow-lg">
        <TrendingUp className="w-6 h-6 opacity-80 mb-2" />
        <div className="text-2xl font-bold mb-1">{stats.active}</div>
        <div className="text-xs opacity-90">Đang bán</div>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-4 shadow-lg">
        <Package className="w-6 h-6 opacity-80 mb-2" />
        <div className="text-2xl font-bold mb-1">{stats.soldOut}</div>
        <div className="text-xs opacity-90">Đã hết</div>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-4 shadow-lg">
        <Package className="w-6 h-6 opacity-80 mb-2" />
        <div className="text-2xl font-bold mb-1">{stats.totalYield}</div>
        <div className="text-xs opacity-90">Tổng SL</div>
      </div>

      <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-4 shadow-lg">
        <TrendingUp className="w-6 h-6 opacity-80 mb-2" />
        <div className="text-2xl font-bold mb-1">{stats.totalSold}</div>
        <div className="text-xs opacity-90">Đã bán</div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-4 shadow-lg">
        <Package className="w-6 h-6 opacity-80 mb-2" />
        <div className="text-2xl font-bold mb-1">{stats.totalAvailable}</div>
        <div className="text-xs opacity-90">Còn lại</div>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg">
        <DollarSign className="w-6 h-6 opacity-80 mb-2" />
        <div className="text-xl font-bold mb-1">
          {(stats.totalRevenue / 1000000).toFixed(1)}M
        </div>
        <div className="text-xs opacity-90">Doanh thu</div>
      </div>
    </div>
  );
}
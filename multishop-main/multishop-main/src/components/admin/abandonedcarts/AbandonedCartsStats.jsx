import React from "react";
import { ShoppingCart, Mail, TrendingUp, DollarSign } from "lucide-react";

export default function AbandonedCartsStats({ config, recoveryRate }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-md border-2 border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingCart className="w-6 h-6 text-orange-500" />
          <p className="text-sm text-gray-600">Tổng bỏ quên</p>
        </div>
        <p className="text-3xl font-bold">{config.stats?.total_abandoned || 0}</p>
      </div>

      <div className="bg-blue-50 rounded-xl p-4 shadow-md border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <Mail className="w-6 h-6 text-blue-600" />
          <p className="text-sm text-blue-600">Email đã gửi</p>
        </div>
        <p className="text-3xl font-bold text-blue-600">{config.stats?.emails_sent || 0}</p>
      </div>

      <div className="bg-green-50 rounded-xl p-4 shadow-md border-2 border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <p className="text-sm text-green-600">Đã khôi phục</p>
        </div>
        <p className="text-3xl font-bold text-green-600">{config.stats?.recovered_count || 0}</p>
      </div>

      <div className="bg-purple-50 rounded-xl p-4 shadow-md border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <p className="text-sm text-purple-600">Tỷ lệ</p>
        </div>
        <p className="text-3xl font-bold text-purple-600">{recoveryRate}%</p>
      </div>

      <div className="bg-yellow-50 rounded-xl p-4 shadow-md border-2 border-yellow-200">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-6 h-6 text-yellow-600" />
          <p className="text-sm text-yellow-600">Doanh thu</p>
        </div>
        <p className="text-xl font-bold text-yellow-600">
          {((config.stats?.recovered_revenue || 0) / 1000000).toFixed(1)}M
        </p>
      </div>
    </div>
  );
}
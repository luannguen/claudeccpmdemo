import React from "react";
import { Users, TrendingUp, ShoppingBag, Award, Star } from "lucide-react";

export default function CustomersStats({ stats }) {
  return (
    <div className="grid md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
        <Users className="w-8 h-8 text-[#7CB342] mb-2" />
        <p className="text-2xl font-bold text-[#0F0F0F]">{stats.total}</p>
        <p className="text-sm text-gray-600">Tổng khách hàng</p>
      </div>
      <div className="bg-green-50 rounded-xl p-4 shadow-lg border border-green-200">
        <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
        <p className="text-2xl font-bold text-green-600">{stats.totalRevenue.toLocaleString('vi-VN')}đ</p>
        <p className="text-sm text-green-700">Tổng doanh thu</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-4 shadow-lg border border-blue-200">
        <ShoppingBag className="w-8 h-8 text-blue-600 mb-2" />
        <p className="text-2xl font-bold text-blue-600">{stats.avgOrderValue.toLocaleString('vi-VN')}đ</p>
        <p className="text-sm text-blue-700">Đơn TB</p>
      </div>
      <div className="bg-purple-50 rounded-xl p-4 shadow-lg border border-purple-200">
        <Award className="w-8 h-8 text-purple-600 mb-2" />
        <p className="text-2xl font-bold text-purple-600">{stats.byType.vip}</p>
        <p className="text-sm text-purple-700">Khách VIP</p>
      </div>
      <div className="bg-orange-50 rounded-xl p-4 shadow-lg border border-orange-200">
        <Star className="w-8 h-8 text-orange-600 mb-2" />
        <p className="text-2xl font-bold text-orange-600">{stats.byType.new}</p>
        <p className="text-sm text-orange-700">Khách mới</p>
      </div>
    </div>
  );
}
import React from "react";
import { Calendar, CheckCircle, Star, TrendingUp } from "lucide-react";

export default function BookingsStats({ stats }) {
  return (
    <div className="mt-12 grid md:grid-cols-4 gap-6">
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6 text-yellow-600" />
        </div>
        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        <p className="text-sm text-gray-600">Chờ xử lý</p>
      </div>
      
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
        <p className="text-sm text-gray-600">Đã xác nhận</p>
      </div>
      
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Star className="w-6 h-6 text-blue-600" />
        </div>
        <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
        <p className="text-sm text-gray-600">Hoàn thành</p>
      </div>
      
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 bg-[#7CB342]/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <TrendingUp className="w-6 h-6 text-[#7CB342]" />
        </div>
        <p className="text-2xl font-bold text-[#7CB342]">
          {stats.totalRevenue.toLocaleString('vi-VN')}đ
        </p>
        <p className="text-sm text-gray-600">Tổng doanh thu</p>
      </div>
    </div>
  );
}
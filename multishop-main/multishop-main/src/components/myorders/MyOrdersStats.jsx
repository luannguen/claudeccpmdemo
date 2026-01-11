import React from "react";

export default function MyOrdersStats({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
      <div className="bg-white rounded-xl p-3 shadow-lg">
        <p className="text-xs text-gray-500 mb-1">Tổng Đơn</p>
        <p className="text-2xl font-bold text-[#0F0F0F]">{stats.total}</p>
      </div>
      <div className="bg-yellow-50 rounded-xl p-3 shadow-lg">
        <p className="text-xs text-gray-500 mb-1">Chờ Xử Lý</p>
        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
      </div>
      <div className="bg-indigo-50 rounded-xl p-3 shadow-lg">
        <p className="text-xs text-gray-500 mb-1">Đang Giao</p>
        <p className="text-2xl font-bold text-indigo-600">{stats.shipping}</p>
      </div>
      <div className="bg-green-50 rounded-xl p-3 shadow-lg">
        <p className="text-xs text-gray-500 mb-1">Hoàn Thành</p>
        <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
      </div>
    </div>
  );
}
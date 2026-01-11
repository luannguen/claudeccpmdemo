import React from "react";

export default function OrdersStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
      <div className="bg-white rounded-xl p-3 shadow-md">
        <p className="text-xs text-gray-500 mb-1">Tổng</p>
        <p className="text-2xl font-bold">{stats.total}</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-3 shadow-md">
        <p className="text-xs text-gray-500 mb-1">Platform</p>
        <p className="text-2xl font-bold text-blue-600">{stats.platform}</p>
      </div>
      <div className="bg-purple-50 rounded-xl p-3 shadow-md">
        <p className="text-xs text-gray-500 mb-1">Shops</p>
        <p className="text-2xl font-bold text-purple-600">{stats.shops}</p>
      </div>
      <div className="bg-yellow-50 rounded-xl p-3 shadow-md">
        <p className="text-xs text-gray-500 mb-1">Chờ XL</p>
        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
      </div>
      <div className="bg-indigo-50 rounded-xl p-3 shadow-md">
        <p className="text-xs text-gray-500 mb-1">Đang Giao</p>
        <p className="text-2xl font-bold text-indigo-600">{stats.shipping}</p>
      </div>
      <div className="bg-green-50 rounded-xl p-3 shadow-md">
        <p className="text-xs text-gray-500 mb-1">Hoàn Thành</p>
        <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
      </div>
    </div>
  );
}
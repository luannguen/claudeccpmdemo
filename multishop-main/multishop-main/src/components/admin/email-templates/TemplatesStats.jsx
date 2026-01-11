import React from 'react';

export default function TemplatesStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="bg-white rounded-xl p-4 shadow-lg">
        <p className="text-sm text-gray-500 mb-1">Tổng templates</p>
        <p className="text-2xl font-bold">{stats.total}</p>
      </div>
      <div className="bg-green-50 rounded-xl p-4 shadow-lg">
        <p className="text-sm text-gray-500 mb-1">Đang hoạt động</p>
        <p className="text-2xl font-bold text-green-600">{stats.active}</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-4 shadow-lg">
        <p className="text-sm text-gray-500 mb-1">Mặc định</p>
        <p className="text-2xl font-bold text-blue-600">{stats.defaults}</p>
      </div>
      <div className="bg-purple-50 rounded-xl p-4 shadow-lg">
        <p className="text-sm text-gray-500 mb-1">Tổng gửi</p>
        <p className="text-2xl font-bold text-purple-600">{stats.totalUsage}</p>
      </div>
    </div>
  );
}
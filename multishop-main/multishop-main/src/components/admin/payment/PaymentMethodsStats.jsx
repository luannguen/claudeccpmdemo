import React from 'react';

export default function PaymentMethodsStats({ stats }) {
  return (
    <div className="grid md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-xl p-4 shadow-md">
        <p className="text-sm text-gray-600 mb-1">Tổng Số</p>
        <p className="text-3xl font-bold">{stats.total}</p>
      </div>
      <div className="bg-green-50 rounded-xl p-4 shadow-md border border-green-200">
        <p className="text-sm text-gray-600 mb-1">Đang Hoạt Động</p>
        <p className="text-3xl font-bold text-green-600">{stats.active}</p>
      </div>
      <div className="bg-blue-50 rounded-xl p-4 shadow-md border border-blue-200">
        <p className="text-sm text-gray-600 mb-1">Mặc Định</p>
        <p className="text-xl font-bold text-blue-600 truncate">{stats.defaultMethod}</p>
      </div>
      <div className="bg-orange-50 rounded-xl p-4 shadow-md border border-orange-200">
        <p className="text-sm text-gray-600 mb-1">Đề Xuất</p>
        <p className="text-3xl font-bold text-orange-600">{stats.recommended}</p>
      </div>
    </div>
  );
}
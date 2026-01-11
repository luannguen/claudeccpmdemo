import React from 'react';

export default function VerificationStats({ stats }) {
  return (
    <div className="grid md:grid-cols-5 gap-4 mb-6">
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        <p className="text-sm text-gray-500 mb-1">Tổng Đơn CK</p>
        <p className="text-3xl font-bold text-[#0F0F0F]">{stats.total}</p>
      </div>
      <div className="bg-yellow-50 rounded-2xl p-4 shadow-lg border-2 border-yellow-300">
        <p className="text-sm text-gray-500 mb-1">Chờ Xác Minh</p>
        <p className="text-3xl font-bold text-yellow-600">{stats.awaiting_verification}</p>
        <p className="text-xs text-yellow-700 mt-1 font-medium">
          {stats.total_amount.toLocaleString('vi-VN')}đ
        </p>
      </div>
      <div className="bg-blue-50 rounded-2xl p-4 shadow-lg">
        <p className="text-sm text-gray-500 mb-1">Mới Tạo</p>
        <p className="text-3xl font-bold text-blue-600">{stats.awaiting_confirmation}</p>
      </div>
      <div className="bg-green-50 rounded-2xl p-4 shadow-lg">
        <p className="text-sm text-gray-500 mb-1">Đã Xác Nhận</p>
        <p className="text-3xl font-bold text-green-600">{stats.paid}</p>
      </div>
      <div className="bg-red-50 rounded-2xl p-4 shadow-lg">
        <p className="text-sm text-gray-500 mb-1">Thất Bại</p>
        <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
      </div>
    </div>
  );
}
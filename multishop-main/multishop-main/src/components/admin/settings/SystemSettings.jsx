import React from "react";
import { Database, Save } from "lucide-react";

export default function SystemSettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#0F0F0F] mb-4">Thông Tin Hệ Thống</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Phiên Bản</p>
          <p className="font-bold text-[#0F0F0F]">v1.0.0</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Cơ Sở Dữ Liệu</p>
          <p className="font-bold text-green-600">● Hoạt động</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Tổng Sản Phẩm</p>
          <p className="font-bold text-[#0F0F0F]">6 sản phẩm</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-1">Tổng Đơn Hàng</p>
          <p className="font-bold text-[#0F0F0F]">0 đơn</p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="font-bold text-[#0F0F0F] mb-4">Bảo Trì Hệ Thống</h4>
        <div className="space-y-3">
          <button className="w-full px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors text-left flex items-center justify-between">
            <span>Xóa Cache</span>
            <Database className="w-5 h-5" />
          </button>
          <button className="w-full px-6 py-3 bg-yellow-50 text-yellow-600 rounded-xl font-medium hover:bg-yellow-100 transition-colors text-left flex items-center justify-between">
            <span>Backup Dữ Liệu</span>
            <Save className="w-5 h-5" />
          </button>
          <button className="w-full px-6 py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors text-left flex items-center justify-between">
            <span>Reset Hệ Thống</span>
            <Database className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
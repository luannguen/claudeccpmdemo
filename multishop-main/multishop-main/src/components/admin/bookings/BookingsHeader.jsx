import React from "react";
import { Sparkles, RefreshCw } from "lucide-react";

export default function BookingsHeader({ 
  totalAppointments, 
  confirmedCount, 
  onRefresh 
}) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-[#7CB342]" />
              <div>
                <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">Quản Lý Đặt Lịch</h1>
                <p className="text-gray-600">Dashboard quản lý booking</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 text-gray-600 hover:text-[#7CB342] transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Làm mới
            </button>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#7CB342]">{totalAppointments}</p>
              <p className="text-sm text-gray-600">Tổng Booking</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
              <p className="text-sm text-gray-600">Đã xác nhận</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
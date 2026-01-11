import React from "react";
import { Settings } from "lucide-react";

export default function SettingsHeader() {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-[#7CB342]/10 rounded-xl md:hidden">
          <Settings className="w-6 h-6 text-[#7CB342]" />
        </div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#0F0F0F]">
          Cài Đặt Hệ Thống
        </h1>
      </div>
      <p className="text-gray-600 text-sm md:text-base">Quản lý cấu hình và người dùng</p>
    </div>
  );
}
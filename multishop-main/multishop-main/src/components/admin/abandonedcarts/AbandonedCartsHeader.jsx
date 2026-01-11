import React from "react";
import { Settings as SettingsIcon } from "lucide-react";

export default function AbandonedCartsHeader({ onOpenSettings }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">Giỏ Hàng Bỏ Quên</h1>
        <p className="text-gray-600">Khôi phục doanh thu từ giỏ hàng bị bỏ quên</p>
      </div>
      
      <button
        onClick={onOpenSettings}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <SettingsIcon className="w-5 h-5" />
        Cấu hình
      </button>
    </div>
  );
}
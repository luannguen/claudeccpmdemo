import React from "react";
import { Download } from "lucide-react";

export default function CommunityHeader({ onExport }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">
          Kiểm Duyệt Cộng Đồng
        </h1>
        <p className="text-gray-600">Quản lý và kiểm duyệt bài viết cộng đồng</p>
      </div>
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
      >
        <Download className="w-4 h-4" />
        Export CSV
      </button>
    </div>
  );
}
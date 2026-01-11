import React from "react";
import { Plus, Download } from "lucide-react";

export default function CustomersHeader({ onAddNew, onExport }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">
          Quản Lý Khách Hàng
        </h1>
        <p className="text-gray-600">Theo dõi và phân tích khách hàng</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onExport}
          className="px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export CSV
        </button>
        <button
          onClick={onAddNew}
          className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Thêm Khách Hàng
        </button>
      </div>
    </div>
  );
}
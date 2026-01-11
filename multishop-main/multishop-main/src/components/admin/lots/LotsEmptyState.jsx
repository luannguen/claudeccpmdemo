import React from "react";
import { Package } from "lucide-react";

export default function LotsEmptyState({ onCreateNew }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">Chưa có lot nào</h3>
      <p className="text-gray-600 mb-6">Bắt đầu tạo lot đầu tiên</p>
      <button
        onClick={onCreateNew}
        className="bg-[#7CB342] text-white px-6 py-3 rounded-lg hover:bg-[#6fa038] transition-colors"
      >
        Tạo ngay
      </button>
    </div>
  );
}
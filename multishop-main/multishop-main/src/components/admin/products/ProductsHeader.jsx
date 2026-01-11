import React from "react";
import { Plus } from "lucide-react";

export default function ProductsHeader({ onAddNew }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">Quản Lý Sản Phẩm</h1>
        <p className="text-gray-600">Kho sản phẩm organic</p>
      </div>
      <button 
        onClick={onAddNew}
        className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />Thêm
      </button>
    </div>
  );
}
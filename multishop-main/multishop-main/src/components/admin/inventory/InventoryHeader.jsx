import React from "react";
import { Plus } from "lucide-react";

export default function InventoryHeader({ onAddNew }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">
          Quản Lý Kho Hàng
        </h1>
        <p className="text-gray-600">Theo dõi xuất nhập kho</p>
      </div>
      <button
        onClick={onAddNew}
        className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Thêm Phiếu XNK
      </button>
    </div>
  );
}
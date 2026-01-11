import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Grid3x3, List, Table2 } from "lucide-react";

export default function MyOrdersHeader({ viewMode, setViewMode }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-1">Đơn Hàng Của Tôi</h1>
        <p className="text-sm text-gray-600">Theo dõi và quản lý đơn hàng</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-white rounded-lg p-1 shadow-md">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#7CB342] text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Xem dạng lưới"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#7CB342] text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Xem dạng danh sách"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-[#7CB342] text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Xem dạng bảng"
          >
            <Table2 className="w-4 h-4" />
          </button>
        </div>
        <Link
          to={createPageUrl('MyProfile')}
          className="px-4 py-2 bg-[#7CB342] text-white rounded-lg font-medium text-sm hover:bg-[#FF9800] transition-colors"
        >
          Xem Profile
        </Link>
      </div>
    </div>
  );
}
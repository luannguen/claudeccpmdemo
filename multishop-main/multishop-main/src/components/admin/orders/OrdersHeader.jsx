import React from "react";
import { Grid3x3, List, Table2 } from "lucide-react";

export default function OrdersHeader({ 
  filteredCount, 
  viewMode, 
  setViewMode 
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">Quản Lý Đơn Hàng</h1>
        <p className="text-gray-600">Platform & Shops • {filteredCount} đơn</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <Grid3x3 className={`w-4 h-4 ${viewMode === 'grid' ? 'text-[#7CB342]' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <List className={`w-4 h-4 ${viewMode === 'list' ? 'text-[#7CB342]' : 'text-gray-600'}`} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-all ${
              viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
          >
            <Table2 className={`w-4 h-4 ${viewMode === 'table' ? 'text-[#7CB342]' : 'text-gray-600'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
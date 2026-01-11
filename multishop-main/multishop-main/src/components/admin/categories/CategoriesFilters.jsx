import React from "react";
import { Search, Grid3x3, List, Table as TableIcon } from "lucide-react";

export default function CategoriesFilters({ 
  searchTerm, 
  setSearchTerm, 
  totalCount,
  viewMode,
  setViewMode
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm danh mục..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]" 
          />
        </div>
        <div className="text-sm text-gray-600">
          <strong>{totalCount}</strong> danh mục
        </div>
        
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid" ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
            title="Grid View"
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list" ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
            title="List View"
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "table" ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
            }`}
            title="Table View"
          >
            <TableIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
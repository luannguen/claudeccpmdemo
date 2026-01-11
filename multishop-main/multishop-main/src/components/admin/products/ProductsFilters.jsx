import React from "react";
import { Search, Grid3x3, List, Table as TableIcon, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang bán" },
  { value: "inactive", label: "Ngừng bán" },
  { value: "hidden", label: "Đã ẩn" },
  { value: "featured", label: "Nổi bật" }
];

export default function ProductsFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  statusFilter = "all",
  setStatusFilter,
  viewMode,
  setViewMode,
  categories
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo tên, SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:border-[#7CB342]" 
          />
        </div>
        
        {/* Category filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full lg:w-[180px] h-12">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status filter */}
        {setStatusFilter && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full lg:w-[180px] h-12">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        
        {/* View mode switcher */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1 self-center">
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
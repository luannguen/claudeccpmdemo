import React from "react";
import { Search, Plus } from "lucide-react";
import { lotStatusOptions } from "@/components/hooks/useAdminProductLots";

export default function LotsFilters({ 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  onCreateNew 
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm lot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
        >
          {lotStatusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <button
          onClick={onCreateNew}
          className="bg-[#7CB342] text-white px-6 py-2 rounded-lg hover:bg-[#6fa038] transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Tạo Lot mới
        </button>
      </div>
    </div>
  );
}
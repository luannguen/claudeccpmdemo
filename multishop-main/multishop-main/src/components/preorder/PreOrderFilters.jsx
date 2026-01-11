import React from "react";
import { Filter } from "lucide-react";

export default function PreOrderFilters({ categoryFilter, setCategoryFilter }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7CB342] focus:border-transparent"
        >
          <option value="all">Tất cả sản phẩm</option>
        </select>
      </div>
    </div>
  );
}
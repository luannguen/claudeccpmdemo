import React from 'react';
import { Search } from 'lucide-react';
import { TEMPLATE_TYPES } from '@/components/hooks/useAdminEmailTemplates';

export default function TemplatesFilters({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  resetFilters,
  hasFilters
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, tiêu đề..."
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
        >
          {TEMPLATE_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
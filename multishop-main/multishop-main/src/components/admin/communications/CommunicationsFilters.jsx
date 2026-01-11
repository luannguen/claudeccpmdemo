import React from 'react';
import { Filter } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { CHANNEL_OPTIONS, TYPE_OPTIONS, STATUS_OPTIONS } from '@/components/hooks/useAdminCommunications';

export default function CommunicationsFilters({
  filters,
  setSearchTerm,
  setChannelFilter,
  setTypeFilter,
  setStatusFilter,
  resetFilters,
  hasFilters,
  totalLogs,
  filteredCount
}) {
  const { searchTerm, channelFilter, typeFilter, statusFilter } = filters;

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-5 h-5 text-gray-600" />
        <h2 className="font-semibold text-gray-900">Bộ lọc</h2>
      </div>

      <div className="space-y-3">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm theo tên, email, mã đơn..."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
          >
            {CHANNEL_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
          >
            {TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-gray-600">
              Hiển thị {filteredCount} / {totalLogs} tin nhắn
            </span>
            <button
              onClick={resetFilters}
              className="text-sm text-[#7CB342] hover:text-[#FF9800] font-medium"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
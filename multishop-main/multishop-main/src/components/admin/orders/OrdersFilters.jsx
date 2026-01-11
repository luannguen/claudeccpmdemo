import React from "react";
import { Calendar, ChevronDown } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { statusOptions, dateRangeOptions } from "@/components/hooks/useAdminOrders";

export default function OrdersFilters({
  searchTerm,
  setSearchTerm,
  sourceFilter,
  setSourceFilter,
  statusFilter,
  setStatusFilter,
  preorderFilter,
  setPreorderFilter,
  dateRange,
  setDateRange,
  customStartDate,
  setCustomStartDate,
  customEndDate,
  setCustomEndDate,
  showDatePicker,
  setShowDatePicker,
  onClearFilters,
  hasActiveFilters
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-lg space-y-3">
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Tìm theo tên, SĐT, mã đơn, shop..."
      />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
        >
          <option value="all">Tất cả nguồn</option>
          <option value="platform">Platform</option>
          <option value="shops">Shops</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
        >
          {statusOptions.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        <select
          value={preorderFilter}
          onChange={(e) => setPreorderFilter(e.target.value)}
          className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
        >
          <option value="all">Tất cả loại</option>
          <option value="preorder">🎯 Bán Trước</option>
          <option value="regular">📦 Thường</option>
        </select>

        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm flex items-center justify-between hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {dateRangeOptions.find(d => d.value === dateRange)?.label}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showDatePicker && (
            <div className="absolute z-10 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-3">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {dateRangeOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setDateRange(option.value);
                      if (option.value !== 'custom') {
                        setShowDatePicker(false);
                      }
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      dateRange === option.value 
                        ? 'bg-[#7CB342] text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              {dateRange === 'custom' && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="w-full px-3 py-2 bg-[#7CB342] text-white rounded-lg text-sm font-medium"
                  >
                    Áp dụng
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
import React from "react";
import SearchBar from "@/components/SearchBar";
import { statusConfig, dateRangeOptions } from "@/components/hooks/useMyOrders";

export default function MyOrdersFilters({ 
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  dateRange, setDateRange,
  orders, filteredOrders,
  clearFilters
}) {
  const hasFilters = searchTerm || dateRange !== 'all' || statusFilter !== 'all';

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 space-y-3">
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Tìm theo mã đơn, tên sản phẩm..."
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1 font-medium">Trạng thái</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'all' ? 'bg-[#7CB342] text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({orders.length})
            </button>
            {Object.entries(statusConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === key
                    ? `bg-${config.color}-500 text-white shadow`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {config.label} ({orders.filter(o => o.order_status === key).length})
              </button>
            ))}
          </div>
        </div>

        <div className="sm:w-48">
          <label className="block text-xs text-gray-600 mb-1 font-medium">Thời gian</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t">
          <span>Hiển thị {filteredOrders.length} / {orders.length} đơn hàng</span>
          <button
            onClick={clearFilters}
            className="text-[#7CB342] hover:text-[#FF9800] font-medium"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
import React from "react";
import { Search, Download } from "lucide-react";

export default function BookingsFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  onExport
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT, dịch vụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
          />
        </div>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="flex items-center gap-2 bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors duration-300"
        >
          <Download className="w-5 h-5" />
          Xuất CSV
        </button>
      </div>
    </div>
  );
}
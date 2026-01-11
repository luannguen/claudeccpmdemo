import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter } from "lucide-react";

export default function CommunityFilters({
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  dateFilter, setDateFilter,
  engagementFilter, setEngagementFilter,
  showAdvancedFilters, setShowAdvancedFilters,
  clearFilters, hasActiveFilters,
  filteredCount, totalCount
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, tác giả, email, hashtag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] focus:ring-2 focus:ring-[#7CB342]/20"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
          >
            <option value="all">📊 Tất cả trạng thái</option>
            <option value="active">✅ Đang hiển thị</option>
            <option value="reported">🚨 Bị báo cáo</option>
            <option value="pending">⏳ Chờ duyệt</option>
            <option value="hidden">🙈 Đã ẩn</option>
          </select>

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showAdvancedFilters
                ? 'bg-[#7CB342] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Bộ lọc nâng cao
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Xóa bộ lọc
            </button>
          )}

          <span className="ml-auto text-sm text-gray-600">
            Hiển thị <strong>{filteredCount}</strong> / {totalCount} bài
          </span>
        </div>

        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200"
            >
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Thời gian đăng</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
                >
                  <option value="all">Tất cả thời gian</option>
                  <option value="today">Hôm nay</option>
                  <option value="week">7 ngày qua</option>
                  <option value="month">30 ngày qua</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Mức độ tương tác</label>
                <select
                  value={engagementFilter}
                  onChange={(e) => setEngagementFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
                >
                  <option value="all">Tất cả mức độ</option>
                  <option value="high">Cao (≥50 điểm)</option>
                  <option value="medium">Trung bình (10-49)</option>
                  <option value="low">Thấp (&lt;10)</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
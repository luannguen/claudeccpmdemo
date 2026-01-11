import React from 'react';
import { Search, List, Users } from 'lucide-react';

export default function MessagesFilters({
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter
}) {
  return (
    <>
      {/* View Mode Toggle */}
      <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setViewMode('by-order')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'by-order' 
                ? 'bg-[#7CB342] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4 inline mr-2" />
            Theo đơn hàng
          </button>
          <button
            onClick={() => setViewMode('by-user')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'by-user' 
                ? 'bg-[#7CB342] text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Theo khách hàng
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email, nội dung..."
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="unread">Tin mới</option>
            <option value="answered">Đã trả lời</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">Tất cả ưu tiên</option>
            <option value="urgent">Khẩn cấp</option>
          </select>
        </div>
      </div>
    </>
  );
}
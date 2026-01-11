import React from 'react';
import { Filter, CheckCircle, Trash2 } from 'lucide-react';
import { NOTIFICATION_CONFIG } from '@/components/hooks/useAdminNotifications';

export default function NotificationsFilters({
  filters,
  setFilterType,
  setFilterRead,
  setFilterPriority,
  stats,
  totalCount,
  filteredCount,
  selectedCount,
  onMarkAllAsRead,
  onBulkDelete
}) {
  const { filterType, filterRead, filterPriority } = filters;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-600 mb-2 block">Loại:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
          >
            <option value="all">Tất cả</option>
            {Object.entries(NOTIFICATION_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-600 mb-2 block">Trạng thái:</label>
          <select
            value={filterRead}
            onChange={(e) => setFilterRead(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
          >
            <option value="all">Tất cả ({totalCount})</option>
            <option value="unread">Chưa đọc ({stats.unread})</option>
            <option value="read">Đã đọc ({totalCount - stats.unread})</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-medium text-gray-600 mb-2 block">Ưu tiên:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="urgent">Khẩn cấp</option>
            <option value="high">Cao</option>
            <option value="normal">Bình thường</option>
            <option value="low">Thấp</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-3">
        {stats.unread > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Đọc Tất Cả ({stats.unread})
          </button>
        )}

        {selectedCount > 0 && (
          <button
            onClick={onBulkDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Xóa Đã Chọn ({selectedCount})
          </button>
        )}

        <p className="text-sm text-gray-600 flex items-center gap-2 ml-auto">
          <Filter className="w-4 h-4" />
          Hiển thị {filteredCount}/{totalCount}
        </p>
      </div>
    </div>
  );
}
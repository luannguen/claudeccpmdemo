import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Eye, Trash2, Calendar, Clock } from 'lucide-react';
import { NOTIFICATION_CONFIG, PRIORITY_BADGE } from '@/components/hooks/useAdminNotifications';

function NotificationCard({ notification, isSelected, onToggleSelect, onViewDetails, onDelete }) {
  const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.system_alert;
  const Icon = config.icon;
  const priorityBadge = PRIORITY_BADGE[notification.priority] || PRIORITY_BADGE.normal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-l-4 ${
        notification.priority === 'urgent' ? 'border-red-500' :
        notification.priority === 'high' ? 'border-orange-500' :
        notification.priority === 'normal' ? 'border-blue-500' :
        'border-gray-300'
      } ${!notification.is_read ? 'bg-blue-50' : ''} ${isSelected ? 'ring-2 ring-[#7CB342]' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]"
          />

          {/* Icon */}
          <div className={`w-12 h-12 rounded-xl bg-${config.color}-100 flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 text-${config.color}-600`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className={`font-bold ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {notification.title}
                  </h3>
                  <span className={`px-2 py-0.5 ${priorityBadge.bg} ${priorityBadge.text} text-[10px] font-bold rounded uppercase`}>
                    {priorityBadge.label}
                  </span>
                  {notification.requires_action && (
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded uppercase">
                      CẦN XỬ LÝ
                    </span>
                  )}
                  {!notification.is_read && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                
                {/* Metadata */}
                {notification.metadata && (
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-2">
                    {notification.metadata.order_number && (
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        Đơn: #{notification.metadata.order_number}
                      </span>
                    )}
                    {notification.metadata.amount && (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                        {notification.metadata.amount.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                    {notification.metadata.customer_name && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        KH: {notification.metadata.customer_name}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(notification.created_date).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(notification.created_date).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={onViewDetails}
                  className="p-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors"
                  title="Xem chi tiết"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function NotificationsList({
  notifications,
  isLoading,
  selectedIds,
  onToggleSelect,
  onViewDetails,
  onDelete,
  hasFilters
}) {
  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Đang tải thông báo...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Bell className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Không Có Thông Báo
        </h3>
        <p className="text-gray-600">
          {hasFilters
            ? 'Thử thay đổi bộ lọc'
            : 'Các thông báo mới sẽ xuất hiện tại đây'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          isSelected={selectedIds.includes(notification.id)}
          onToggleSelect={() => onToggleSelect(notification.id)}
          onViewDetails={(e) => {
            e.stopPropagation();
            onViewDetails(notification);
          }}
          onDelete={(e) => {
            e.stopPropagation();
            if (confirm('Xóa thông báo này?')) {
              onDelete(notification.id);
            }
          }}
        />
      ))}
    </div>
  );
}
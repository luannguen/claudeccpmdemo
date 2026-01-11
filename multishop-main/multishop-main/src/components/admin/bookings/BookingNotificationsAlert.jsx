import React from "react";
import { AlertCircle } from "lucide-react";

export default function BookingNotificationsAlert({ notifications, onMarkViewed }) {
  const pendingNotifications = notifications.filter(n => n.notification_status === 'pending');
  
  if (pendingNotifications.length === 0) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', { 
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-orange-600" />
        <h3 className="font-bold text-orange-800">
          {pendingNotifications.length} Thông báo booking mới
        </h3>
      </div>
      <div className="space-y-2">
        {pendingNotifications.slice(0, 3).map(notification => (
          <div key={notification.id} className="flex items-center justify-between bg-white rounded-lg p-3">
            <div>
              <span className="font-medium">{notification.client_name}</span>
              <span className="text-gray-600 ml-2">đặt {notification.service_name}</span>
              <span className="text-sm text-gray-500 ml-2">
                vào {formatDate(notification.appointment_date)} lúc {notification.appointment_time}
              </span>
            </div>
            <button
              onClick={() => onMarkViewed(notification.id)}
              className="text-sm bg-[#7CB342] text-white px-3 py-1 rounded-lg hover:bg-[#FF9800] transition-colors"
            >
              Đã xem
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
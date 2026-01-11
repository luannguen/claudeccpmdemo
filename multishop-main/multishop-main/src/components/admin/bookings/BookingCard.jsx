import React from "react";
import { motion } from "framer-motion";
import { 
  User, Mail, Phone, Calendar, Clock, 
  Star, MessageSquare, AlertCircle, CheckCircle, XCircle 
} from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-green-100 text-green-800 border-green-200", 
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  cancelled: "bg-red-100 text-red-800 border-red-200"
};

const statusLabels = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy"
};

export default function BookingCard({ appointment, onUpdateStatus }) {
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#7CB342]/10 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-[#7CB342]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#0F0F0F]">
                {appointment.client_name || 'N/A'}
              </h3>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <a href={`mailto:${appointment.email}`} className="hover:text-[#7CB342] break-all">
                    {appointment.email || 'N/A'}
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${appointment.phone}`} className="hover:text-[#7CB342]">
                    {appointment.phone || 'N/A'}
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[appointment.status] || statusColors.pending}`}>
              {statusLabels[appointment.status] || 'Chờ xử lý'}
            </span>
            <span className="text-xs text-gray-500">
              #{(appointment.id || '').slice(-8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#7CB342]" />
            <div>
              <p className="font-medium text-[#0F0F0F]">{appointment.service || 'N/A'}</p>
              <p className="text-sm text-gray-600">
                {appointment.service_price ? `${appointment.service_price.toLocaleString('vi-VN')}đ` : 'Chưa có giá'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <p className="font-medium text-[#0F0F0F]">{formatDate(appointment.preferred_date)}</p>
              <p className="text-sm text-gray-600">Ngày hẹn</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-600" />
            <div>
              <p className="font-medium text-[#0F0F0F]">{appointment.preferred_time || 'N/A'}</p>
              <p className="text-sm text-gray-600">{appointment.duration || 'Chưa xác định'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400" />
            <div>
              <p className="font-medium text-[#0F0F0F]">{formatDateTime(appointment.created_date)}</p>
              <p className="text-sm text-gray-600">Ngày đặt</p>
            </div>
          </div>
        </div>

        {/* Message */}
        {appointment.message && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Ghi chú:</p>
                <p className="text-sm text-gray-600">{appointment.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            Cập nhật: {formatDateTime(appointment.updated_date)}
          </div>
          
          <div className="flex items-center gap-2">
            {appointment.status === 'pending' && (
              <>
                <button
                  onClick={() => onUpdateStatus(appointment.id, 'confirmed')}
                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Xác nhận
                </button>
                <button
                  onClick={() => onUpdateStatus(appointment.id, 'cancelled')}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Hủy
                </button>
              </>
            )}
            
            {appointment.status === 'confirmed' && (
              <button
                onClick={() => onUpdateStatus(appointment.id, 'completed')}
                className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Hoàn thành
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
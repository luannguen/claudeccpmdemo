/**
 * 🎴 Admin Return Card - Compact view for admin list
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, Clock, CheckCircle, XCircle, Package, 
  DollarSign, AlertTriangle, User, Phone, Mail
} from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'Chờ duyệt', color: 'yellow', icon: Clock },
  reviewing: { label: 'Đang xem xét', color: 'blue', icon: Clock },
  approved: { label: 'Đã duyệt', color: 'blue', icon: CheckCircle },
  rejected: { label: 'Từ chối', color: 'red', icon: XCircle },
  shipping_back: { label: 'Đang gửi về', color: 'blue', icon: Package },
  received: { label: 'Đã nhận', color: 'green', icon: CheckCircle },
  refunded: { label: 'Đã hoàn tiền', color: 'green', icon: DollarSign },
  completed: { label: 'Hoàn tất', color: 'green', icon: CheckCircle }
};

const PRIORITY_CONFIG = {
  low: { color: 'gray', label: 'Thấp' },
  normal: { color: 'blue', label: 'Bình thường' },
  high: { color: 'orange', label: 'Cao' },
  urgent: { color: 'red', label: 'Khẩn cấp' }
};

export default function AdminReturnCard({ returnRequest, onView }) {
  const statusInfo = STATUS_CONFIG[returnRequest.status] || STATUS_CONFIG.pending;
  const StatusIcon = statusInfo.icon;
  const priorityInfo = PRIORITY_CONFIG[returnRequest.priority] || PRIORITY_CONFIG.normal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden border-l-4"
      style={{ borderLeftColor: `var(--${statusInfo.color}-500)` }}
    >
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left: Order Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  #{returnRequest.order_number}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(returnRequest.created_date).toLocaleString('vi-VN')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${statusInfo.color}-100 text-${statusInfo.color}-700 flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {statusInfo.label}
              </span>
            </div>

            {/* Customer Info */}
            <div className="grid md:grid-cols-3 gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{returnRequest.customer_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{returnRequest.customer_email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{returnRequest.customer_phone}</span>
              </div>
            </div>

            {/* Return Info */}
            <div className="flex flex-wrap gap-4 text-sm">
              <div>
                <span className="text-gray-600">Số tiền:</span>
                <span className="ml-2 font-bold text-[#7CB342]">
                  {returnRequest.total_return_amount.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div>
                <span className="text-gray-600">Lý do:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {returnRequest.return_reason}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Loại:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {returnRequest.return_type === 'full' ? 'Toàn bộ' : 'Một phần'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-2">
            {returnRequest.priority !== 'normal' && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${priorityInfo.color}-100 text-${priorityInfo.color}-700 text-center`}>
                {priorityInfo.label}
              </span>
            )}
            {returnRequest.requires_action && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 text-center flex items-center gap-1 justify-center">
                <AlertTriangle className="w-3 h-3" />
                Cần xử lý
              </span>
            )}
            <button
              onClick={() => onView(returnRequest)}
              className="px-4 py-2 bg-[#7CB342] text-white rounded-lg font-medium hover:bg-[#FF9800] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Eye className="w-4 h-4" />
              Xem Chi Tiết
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
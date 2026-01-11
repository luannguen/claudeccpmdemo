import React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Tag, Eye, Edit, Trash2, RefreshCw } from "lucide-react";
import { customerTypes } from "@/components/hooks/useAdminCustomers";
import { Badge } from "@/components/ui/badge";

export default function CustomerCard({ customer, onView, onEdit, onDelete, onReassign }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold text-lg">
            {customer.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0F0F0F]">
              {customer.full_name}
            </h3>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
              customer.customer_type === 'vip' ? 'bg-purple-100 text-purple-600' :
              customer.customer_type === 'active' ? 'bg-green-100 text-green-600' :
              customer.customer_type === 'new' ? 'bg-blue-100 text-blue-600' :
              'bg-gray-100 text-gray-600'
            }`}>
              {customerTypes.find(t => t.value === customer.customer_type)?.label}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{customer.phone}</span>
        </div>
        {customer.email && !customer.email.includes('@guest.zerofarm') && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span className="truncate">{customer.email}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Tag className="w-3 h-3" />
          <span>
            {customer.customer_source === 'order' ? 'Từ đơn hàng' :
             customer.customer_source === 'cart' ? 'Từ giỏ hàng' :
             customer.customer_source === 'manual_registration' ? 'CTV đăng ký' : 'Thêm thủ công'}
          </span>
        </div>
        {customer.is_referred_customer && (
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-300">
              🎁 Giới thiệu
            </Badge>
            {customer.referral_locked && (
              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                🔒 Đã khóa
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
        <div>
          <p className="text-xs text-gray-500">Đơn hàng</p>
          <p className="font-bold text-[#7CB342]">{customer.total_orders || 0}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Chi tiêu</p>
          <p className="font-bold text-[#7CB342] text-xs">{(customer.total_spent || 0).toLocaleString('vi-VN')}đ</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Điểm</p>
          <p className="font-bold text-purple-600">{customer.loyalty_points || 0}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onView(customer)}
          className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Eye className="w-4 h-4" />
          Xem
        </button>
        <button
          onClick={() => onEdit(customer)}
          className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Edit className="w-4 h-4" />
          Sửa
        </button>
        {customer.is_referred_customer && onReassign && (
          <button
            onClick={() => onReassign(customer)}
            className="bg-amber-50 text-amber-600 p-2 rounded-lg hover:bg-amber-100 transition-colors"
            title="Chuyển CTV"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(customer.id)}
          className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
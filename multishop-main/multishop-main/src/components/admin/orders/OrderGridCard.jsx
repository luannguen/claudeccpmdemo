import React from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { statusOptions } from "@/components/hooks/useAdminOrders";

const OrderGridCard = React.memo(({ order, onSelect, isSelected, onView }) => {
  const statusColor = statusOptions.find(s => s.value === order.order_status)?.color || 'gray';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-2 ${
        isSelected ? 'border-[#7CB342] ring-2 ring-[#7CB342]/20' : 'border-gray-100'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(order.id);
              }}
              className="w-5 h-5 text-[#7CB342] rounded cursor-pointer"
            />
            <p className="font-mono text-sm font-bold">#{order.order_number || order.id?.slice(-6)}</p>
            {order.has_preorder_items && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                BÁN TRƯỚC
              </span>
            )}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-700`}>
            {statusOptions.find(s => s.value === order.order_status)?.label}
          </span>
        </div>

        <div className="space-y-2 text-sm mb-3">
          <p className="font-medium truncate">{order.customer_name}</p>
          <p className="text-gray-600 text-xs">{order.customer_phone}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(order.created_date).toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <p className="text-lg font-bold text-[#7CB342]">
            {(order.total_amount || 0).toLocaleString('vi-VN')}đ
          </p>
          <button
            onClick={() => onView(order)}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors"
          >
            Chi tiết
          </button>
        </div>
      </div>
    </motion.div>
  );
});

OrderGridCard.displayName = 'OrderGridCard';

export default OrderGridCard;
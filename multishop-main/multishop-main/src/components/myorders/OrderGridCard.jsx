import React from "react";
import { motion } from "framer-motion";
import { Package, Calendar } from "lucide-react";
import { statusConfig, canReturnOrder } from "@/components/hooks/useMyOrders";
import DepositPaymentButton from "./DepositPaymentButton";

export default function OrderGridCard({ order, onView, onReturn }) {
  const status = statusConfig[order.order_status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const canReturn = canReturnOrder(order.order_status);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all border border-gray-100"
    >
      <div className={`h-2 bg-gradient-to-r from-${status.color}-400 to-${status.color}-600`} />
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-12 h-12 rounded-xl bg-${status.color}-100 flex items-center justify-center`}>
            <StatusIcon className={`w-6 h-6 text-${status.color}-600`} />
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold bg-${status.color}-100 text-${status.color}-700`}>
            {status.label}
          </span>
        </div>

        <p className="font-mono font-bold text-sm mb-1">#{order.order_number || order.id?.slice(-8)}</p>
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(order.created_date).toLocaleDateString('vi-VN')}
        </p>

        <div className="space-y-2 mb-3 max-h-24 overflow-hidden">
          {(order.items || []).slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Package className="w-3 h-3 text-gray-400" />
              <p className="text-xs truncate flex-1">{item.product_name}</p>
              <p className="text-xs text-gray-600">x{item.quantity}</p>
            </div>
          ))}
          {(order.items || []).length > 2 && (
            <p className="text-xs text-gray-400">+{(order.items || []).length - 2} sản phẩm</p>
          )}
        </div>

        <div className="flex items-center justify-between mb-3 pt-3 border-t">
          <span className="text-xs text-gray-600">Tổng</span>
          <span className="text-lg font-bold text-[#7CB342]">
            {(order.total_amount || 0).toLocaleString('vi-VN')}đ
          </span>
        </div>

        <div className="space-y-2">
          {/* Deposit Payment Button */}
          {order.deposit_status === 'pending' && order.deposit_amount > 0 && (
            <DepositPaymentButton order={order} />
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => onView(order)}
              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Chi Tiết
            </button>
            {canReturn && (
              <button
                onClick={() => onReturn(order)}
                className="flex-1 border-2 border-[#7CB342] text-[#7CB342] py-2 rounded-lg text-sm font-medium hover:bg-green-50"
              >
                Trả Hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
import React from "react";
import { motion } from "framer-motion";
import { Package, Calendar, Eye, PackageX, Star } from "lucide-react";
import { statusConfig, canReturnOrder } from "@/components/hooks/useMyOrders";
import DepositPaymentButton from "@/components/myorders/DepositPaymentButton";

export default function OrderListItem({ order, onView, onReturn }) {
  const status = statusConfig[order.order_status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const canReturn = canReturnOrder(order.order_status);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
    >
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-${status.color}-100 flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 text-${status.color}-600`} />
            </div>
            <div>
              <p className="font-mono font-bold">#{order.order_number || order.id?.slice(-8)}</p>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(order.created_date).toLocaleDateString('vi-VN', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-gray-600">Tổng</p>
              <p className="text-xl font-bold text-[#7CB342]">
                {(order.total_amount || 0).toLocaleString('vi-VN')}đ
              </p>
            </div>
            <span className={`px-3 py-1 rounded-lg text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-2 mb-3">
          {(order.items || []).slice(0, 3).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Package className="w-4 h-4 text-gray-400" />
                <p className="font-medium text-sm truncate">{item.product_name}</p>
                <p className="text-xs text-gray-600">x{item.quantity}</p>
              </div>
              <p className="font-medium text-sm">{(item.subtotal || 0).toLocaleString('vi-VN')}đ</p>
            </div>
          ))}
          {(order.items || []).length > 3 && (
            <p className="text-xs text-gray-500 text-center">... và {(order.items || []).length - 3} sản phẩm khác</p>
          )}
        </div>

        <div className="bg-yellow-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-yellow-800 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Điểm tích lũy:
            </span>
            <span className="font-bold text-yellow-600">
              +{Math.floor((order.total_amount || 0) / 1000)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {/* Deposit Payment Button */}
          {order.deposit_status === 'pending' && order.deposit_amount > 0 && (
            <DepositPaymentButton order={order} />
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => onView(order)}
              className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Xem Chi Tiết
            </button>
            {canReturn && (
              <button
                onClick={() => onReturn(order)}
                className="flex-1 border-2 border-[#7CB342] text-[#7CB342] py-2.5 rounded-lg font-medium hover:bg-green-50 flex items-center justify-center gap-2"
              >
                <PackageX className="w-4 h-4" />
                Trả Hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
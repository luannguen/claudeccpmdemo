import React from "react";
import { Calendar, User, Phone, ShoppingCart, Printer, Eye } from "lucide-react";
import { statusOptions } from "@/components/hooks/useAdminOrders";

export default function OrderListItem({ 
  item: order, 
  onView, 
  onPrint, 
  onSelect, 
  selectedOrders = [] 
}) {
  const statusConfig = statusOptions.find(s => s.value === order.order_status) || {};
  const isSelected = selectedOrders.includes(order.id);

  return (
    <div 
      className={`bg-white rounded-xl border-2 p-4 transition-all hover:shadow-md ${
        isSelected ? 'border-[#7CB342]' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect?.(order.id)}
          className="w-5 h-5 text-[#7CB342] rounded cursor-pointer mt-1"
        />

        {/* Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-mono text-sm font-bold text-gray-900">
                #{order.order_number || order.id?.slice(-6)}
              </h3>
              {order.has_preorder_items && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  BÁN TRƯỚC
                </span>
              )}
              {order.shop_id ? (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">Shop</span>
              ) : (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">Platform</span>
              )}
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-700`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                <p className="text-xs text-gray-500">{order.customer_phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600">
                {new Date(order.created_date).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-bold text-[#7CB342]">
                {(order.total_amount || 0).toLocaleString('vi-VN')}đ
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrint?.(order);
                }}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="In đơn"
              >
                <Printer className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(order);
                }}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Package } from "lucide-react";

export default function ProfileRecentOrders({ orders }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-[#7CB342]" />
        Đơn Hàng Gần Đây
      </h3>
      {orders.slice(0, 3).map((order) => (
        <div key={order.id} className="mb-3 pb-3 border-b border-gray-100 last:border-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium">#{order.order_number || order.id?.slice(-6)}</p>
            <span className={`px-2 py-1 rounded-full text-xs ${
              order.order_status === 'delivered' ? 'bg-green-100 text-green-700' : 
              order.order_status === 'shipping' ? 'bg-blue-100 text-blue-700' : 
              'bg-yellow-100 text-yellow-700'
            }`}>
              {order.order_status}
            </span>
          </div>
          <p className="text-xs text-gray-500">{new Date(order.created_date).toLocaleDateString('vi-VN')}</p>
          <p className="text-sm font-bold text-[#7CB342]">{(order.total_amount || 0).toLocaleString('vi-VN')}đ</p>
        </div>
      ))}
      <Link to={createPageUrl('MyOrders')} className="block mt-4 text-center text-[#7CB342] font-medium hover:underline text-sm">
        Xem tất cả →
      </Link>
    </div>
  );
}
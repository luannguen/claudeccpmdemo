import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { createPageUrl } from "@/utils";

const statusConfig = {
  delivered: { label: 'Đã giao', class: 'bg-green-100 text-green-600' },
  pending: { label: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-600' },
  cancelled: { label: 'Đã hủy', class: 'bg-red-100 text-red-600' },
  default: { label: 'Đang xử lý', class: 'bg-blue-100 text-blue-600' }
};

export default function DashboardRecentOrders({ orders }) {
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-[#0F0F0F]">Đơn Hàng Gần Đây</h3>
        <Link 
          to={createPageUrl("AdminOrders")}
          className="text-[#7CB342] hover:text-[#FF9800] text-sm font-medium flex items-center gap-1"
        >
          Xem tất cả <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Mã ĐH</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Khách hàng</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Tổng tiền</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Trạng thái</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Ngày</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => {
              const status = statusConfig[order.order_status] || statusConfig.default;
              return (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-2 text-sm font-mono">
                    #{order.order_number || order.id?.slice(-6)}
                  </td>
                  <td className="py-3 px-2 text-sm">{order.customer_name}</td>
                  <td className="py-3 px-2 text-sm font-medium text-[#7CB342]">
                    {(order.total_amount || 0).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-500">
                    {new Date(order.created_date).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
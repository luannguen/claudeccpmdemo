import React from "react";
import { statusConfig, canReturnOrder } from "@/components/hooks/useMyOrders";

export default function OrderTableView({ data, items, orders, onView, onReturn }) {
  // Support multiple prop names for compatibility with DataViewRenderer
  const orderList = data || items || orders || [];
  
  if (!orderList.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
        Chưa có đơn hàng nào
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 text-xs font-medium text-gray-600">Mã ĐH</th>
              <th className="text-left p-4 text-xs font-medium text-gray-600">Ngày</th>
              <th className="text-left p-4 text-xs font-medium text-gray-600">Sản phẩm</th>
              <th className="text-right p-4 text-xs font-medium text-gray-600">Tổng</th>
              <th className="text-center p-4 text-xs font-medium text-gray-600">Trạng thái</th>
              <th className="text-center p-4 text-xs font-medium text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orderList.map((order) => {
              const status = statusConfig[order.order_status] || statusConfig.pending;
              const StatusIcon = status.icon;
              const canReturn = canReturnOrder(order.order_status);

              return (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-mono text-sm font-bold">#{order.order_number || order.id?.slice(-8)}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.created_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium">{(order.items || [])[0]?.product_name}</p>
                    {(order.items || []).length > 1 && (
                      <p className="text-xs text-gray-500">+{(order.items || []).length - 1} sản phẩm</p>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <p className="font-bold text-[#7CB342]">
                      {(order.total_amount || 0).toLocaleString('vi-VN')}đ
                    </p>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onView(order)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600"
                      >
                        Chi tiết
                      </button>
                      {canReturn && (
                        <button
                          onClick={() => onReturn(order)}
                          className="px-3 py-1.5 border-2 border-[#7CB342] text-[#7CB342] rounded-lg text-xs font-medium hover:bg-green-50"
                        >
                          Trả
                        </button>
                      )}
                    </div>
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
import React from "react";
import { ShoppingCart, Printer } from "lucide-react";
import { statusOptions } from "@/components/hooks/useAdminOrders";

export default function OrderTableView(props) {
  // Debug props
  console.log('OrderTableView props:', { 
    hasData: !!props.data, 
    hasOnView: !!props.onView, 
    hasOnPrint: !!props.onPrint,
    allPropKeys: Object.keys(props)
  });
  
  // Extract props from DataViewRenderer
  const {
    data,
    items,
    orders: ordersProp,
    selectedOrders = [],
    toggleOrderSelection,
    onSelect,
    toggleSelectAll,
    onView,
    onPrint
  } = props;
  
  // Support multiple prop names for DataViewRenderer compatibility
  const orders = data || items || ordersProp || [];
  // Support both onSelect and toggleOrderSelection
  const handleToggle = onSelect || toggleOrderSelection;
  
  // Debug handlers
  console.log('OrderTableView handlers:', { 
    hasOnView: !!onView, 
    hasOnPrint: !!onPrint,
    ordersCount: orders.length
  });
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-[#7CB342] rounded cursor-pointer"
                />
              </th>
              <th className="text-left p-3 text-xs font-medium text-gray-600">Mã ĐH</th>
              <th className="text-left p-3 text-xs font-medium text-gray-600">Nguồn</th>
              <th className="text-left p-3 text-xs font-medium text-gray-600">Khách hàng</th>
              <th className="text-left p-3 text-xs font-medium text-gray-600">Ngày</th>
              <th className="text-right p-3 text-xs font-medium text-gray-600">Tổng</th>
              <th className="text-center p-3 text-xs font-medium text-gray-600">Trạng thái</th>
              <th className="text-center p-3 text-xs font-medium text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => {
              const statusColor = statusOptions.find(s => s.value === order.order_status)?.color || 'gray';
              return (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => handleToggle?.(order.id)}
                      className="w-5 h-5 text-[#7CB342] rounded cursor-pointer"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-xs font-medium">#{order.order_number || order.id?.slice(-6)}</p>
                      {order.has_preorder_items && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          BÁN TRƯỚC
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {order.shop_id ? (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Shop</span>
                    ) : (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Platform</span>
                    )}
                  </td>
                  <td className="p-3">
                    <p className="font-medium text-sm">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.customer_phone}</p>
                  </td>
                  <td className="p-3 text-xs text-gray-600">
                    {new Date(order.created_date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-3 text-right">
                    <p className="font-bold text-[#7CB342] text-sm">
                      {(order.total_amount || 0).toLocaleString('vi-VN')}đ
                    </p>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusColor}-100 text-${statusColor}-700`}>
                      {statusOptions.find(s => s.value === order.order_status)?.label}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
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
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Không tìm thấy đơn hàng</p>
        </div>
      )}
    </div>
  );
}
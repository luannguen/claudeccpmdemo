import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Search, Eye, Calendar } from "lucide-react";
import moment from "moment";

const formatCurrency = (amount) => 
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipping: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700"
};

const statusLabels = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
  refunded: "Hoàn tiền"
};

export default function ShopOrdersTable({ orders = [], isLoading, onViewOrder }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = orders.filter(o => {
    const matchSearch = 
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + (o.total || 0), 0)
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-gray-100 rounded"></div>)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            Đơn Hàng ({orders.length})
          </h3>
          <div className="flex gap-2 text-sm">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg">
              {stats.pending} chờ xử lý
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg">
              {stats.delivered} đã giao
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm đơn hàng, khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#7CB342]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-xl text-sm focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="max-h-[500px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Commission</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order, idx) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onViewOrder?.(order)}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{order.order_number}</p>
                    <p className="text-xs text-gray-500">{order.items?.length || 0} sản phẩm</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 text-sm">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-medium text-gray-900 text-sm">{formatCurrency(order.total)}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-medium text-orange-600 text-sm">
                      {formatCurrency(order.commission_total || (order.total * 0.03))}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <p className="text-sm text-gray-600">
                      {moment(order.created_date).format('DD/MM/YY')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {moment(order.created_date).format('HH:mm')}
                    </p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
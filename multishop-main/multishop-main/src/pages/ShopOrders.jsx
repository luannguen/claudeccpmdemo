
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShoppingCart, Search, Eye, Truck,
  CheckCircle, XCircle, Clock, Package, Phone, Mail, MapPin, X
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ShopLayout from "@/components/ShopLayout"; // Changed from AdminLayout to ShopLayout
import TenantGuard, { useTenantAccess } from "@/components/TenantGuard"; // Updated import for useTenantAccess

const statusOptions = [
  { value: "all", label: "Tất cả", color: "gray" },
  { value: "pending", label: "Chờ xử lý", color: "yellow" },
  { value: "confirmed", label: "Đã xác nhận", color: "blue" },
  { value: "processing", label: "Đang chuẩn bị", color: "purple" },
  { value: "shipping", label: "Đang giao", color: "indigo" },
  { value: "delivered", label: "Đã giao", color: "green" },
  { value: "cancelled", label: "Đã hủy", color: "red" }
];

function OrderDetailsModal({ order, onClose, onUpdateStatus }) {
  const [newStatus, setNewStatus] = useState(order?.order_status || "pending");
  const [internalNote, setInternalNote] = useState(order?.internal_note || "");

  const handleUpdateStatus = () => {
    onUpdateStatus(order.id, {
      order_status: newStatus,
      internal_note: internalNote
    });
    onClose();
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
              Chi Tiết Đơn Hàng
            </h2>
            <p className="text-sm text-gray-500">#{order.order_number || order.id?.slice(-8)}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-bold text-[#0F0F0F] mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#7CB342]" />
              Thông Tin Khách Hàng
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Khách hàng</p>
                  <p className="font-medium">{order.customer_name}</p>
                  <p className="text-sm text-gray-600">{order.customer_phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{order.customer_email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Địa chỉ giao hàng</p>
                  <p className="font-medium">{order.shipping_address}</p>
                  {order.shipping_ward && <p className="text-sm text-gray-600">{order.shipping_ward}, {order.shipping_district}, {order.shipping_city}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Commission Info (Shop Owner View) */}
          <div className="bg-blue-50 rounded-2xl p-6">
            <h3 className="font-bold text-blue-900 mb-4">Thông Tin Hoa Hồng</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Tổng đơn hàng:</p>
                <p className="text-xl font-bold text-gray-900">{(order.total_amount || 0).toLocaleString('vi-VN')}đ</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Commission ({order.commission_rate || 3}%):</p>
                <p className="text-xl font-bold text-red-600">-{(order.commission_total || 0).toLocaleString('vi-VN')}đ</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Bạn nhận:</p>
                <p className="text-xl font-bold text-green-600">{(order.shop_revenue || 0).toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-bold text-[#0F0F0F] mb-4">Sản Phẩm</h3>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-gray-600">Sản phẩm</th>
                    <th className="text-center p-4 text-sm font-medium text-gray-600">Số lượng</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-600">Đơn giá</th>
                    <th className="text-right p-4 text-sm font-medium text-gray-600">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, index) => (
                    <tr key={index} className="border-t border-gray-100">
                      <td className="p-4">{item.product_name}</td>
                      <td className="p-4 text-center">{item.quantity}</td>
                      <td className="p-4 text-right">{(item.unit_price || 0).toLocaleString('vi-VN')}đ</td>
                      <td className="p-4 text-right font-medium">{(item.subtotal || 0).toLocaleString('vi-VN')}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Update Status */}
          <div>
            <h3 className="font-bold text-[#0F0F0F] mb-4">Cập Nhật Đơn Hàng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                >
                  {statusOptions.filter(s => s.value !== 'all').map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none"
                  placeholder="Ghi chú..."
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
            >
              Đóng
            </button>
            <button
              onClick={handleUpdateStatus}
              className="flex-1 px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800]"
            >
              Cập Nhật
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Renamed ShopOrdersContent to ShopOrders, as per the desired output structure
function ShopOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const queryClient = useQueryClient();
  const { tenant, tenantId } = useTenantAccess();

  // The 'user' and 'shop' queries have been removed and replaced by useTenantAccess.
  // The 'my-shop-orders' query now directly depends on 'tenantId'.
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-shop-orders', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const allOrders = await base44.entities.Order.list('-created_date', 500);
      return allOrders.filter(o => o.shop_id === tenantId);
    },
    enabled: !!tenantId,
    staleTime: 5 * 1000, // Added staleTime
    refetchOnMount: 'always', // Added refetchOnMount
    initialData: []
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Order.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-shop-orders']);
      setSelectedOrder(null);
    }
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm) ||
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (orderId, data) => {
    updateMutation.mutate({ id: orderId, data });
  };

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj?.color || 'gray';
  };

  if (!tenant) { // Changed: Checks for tenant instead of shop
    return (
      <div className="text-center py-20">
        <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <p className="text-gray-600">Không tìm thấy thông tin shop</p> {/* Changed text */}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">
          Đơn Hàng Của Shop
        </h1>
        <p className="text-gray-600">Quản lý đơn hàng từ {tenant.organization_name}</p> {/* Changed: uses tenant.organization_name */}
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Tổng Đơn</p>
          <p className="text-3xl font-bold text-[#0F0F0F]">{orders.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Chờ Xử Lý</p>
          <p className="text-3xl font-bold text-orange-600">
            {orders.filter(o => o.order_status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Đang Giao</p>
          <p className="text-3xl font-bold text-blue-600">
            {orders.filter(o => o.order_status === 'shipping').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Hoàn Thành</p>
          <p className="text-3xl font-bold text-green-600">
            {orders.filter(o => o.order_status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, mã đơn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Mã ĐH</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Khách hàng</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-600">Ngày đặt</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Tổng tiền</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-600">Bạn nhận</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-600">Trạng thái</th>
                  <th className="text-center p-4 text-sm font-medium text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      <p className="font-mono text-sm font-medium">#{order.order_number || order.id?.slice(-6)}</p>
                      <p className="text-xs text-gray-500">{new Date(order.created_date).toLocaleDateString('vi-VN')}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">{order.customer_phone}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                      <p className="text-xs text-gray-400">{order.delivery_time}</p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold text-gray-900">
                        {(order.total_amount || 0).toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-xs text-red-600">
                        Commission: -{(order.commission_total || 0).toLocaleString('vi-VN')}đ
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-bold text-green-600">
                        {(order.shop_revenue || 0).toLocaleString('vi-VN')}đ
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                        ${getStatusColor(order.order_status) === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                          getStatusColor(order.order_status) === 'blue' ? 'bg-blue-100 text-blue-700' :
                          getStatusColor(order.order_status) === 'green' ? 'bg-green-100 text-green-700' :
                          getStatusColor(order.order_status) === 'red' ? 'bg-red-100 text-red-700' :
                          getStatusColor(order.order_status) === 'purple' ? 'bg-purple-100 text-purple-700' :
                          getStatusColor(order.order_status) === 'indigo' ? 'bg-indigo-100 text-indigo-700' :
                          'bg-gray-100 text-gray-700'}`}
                      >
                        {statusOptions.find(s => s.value === order.order_status)?.label || 'Chờ xử lý'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        Chi tiết
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có đơn hàng nào</p>
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}

// New default export component wrapping the main ShopOrders logic
export default function ShopOrdersPage() {
  return (
    <TenantGuard requireTenantId={true}>
      <ShopLayout>
        <ShopOrders />
      </ShopLayout>
    </TenantGuard>
  );
}

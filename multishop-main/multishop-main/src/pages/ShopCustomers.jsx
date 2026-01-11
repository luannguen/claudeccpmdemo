
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Search, Eye, X, Phone, Mail, MapPin,
  ShoppingBag, DollarSign, Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ShopLayout from "@/components/ShopLayout";
import TenantGuard, { useTenantAccess } from "@/components/TenantGuard";

function CustomerDetailModal({ customer, orders, onClose }) {
  if (!customer) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold">{customer.full_name}</h2>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <ShoppingBag className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{customer.total_orders || 0}</p>
              <p className="text-xs text-gray-600">Đơn hàng</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" /> {/* Changed from TrendingUp to DollarSign */}
              <p className="text-2xl font-bold text-green-600">
                {((customer.total_spent || 0) / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-600">Đã mua</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" /> {/* Changed from Star to Users, as Star was removed */}
              <p className="text-lg font-bold text-purple-600">
                {customer.customer_type === 'vip' ? 'VIP' : customer.customer_type === 'active' ? 'Active' : 'New'}
              </p>
              <p className="text-xs text-gray-600">Loại KH</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-bold mb-4">Thông Tin Liên Hệ</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                <span>
                  {customer.address}
                  {customer.ward && `, ${customer.ward}`}
                  {customer.district && `, ${customer.district}`}
                  {customer.city && `, ${customer.city}`}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <h3 className="font-bold mb-4">Đơn Hàng Gần Đây</h3>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-mono text-sm font-medium">#{order.order_number || order.id?.slice(-6)}</p>
                    <p className="text-xs text-gray-500">{new Date(order.created_date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#7CB342]">{(order.total_amount || 0).toLocaleString('vi-VN')}đ</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.order_status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.order_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ShopCustomers() {
  const { tenant, tenantId } = useTenantAccess();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Fetch shop's customers
  const { data: customers = [] } = useQuery({
    queryKey: ['shop-customers', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const allCustomers = await base44.entities.Customer.list('-created_date', 500);
      return allCustomers.filter(c => c.tenant_id === tenantId);
    },
    enabled: !!tenantId,
    staleTime: 5 * 1000,
    refetchOnMount: 'always'
  });

  // Fetch shop's orders for customer details
  const { data: orders = [] } = useQuery({
    queryKey: ['shop-orders-customers', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const allOrders = await base44.entities.Order.list('-created_date', 500);
      return allOrders.filter(o => o.shop_id === tenantId);
    },
    enabled: !!tenantId,
    staleTime: 5 * 1000,
    refetchOnMount: 'always'
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);

    const matchesType = typeFilter === "all" || customer.customer_type === typeFilter;

    return matchesSearch && matchesType;
  });

  const stats = {
    total: customers.length,
    new: customers.filter(c => c.customer_type === 'new').length,
    active: customers.filter(c => c.customer_type === 'active').length,
    vip: customers.filter(c => c.customer_type === 'vip').length
  };

  if (!tenant) {
    return (
      <div className="text-center py-20">
        <Users className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <p className="text-gray-600">Không tìm thấy thông tin shop</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">
          Khách Hàng
        </h1>
        <p className="text-gray-600">Quản lý khách hàng của {tenant?.organization_name}</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Tổng KH</p>
          <p className="text-3xl font-bold text-[#0F0F0F]">{stats.total}</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Mới</p>
          <p className="text-3xl font-bold text-blue-600">{stats.new}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">Active</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-purple-50 rounded-2xl p-6 shadow-lg">
          <p className="text-sm text-gray-500 mb-2">VIP</p>
          <p className="text-3xl font-bold text-purple-600">{stats.vip}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          >
            <option value="all">Tất cả loại KH</option>
            <option value="new">Mới</option>
            <option value="active">Active</option>
            <option value="vip">VIP</option>
          </select>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <motion.div
            key={customer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold">
                  {customer.full_name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold">{customer.full_name}</h3>
                  <p className="text-sm text-gray-500">{customer.phone}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                customer.customer_type === 'vip' ? 'bg-purple-100 text-purple-700' :
                customer.customer_type === 'active' ? 'bg-green-100 text-green-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {customer.customer_type === 'vip' ? 'VIP' :
                 customer.customer_type === 'active' ? 'Active' : 'New'}
              </span>
            </div>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{customer.email}</span>
              </div>
              {customer.city && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{customer.city}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <ShoppingBag className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-xl font-bold text-blue-600">{customer.total_orders || 0}</p>
                <p className="text-xs text-gray-600">Đơn hàng</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" /> {/* Changed from TrendingUp to DollarSign */}
                <p className="text-xl font-bold text-green-600">
                  {((customer.total_spent || 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-600">Đã mua</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(customer)}
              className="w-full bg-[#7CB342] text-white py-2 rounded-lg hover:bg-[#FF9800] transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Xem Chi Tiết
            </button>
          </motion.div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Chưa có khách hàng</p>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          orders={orders.filter(o => o.customer_email === selectedCustomer.email)}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

export default function ShopCustomersPage() {
  return (
    <TenantGuard requireTenantId={true}>
      <ShopLayout>
        <ShopCustomers />
      </ShopLayout>
    </TenantGuard>
  );
}


import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Package, ShoppingCart, Users, DollarSign,
  Eye, ArrowUpRight, Store
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import ShopLayout from "@/components/ShopLayout";
import TenantGuard, { useTenantAccess } from "@/components/TenantGuard";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#E91E63'];

function ShopDashboard() {
  const { tenant, tenantId } = useTenantAccess();

  const { data: shopProducts = [] } = useQuery({
    queryKey: ['shop-dashboard-products', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const products = await base44.entities.ShopProduct.list('-created_date', 500);
      return products.filter(sp => sp.shop_id === tenantId);
    },
    enabled: !!tenantId,
    staleTime: 5 * 1000,
    refetchOnMount: 'always'
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['shop-dashboard-orders', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const allOrders = await base44.entities.Order.list('-created_date', 500);
      return allOrders.filter(o => o.shop_id === tenantId);
    },
    enabled: !!tenantId,
    staleTime: 5 * 1000,
    refetchOnMount: 'always'
  });

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.shop_revenue || 0), 0);
  const totalOrders = orders.length;
  const activeProducts = shopProducts.filter(sp => sp.is_active && sp.status === 'active').length;
  const pendingOrders = orders.filter(o => o.order_status === 'pending').length;

  // Recent orders (last 7 days)
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const recentOrders = orders.filter(o => new Date(o.created_date) >= last7Days);

  // Chart data
  const revenueData = recentOrders.reduce((acc, order) => {
    const date = new Date(order.created_date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.revenue += order.shop_revenue || 0;
    } else {
      acc.push({ date, revenue: order.shop_revenue || 0 });
    }
    return acc;
  }, []);

  const topProducts = shopProducts
    .sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0))
    .slice(0, 5)
    .map(p => ({
      name: p.platform_product_name?.substring(0, 20) || 'Product',
      value: p.total_sold || 0
    }));

  if (!tenant || !tenantId) {
    return (
      <div className="text-center py-20">
        <Store className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <p className="text-gray-600">Không tìm thấy thông tin shop</p>
        <Link
          to={createPageUrl('TenantSignup')}
          className="inline-block mt-4 px-6 py-3 bg-[#7CB342] text-white rounded-xl hover:bg-[#FF9800]"
        >
          Đăng Ký Shop Mới
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Shop Dashboard
            </h1>
            <p className="text-gray-600">Chào mừng trở lại, {tenant?.organization_name}</p>
          </div>
          
          {tenant && (
            <div className="flex gap-4">
              <a
                href={createPageUrl(`ShopPublicStorefront?shop=${tenant.slug}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-5 h-5" />
                Xem Storefront
              </a>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-10 h-10 opacity-80" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +12%
              </span>
            </div>
            <p className="text-sm opacity-90 mb-1">Doanh Thu</p>
            <p className="text-3xl font-bold">{totalRevenue.toLocaleString('vi-VN')}đ</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <ShoppingCart className="w-10 h-10 opacity-80" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                {pendingOrders} chờ
              </span>
            </div>
            <p className="text-sm opacity-90 mb-1">Đơn Hàng</p>
            <p className="text-3xl font-bold">{totalOrders}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <Package className="w-10 h-10 opacity-80" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                {activeProducts} active
              </span>
            </div>
            <p className="text-sm opacity-90 mb-1">Sản Phẩm</p>
            <p className="text-3xl font-bold">{shopProducts.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-10 h-10 opacity-80" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" />
                +8%
              </span>
            </div>
            <p className="text-sm opacity-90 mb-1">Đã Bán (7 ngày)</p>
            <p className="text-3xl font-bold">
              {shopProducts.reduce((sum, p) => sum + (p.total_sold || 0), 0)}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#7CB342]" />
            Doanh Thu 7 Ngày Qua
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
              <Line type="monotone" dataKey="revenue" stroke="#7CB342" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#FF9800]" />
            Top 5 Sản Phẩm Bán Chạy
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topProducts}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {topProducts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6">Thao Tác Nhanh</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to={createPageUrl(`ShopProductCatalog?tenant=${tenantId}`)}
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-[#7CB342] hover:bg-green-50 transition-colors"
          >
            <Package className="w-10 h-10 text-[#7CB342]" />
            <div>
              <p className="font-bold">Thêm Sản Phẩm</p>
              <p className="text-sm text-gray-600">Browse catalog</p>
            </div>
          </Link>

          <Link
            to={createPageUrl(`ShopOrders?tenant=${tenantId}`)}
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-colors"
          >
            <ShoppingCart className="w-10 h-10 text-blue-600" />
            <div>
              <p className="font-bold">Xem Đơn Hàng</p>
              <p className="text-sm text-gray-600">{pendingOrders} đang chờ</p>
            </div>
          </Link>

          <Link
            to={createPageUrl(`TenantSettings?tenant=${tenantId}`)}
            className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50 transition-colors"
          >
            <Store className="w-10 h-10 text-purple-600" />
            <div>
              <p className="font-bold">Cài Đặt Shop</p>
              <p className="text-sm text-gray-600">Branding & settings</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ShopDashboardPage() {
  return (
    <TenantGuard requireTenantId={true}>
      <ShopLayout>
        <ShopDashboard />
      </ShopLayout>
    </TenantGuard>
  );
}

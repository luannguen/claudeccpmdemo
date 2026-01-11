import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, DollarSign, Package, ShoppingCart,
  Award, Target, Users, Calendar, ArrowLeft
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#F44336', '#9C27B0'];

function SuperAdminShopPerformanceContent() {
  const urlParams = new URLSearchParams(window.location.search);
  const shopId = urlParams.get('shop');

  // Fetch shop info
  const { data: shop, isLoading: shopLoading } = useQuery({
    queryKey: ['shop-performance', shopId],
    queryFn: async () => {
      if (!shopId) return null;
      const tenants = await base44.entities.Tenant.list('-created_date', 500);
      return tenants.find(t => t.id === shopId);
    },
    enabled: !!shopId
  });

  // Fetch shop products
  const { data: shopProducts = [] } = useQuery({
    queryKey: ['shop-products-performance', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const products = await base44.entities.ShopProduct.list('-created_date', 1000);
      return products.filter(sp => sp.shop_id === shopId);
    },
    enabled: !!shopId
  });

  // Fetch shop orders (mock - need real implementation)
  const { data: shopOrders = [] } = useQuery({
    queryKey: ['shop-orders-performance', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const orders = await base44.entities.Order.list('-created_date', 1000);
      return orders.filter(o => o.shop_id === shopId);
    },
    enabled: !!shopId
  });

  // Calculate detailed metrics
  const metrics = useMemo(() => {
    const totalRevenue = shopProducts.reduce((sum, sp) => sum + (sp.total_revenue || 0), 0);
    const totalCommission = shopProducts.reduce((sum, sp) => sum + (sp.total_commission || 0), 0);
    const totalSold = shopProducts.reduce((sum, sp) => sum + (sp.total_sold || 0), 0);
    const avgOrderValue = totalSold > 0 ? totalRevenue / totalSold : 0;
    
    // Top products
    const topProducts = [...shopProducts]
      .sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0))
      .slice(0, 5);
    
    // Revenue by product category (mock)
    const revenueByCategory = {
      vegetables: shopProducts.filter(sp => sp.platform_product_name?.includes('Rau')).reduce((sum, sp) => sum + (sp.total_revenue || 0), 0),
      fruits: shopProducts.filter(sp => sp.platform_product_name?.includes('Trái')).reduce((sum, sp) => sum + (sp.total_revenue || 0), 0),
      rice: shopProducts.filter(sp => sp.platform_product_name?.includes('Gạo')).reduce((sum, sp) => sum + (sp.total_revenue || 0), 0),
      other: 0
    };

    // Monthly trend (last 6 months - mock)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      monthlyTrend.push({
        month: date.toLocaleDateString('vi-VN', { month: 'short' }),
        revenue: Math.floor(totalRevenue / 6 * (0.8 + Math.random() * 0.4)),
        orders: Math.floor(totalSold / 6 * (0.8 + Math.random() * 0.4))
      });
    }

    return {
      totalRevenue,
      totalCommission,
      totalSold,
      avgOrderValue,
      topProducts,
      revenueByCategory,
      monthlyTrend,
      netRevenue: totalRevenue - totalCommission
    };
  }, [shopProducts, shopOrders]);

  if (!shopId) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">Vui lòng chọn shop để xem performance</p>
        <Link to={createPageUrl('SuperAdminTenants')} className="text-[#7CB342] hover:underline">
          ← Quay lại danh sách shops
        </Link>
      </div>
    );
  }

  if (shopLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center py-20">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">Không tìm thấy shop</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          to={createPageUrl('SuperAdminTenants')}
          className="text-[#7CB342] hover:text-[#FF9800] mb-4 inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại danh sách shops
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {shop.organization_name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">
              {shop.organization_name}
            </h1>
            <p className="text-gray-600">Performance Analytics & Reports</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng Doanh Thu</p>
              <p className="text-2xl font-bold text-[#0F0F0F]">
                {metrics.totalRevenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Net: {metrics.netRevenue.toLocaleString('vi-VN')}đ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đơn Hàng</p>
              <p className="text-2xl font-bold text-[#0F0F0F]">{metrics.totalSold}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            AOV: {metrics.avgOrderValue.toLocaleString('vi-VN')}đ
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sản Phẩm</p>
              <p className="text-2xl font-bold text-[#0F0F0F]">{shopProducts.length}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Active: {shopProducts.filter(sp => sp.is_active).length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Commission</p>
              <p className="text-2xl font-bold text-[#0F0F0F]">
                {metrics.totalCommission.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Rate: {shop.commission_rate || 3}%
          </p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">
            Revenue & Orders Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#7CB342" strokeWidth={2} name="Revenue (VNĐ)" />
              <Line type="monotone" dataKey="orders" stroke="#FF9800" strokeWidth={2} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">
            Revenue by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(metrics.revenueByCategory).map(([name, value]) => ({
                  name: name.charAt(0).toUpperCase() + name.slice(1),
                  value
                }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.keys(metrics.revenueByCategory).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <h3 className="text-lg font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-[#7CB342]" />
          Top 5 Sản Phẩm Bán Chạy
        </h3>
        <div className="space-y-4">
          {metrics.topProducts.map((product, idx) => (
            <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                idx === 0 ? 'bg-yellow-500' :
                idx === 1 ? 'bg-gray-400' :
                idx === 2 ? 'bg-orange-500' :
                'bg-gray-300'
              }`}>
                #{idx + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{product.platform_product_name}</p>
                <p className="text-sm text-gray-500">
                  {product.shop_price.toLocaleString('vi-VN')}đ / {product.unit || 'kg'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-[#7CB342]">{product.total_sold || 0} đã bán</p>
                <p className="text-sm text-gray-600">
                  {(product.total_revenue || 0).toLocaleString('vi-VN')}đ
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shop Info Summary */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[#0F0F0F] mb-4">Shop Information</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Subscription Plan</p>
            <p className="font-bold text-[#7CB342] text-lg uppercase">{shop.subscription_plan}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Commission Rate</p>
            <p className="font-bold text-blue-600 text-lg">{shop.commission_rate || 3}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Joined Date</p>
            <p className="font-medium text-gray-900">
              {new Date(shop.created_date).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminShopPerformance() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminShopPerformanceContent />
      </AdminLayout>
    </AdminGuard>
  );
}
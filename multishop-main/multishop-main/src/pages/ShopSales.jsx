
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, Package, ShoppingCart, Download
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ShopLayout from "@/components/ShopLayout";
import TenantGuard, { useTenantAccess } from "@/components/TenantGuard";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#E91E63', '#9C27B0'];

function ShopSalesContent() {
  const { tenant, tenantId } = useTenantAccess();

  const { data: shopProducts = [] } = useQuery({
    queryKey: ['shop-sales-products', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const products = await base44.entities.ShopProduct.list('-created_date', 500);
      return products.filter(sp => sp.shop_id === tenantId);
    },
    enabled: !!tenantId,
    staleTime: 5 * 1000, // Changed from 5 * 60 * 1000
    refetchOnMount: 'always' // Changed from false
    // refetchOnWindowFocus: false // Removed as refetchOnMount: 'always' implies it
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['shop-sales-orders', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const allOrders = await base44.entities.Order.list('-created_date', 500);
      return allOrders.filter(o => o.shop_id === tenantId);
    },
    enabled: !!tenantId,
    staleTime: 5 * 1000, // Changed from 5 * 60 * 1000
    refetchOnMount: 'always' // Changed from false
    // refetchOnWindowFocus: false // Removed as refetchOnMount: 'always' implies it
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['shop-sales-commissions', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const allCommissions = await base44.entities.Commission.list('-created_date', 500);
      return allCommissions.filter(c => c.shop_id === tenantId);
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });

  const analytics = useMemo(() => {
    const now = new Date();

    // Monthly data (last 12 months)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);

      const monthOrders = orders.filter(o => o.created_date?.startsWith(monthKey));
      const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.shop_revenue || 0), 0);
      const monthCommission = monthOrders.reduce((sum, o) => sum + (o.commission_total || 0), 0);

      monthlyData.push({
        month: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        commission: monthCommission,
        orders: monthOrders.length
      });
    }

    // Product performance
    const productPerformance = shopProducts
      .map(sp => ({
        name: sp.platform_product_name,
        revenue: sp.total_revenue || 0,
        sold: sp.total_sold || 0,
        commission: (sp.total_revenue || 0) * ((sp.commission_rate || 3) / 100)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Commission by month
    const commissionByMonth = monthlyData.map(m => ({
      month: m.month,
      commission: m.commission,
      revenue: m.revenue
    }));

    // Total metrics
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalCommission = commissions.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const netRevenue = totalRevenue - totalCommission;
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const avgCommissionRate = totalRevenue > 0 ? (totalCommission / totalRevenue * 100) : 3;

    // This month vs last month
    const thisMonth = now.toISOString().slice(0, 7);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

    const thisMonthOrders = orders.filter(o => o.created_date?.startsWith(thisMonth));
    const lastMonthOrders = orders.filter(o => o.created_date?.startsWith(lastMonth));

    const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + (o.shop_revenue || 0), 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + (o.shop_revenue || 0), 0);

    const revenueGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;
    const ordersGrowth = lastMonthOrders.length > 0 ? ((thisMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length * 100) : 0;

    return {
      monthlyData,
      productPerformance,
      commissionByMonth,
      totalRevenue,
      totalCommission,
      netRevenue,
      avgOrderValue,
      avgCommissionRate,
      revenueGrowth,
      ordersGrowth,
      thisMonthOrders: thisMonthOrders.length,
      thisMonthRevenue
    };
  }, [shopProducts, orders, commissions]);

  if (!tenant) {
    return (
      <div className="text-center py-20">
        <TrendingUp className="w-20 h-20 text-gray-300 mx-auto mb-6" />
        <p className="text-gray-600">Không tìm thấy thông tin shop</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">
              Doanh Thu & Analytics
            </h1>
            <p className="text-gray-600">Báo cáo chi tiết của {tenant.organization_name}</p>
          </div>
          <button className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2">
            <Download className="w-5 h-5" />
            Xuất Báo Cáo
          </button>
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
                {analytics.netRevenue.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${analytics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.revenueGrowth >= 0 ? '↗' : '↘'} {Math.abs(analytics.revenueGrowth).toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">vs tháng trước</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hoa Hồng Đã Trả</p>
              <p className="text-2xl font-bold text-[#0F0F0F]">
                {analytics.totalCommission.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Rate: {analytics.avgCommissionRate.toFixed(1)}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đơn Hàng Tháng Này</p>
              <p className="text-2xl font-bold text-[#0F0F0F]">{analytics.thisMonthOrders}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${analytics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.ordersGrowth >= 0 ? '↗' : '↘'} {Math.abs(analytics.ordersGrowth).toFixed(1)}%
            </span>
            <span className="text-xs text-gray-500">vs tháng trước</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">AOV</p>
              <p className="text-2xl font-bold text-[#0F0F0F]">
                {Math.round(analytics.avgOrderValue).toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">Giá trị đơn trung bình</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">
            Xu Hướng Doanh Thu 12 Tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#7CB342" strokeWidth={2} name="Doanh thu" />
              <Line type="monotone" dataKey="commission" stroke="#F44336" strokeWidth={2} name="Hoa hồng" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">
            Số Đơn Hàng 12 Tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#2196F3" name="Đơn hàng" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
        <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">
          Top 10 Sản Phẩm Theo Doanh Thu
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analytics.productPerformance} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={150} />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#7CB342" name="Doanh thu (VNĐ)" />
            <Bar dataKey="commission" fill="#FF9800" name="Hoa hồng (VNĐ)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Commission Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">Tóm Tắt Hoa Hồng</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Tổng Hoa Hồng Đã Trả</p>
            <p className="text-3xl font-bold text-red-600">
              {analytics.totalCommission.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className="bg-white rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Rate Trung Bình</p>
            <p className="text-3xl font-bold text-blue-600">
              {analytics.avgCommissionRate.toFixed(2)}%
            </p>
          </div>
          <div className="bg-white rounded-xl p-6">
            <p className="text-sm text-gray-600 mb-2">Doanh Thu Ròng</p>
            <p className="text-3xl font-bold text-green-600">
              {analytics.netRevenue.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShopSales() {
  return (
    <TenantGuard requireTenantId={true}>
      <ShopLayout>
        <ShopSalesContent />
      </ShopLayout>
    </TenantGuard>
  );
}

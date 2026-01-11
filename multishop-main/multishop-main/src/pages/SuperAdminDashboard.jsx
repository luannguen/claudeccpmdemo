
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Store, ShoppingCart, Package, DollarSign, TrendingUp,
  Users, Award, Activity, AlertCircle, Crown, BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#E91E63', '#9C27B0'];

function SuperAdminDashboardContent() {
  // Fetch all data
  const { data: tenants = [] } = useQuery({
    queryKey: ['super-admin-dashboard-tenants'],
    queryFn: () => base44.entities.Tenant.list('-created_date', 500),
    staleTime: 5 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnMount: 'always'
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['super-admin-dashboard-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 500),
    staleTime: 5 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnMount: 'always'
  });

  const { data: shopProducts = [] } = useQuery({
    queryKey: ['super-admin-dashboard-products'],
    queryFn: () => base44.entities.ShopProduct.list('-created_date', 500),
    staleTime: 5 * 1000,
    refetchOnMount: 'always'
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ['super-admin-commissions'], // This query key was not changed in the outline, keeping existing one.
    queryFn: () => base44.entities.Commission.list('-created_date', 500),
    initialData: []
  });

  const { data: loyaltyAccounts = [] } = useQuery({
    queryKey: ['super-admin-dashboard-loyalty'],
    queryFn: () => base44.entities.LoyaltyAccount.list('-created_date', 500),
    staleTime: 5 * 1000,
    refetchOnMount: 'always'
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    // Tenants
    const activeShops = tenants.filter(t => t.status === 'active').length;
    const pendingApproval = tenants.filter(t => !t.onboarding_completed || t.status === 'inactive').length;

    // Orders
    const totalOrders = orders.length;
    const platformOrders = orders.filter(o => !o.shop_id).length;
    const shopOrders = orders.filter(o => o.shop_id).length;

    // Revenue
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const platformRevenue = orders.filter(o => !o.shop_id).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalCommission = orders.reduce((sum, o) => sum + (o.commission_total || 0), 0);

    // Products
    const totalListings = shopProducts.length;
    const activeListings = shopProducts.filter(sp => sp.is_active && sp.status === 'active').length;

    // Users
    const totalCustomers = loyaltyAccounts.length;
    const vipCustomers = loyaltyAccounts.filter(la => la.tier === 'gold' || la.tier === 'platinum').length;

    return {
      activeShops,
      pendingApproval,
      totalOrders,
      platformOrders,
      shopOrders,
      totalRevenue,
      platformRevenue,
      totalCommission,
      totalListings,
      activeListings,
      totalCustomers,
      vipCustomers
    };
  }, [tenants, orders, shopProducts, loyaltyAccounts]);

  // Revenue trend (last 7 days)
  const revenueTrend = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });

      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.created_date);
        return orderDate.toDateString() === date.toDateString();
      });

      last7Days.push({
        date: dateStr,
        platform: dayOrders.filter(o => !o.shop_id).reduce((sum, o) => sum + (o.total_amount || 0), 0),
        shops: dayOrders.filter(o => o.shop_id).reduce((sum, o) => sum + (o.total_amount || 0), 0),
        commission: dayOrders.reduce((sum, o) => sum + (o.commission_total || 0), 0)
      });
    }
    return last7Days;
  }, [orders]);

  // Top shops by revenue
  const topShops = useMemo(() => {
    const shopRevenue = {};
    orders.filter(o => o.shop_id).forEach(order => {
      if (!shopRevenue[order.shop_id]) {
        shopRevenue[order.shop_id] = {
          shop_name: order.shop_name,
          revenue: 0,
          orders: 0,
          commission: 0
        };
      }
      shopRevenue[order.shop_id].revenue += order.total_amount || 0;
      shopRevenue[order.shop_id].orders += 1;
      shopRevenue[order.shop_id].commission += order.commission_total || 0;
    });

    return Object.values(shopRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders]);

  // Subscription distribution
  const subscriptionDist = useMemo(() => {
    const dist = { free: 0, starter: 0, pro: 0, enterprise: 0 };
    tenants.forEach(t => {
      dist[t.subscription_plan] = (dist[t.subscription_plan] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [tenants]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2 flex items-center gap-3">
              <Crown className="w-8 h-8 text-purple-600" />
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600">Platform Overview & Analytics</p>
          </div>

          {metrics.pendingApproval > 0 && (
            <Link
              to={createPageUrl('SuperAdminApprovals')}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              <AlertCircle className="w-5 h-5" />
              {metrics.pendingApproval} Cần Duyệt
            </Link>
          )}
        </div>

        {/* Debug Panel */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            📊 <strong>Data Status:</strong> {tenants.length} shops, {orders.length} orders,
            {shopProducts.length} shop products, {loyaltyAccounts.length} users
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Store className="w-10 h-10 opacity-80" />
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs">{metrics.activeShops} active</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Shops</p>
          <p className="text-3xl font-bold">{tenants.length}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <ShoppingCart className="w-10 h-10 opacity-80" />
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs">{metrics.shopOrders} shops</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Total Orders</p>
          <p className="text-3xl font-bold">{metrics.totalOrders}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-10 h-10 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Platform Revenue</p>
          <p className="text-3xl font-bold">{(metrics.totalRevenue / 1000000).toFixed(1)}M</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-10 h-10 opacity-80" />
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs">Commission</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Commission Earned</p>
          <p className="text-3xl font-bold">{(metrics.totalCommission / 1000000).toFixed(1)}M</p>
        </motion.div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#7CB342]" />
            Revenue Trend (7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${(value / 1000).toFixed(0)}K`} />
              <Legend />
              <Line type="monotone" dataKey="platform" stroke="#2196F3" name="Platform" strokeWidth={2} />
              <Line type="monotone" dataKey="shops" stroke="#7CB342" name="Shops" strokeWidth={2} />
              <Line type="monotone" dataKey="commission" stroke="#FF9800" name="Commission" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription Distribution */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-600" />
            Subscription Plans
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subscriptionDist}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {subscriptionDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Shops & Quick Stats */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Shops */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#7CB342]" />
            Top 5 Shops by Revenue
          </h3>
          <div className="space-y-4">
            {topShops.map((shop, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-bold">{shop.shop_name}</p>
                    <p className="text-sm text-gray-500">{shop.orders} đơn hàng</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#7CB342]">{(shop.revenue / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-500">Commission: {(shop.commission / 1000).toFixed(0)}K</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Platform Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Store className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-bold">Active Shops</p>
                  <p className="text-sm text-gray-600">{metrics.pendingApproval} pending approval</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600">{metrics.activeShops}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-bold">Product Listings</p>
                  <p className="text-sm text-gray-600">{metrics.activeListings} active</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600">{metrics.totalListings}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="font-bold">Platform Users</p>
                  <p className="text-sm text-gray-600">{metrics.vipCustomers} VIP members</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-600">{metrics.totalCustomers}</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="font-bold">Commission Pool</p>
                  <p className="text-sm text-gray-600">From {metrics.shopOrders} shop orders</p>
                </div>
              </div>
              <p className="text-3xl font-bold text-orange-600">{(metrics.totalCommission / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border-2 border-purple-200">
        <h3 className="font-bold text-purple-900 mb-4">🚀 Quick Actions</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <Link to={createPageUrl('SuperAdminTenants')} className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
            <Store className="w-8 h-8 text-purple-600 mb-2" />
            <p className="font-bold">Quản Lý Shops</p>
            <p className="text-xs text-gray-600">{tenants.length} shops</p>
          </Link>
          <Link to={createPageUrl('SuperAdminApprovals')} className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
            <AlertCircle className="w-8 h-8 text-orange-600 mb-2" />
            <p className="font-bold">Approvals</p>
            <p className="text-xs text-gray-600">{metrics.pendingApproval} pending</p>
          </Link>
          <Link to={createPageUrl('AdminOrders')} className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
            <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
            <p className="font-bold">All Orders</p>
            <p className="text-xs text-gray-600">{metrics.totalOrders} orders</p>
          </Link>
          <Link to={createPageUrl('SuperAdminCommissions')} className="bg-white p-4 rounded-xl hover:shadow-lg transition-shadow">
            <DollarSign className="w-8 h-8 text-green-600 mb-2" />
            <p className="font-bold">Commissions</p>
            <p className="text-xs text-gray-600">{(metrics.totalCommission / 1000).toFixed(0)}K</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminDashboardContent />
      </AdminLayout>
    </AdminGuard>
  );
}

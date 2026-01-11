
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, ShoppingCart, DollarSign, Package,
  Store, Award, Activity, Crown, BarChart3
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#E91E63', '#9C27B0'];

function SuperAdminAnalyticsContent() {
  // Fetch data with debug logging
  const { data: orders = [] } = useQuery({
    queryKey: ['super-admin-analytics-orders'],
    queryFn: async () => {
      console.log('Analytics: Fetching orders...');
      const result = await base44.entities.Order.list('-created_date', 500);
      console.log('Analytics: Orders fetched:', result.length);
      return result;
    },
    initialData: [],
    refetchOnMount: true
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['super-admin-analytics-tenants'],
    queryFn: async () => {
      console.log('Analytics: Fetching tenants...');
      const result = await base44.entities.Tenant.list('-created_date', 500);
      console.log('Analytics: Tenants fetched:', result.length);
      return result;
    },
    initialData: [],
    refetchOnMount: true
  });

  const { data: shopProducts = [] } = useQuery({
    queryKey: ['super-admin-analytics-products'],
    queryFn: async () => {
      const result = await base44.entities.ShopProduct.list('-created_date', 500);
      return result;
    },
    initialData: []
  });

  const { data: loyaltyAccounts = [] } = useQuery({
    queryKey: ['super-admin-analytics-loyalty'],
    queryFn: () => base44.entities.LoyaltyAccount.list('-created_date', 500),
    initialData: []
  });

  // Growth metrics (last 30 days)
  const growthData = useMemo(() => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.created_date);
        return orderDate.toDateString() === date.toDateString();
      });
      
      const dayTenants = tenants.filter(t => {
        const tenantDate = new Date(t.created_date);
        return tenantDate.toDateString() === date.toDateString();
      });
      
      last30Days.push({
        date: dateStr,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        shops: dayTenants.length,
        commission: dayOrders.reduce((sum, o) => sum + (o.commission_total || 0), 0)
      });
    }
    return last30Days;
  }, [orders, tenants]);

  // User tier distribution
  const tierDistribution = useMemo(() => {
    const dist = { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    loyaltyAccounts.forEach(la => {
      dist[la.tier] = (dist[la.tier] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ 
      name: name === 'bronze' ? '🥉 Đồng' : 
            name === 'silver' ? '🥈 Bạc' : 
            name === 'gold' ? '🥇 Vàng' : '💎 Bạch Kim', 
      value 
    }));
  }, [loyaltyAccounts]);

  // Shop by subscription plan
  const planDistribution = useMemo(() => {
    const dist = {};
    tenants.forEach(t => {
      dist[t.subscription_plan] = (dist[t.subscription_plan] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ 
      name: name.toUpperCase(), 
      value 
    }));
  }, [tenants]);

  // Commission data by shop
  const commissionData = useMemo(() => {
    const shopOrders = orders.filter(o => o.shop_id);
    const byShop = {};
    
    shopOrders.forEach(order => {
      if (!byShop[order.shop_id]) {
        byShop[order.shop_id] = {
          shop_id: order.shop_id,
          shop_name: order.shop_name,
          orders: 0,
          revenue: 0,
          commission: 0
        };
      }
      byShop[order.shop_id].orders += 1;
      byShop[order.shop_id].revenue += order.total_amount || 0;
      byShop[order.shop_id].commission += order.commission_total || 0;
    });

    return Object.values(byShop).sort((a, b) => b.commission - a.commission);
  }, [orders]);

  // Calculate KPIs
  const kpis = {
    totalRevenue: orders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
    totalCommission: orders.reduce((sum, o) => sum + (o.commission_total || 0), 0),
    totalOrders: orders.length,
    totalShops: tenants.filter(t => t.status === 'active').length,
    totalUsers: loyaltyAccounts.length,
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, o) => sum + (o.total_amount || 0), 0) / orders.length : 0
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-purple-600" />
          Platform Analytics
        </h1>
        <p className="text-gray-600">Deep insights & performance metrics</p>
        
        {/* Debug Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            📊 <strong>Data:</strong> {tenants.length} shops, {orders.length} orders, 
            {shopProducts.length} listings, {loyaltyAccounts.length} users
          </p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-gray-500 mb-1">Revenue</p>
          <p className="text-2xl font-bold text-green-600">{(kpis.totalRevenue / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-gray-500 mb-1">Commission</p>
          <p className="text-2xl font-bold text-orange-600">{(kpis.totalCommission / 1000000).toFixed(2)}M</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-gray-500 mb-1">Orders</p>
          <p className="text-2xl font-bold text-blue-600">{kpis.totalOrders}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-gray-500 mb-1">Shops</p>
          <p className="text-2xl font-bold text-purple-600">{kpis.totalShops}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-gray-500 mb-1">Users</p>
          <p className="text-2xl font-bold text-indigo-600">{kpis.totalUsers}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-lg">
          <p className="text-xs text-gray-500 mb-1">AOV</p>
          <p className="text-2xl font-bold text-pink-600">{(kpis.avgOrderValue / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-6">Growth Metrics (30 Days)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value) => typeof value === 'number' && value > 1000 ? `${(value / 1000).toFixed(0)}K` : value} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#2196F3" name="Orders" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#7CB342" name="Revenue" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="commission" stroke="#FF9800" name="Commission" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Distribution Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">User Tier Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={tierDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                {tierDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-6">Shop Plans Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={planDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#7CB342" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Shops by Commission */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-6">Top Shops by Commission</h3>
        <div className="space-y-4">
          {commissionData.slice(0, 10).map((shop, index) => (
            <div key={shop.shop_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-bold">{shop.shop_name}</p>
                <p className="text-sm text-gray-600">{shop.orders} đơn hàng</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-600">{(shop.commission / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-500">commission</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminAnalytics() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminAnalyticsContent />
      </AdminLayout>
    </AdminGuard>
  );
}

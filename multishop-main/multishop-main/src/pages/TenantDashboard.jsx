
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Package, ShoppingBag, Users, TrendingUp, Settings, 
  AlertCircle, CheckCircle, Zap, ArrowUpRight, Calendar,
  Store, CreditCard, Bell, Plus, ExternalLink, Crown,
  BarChart3, Target, Activity, Clock, DollarSign
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import UsageLimitBadge from "@/components/tenant/UsageLimitBadge";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import TenantGuard from "@/components/TenantGuard";

function TenantDashboard() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const tenantId = urlParams.get('tenant');

  // Fetch tenant data
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ['tenant-dashboard', tenantId],
    queryFn: async () => {
      if (!tenantId) throw new Error('No tenant ID');
      const tenants = await base44.entities.Tenant.list('-created_date', 100);
      return tenants.find(t => t.id === tenantId);
    },
    enabled: !!tenantId
  });

  // Fetch subscription
  const { data: subscription } = useQuery({
    queryKey: ['tenant-subscription', tenantId],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.list('-created_date', 100);
      return subs.find(s => s.tenant_id === tenantId);
    },
    enabled: !!tenantId
  });

  // Calculate days remaining in trial/subscription
  const daysRemaining = useMemo(() => {
    if (!subscription) return 0;
    const endDate = subscription.status === 'trial' 
      ? new Date(subscription.trial_ends_at)
      : new Date(subscription.current_period_end);
    const now = new Date();
    const diff = endDate - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [subscription]);

  // Mock data for now - in production, fetch from tenant's products/orders
  const stats = {
    products: tenant?.usage?.products_count || 0,
    orders: tenant?.usage?.orders_this_month || 0,
    revenue: 0, // Calculate from orders
    customers: 0 // Calculate from orders
  };

  const usagePercentages = useMemo(() => {
    if (!tenant?.limits || !tenant?.usage) return {};
    return {
      products: (tenant.usage.products_count / tenant.limits.max_products) * 100,
      orders: (tenant.usage.orders_this_month / tenant.limits.max_orders_per_month) * 100,
      users: (tenant.usage.users_count / tenant.limits.max_users) * 100,
      storage: (tenant.usage.storage_used_mb / tenant.limits.max_storage_mb) * 100
    };
  }, [tenant]);

  if (tenantLoading || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Store className="w-8 h-8 text-[#7CB342]" />
                <div>
                  <h1 className="text-xl font-serif font-bold text-[#0F0F0F]">
                    {tenant.organization_name}
                  </h1>
                  <p className="text-xs text-gray-500">
                    zerofarm.vn/{tenant.slug}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <Link
                to={createPageUrl(`TenantSettings?tenant=${tenantId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>

              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold">
                {tenant.owner_name?.charAt(0)?.toUpperCase() || 'T'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Trial/Subscription Alert */}
        {subscription && (subscription.status === 'trial' || daysRemaining <= 7) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 rounded-2xl p-6 flex items-center justify-between ${
              daysRemaining <= 3 ? 'bg-red-50 border-2 border-red-200' :
              daysRemaining <= 7 ? 'bg-orange-50 border-2 border-orange-200' :
              'bg-blue-50 border-2 border-blue-200'
            }`}
          >
            <div className="flex items-center gap-4">
              {subscription.status === 'trial' ? (
                <>
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">
                      {daysRemaining > 0 ? `Còn ${daysRemaining} ngày dùng thử` : 'Trial đã hết hạn'}
                    </h3>
                    <p className="text-sm text-blue-700">
                      Nâng cấp lên gói trả phí để tiếp tục sử dụng
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-orange-900">
                      Subscription sắp hết hạn trong {daysRemaining} ngày
                    </h3>
                    <p className="text-sm text-orange-700">
                      Gia hạn ngay để tránh gián đoạn dịch vụ
                    </p>
                  </div>
                </>
              )}
            </div>
            <Link
              to={createPageUrl(`TenantBilling?tenant=${tenantId}`)}
              className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2"
            >
              {subscription.status === 'trial' ? 'Nâng Cấp Ngay' : 'Gia Hạn'}
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500">
                {stats.products}/{tenant.limits?.max_products || 10}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Sản Phẩm</p>
            <p className="text-3xl font-bold text-[#0F0F0F]">{stats.products}</p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 transition-all"
                style={{ width: `${Math.min(usagePercentages.products || 0, 100)}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500">
                {stats.orders}/{tenant.limits?.max_orders_per_month || 50}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Đơn Hàng Tháng Này</p>
            <p className="text-3xl font-bold text-[#0F0F0F]">{stats.orders}</p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(usagePercentages.orders || 0, 100)}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="text-white/80 text-sm mb-1">Doanh Thu Tháng</p>
            <p className="text-3xl font-bold">{stats.revenue.toLocaleString('vi-VN')}đ</p>
            <p className="text-white/60 text-xs mt-2">+0% so với tháng trước</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-gray-500">
                {tenant.usage?.users_count || 1}/{tenant.limits?.max_users || 2}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Nhân Viên</p>
            <p className="text-3xl font-bold text-[#0F0F0F]">{tenant.usage?.users_count || 1}</p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all"
                style={{ width: `${Math.min(usagePercentages.users || 0, 100)}%` }}
              />
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Grid */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-[#0F0F0F] mb-6">
                Thao Tác Nhanh
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => alert('Navigate to Add Product')}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-[#7CB342] hover:bg-green-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-[#7CB342]/10 rounded-xl flex items-center justify-center group-hover:bg-[#7CB342] transition-colors">
                    <Plus className="w-6 h-6 text-[#7CB342] group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#0F0F0F]">Thêm Sản Phẩm</p>
                    <p className="text-sm text-gray-600">Thêm sản phẩm mới</p>
                  </div>
                </button>

                <button
                  onClick={() => window.open(`https://zerofarm.vn/${tenant.slug}`, '_blank')}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <ExternalLink className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#0F0F0F]">Xem Website</p>
                    <p className="text-sm text-gray-600">Mở website công khai</p>
                  </div>
                </button>

                <Link
                  to={createPageUrl(`TenantSettings?tenant=${tenantId}`)}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                    <Settings className="w-6 h-6 text-purple-600 group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#0F0F0F]">Cài Đặt</p>
                    <p className="text-sm text-gray-600">Tùy chỉnh website</p>
                  </div>
                </Link>

                <Link
                  to={createPageUrl(`TenantUsers?tenant=${tenantId}`)}
                  className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                    <Users className="w-6 h-6 text-orange-600 group-hover:text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#0F0F0F]">Mời Nhân Viên</p>
                    <p className="text-sm text-gray-600">Thêm thành viên</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Getting Started Checklist */}
            {!tenant.onboarding_completed && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                  <h3 className="font-bold text-[#0F0F0F]">Bắt Đầu</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="flex-1 text-sm">Tạo tài khoản</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="flex-1 text-sm">Hoàn tất onboarding</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl opacity-60">
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    <span className="flex-1 text-sm">Thêm sản phẩm đầu tiên</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl opacity-60">
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    <span className="flex-1 text-sm">Nhận đơn hàng đầu tiên</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-[#0F0F0F] mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#7CB342]" />
                Hoạt Động Gần Đây
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#0F0F0F]">Tài khoản đã được tạo</p>
                    <p className="text-sm text-gray-600">
                      {new Date(tenant.created_date).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Chưa có hoạt động gần đây</p>
                </div>
              </div>
            </div>

            {/* Usage Limits Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-lg font-serif font-bold text-[#0F0F0F] mb-6">
                Mức Sử Dụng & Giới Hạn
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <UsageLimitBadge type="product" tenant={tenant} />
                <UsageLimitBadge type="order" tenant={tenant} />
                <UsageLimitBadge type="user" tenant={tenant} />
                <UsageLimitBadge type="storage" tenant={tenant} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Plan Info */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Crown className="w-8 h-8" />
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">
                  {subscription?.status === 'trial' ? 'Trial' : 'Active'}
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-1">
                {tenant.subscription_plan.toUpperCase()}
              </h3>
              <p className="text-white/80 text-sm mb-4">
                {subscription?.status === 'trial' 
                  ? `Còn ${daysRemaining} ngày dùng thử`
                  : `Gia hạn ${daysRemaining} ngày nữa`}
              </p>
              <Link
                to={createPageUrl(`TenantBilling?tenant=${tenantId}`)}
                className="block w-full bg-white text-purple-600 py-3 rounded-xl font-medium text-center hover:bg-gray-100 transition-colors"
              >
                Quản Lý Gói
              </Link>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="font-bold text-[#0F0F0F] mb-4">📚 Tài Nguyên</h3>
              <div className="space-y-3">
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-sm">Hướng dẫn sử dụng</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-sm">Video tutorials</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </a>
                <a href="#" className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-sm">Liên hệ hỗ trợ</span>
                  <ArrowUpRight className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="font-bold text-[#0F0F0F] mb-2">Cần Hỗ Trợ?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Đội ngũ của chúng tôi sẵn sàng giúp đỡ 24/7
              </p>
              <button className="w-full bg-[#7CB342] text-white py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors">
                Chat với chúng tôi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap with TenantGuard instead of AdminGuard
export default function TenantDashboardPage() {
  return (
    <TenantGuard requireTenantId={true}>
      <TenantDashboard />
    </TenantGuard>
  );
}

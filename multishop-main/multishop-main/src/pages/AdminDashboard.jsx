import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

// Hooks
import {
  useOrders,
  useProducts,
  useCustomers,
  useDashboardAnalytics,
  useWishlistStats,
  useExportDashboardData
} from "@/components/hooks/useDashboardData";

import {
  usePreOrderLots,
  usePreOrderProducts,
  usePreOrderAnalytics
} from "@/components/hooks/usePreOrderAnalytics";

// Components
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import DashboardKPICards from "@/components/admin/dashboard/DashboardKPICards";
import DashboardCharts from "@/components/admin/dashboard/DashboardCharts";
import DashboardTopProducts from "@/components/admin/dashboard/DashboardTopProducts";
import DashboardRecentOrders from "@/components/admin/dashboard/DashboardRecentOrders";
import DashboardQuickActions from "@/components/admin/dashboard/DashboardQuickActions";

// Pre-Order Analytics Components
import PreOrderAnalyticsCards from "@/components/admin/dashboard/PreOrderAnalyticsCards";
import PreOrderRevenueChart from "@/components/admin/dashboard/PreOrderRevenueChart";
import PopularLotsTable from "@/components/admin/dashboard/PopularLotsTable";
import HarvestCalendar from "@/components/admin/dashboard/HarvestCalendar";
import PreOrderQuickActions from "@/components/admin/dashboard/PreOrderQuickActions";
import SaasMetricsWidget from "@/components/admin/dashboard/SaasMetricsWidget";

// Gift Module
import { useGiftAdmin, GiftAnalyticsWidget } from "@/components/features/gift";

const AdminDashboardContent = React.memo(function AdminDashboardContent() {
  const [dateRange, setDateRange] = useState("week");
  const [activeTab, setActiveTab] = useState("overview"); // overview | preorder

  // Data hooks
  const { data: orders = [], isError: ordersError } = useOrders();
  const { data: products = [], isError: productsError } = useProducts();
  const { data: customers = [], isError: customersError } = useCustomers();

  // Pre-Order data hooks
  const { data: lots = [] } = usePreOrderLots();
  const { data: preOrderProducts = [] } = usePreOrderProducts();
  
  // Gift data hook
  const { analytics: giftAnalytics, isLoading: loadingGifts } = useGiftAdmin();

  // Computed data
  const analytics = useDashboardAnalytics(orders, products, customers, dateRange);
  const preOrderAnalytics = usePreOrderAnalytics(orders, lots, preOrderProducts, dateRange);
  const wishlistStats = useWishlistStats();
  const handleExport = useExportDashboardData(analytics, orders, products, wishlistStats);

  // Error state
  const hasError = ordersError || productsError || customersError;

  if (hasError) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon.AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-serif font-bold text-[#0F0F0F] mb-4">
          Không Thể Tải Dữ Liệu
        </h2>
        <p className="text-gray-600 mb-6">
          Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#7CB342] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
        >
          Tải Lại Trang
        </button>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader
        dateRange={dateRange}
        setDateRange={setDateRange}
        onExport={handleExport}
      />

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === "overview" 
              ? "bg-[#7CB342] text-white shadow-lg" 
              : "bg-white text-gray-600 hover:bg-gray-50 border"
          }`}
        >
          📊 Tổng Quan
        </button>
        <button
          onClick={() => setActiveTab("preorder")}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === "preorder" 
              ? "bg-amber-500 text-white shadow-lg" 
              : "bg-white text-gray-600 hover:bg-gray-50 border"
          }`}
        >
          🌾 Pre-Order Analytics
        </button>
        <button
          onClick={() => setActiveTab("saas")}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === "saas" 
              ? "bg-indigo-600 text-white shadow-lg" 
              : "bg-white text-gray-600 hover:bg-gray-50 border"
          }`}
        >
          🏪 SaaS Multi-Shop
        </button>
        <button
          onClick={() => setActiveTab("gifts")}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === "gifts" 
              ? "bg-[#7CB342] text-white shadow-lg" 
              : "bg-white text-gray-600 hover:bg-gray-50 border"
          }`}
        >
          🎁 Quà Tặng
        </button>
      </div>

      {activeTab === "overview" && (
        <>
          <DashboardKPICards
            analytics={analytics}
            wishlistStats={wishlistStats}
          />

          <DashboardCharts
            dailyData={analytics.dailyData}
            categoryRevenue={analytics.categoryRevenue}
          />

          {/* Top Products & Recent Orders */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <DashboardTopProducts
              topProducts={analytics.topProducts}
              wishlistStats={wishlistStats}
              products={products}
            />
            <DashboardRecentOrders orders={orders} />
          </div>

          <DashboardQuickActions analytics={analytics} />
        </>
      )}

      {activeTab === "preorder" && (
        <>
          {/* Pre-Order Analytics Section */}
          <PreOrderAnalyticsCards analytics={preOrderAnalytics} />

          <PreOrderRevenueChart analytics={preOrderAnalytics} />

          {/* Popular Lots & Harvest Calendar */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <PopularLotsTable 
              popularLots={preOrderAnalytics.popularLots}
              topSellingLots={preOrderAnalytics.topSellingLots}
            />
            <HarvestCalendar 
              harvestCalendar={preOrderAnalytics.harvestCalendar}
              harvestByMonth={preOrderAnalytics.harvestByMonth}
            />
          </div>

          {/* Pre-Order Status Breakdown */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Trạng Thái Đơn Pre-Order</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {Object.entries(preOrderAnalytics.preorderStatusBreakdown).map(([status, count]) => {
                const statusLabels = {
                  awaiting_harvest: '🌾 Chờ thu hoạch',
                  harvest_ready: '🌿 Sẵn sàng',
                  partial_payment: '💰 Đã cọc',
                  pending: '⏳ Chờ xử lý',
                  confirmed: '✅ Đã xác nhận',
                  shipping: '🚚 Đang giao',
                  delivered: '📦 Đã giao',
                  cancelled: '❌ Đã hủy'
                };
                return (
                  <div key={status} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                    <p className="text-xs text-gray-600 mt-1">{statusLabels[status] || status}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pre-Order Quick Actions */}
          <PreOrderQuickActions analytics={preOrderAnalytics} />
        </>
      )}

      {activeTab === "saas" && (
        <>
          {/* SaaS Multi-Shop Section */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <SaasMetricsWidget />
            </div>
            <div className="space-y-6">
              {/* Quick Actions for SaaS */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon.Zap size={20} className="text-amber-500" />
                  Thao Tác Nhanh
                </h3>
                <div className="space-y-3">
                  <Link 
                    to={createPageUrl('SuperAdminCommissions')}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <Icon.DollarSign size={20} className="text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Commission</p>
                      <p className="text-xs text-gray-500">Quản lý hoa hồng</p>
                    </div>
                  </Link>
                  <Link 
                    to={createPageUrl('SuperAdminBilling')}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Icon.CreditCard size={20} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Billing</p>
                      <p className="text-xs text-gray-500">Invoice & thanh toán</p>
                    </div>
                  </Link>
                  <Link 
                    to={createPageUrl('SuperAdminTenants')}
                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                  >
                    <Icon.Store size={20} className="text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">Tenants</p>
                      <p className="text-xs text-gray-500">Quản lý shop</p>
                    </div>
                  </Link>
                  <Link 
                    to={createPageUrl('Marketplace')}
                    className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
                  >
                    <Icon.ShoppingBag size={20} className="text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900">Marketplace</p>
                      <p className="text-xs text-gray-500">Browse shops</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "gifts" && (
        <>
          {/* Gift Analytics Section */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <GiftAnalyticsWidget analytics={giftAnalytics} isLoading={loadingGifts} />
            </div>
            <div className="space-y-6">
              {/* Quick Actions for Gifts */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon.Gift size={20} className="text-[#7CB342]" />
                  Thao Tác Nhanh
                </h3>
                <div className="space-y-3">
                  <Link 
                    to={createPageUrl('AdminGifts')}
                    className="flex items-center gap-3 p-3 bg-[#7CB342]/10 rounded-xl hover:bg-[#7CB342]/20 transition-colors"
                  >
                    <Icon.Gift size={20} className="text-[#7CB342]" />
                    <div>
                      <p className="font-medium text-gray-900">Quản lý quà</p>
                      <p className="text-xs text-gray-500">Xem tất cả giao dịch</p>
                    </div>
                  </Link>
                  <Link 
                    to={createPageUrl('AdminEcards')}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Icon.User size={20} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">E-Cards</p>
                      <p className="text-xs text-gray-500">Quản lý E-Card</p>
                    </div>
                  </Link>
                </div>
              </div>
              
              {/* Summary Stats */}
              <div className="bg-gradient-to-br from-[#7CB342] to-[#689F38] rounded-2xl p-6 text-white">
                <h4 className="font-medium mb-4">Tóm tắt</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="opacity-80">Tổng quà tặng</span>
                    <span className="font-bold">{giftAnalytics?.totalGifts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Chờ đổi quà</span>
                    <span className="font-bold">{giftAnalytics?.redeemable || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Đã giao</span>
                    <span className="font-bold">{giftAnalytics?.delivered || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminDashboardContent />
      </AdminLayout>
    </AdminGuard>
  );
}
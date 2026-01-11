import React from "react";
import { Download } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

// Hooks & Components
import { useAdminReports } from "@/components/hooks/useAdminReports";
import ReportFilters from "@/components/admin/reports/ReportFilters";
import ReportStats from "@/components/admin/reports/ReportStats";
import RevenueTrendChart from "@/components/admin/reports/RevenueTrendChart";
import CategoryChart from "@/components/admin/reports/CategoryChart";
import TopProductsChart from "@/components/admin/reports/TopProductsChart";
import TopCustomersList from "@/components/admin/reports/TopCustomersList";

function AdminReportsContent() {
  const { analytics, dateRange, setDateRange, handleExport } = useAdminReports();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">
            Báo Cáo & Phân Tích
          </h1>
          <p className="text-gray-600">Advanced Analytics & Insights</p>
        </div>
        <button
          onClick={handleExport}
          className="px-6 py-3 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      <ReportFilters dateRange={dateRange} setDateRange={setDateRange} />

      {analytics.isLoading ? (
        <div className="text-center py-20">Loading...</div>
      ) : (
        <>
          <ReportStats analytics={analytics} />
          
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <RevenueTrendChart data={analytics.dailyData} />
            <CategoryChart data={analytics.categoryRevenue} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <TopProductsChart data={analytics.topProducts} />
            <TopCustomersList customers={analytics.topCustomers} />
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminReports() {
  return (
    <AdminGuard requiredModule="reports" requiredPermission="reports.view">
      <AdminLayout>
        <AdminReportsContent />
      </AdminLayout>
    </AdminGuard>
  );
}
import React from "react";
import { Download } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

// Hooks
import { useInsightsData, useCustomerInsights, exportInsightsToCSV } from "@/components/hooks/useCustomerInsights";

// Components
import InsightsKPICards from "@/components/admin/insights/InsightsKPICards";
import { SegmentPieChart, CLVBarChart, CohortLineChart, CustomerStatusCards } from "@/components/admin/insights/InsightsCharts";
import TopCustomersTable from "@/components/admin/insights/TopCustomersTable";

function AdminCustomerInsightsContent() {
  const { customers, orders, isLoading } = useInsightsData();
  const insights = useCustomerInsights(customers, orders);

  const handleExport = () => {
    exportInsightsToCSV(insights.rfmData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#0F0F0F]">
            Customer Insights & Analytics
          </h1>
          <p className="text-gray-600">RFM Analysis, CLV & Segmentation</p>
        </div>
        <button
          onClick={handleExport}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Data
        </button>
      </div>

      {/* KPI Cards */}
      <InsightsKPICards insights={insights} />

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <SegmentPieChart data={insights.segmentData} />
        <CLVBarChart data={insights.clvRanges} />
      </div>

      {/* Cohort Analysis */}
      <CohortLineChart data={insights.cohortData} />

      {/* Customer Status Cards */}
      <CustomerStatusCards
        newCustomers={insights.newCustomers}
        returningCustomers={insights.returningCustomers}
        churnedCustomers={insights.churnedCustomers}
      />

      {/* Top Customers */}
      <TopCustomersTable customers={insights.topCustomers} />
    </div>
  );
}

export default function AdminCustomerInsights() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminCustomerInsightsContent />
      </AdminLayout>
    </AdminGuard>
  );
}
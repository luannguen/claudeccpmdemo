import React from "react";
import { RefreshCw, Download, Calendar } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

// Hooks
import {
  useDateRangeState,
  usePaymentAnalytics,
  usePaymentDailyData,
  usePaymentTransactions,
  usePieChartData,
  useLineChartData,
  exportAnalyticsData
} from "@/components/hooks/useAdminPaymentAnalytics";

// Components
import AnalyticsStats from "@/components/admin/payment/AnalyticsStats";
import { RevenueLineChart, PaymentMethodPieChart } from "@/components/admin/payment/AnalyticsCharts";
import PaymentMethodBreakdown from "@/components/admin/payment/PaymentMethodBreakdown";
import PaymentStatusCards from "@/components/admin/payment/PaymentStatusCards";
import TransactionsTable from "@/components/admin/payment/TransactionsTable";

function AdminPaymentAnalyticsContent() {
  const { dateRange, setDateRange } = useDateRangeState();
  
  // Data
  const { data: analytics, isLoading, refetch } = usePaymentAnalytics(dateRange);
  const { data: dailyData } = usePaymentDailyData(dateRange);
  const { data: transactions } = usePaymentTransactions(dateRange);

  // Transformed data for charts
  const pieChartData = usePieChartData(analytics);
  const lineChartData = useLineChartData(dailyData);

  const handleExport = () => {
    exportAnalyticsData(analytics, transactions, dateRange);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Phân Tích Thanh Toán</h1>
          <p className="text-gray-600">Thống kê và phân tích các giao dịch thanh toán</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <div className="flex gap-3 flex-1">
            <div>
              <label className="block text-xs font-medium mb-1">Từ ngày</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Đến ngày</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342]"
              />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <>
          <AnalyticsStats analytics={analytics} />

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <RevenueLineChart data={lineChartData} />
            <PaymentMethodPieChart data={pieChartData} />
          </div>

          <PaymentMethodBreakdown byPaymentMethod={analytics?.by_payment_method} />
          <PaymentStatusCards byPaymentStatus={analytics?.by_payment_status} />
          <TransactionsTable transactions={transactions} />
        </>
      )}
    </div>
  );
}

export default function AdminPaymentAnalytics() {
  return (
    <AdminGuard>
      <AdminLayout>
        <AdminPaymentAnalyticsContent />
      </AdminLayout>
    </AdminGuard>
  );
}
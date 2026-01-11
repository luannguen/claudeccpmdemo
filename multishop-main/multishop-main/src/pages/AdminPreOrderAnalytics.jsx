/**
 * AdminPreOrderAnalytics - Dashboard analytics cho preorder
 * Page - Admin only
 */

import React, { useState } from 'react';
import { BarChart, TrendingUp, Calendar, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Layout
import AdminLayout from '@/components/AdminLayout';
import AdminGuard from '@/components/AdminGuard';

// Hooks
import { usePreOrderDashboard, useDemandForecast } from '@/components/hooks/usePreOrderAdvanced';

// Components
import PreOrderFunnelChart from '@/components/preorder/analytics/PreOrderFunnelChart';
import CancellationInsights from '@/components/preorder/analytics/CancellationInsights';
import DelayMetricsCard from '@/components/preorder/analytics/DelayMetricsCard';
import DemandForecastWidget from '@/components/preorder/analytics/DemandForecastWidget';

export default function AdminPreOrderAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedLotId, setSelectedLotId] = useState(null);

  // Calculate date filters
  const getDateFilters = () => {
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      lotId: selectedLotId
    };
  };

  // Fetch dashboard data
  const { data: dashboard, isLoading } = usePreOrderDashboard(getDateFilters());
  const { data: forecast } = useDemandForecast(selectedLotId);

  return (
    <AdminGuard>
      <AdminLayout currentPageName="AdminPreOrderAnalytics">
        <div className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Bán Trước</h1>
              <p className="text-sm text-gray-600">Phân tích hiệu suất & insights</p>
            </div>

            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 ngày</SelectItem>
                  <SelectItem value="30d">30 ngày</SelectItem>
                  <SelectItem value="90d">90 ngày</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : !dashboard ? (
            <div className="text-center py-20">
              <BarChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Chưa có dữ liệu</p>
            </div>
          ) : (
            <Tabs defaultValue="overview">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                <TabsTrigger value="funnel">Funnel</TabsTrigger>
                <TabsTrigger value="cancellation">Hủy đơn</TabsTrigger>
                <TabsTrigger value="delivery">Giao hàng</TabsTrigger>
                <TabsTrigger value="forecast">Dự báo</TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Revenue */}
                  <div className="bg-white rounded-xl border shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Doanh thu</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tổng giá trị đơn</span>
                        <span className="font-semibold">
                          {dashboard.revenue?.total_order_value?.toLocaleString()}đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tiền cọc thu được</span>
                        <span className="font-semibold text-blue-600">
                          {dashboard.revenue?.total_deposit_collected?.toLocaleString()}đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Thanh toán cuối</span>
                        <span className="font-semibold text-green-600">
                          {dashboard.revenue?.total_final_payment?.toLocaleString()}đ
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Đã hoàn tiền</span>
                        <span className="font-semibold text-red-600">
                          -{dashboard.revenue?.total_refunded?.toLocaleString()}đ
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Doanh thu ròng</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {dashboard.revenue?.net_revenue?.toLocaleString()}đ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Conversion summary */}
                  <div className="bg-white rounded-xl border shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Chuyển đổi</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Giỏ → Cọc</span>
                        <span className="font-semibold text-blue-600">
                          {dashboard.conversions?.checkout_to_deposit}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Cọc → Thanh toán</span>
                        <span className="font-semibold text-green-600">
                          {dashboard.conversions?.deposit_to_final}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Thanh toán → Giao</span>
                        <span className="font-semibold text-emerald-600">
                          {dashboard.conversions?.final_to_fulfilled}%
                        </span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Tổng chuyển đổi</span>
                        <span className="text-lg font-bold text-blue-600">
                          {dashboard.conversions?.overall_conversion}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Funnel Tab */}
              <TabsContent value="funnel">
                <div className="bg-white rounded-xl border shadow-sm p-6">
                  <PreOrderFunnelChart 
                    funnel={dashboard?.funnel} 
                    conversions={dashboard?.conversions}
                  />
                </div>
              </TabsContent>

              {/* Cancellation Tab */}
              <TabsContent value="cancellation">
                <CancellationInsights metrics={dashboard?.cancellation} />
              </TabsContent>

              {/* Delivery Tab */}
              <TabsContent value="delivery">
                <div className="grid md:grid-cols-2 gap-6">
                  <DelayMetricsCard metrics={dashboard?.delivery} />
                  
                  {/* Dispute metrics */}
                  <div className="bg-white rounded-xl border shadow-sm p-5">
                    <h3 className="font-semibold text-gray-900 mb-4">Disputes</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tổng disputes</span>
                        <span className="font-semibold">{dashboard.dispute?.total_disputes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tỉ lệ dispute</span>
                        <span className="font-semibold text-red-600">
                          {dashboard.dispute?.dispute_rate}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Đã giải quyết</span>
                        <span className="font-semibold text-green-600">
                          {dashboard.dispute?.resolved_count}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Thời gian xử lý TB</span>
                        <span className="font-semibold">
                          {dashboard.dispute?.average_resolution_time_hours}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Hài lòng TB</span>
                        <span className="font-semibold text-blue-600">
                          {dashboard.dispute?.customer_satisfaction_avg}/5
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Forecast Tab */}
              <TabsContent value="forecast">
                <DemandForecastWidget forecast={forecast} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
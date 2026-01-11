import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, Download, Eye, CheckCircle,
  Clock, Store, Calendar, Filter, Crown, Play, RefreshCw
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import { useAdminCommissions, COMMISSION_STATUS } from "@/components/hooks/useCommission";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/NotificationToast";

function SuperAdminCommissionsContent() {
  const [shopFilter, setShopFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [selectedCommissions, setSelectedCommissions] = useState([]);
  
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  // Use new commission hooks
  const { 
    commissions: commissionRecords, 
    analytics, 
    isLoading: commissionsLoading,
    processCommission,
    approveCommission,
    bulkApprove,
    markPaid,
    refetch: refetchCommissions,
    isProcessing,
    isApproving
  } = useAdminCommissions({ 
    status: statusFilter !== 'all' ? statusFilter : undefined,
    shop_id: shopFilter !== 'all' ? shopFilter : undefined,
    period_month: selectedPeriod || undefined
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['super-admin-commissions-orders'],
    queryFn: async () => {
      const result = await base44.entities.Order.list('-created_date', 500);
      return result;
    },
    initialData: [],
    refetchOnMount: true
  });

  const { data: tenants = [] } = useQuery({
    queryKey: ['super-admin-commissions-tenants'],
    queryFn: async () => {
      const result = await base44.entities.Tenant.list('-created_date', 500);
      return result;
    },
    initialData: [],
    refetchOnMount: true
  });

  // Process commission for an order
  const handleProcessCommission = async (orderId) => {
    try {
      const result = await processCommission(orderId);
      if (result.success) {
        addToast(`Đã tính commission: ${result.commission_amount?.toLocaleString()}đ`, 'success');
      } else {
        addToast(result.error || 'Không thể tính commission', 'error');
      }
    } catch (error) {
      addToast('Lỗi khi tính commission: ' + error.message, 'error');
    }
  };

  // Approve selected commissions
  const handleBulkApprove = async () => {
    if (selectedCommissions.length === 0) {
      addToast('Chọn ít nhất 1 commission để duyệt', 'warning');
      return;
    }
    try {
      await bulkApprove({ commissionIds: selectedCommissions, approvedBy: 'admin' });
      addToast(`Đã duyệt ${selectedCommissions.length} commission`, 'success');
      setSelectedCommissions([]);
    } catch (error) {
      addToast('Lỗi khi duyệt: ' + error.message, 'error');
    }
  };

  // Toggle selection
  const toggleSelection = (id) => {
    setSelectedCommissions(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Calculate commission data from both sources
  const commissionData = useMemo(() => {
    // Use analytics if available
    if (analytics?.by_shop?.length > 0) {
      return analytics.by_shop;
    }
    
    // Fallback to orders calculation
    const shopOrders = orders.filter(o => o.shop_id);
    
    const byShop = {};
    shopOrders.forEach(order => {
      if (!byShop[order.shop_id]) {
        byShop[order.shop_id] = {
          shop_id: order.shop_id,
          shop_name: order.shop_name,
          total_orders: 0,
          total_revenue: 0,
          total_commission: 0,
          pending: 0,
          approved: 0,
          paid: 0
        };
      }
      byShop[order.shop_id].total_orders += 1;
      byShop[order.shop_id].total_revenue += order.total_amount || 0;
      byShop[order.shop_id].total_commission += order.commission_total || 0;
    });

    return Object.values(byShop).sort((a, b) => b.total_commission - a.total_commission);
  }, [orders, analytics]);

  const totalCommission = analytics?.total_commission_amount || commissionData.reduce((sum, s) => sum + (s.total_commission || s.commission || 0), 0);
  const totalRevenue = analytics?.total_revenue || commissionData.reduce((sum, s) => sum + (s.total_revenue || s.revenue || 0), 0);
  const pendingCommission = analytics?.total_pending || 0;
  const approvedCommission = analytics?.total_approved || 0;

  // Orders without commission (shop orders with status delivered but no commission calculated)
  const ordersWithoutCommission = useMemo(() => {
    return orders.filter(o => 
      o.shop_id && 
      ['delivered', 'completed'].includes(o.order_status) && 
      !o.commission_total
    );
  }, [orders]);

  // Commission trend (last 30 days)
  const commissionTrend = useMemo(() => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
      
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.created_date);
        return orderDate.toDateString() === date.toDateString() && o.shop_id;
      });
      
      last30Days.push({
        date: dateStr,
        commission: dayOrders.reduce((sum, o) => sum + (o.commission_total || 0), 0),
        revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0)
      });
    }
    return last30Days;
  }, [orders]);

  const filteredCommissions = commissionData.filter(item => {
    return shopFilter === "all" || item.shop_id === shopFilter;
  });

  // Filter commission records
  const filteredCommissionRecords = commissionRecords.filter(c => {
    if (shopFilter !== 'all' && c.shop_id !== shopFilter) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2 flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-purple-600" />
          Commission Tracking
        </h1>
        <p className="text-gray-600">Theo dõi hoa hồng và doanh thu từ shops</p>
        
        {/* Debug Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-blue-800">
            📊 <strong>Data:</strong> {tenants.length} shops, {orders.filter(o => o.shop_id).length} shop orders, {commissionRecords.length} commission records
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchCommissions()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
        
        {/* Pending Orders Alert */}
        {ordersWithoutCommission.length > 0 && (
          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-orange-800">
                  ⚠️ {ordersWithoutCommission.length} đơn hàng chưa tính commission
                </p>
                <p className="text-sm text-orange-600">
                  Các đơn hàng đã giao nhưng chưa tính hoa hồng
                </p>
              </div>
              <Button 
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 gap-2"
                onClick={async () => {
                  for (const order of ordersWithoutCommission.slice(0, 10)) {
                    await handleProcessCommission(order.id);
                  }
                }}
                disabled={isProcessing}
              >
                <Play className="w-4 h-4" />
                Tính Commission ({Math.min(ordersWithoutCommission.length, 10)})
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-2xl p-5 shadow-xl">
          <DollarSign className="w-8 h-8 opacity-80 mb-3" />
          <p className="text-xs opacity-90 mb-1">Total Commission</p>
          <p className="text-2xl font-bold">{(totalCommission / 1000000).toFixed(2)}M</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-5 shadow-xl">
          <TrendingUp className="w-8 h-8 opacity-80 mb-3" />
          <p className="text-xs opacity-90 mb-1">Shop Revenue</p>
          <p className="text-2xl font-bold">{(totalRevenue / 1000000).toFixed(2)}M</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-5 shadow-xl">
          <Clock className="w-8 h-8 opacity-80 mb-3" />
          <p className="text-xs opacity-90 mb-1">Pending</p>
          <p className="text-2xl font-bold">{(pendingCommission / 1000000).toFixed(2)}M</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-2xl p-5 shadow-xl">
          <Store className="w-8 h-8 opacity-80 mb-3" />
          <p className="text-xs opacity-90 mb-1">Active Shops</p>
          <p className="text-2xl font-bold">{commissionData.length}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-2xl p-5 shadow-xl">
          <CheckCircle className="w-8 h-8 opacity-80 mb-3" />
          <p className="text-xs opacity-90 mb-1">Approved</p>
          <p className="text-2xl font-bold">{(approvedCommission / 1000000).toFixed(2)}M</p>
        </motion.div>
      </div>

      {/* Commission Trend Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-xl font-bold mb-6">Commission Trend (30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={commissionTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => `${(value / 1000).toFixed(0)}K`} />
            <Line type="monotone" dataKey="commission" stroke="#FF9800" name="Commission" strokeWidth={2} />
            <Line type="monotone" dataKey="revenue" stroke="#7CB342" name="Revenue" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-3">
            <select
              value={shopFilter}
              onChange={(e) => setShopFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            >
              <option value="all">Tất cả shops</option>
              {commissionData.map(item => (
                <option key={item.shop_id} value={item.shop_id}>{item.shop_name}</option>
              ))}
            </select>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="calculated">Đã tính</option>
              <option value="approved">Đã duyệt</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ xử lý</option>
            </select>
          </div>
          
          {selectedCommissions.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Đã chọn {selectedCommissions.length}
              </span>
              <Button 
                size="sm"
                className="bg-green-600 hover:bg-green-700 gap-2"
                onClick={handleBulkApprove}
                disabled={isApproving}
              >
                <CheckCircle className="w-4 h-4" />
                Duyệt
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Shop Summary Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-bold text-gray-900">Tổng hợp theo Shop</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Shop</th>
                <th className="text-right p-4 text-sm font-medium text-gray-600">Đơn hàng</th>
                <th className="text-right p-4 text-sm font-medium text-gray-600">Doanh thu</th>
                <th className="text-right p-4 text-sm font-medium text-gray-600">Commission</th>
                <th className="text-right p-4 text-sm font-medium text-gray-600">Pending</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommissions.map((item) => (
                <tr key={item.shop_id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">{item.shop_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-medium">{item.total_orders || item.orders || 0}</td>
                  <td className="p-4 text-right font-bold text-blue-600">
                    {(item.total_revenue || item.revenue || 0).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="p-4 text-right font-bold text-green-600">
                    {(item.total_commission || item.commission || 0).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="p-4 text-right text-orange-600">
                    {(item.pending || 0).toLocaleString('vi-VN')}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Commission Records Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Chi tiết Commission Records</h3>
          <Badge variant="outline">{filteredCommissionRecords.length} records</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="w-10 p-3"></th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Order</th>
                <th className="text-left p-3 text-sm font-medium text-gray-600">Shop</th>
                <th className="text-right p-3 text-sm font-medium text-gray-600">Đơn hàng</th>
                <th className="text-right p-3 text-sm font-medium text-gray-600">Rate</th>
                <th className="text-right p-3 text-sm font-medium text-gray-600">Commission</th>
                <th className="text-center p-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-right p-3 text-sm font-medium text-gray-600">Ngày</th>
              </tr>
            </thead>
            <tbody>
              {filteredCommissionRecords.slice(0, 50).map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input 
                      type="checkbox"
                      checked={selectedCommissions.includes(c.id)}
                      onChange={() => toggleSelection(c.id)}
                      className="rounded border-gray-300"
                      disabled={c.status === 'paid'}
                    />
                  </td>
                  <td className="p-3 font-medium text-sm">{c.order_number}</td>
                  <td className="p-3 text-sm text-gray-600">{c.shop_name}</td>
                  <td className="p-3 text-right text-sm">{c.order_amount?.toLocaleString('vi-VN')}đ</td>
                  <td className="p-3 text-right text-sm">{c.commission_rate}%</td>
                  <td className="p-3 text-right font-bold text-green-600 text-sm">
                    {c.commission_amount?.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="p-3 text-center">
                    <Badge className={
                      c.status === 'paid' ? 'bg-green-100 text-green-700' :
                      c.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      c.status === 'calculated' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right text-sm text-gray-500">
                    {new Date(c.created_date).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
              {filteredCommissionRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    Chưa có commission records
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminCommissions() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminCommissionsContent />
      </AdminLayout>
    </AdminGuard>
  );
}
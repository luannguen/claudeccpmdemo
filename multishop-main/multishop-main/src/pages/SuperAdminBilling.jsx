import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, Download,
  CreditCard, AlertCircle, CheckCircle, Search, Filter,
  FileText, Clock, Users, Package
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";
import { useAdminBilling } from "@/components/hooks/useBilling";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/NotificationToast";
import InvoiceCard from "@/components/tenant/InvoiceCard";
import { RefreshCw, Send, Play } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#F44336', '#9C27B0'];

function SuperAdminBillingContent() {
  const { addToast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('');
  
  const {
    analytics,
    isLoading: billingLoading,
    generateInvoices,
    sendReminders,
    processRenewals,
    isGenerating,
    isSending,
    isProcessing,
    refetch
  } = useAdminBilling(selectedPeriod);

  // Handle manual invoice generation
  const handleGenerateInvoices = async () => {
    try {
      const result = await generateInvoices();
      addToast(`Đã tạo ${result.generated_count} invoices, tổng: ${(result.total_amount / 1000000).toFixed(1)}M`, 'success');
    } catch (error) {
      addToast('Lỗi khi tạo invoices: ' + error.message, 'error');
    }
  };

  // Handle send reminders
  const handleSendReminders = async () => {
    try {
      const result = await sendReminders();
      addToast(`Đã gửi ${result.reminders_sent} email nhắc nhở`, 'success');
    } catch (error) {
      addToast('Lỗi khi gửi reminders: ' + error.message, 'error');
    }
  };

  // Handle process renewals
  const handleProcessRenewals = async () => {
    try {
      const result = await processRenewals();
      addToast(`Renewed: ${result.renewed_count}, Suspended: ${result.suspended_count}`, 'info');
    } catch (error) {
      addToast('Lỗi khi xử lý renewals: ' + error.message, 'error');
    }
  };
  const [dateRange, setDateRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fetch all subscriptions
  const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ['billing-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 1000),
    initialData: []
  });

  // Fetch all tenants for revenue calculation
  const { data: tenants = [] } = useQuery({
    queryKey: ['billing-tenants'],
    queryFn: () => base44.entities.Tenant.list('-created_date', 1000),
    initialData: []
  });

  // Calculate revenue metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    // Active paid subscriptions
    const activeSubscriptions = subscriptions.filter(s => 
      s.status === 'active' && s.plan_name !== 'free'
    );
    
    // MRR (Monthly Recurring Revenue)
    const monthlyRevenue = activeSubscriptions
      .filter(s => s.billing_cycle === 'monthly')
      .reduce((sum, s) => sum + (s.price || 0), 0);
    
    const yearlyRevenue = activeSubscriptions
      .filter(s => s.billing_cycle === 'yearly')
      .reduce((sum, s) => sum + (s.price || 0), 0);
    
    const mrr = monthlyRevenue + (yearlyRevenue / 12);
    const arr = mrr * 12;
    
    // Revenue by plan
    const revenueByPlan = {
      starter: 0,
      pro: 0,
      enterprise: 0
    };
    
    activeSubscriptions.forEach(s => {
      if (s.plan_name in revenueByPlan) {
        const monthlyValue = s.billing_cycle === 'yearly' ? s.price / 12 : s.price;
        revenueByPlan[s.plan_name] += monthlyValue;
      }
    });
    
    // Trial to paid conversion (mock - cần actual payment data)
    const trialTenants = tenants.filter(t => t.subscription_status === 'trial').length;
    const paidTenants = tenants.filter(t => t.subscription_status === 'active' && t.subscription_plan !== 'free').length;
    const conversionRate = trialTenants > 0 ? (paidTenants / (trialTenants + paidTenants)) * 100 : 0;
    
    // Churn calculation (simplified)
    const cancelledThisMonth = subscriptions.filter(s => 
      s.cancelled_at && 
      new Date(s.cancelled_at) >= thisMonth
    ).length;
    
    const totalActiveLastMonth = subscriptions.filter(s => 
      s.created_date && new Date(s.created_date) < thisMonth
    ).length;
    
    const churnRate = totalActiveLastMonth > 0 ? (cancelledThisMonth / totalActiveLastMonth) * 100 : 0;
    
    // ARPU
    const arpu = paidTenants > 0 ? mrr / paidTenants : 0;
    
    // Revenue trend (last 6 months)
    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthSubs = subscriptions.filter(s => {
        const created = new Date(s.created_date);
        return created <= monthEnd && s.status === 'active';
      });
      
      const monthMRR = monthSubs.reduce((sum, s) => {
        const monthlyValue = s.billing_cycle === 'yearly' ? (s.price || 0) / 12 : (s.price || 0);
        return sum + monthlyValue;
      }, 0);
      
      revenueTrend.push({
        month: month.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
        mrr: Math.round(monthMRR),
        tenants: monthSubs.length
      });
    }
    
    // Billing cycle distribution
    const billingCycleData = [
      { name: 'Monthly', value: activeSubscriptions.filter(s => s.billing_cycle === 'monthly').length },
      { name: 'Quarterly', value: activeSubscriptions.filter(s => s.billing_cycle === 'quarterly').length },
      { name: 'Yearly', value: activeSubscriptions.filter(s => s.billing_cycle === 'yearly').length }
    ].filter(d => d.value > 0);
    
    return {
      mrr,
      arr,
      revenueByPlan,
      conversionRate,
      churnRate,
      arpu,
      revenueTrend,
      billingCycleData,
      activeSubscriptions: activeSubscriptions.length,
      trialCount: trialTenants
    };
  }, [subscriptions, tenants]);

  // Recent transactions (mock data - cần payment gateway integration)
  const recentTransactions = useMemo(() => {
    return subscriptions
      .filter(s => s.status === 'active' && s.last_payment_date)
      .slice(0, 10)
      .map(s => {
        const tenant = tenants.find(t => t.id === s.tenant_id);
        return {
          id: s.id,
          tenant_name: tenant?.organization_name || 'Unknown',
          amount: s.last_payment_amount || s.price,
          date: s.last_payment_date,
          status: 'paid',
          plan: s.plan_name,
          payment_method: s.payment_method || 'bank_transfer'
        };
      });
  }, [subscriptions, tenants]);

  const filteredTransactions = recentTransactions.filter(t =>
    t.tenant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (subsLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-gray-600">Đang tải dữ liệu billing...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#0F0F0F] mb-2">
          Revenue & Billing
        </h1>
        <p className="text-gray-600">Quản lý doanh thu và thanh toán platform</p>
        
        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 gap-2"
            onClick={handleGenerateInvoices}
            disabled={isGenerating}
          >
            <Play className="w-4 h-4" />
            {isGenerating ? 'Đang tạo...' : 'Generate Invoices'}
          </Button>
          
          <Button 
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={handleSendReminders}
            disabled={isSending}
          >
            <Send className="w-4 h-4" />
            {isSending ? 'Đang gửi...' : 'Send Reminders'}
          </Button>
          
          <Button 
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={handleProcessRenewals}
            disabled={isProcessing}
          >
            <RefreshCw className="w-4 h-4" />
            {isProcessing ? 'Đang xử lý...' : 'Process Renewals'}
          </Button>
          
          <Button 
            size="sm"
            variant="outline"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Analytics Display */}
        {analytics && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-sm text-green-800">
              💰 <strong>Analytics:</strong> Revenue: {(analytics.total_revenue / 1000000).toFixed(1)}M, 
              Pending: {(analytics.total_pending / 1000000).toFixed(1)}M, 
              Overdue: {(analytics.total_overdue / 1000000).toFixed(1)}M
              ({analytics.collection_rate?.toFixed(1)}% collection rate)
            </p>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* MRR */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-white/80 text-sm mb-1">MRR</p>
          <p className="text-3xl font-bold">{metrics.mrr.toLocaleString('vi-VN')}đ</p>
          <p className="text-white/60 text-xs mt-2">
            ARR: {metrics.arr.toLocaleString('vi-VN')}đ
          </p>
        </motion.div>

        {/* Active Subscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">Active Subscriptions</p>
          <p className="text-3xl font-bold text-[#0F0F0F]">{metrics.activeSubscriptions}</p>
          <p className="text-xs text-gray-500 mt-2">
            {metrics.trialCount} đang trial
          </p>
        </motion.div>

        {/* ARPU */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">ARPU</p>
          <p className="text-3xl font-bold text-[#0F0F0F]">
            {metrics.arpu.toLocaleString('vi-VN')}đ
          </p>
          <p className="text-xs text-gray-500 mt-2">Average per user/month</p>
        </motion.div>

        {/* Conversion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className={`text-sm font-medium ${
              metrics.conversionRate >= 60 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {metrics.conversionRate.toFixed(1)}%
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Trial Conversion</p>
          <p className="text-3xl font-bold text-[#0F0F0F]">
            {metrics.churnRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-2">Churn rate</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">
            MRR Growth (6 Tháng)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="mrr" 
                stroke="#7CB342" 
                strokeWidth={2} 
                name="MRR"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Plan */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-bold text-[#0F0F0F] mb-6">
            Revenue by Plan
          </h3>
          <div className="space-y-4">
            {Object.entries(metrics.revenueByPlan).map(([plan, revenue], idx) => {
              const percentage = metrics.mrr > 0 ? (revenue / metrics.mrr) * 100 : 0;
              return (
                <div key={plan}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium capitalize">{plan}</span>
                    <span className="text-[#7CB342] font-bold">
                      {revenue.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full bg-[#7CB342] transition-all"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: COLORS[idx]
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of MRR</p>
                </div>
              );
            })}
          </div>

          {/* Billing Cycle */}
          <div className="mt-8 pt-6 border-t">
            <h4 className="font-bold text-[#0F0F0F] mb-4">Billing Cycle</h4>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={metrics.billingCycleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.billingCycleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#0F0F0F]">
            Giao Dịch Gần Đây
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tenant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7CB342]"
              />
            </div>
            <button className="px-4 py-2 bg-[#7CB342] text-white rounded-lg text-sm font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Tenant</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Plan</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Payment Method</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có giao dịch</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <p className="font-medium text-gray-900">{transaction.tenant_name}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                        {transaction.plan}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#7CB342]">
                      {transaction.amount.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(transaction.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-sm text-gray-600 capitalize">
                      {transaction.payment_method.replace('_', ' ')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'paid' ? 'bg-green-100 text-green-700' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {transaction.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                        {transaction.status === 'pending' && <Clock className="w-3 h-3" />}
                        {transaction.status === 'failed' && <AlertCircle className="w-3 h-3" />}
                        {transaction.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-[#7CB342] hover:text-[#FF9800] text-sm font-medium">
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminBilling() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin']}>
      <AdminLayout>
        <SuperAdminBillingContent />
      </AdminLayout>
    </AdminGuard>
  );
}
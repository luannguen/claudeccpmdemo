/**
 * ReferralAnalyticsReport - Advanced analytics and export
 */

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { format, subMonths } from 'date-fns';

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#9C27B0', '#F44336'];

export default function ReferralAnalyticsReport({ members, events, settings }) {
  const [exportFormat, setExportFormat] = useState('csv');
  
  // Phân tích theo rank
  const rankDistribution = useMemo(() => {
    const distribution = {};
    members.forEach(m => {
      const rank = m.seeder_rank || 'nguoi_gieo_hat';
      distribution[rank] = (distribution[rank] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([rank, count]) => ({
      name: settings?.seeder_rank_config?.[rank]?.label || rank,
      value: count,
      percentage: ((count / members.length) * 100).toFixed(1)
    }));
  }, [members, settings]);
  
  // Commission by tier
  const commissionByTier = useMemo(() => {
    const tiers = settings?.commission_tiers || [];
    return tiers.map(tier => {
      const membersInTier = members.filter(m => {
        const max = tier.max_revenue || Infinity;
        return m.current_month_revenue >= tier.min_revenue && m.current_month_revenue < max;
      });
      
      const totalCommission = membersInTier.reduce((sum, m) => sum + (m.unpaid_commission || 0) + (m.total_paid_commission || 0), 0);
      
      return {
        name: tier.label,
        members: membersInTier.length,
        commission: totalCommission,
        rate: tier.rate
      };
    });
  }, [members, settings]);
  
  // Conversion funnel
  const conversionFunnel = useMemo(() => {
    const totalMembers = members.length;
    const withReferrals = members.filter(m => m.total_referred_customers > 0).length;
    const withRevenue = members.filter(m => m.total_referral_revenue > 0).length;
    const withCommission = members.filter(m => (m.unpaid_commission || 0) + (m.total_paid_commission || 0) > 0).length;
    
    return [
      { stage: 'Đăng ký', count: totalMembers, percentage: 100 },
      { stage: 'Có giới thiệu', count: withReferrals, percentage: ((withReferrals / totalMembers) * 100).toFixed(1) },
      { stage: 'Có doanh số', count: withRevenue, percentage: ((withRevenue / totalMembers) * 100).toFixed(1) },
      { stage: 'Có hoa hồng', count: withCommission, percentage: ((withCommission / totalMembers) * 100).toFixed(1) }
    ];
  }, [members]);
  
  // Monthly trend
  const monthlyTrend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const monthKey = format(date, 'yyyy-MM');
      
      const monthEvents = events.filter(e => e.period_month === monthKey);
      const monthRevenue = monthEvents.reduce((sum, e) => sum + (e.order_amount || 0), 0);
      const monthCommission = monthEvents.reduce((sum, e) => sum + (e.commission_amount || 0), 0);
      
      return {
        month: format(date, 'MM/yyyy'),
        revenue: monthRevenue,
        commission: monthCommission,
        orders: monthEvents.length
      };
    });
  }, [events]);
  
  const exportData = (format) => {
    if (format === 'csv') {
      const headers = ['Tên', 'Email', 'Mã', 'Cấp bậc', 'Khách GT', 'Doanh số', 'Hoa hồng chờ', 'Đã TT'];
      const rows = members.map(m => [
        m.full_name,
        m.user_email,
        m.referral_code,
        m.seeder_rank,
        m.total_referred_customers || 0,
        m.total_referral_revenue || 0,
        m.unpaid_commission || 0,
        m.total_paid_commission || 0
      ]);
      
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `referral-report-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Icon.FileText size={20} className="text-blue-600" />
              Báo Cáo & Phân Tích
            </CardTitle>
            <Button onClick={() => exportData('csv')} variant="outline" className="gap-2">
              <Icon.Download size={16} />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="ranks">Phân bố cấp bậc</TabsTrigger>
              <TabsTrigger value="tiers">Theo tier</TabsTrigger>
              <TabsTrigger value="funnel">Conversion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN')} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#7CB342" name="Doanh số" strokeWidth={2} />
                  <Line type="monotone" dataKey="commission" stroke="#FF9800" name="Hoa hồng" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="ranks" className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={rankDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {rankDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="tiers" className="mt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={commissionByTier}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => value.toLocaleString('vi-VN')} />
                  <Bar dataKey="members" fill="#7CB342" name="Số thành viên" />
                  <Bar dataKey="commission" fill="#FF9800" name="Hoa hồng" />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="funnel" className="mt-6">
              <div className="space-y-3">
                {conversionFunnel.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-4 flex items-center justify-between"
                      style={{ 
                        width: `${stage.percentage}%`,
                        minWidth: '200px'
                      }}
                    >
                      <div>
                        <p className="font-medium">{stage.stage}</p>
                        <p className="text-xs opacity-90">{stage.percentage}%</p>
                      </div>
                      <p className="text-2xl font-bold">{stage.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
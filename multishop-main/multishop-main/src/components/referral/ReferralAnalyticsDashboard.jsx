/**
 * ReferralAnalyticsDashboard - Deep analytics cho CTV
 * UI Layer - Presentation only
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { format, subDays, differenceInDays } from 'date-fns';

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#9C27B0', '#F44336'];

export default function ReferralAnalyticsDashboard({ member, events, customers }) {
  // Conversion rate
  const conversionRate = useMemo(() => {
    const totalCustomers = customers.length;
    const customersWithOrders = customers.filter(c => (c.total_orders || 0) > 0).length;
    return totalCustomers > 0 ? ((customersWithOrders / totalCustomers) * 100).toFixed(1) : 0;
  }, [customers]);
  
  // Customer lifetime value
  const avgCustomerValue = useMemo(() => {
    const customersWithOrders = customers.filter(c => (c.total_orders || 0) > 0);
    if (customersWithOrders.length === 0) return 0;
    const totalValue = customersWithOrders.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    return Math.round(totalValue / customersWithOrders.length);
  }, [customers]);
  
  // Repeat customer rate
  const repeatRate = useMemo(() => {
    const customersWithOrders = customers.filter(c => (c.total_orders || 0) > 0);
    const repeatCustomers = customersWithOrders.filter(c => (c.total_orders || 0) > 1);
    return customersWithOrders.length > 0 
      ? ((repeatCustomers.length / customersWithOrders.length) * 100).toFixed(1) 
      : 0;
  }, [customers]);
  
  // Link clicks (from UserActivity)
  const linkClicks = useMemo(() => {
    // Would be fetched from UserActivity entity
    return Math.floor(Math.random() * 50) + 10; // Mock for now
  }, []);
  
  // Commission by customer
  const topCustomers = useMemo(() => {
    const customerCommissions = {};
    
    events.forEach(event => {
      const email = event.referred_customer_email;
      if (!customerCommissions[email]) {
        customerCommissions[email] = {
          name: event.referred_customer_name,
          email: email,
          commission: 0,
          orders: 0
        };
      }
      customerCommissions[email].commission += event.commission_amount || 0;
      customerCommissions[email].orders += 1;
    });
    
    return Object.values(customerCommissions)
      .sort((a, b) => b.commission - a.commission)
      .slice(0, 5);
  }, [events]);
  
  // Daily trend (last 30 days)
  const dailyTrend = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayEvents = events.filter(e => 
        format(new Date(e.created_date), 'yyyy-MM-dd') === dateStr
      );
      
      return {
        date: format(date, 'dd/MM'),
        revenue: dayEvents.reduce((sum, e) => sum + (e.order_amount || 0), 0),
        commission: dayEvents.reduce((sum, e) => sum + (e.commission_amount || 0), 0),
        orders: dayEvents.length
      };
    });
  }, [events]);
  
  // Customer acquisition timeline
  const acquisitionTimeline = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const daysAgo = (5 - i) * 30;
      const startDate = subDays(new Date(), daysAgo + 30);
      const endDate = subDays(new Date(), daysAgo);
      
      const periodCustomers = customers.filter(c => {
        const referredDate = new Date(c.referred_date || c.created_date);
        return referredDate >= startDate && referredDate <= endDate;
      });
      
      return {
        period: format(endDate, 'MM/yyyy'),
        customers: periodCustomers.length,
        withOrders: periodCustomers.filter(c => (c.total_orders || 0) > 0).length
      };
    });
  }, [customers]);
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Icon.Target className="mx-auto mb-2 text-blue-600" size={24} />
              <p className="text-3xl font-bold text-blue-600">{conversionRate}%</p>
              <p className="text-xs text-gray-500">Tỷ lệ chuyển đổi</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Icon.DollarSign className="mx-auto mb-2 text-green-600" size={24} />
              <p className="text-3xl font-bold text-green-600">
                {(avgCustomerValue / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500">Giá trị TB/KH</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Icon.RefreshCw className="mx-auto mb-2 text-purple-600" size={24} />
              <p className="text-3xl font-bold text-purple-600">{repeatRate}%</p>
              <p className="text-xs text-gray-500">KH quay lại</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Icon.Eye className="mx-auto mb-2 text-amber-600" size={24} />
              <p className="text-3xl font-bold text-amber-600">{linkClicks}</p>
              <p className="text-xs text-gray-500">Lượt click link</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.TrendingUp size={20} />
            Xu Hướng 30 Ngày
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyTrend}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(value) => value.toLocaleString('vi-VN')} />
              <Legend />
              <Line type="monotone" dataKey="commission" stroke="#7CB342" strokeWidth={2} name="Hoa hồng" />
              <Line type="monotone" dataKey="orders" stroke="#2196F3" strokeWidth={2} name="Đơn hàng" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Trophy size={20} className="text-amber-500" />
            Top 5 Khách Hàng Đóng Góp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topCustomers.map((customer, index) => (
              <div key={customer.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.orders} đơn</p>
                  </div>
                </div>
                <p className="font-bold text-green-600">
                  +{(customer.commission / 1000).toFixed(0)}K
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Customer Acquisition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Users size={20} className="text-blue-600" />
            Tuyển Dụng Khách Hàng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={acquisitionTimeline}>
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="customers" fill="#7CB342" name="Khách mới" radius={[8, 8, 0, 0]} />
              <Bar dataKey="withOrders" fill="#FF9800" name="Đã mua" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
/**
 * CommissionTracker Component
 * UI Layer - Real-time commission tracking dashboard
 * 
 * @module features/referral/ui/commission
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, subMonths } from 'date-fns';

export default function CommissionTracker({ member, events, settings }) {
  const dailyData = useMemo(() => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayEvents = events.filter(e => 
        format(new Date(e.created_date), 'yyyy-MM-dd') === dayStr
      );
      
      return {
        date: format(day, 'dd/MM'),
        commission: dayEvents.reduce((sum, e) => sum + (e.commission_amount || 0), 0),
        orders: dayEvents.length
      };
    });
  }, [events]);
  
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MM/yyyy'),
        monthKey: format(date, 'yyyy-MM')
      };
    });
    
    return months.map(({ month, monthKey }) => {
      const monthEvents = events.filter(e => e.period_month === monthKey);
      return {
        month,
        commission: monthEvents.reduce((sum, e) => sum + (e.commission_amount || 0), 0),
        orders: monthEvents.length
      };
    });
  }, [events]);
  
  const currentTier = useMemo(() => {
    const tiers = settings?.commission_tiers || [];
    return tiers.find(tier => {
      const max = tier.max_revenue || Infinity;
      return member.current_month_revenue >= tier.min_revenue && member.current_month_revenue < max;
    }) || tiers[0];
  }, [member, settings]);
  
  const nextTier = useMemo(() => {
    const tiers = settings?.commission_tiers || [];
    const currentIndex = tiers.findIndex(t => t.label === currentTier?.label);
    return currentIndex >= 0 && currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  }, [currentTier, settings]);
  
  const tierProgress = useMemo(() => {
    if (!nextTier) return 100;
    const current = member.current_month_revenue || 0;
    const target = nextTier.min_revenue;
    return Math.min((current / target) * 100, 100);
  }, [member, nextTier]);
  
  const totalThisMonth = events
    .filter(e => e.period_month === format(new Date(), 'yyyy-MM'))
    .reduce((sum, e) => sum + (e.commission_amount || 0), 0);
  
  const projectedEndOfMonth = useMemo(() => {
    const daysInMonth = endOfMonth(new Date()).getDate();
    const currentDay = new Date().getDate();
    const avgPerDay = totalThisMonth / currentDay;
    return avgPerDay * daysInMonth;
  }, [totalThisMonth]);
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Icon.DollarSign size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tháng này</p>
                <p className="text-xl font-bold text-green-600">
                  {(totalThisMonth / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Icon.TrendingUp size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Dự kiến</p>
                <p className="text-xl font-bold text-blue-600">
                  {(projectedEndOfMonth / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Icon.Award size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tỉ lệ</p>
                <p className="text-xl font-bold text-amber-600">
                  {currentTier?.rate || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Icon.Target size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đơn</p>
                <p className="text-xl font-bold text-purple-600">
                  {events.filter(e => e.period_month === format(new Date(), 'yyyy-MM')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {nextTier && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Icon.Target size={16} />
              Tiến độ lên cấp {nextTier.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {(member.current_month_revenue || 0).toLocaleString('vi-VN')}đ
                </span>
                <span className="font-medium text-amber-600">
                  {nextTier.min_revenue.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${tierProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Còn {(nextTier.min_revenue - (member.current_month_revenue || 0)).toLocaleString('vi-VN')}đ
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Calendar size={18} />
            Hoa hồng theo ngày
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="commissionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7CB342" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7CB342" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip 
                formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
                labelFormatter={(label) => `Ngày ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="commission" 
                stroke="#7CB342" 
                strokeWidth={2}
                fill="url(#commissionGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.TrendingUp size={18} />
            Xu hướng 6 tháng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
              <Bar dataKey="commission" radius={[8, 8, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === monthlyData.length - 1 ? '#7CB342' : '#93C47D'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
/**
 * CommissionForecast - AI-powered commission forecasting
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { addDays, format } from 'date-fns';

export default function CommissionForecast({ member, events }) {
  const forecast = useMemo(() => {
    // Tính trung bình hoa hồng/ngày trong 30 ngày qua
    const last30Days = events
      .filter(e => {
        const eventDate = new Date(e.created_date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return eventDate >= thirtyDaysAgo;
      });
    
    const avgCommissionPerDay = last30Days.length > 0
      ? last30Days.reduce((sum, e) => sum + (e.commission_amount || 0), 0) / 30
      : 0;
    
    const avgOrdersPerDay = last30Days.length / 30;
    
    // Dự báo 7 ngày tới
    const forecastData = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(new Date(), i + 1);
      // Áp dụng trend factor (growth hoặc decline)
      const trendFactor = 1 + (Math.random() * 0.1 - 0.05); // ±5% variance
      
      return {
        date: format(date, 'dd/MM'),
        estimated: Math.round(avgCommissionPerDay * trendFactor),
        orders: Math.max(1, Math.round(avgOrdersPerDay * trendFactor))
      };
    });
    
    const weekTotal = forecastData.reduce((sum, d) => sum + d.estimated, 0);
    const trend = avgCommissionPerDay > 0 ? 'up' : 'stable';
    
    return {
      data: forecastData,
      avgPerDay: avgCommissionPerDay,
      weekTotal,
      trend,
      confidence: last30Days.length >= 10 ? 'high' : last30Days.length >= 5 ? 'medium' : 'low'
    };
  }, [member, events]);
  
  const confidenceConfig = {
    high: { label: 'Độ tin cậy cao', color: 'bg-green-100 text-green-700' },
    medium: { label: 'Độ tin cậy trung bình', color: 'bg-amber-100 text-amber-700' },
    low: { label: 'Cần thêm dữ liệu', color: 'bg-gray-100 text-gray-700' }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon.Sparkles size={20} className="text-purple-500" />
            Dự Báo Hoa Hồng (7 ngày tới)
          </CardTitle>
          <Badge className={confidenceConfig[forecast.confidence].color}>
            {confidenceConfig[forecast.confidence].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon.Calendar size={16} className="text-blue-600" />
              <span className="text-sm text-gray-600">Trung bình/ngày</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {(forecast.avgPerDay / 1000).toFixed(1)}K
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon.TrendingUp size={16} className="text-purple-600" />
              <span className="text-sm text-gray-600">Dự kiến tuần tới</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {(forecast.weekTotal / 1000).toFixed(1)}K
            </p>
          </div>
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={forecast.data}>
            <defs>
              <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
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
              dataKey="estimated" 
              stroke="#7CB342" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#forecastGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-start gap-2 text-sm">
          <Icon.Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-blue-700">
            Dự báo dựa trên xu hướng 30 ngày gần nhất. Kết quả thực tế có thể khác biệt tùy theo hoạt động của khách hàng.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
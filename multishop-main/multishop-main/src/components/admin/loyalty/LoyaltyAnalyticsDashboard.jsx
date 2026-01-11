/**
 * Loyalty Analytics Dashboard
 * UI Component - Admin analytics cho loyalty
 */

import React, { useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function LoyaltyAnalyticsDashboard({ accounts }) {
  const chartData = useMemo(() => {
    // Tier distribution
    const tierDist = accounts.reduce((acc, a) => {
      acc[a.tier] = (acc[a.tier] || 0) + 1;
      return acc;
    }, {});
    
    const tierData = Object.entries(tierDist).map(([tier, count]) => ({
      name: tier,
      value: count
    }));
    
    // Points distribution
    const pointsData = [
      { range: '0-500', count: accounts.filter(a => a.total_points < 500).length },
      { range: '500-1000', count: accounts.filter(a => a.total_points >= 500 && a.total_points < 1000).length },
      { range: '1000-5000', count: accounts.filter(a => a.total_points >= 1000 && a.total_points < 5000).length },
      { range: '5000+', count: accounts.filter(a => a.total_points >= 5000).length }
    ];
    
    // Activity by month (mock - would need real data)
    const activityData = Array.from({ length: 6 }, (_, i) => ({
      month: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN', { month: 'short' }),
      earned: Math.floor(Math.random() * 10000) + 5000,
      redeemed: Math.floor(Math.random() * 5000) + 2000
    }));
    
    return { tierData, pointsData, activityData };
  }, [accounts]);
  
  const COLORS = ['#f59e0b', '#9ca3af', '#fbbf24', '#a855f7'];
  
  return (
    <div className="space-y-6">
      {/* Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân Bố Theo Hạng</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.tierData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.tierData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Points Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Phân Bố Điểm</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.pointsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Hoạt Động 6 Tháng Gần Đây</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="earned" stroke="#10b981" name="Tích điểm" strokeWidth={2} />
              <Line type="monotone" dataKey="redeemed" stroke="#ef4444" name="Tiêu điểm" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
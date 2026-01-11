import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Area, AreaChart } from 'recharts';

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#E91E63', '#9C27B0'];

const categoryLabels = {
  bug: 'Lỗi',
  feature_request: 'Yêu cầu tính năng',
  improvement: 'Cải tiến',
  ui_ux: 'UI/UX',
  performance: 'Hiệu năng',
  other: 'Khác'
};

const priorityLabels = {
  low: 'Thấp',
  medium: 'Trung bình',
  high: 'Cao',
  critical: 'Khẩn cấp'
};

export default function FeedbackAnalyticsDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['feedback-analytics-admin'],
    queryFn: async () => {
      const feedback = await base44.entities.Feedback.list('-created_date', 1000);
      
      const stats = {
        total: feedback.length,
        new: feedback.filter(f => f.status === 'new').length,
        reviewing: feedback.filter(f => f.status === 'reviewing').length,
        inProgress: feedback.filter(f => f.status === 'in_progress').length,
        resolved: feedback.filter(f => f.status === 'resolved').length,
        rejected: feedback.filter(f => f.status === 'rejected').length,
        byCategory: {},
        byPriority: {},
        bySentiment: {
          positive: 0,
          neutral: 0,
          negative: 0
        },
        sentimentTrend: [],
        avgResponseTime: 0,
        topUsers: []
      };

      // Group by category and priority
      feedback.forEach(f => {
        stats.byCategory[f.category] = (stats.byCategory[f.category] || 0) + 1;
        stats.byPriority[f.priority] = (stats.byPriority[f.priority] || 0) + 1;
        if (f.ai_sentiment) {
          stats.bySentiment[f.ai_sentiment]++;
        }
      });

      // Sentiment trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      stats.sentimentTrend = last7Days.map(date => {
        const dayFeedback = feedback.filter(f => 
          f.created_date.split('T')[0] === date
        );
        return {
          date: new Date(date).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' }),
          positive: dayFeedback.filter(f => f.ai_sentiment === 'positive').length,
          neutral: dayFeedback.filter(f => f.ai_sentiment === 'neutral').length,
          negative: dayFeedback.filter(f => f.ai_sentiment === 'negative').length,
          total: dayFeedback.length
        };
      });

      // Calculate response time
      const resolvedWithResponse = feedback.filter(f => 
        f.status === 'resolved' && f.admin_response && f.reviewed_date
      );
      
      if (resolvedWithResponse.length > 0) {
        const totalTime = resolvedWithResponse.reduce((sum, f) => {
          const created = new Date(f.created_date).getTime();
          const resolved = new Date(f.reviewed_date).getTime();
          return sum + (resolved - created);
        }, 0);
        
        stats.avgResponseTime = Math.round(totalTime / resolvedWithResponse.length / (1000 * 60 * 60)); // hours
      }

      // Top contributors
      const userCounts = {};
      feedback.forEach(f => {
        if (f.user_name) {
          userCounts[f.user_name] = (userCounts[f.user_name] || 0) + 1;
        }
      });
      
      stats.topUsers = Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      return stats;
    },
    staleTime: 2 * 60 * 1000
  });

  if (isLoading || !analytics) {
    return (
      <div className="flex items-center justify-center p-12">
        <Icon.Spinner size={48} />
      </div>
    );
  }

  const categoryData = Object.entries(analytics.byCategory).map(([key, value]) => ({
    name: categoryLabels[key] || key,
    value
  }));

  const priorityData = Object.entries(analytics.byPriority).map(([key, value]) => ({
    name: priorityLabels[key] || key,
    value
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Icon.MessageCircle size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.total}</p>
                <p className="text-xs text-gray-500">Tổng feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Icon.Clock size={24} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.new + analytics.reviewing}</p>
                <p className="text-xs text-gray-500">Đang xử lý</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Icon.CheckCircle size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.resolved}</p>
                <p className="text-xs text-gray-500">Đã giải quyết</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Icon.Timer size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.avgResponseTime}h</p>
                <p className="text-xs text-gray-500">Thời gian phản hồi TB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedback theo Danh Mục</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback theo Mức Độ</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#7CB342" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sentiment Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.TrendingUp size={20} className="text-purple-500" />
            Xu Hướng Sentiment (7 ngày gần nhất)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={analytics.sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" name="Tích cực" />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#6b7280" fill="#6b7280" name="Trung lập" />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" name="Tiêu cực" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Contributors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Award size={20} className="text-amber-500" />
            Top Người Đóng Góp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{user.name}</span>
                </div>
                <Badge variant="outline">{user.count} feedback</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
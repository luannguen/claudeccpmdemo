import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFeedbackAnalytics } from '@/components/hooks/useFeedbackEnhanced';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#7CB342', '#FF9800', '#2196F3', '#E91E63'];

const categoryLabels = {
  bug: 'Lỗi',
  feature_request: 'Tính năng',
  improvement: 'Cải tiến',
  ui_ux: 'UI/UX',
  performance: 'Hiệu năng',
  other: 'Khác'
};

export default function FeedbackUserAnalytics() {
  const { data: analytics, isLoading } = useFeedbackAnalytics();

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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon.MessageCircle size={24} className="text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">{analytics.total}</p>
              <p className="text-xs text-gray-500 mt-1">Tổng Feedback</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon.Clock size={24} className="text-amber-600" />
              </div>
              <p className="text-3xl font-bold text-amber-600">{analytics.pending}</p>
              <p className="text-xs text-gray-500 mt-1">Đang Xử Lý</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon.CheckCircle size={24} className="text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">{analytics.resolved}</p>
              <p className="text-xs text-gray-500 mt-1">Đã Giải Quyết</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Feedback Của Bạn Theo Danh Mục</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-8">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                {categoryData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm text-gray-600">{item.name}</span>
                    <Badge variant="outline">{item.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Trophy size={20} className="text-amber-500" />
            Thành Tựu Đóng Góp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {analytics.total >= 1 && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
                <div className="text-3xl mb-2">🎯</div>
                <p className="font-bold text-blue-900">First Feedback</p>
                <p className="text-xs text-blue-600">Đã gửi feedback đầu tiên</p>
              </div>
            )}
            
            {analytics.total >= 5 && (
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center">
                <div className="text-3xl mb-2">💚</div>
                <p className="font-bold text-green-900">Active Contributor</p>
                <p className="text-xs text-green-600">Đã gửi 5+ feedback</p>
              </div>
            )}
            
            {analytics.resolved >= 3 && (
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-center">
                <div className="text-3xl mb-2">🏆</div>
                <p className="font-bold text-purple-900">Problem Solver</p>
                <p className="text-xs text-purple-600">3+ feedback đã giải quyết</p>
              </div>
            )}
            
            {analytics.total >= 10 && (
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl text-center">
                <div className="text-3xl mb-2">⭐</div>
                <p className="font-bold text-amber-900">Super Contributor</p>
                <p className="text-xs text-amber-600">Đóng góp 10+ feedback</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
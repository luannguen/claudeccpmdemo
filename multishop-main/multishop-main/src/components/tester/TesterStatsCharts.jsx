/**
 * Tester Stats Charts - Biểu đồ thống kê performance tester
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, Clock, Target } from 'lucide-react';

export default function TesterStatsCharts({ profile, stats }) {
  // Show at least empty state instead of null
  if (!profile && !stats) {
    return (
      <div className="p-4 text-center text-gray-400 text-sm">
        Đang tải thống kê...
      </div>
    );
  }
  
  const safeProfile = profile || {};
  const safeStats = stats || {};

  // Weekly trend data (mock - should come from backend)
  const weeklyTrend = [
    { day: 'T2', passed: 5, failed: 2 },
    { day: 'T3', passed: 8, failed: 1 },
    { day: 'T4', passed: 6, failed: 3 },
    { day: 'T5', passed: 10, failed: 1 },
    { day: 'T6', passed: 7, failed: 2 },
    { day: 'T7', passed: 4, failed: 0 },
    { day: 'CN', passed: 3, failed: 1 }
  ];

  // Test status distribution
  const statusData = [
    { name: 'Passed', value: safeProfile.total_passed || 0, color: '#10b981' },
    { name: 'Failed', value: safeProfile.total_failed || 0, color: '#ef4444' },
    { name: 'Pending', value: Math.max(0, (safeStats.testCases?.total || 0) - ((safeProfile.total_passed || 0) + (safeProfile.total_failed || 0))), color: '#6b7280' }
  ];

  // Pass rate calculation
  const passRate = safeProfile.total_tests_completed > 0
    ? Math.round((safeProfile.total_passed / safeProfile.total_tests_completed) * 100)
    : 0;

  const avgBugsPerFeature = safeStats.assignedFeatures > 0
    ? ((safeProfile.total_bugs_found || 0) / safeStats.assignedFeatures).toFixed(1)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Weekly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            Test Cases Tuần Này
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="passed" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-violet-500" />
            Phân Bổ Kết Quả
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <ResponsiveContainer width="50%" height={150}>
              <PieChart>
                <Pie
                  data={statusData.filter(d => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 text-sm">
              {statusData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}: <strong>{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-500" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{passRate}%</p>
              <p className="text-xs text-gray-600 mt-1">Pass Rate</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">{safeProfile.total_bugs_found || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Bugs Found</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{avgBugsPerFeature}</p>
              <p className="text-xs text-gray-600 mt-1">Bugs/Feature</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{safeStats.assignedFeatures || 0}</p>
              <p className="text-xs text-gray-600 mt-1">Features Assigned</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
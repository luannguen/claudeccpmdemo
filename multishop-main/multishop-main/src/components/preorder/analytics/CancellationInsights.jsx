/**
 * CancellationInsights - Phân tích lý do hủy đơn
 * UI Layer
 */

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const REASON_LABELS = {
  'change_mind': 'Đổi ý',
  'found_cheaper': 'Tìm được rẻ hơn',
  'too_long_wait': 'Chờ quá lâu',
  'financial_issue': 'Vấn đề tài chính',
  'duplicate_order': 'Đặt nhầm',
  'seller_delayed': 'Seller trễ hẹn',
  'quality_concern': 'Lo ngại chất lượng',
  'other': 'Lý do khác'
};

const COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', 
  '#8B5CF6', '#EC4899', '#6366F1', '#64748B'
];

export default function CancellationInsights({ 
  metrics = {},
  showChart = true 
}) {
  const { 
    total_cancellations = 0, 
    cancel_rate = 0,
    reasons_breakdown = {},
    tier_breakdown = {},
    total_penalty_collected = 0,
    total_refund_paid = 0
  } = metrics;

  // Prepare chart data
  const chartData = Object.entries(reasons_breakdown).map(([reason, count]) => ({
    name: REASON_LABELS[reason] || reason,
    value: count,
    percent: total_cancellations > 0 ? ((count / total_cancellations) * 100).toFixed(1) : 0
  }));

  // Sort by value desc
  chartData.sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Phân tích hủy đơn</h3>
            <p className="text-xs text-gray-500">
              {total_cancellations} đơn hủy • Tỷ lệ {cancel_rate}%
            </p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full ${
          parseFloat(cancel_rate) >= 30 
            ? 'bg-red-100 text-red-700' 
            : parseFloat(cancel_rate) >= 15
              ? 'bg-amber-100 text-amber-700'
              : 'bg-green-100 text-green-700'
        }`}>
          <span className="text-sm font-semibold">{cancel_rate}%</span>
        </div>
      </div>

      {/* Chart */}
      {showChart && chartData.length > 0 && (
        <div className="mb-5">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={(entry) => `${entry.percent}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={({ payload }) => {
                  if (!payload?.[0]) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 rounded-lg shadow-lg border">
                      <p className="font-medium text-sm">{data.name}</p>
                      <p className="text-xs text-gray-600">
                        {data.value} đơn ({data.percent}%)
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top reasons list */}
      <div className="space-y-2 mb-5">
        <h4 className="text-sm font-medium text-gray-700">Lý do phổ biến:</h4>
        {chartData.slice(0, 5).map((data, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-gray-700">{data.name}</span>
            </div>
            <span className="font-medium text-gray-900">
              {data.value} ({data.percent}%)
            </span>
          </div>
        ))}
      </div>

      {/* Tier breakdown */}
      {Object.keys(tier_breakdown).length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Theo Policy Tier:</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(tier_breakdown).map(([tier, count]) => (
              <div key={tier} className="p-2 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600">{tier.replace('tier_', 'Tier ')}</p>
                <p className="font-semibold text-gray-900">{count} đơn</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial impact */}
      <div className="border-t pt-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 mb-1">Tổng hoàn tiền</p>
            <p className="text-lg font-bold text-red-700">
              {total_refund_paid.toLocaleString()}đ
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 mb-1">Phí hủy thu được</p>
            <p className="text-lg font-bold text-green-700">
              {total_penalty_collected.toLocaleString()}đ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
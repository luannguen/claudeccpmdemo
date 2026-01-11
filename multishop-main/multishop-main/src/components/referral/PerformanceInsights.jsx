/**
 * PerformanceInsights - AI-powered insights and recommendations
 * UI Layer - Presentation only
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { usePerformanceInsights } from '@/components/hooks/useReferralGamification';
import { Progress } from '@/components/ui/progress';

function RecommendationCard({ recommendation }) {
  const typeConfig = {
    warning: { icon: Icon.AlertTriangle, bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700' },
    info: { icon: Icon.Info, bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700' },
    success: { icon: Icon.CheckCircle, bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
    goal: { icon: Icon.Target, bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' }
  };
  
  const config = typeConfig[recommendation.type] || typeConfig.info;
  const IconComp = config.icon;
  
  return (
    <div className={`p-4 rounded-xl border-2 ${config.bg} ${config.border}`}>
      <div className="flex items-start gap-3">
        <IconComp size={20} className={config.text} />
        <div className="flex-1">
          <h4 className={`font-semibold ${config.text}`}>{recommendation.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{recommendation.message}</p>
        </div>
      </div>
    </div>
  );
}

export default function PerformanceInsights({ memberId }) {
  const { data: insights, isLoading } = usePerformanceInsights(memberId);
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-100 rounded-lg" />
            <div className="h-20 bg-gray-100 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!insights) return null;
  
  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon.Activity size={20} className="text-blue-600" />
            Hiệu Suất Của Bạn
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Icon.Target size={32} className="mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{insights.conversionRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-500">Tỷ lệ chuyển đổi</p>
            </div>
            
            <div className="text-center">
              <Icon.DollarSign size={32} className="mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">
                {(insights.avgOrderValue / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500">Giá trị đơn TB</p>
            </div>
            
            <div className="text-center">
              <Icon.RefreshCw size={32} className="mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{insights.repeatRate}</p>
              <p className="text-xs text-gray-500">KH quay lại</p>
            </div>
            
            <div className="text-center">
              <Icon.Trophy size={32} className="mx-auto mb-2 text-amber-600" />
              <p className="text-2xl font-bold text-amber-600">#{insights.myRank}</p>
              <p className="text-xs text-gray-500">Hạng hiện tại</p>
            </div>
          </div>
          
          {/* Percentile Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Vị trí trong hệ thống</span>
              <span className="font-bold text-amber-600">Top {insights.percentile.toFixed(0)}%</span>
            </div>
            <Progress value={100 - insights.percentile} className="h-3" />
            <p className="text-xs text-gray-500 text-right">
              {insights.myRank} / {insights.totalMembers} CTV
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* AI Recommendations */}
      {insights.recommendations?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon.Lightbulb size={20} className="text-amber-600" />
              Gợi Ý Cải Thiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.recommendations.map((rec, i) => (
                <RecommendationCard key={i} recommendation={rec} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
/**
 * Performance Metrics Component
 * UI Component - Track & display performance metrics
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function PerformanceMetrics({ feature }) {
  const metrics = feature.performance_metrics || {
    page_load_time: null,
    api_response_time: null,
    lighthouse_score: null,
    bundle_size_kb: null
  };

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (!score) return null;
    if (score >= 90) return 'bg-green-100 text-green-700';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon.Zap size={20} className="text-yellow-500" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Page Load Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon.Clock size={16} className="text-gray-500" />
            <span className="text-sm font-medium">Page Load Time</span>
          </div>
          <div className="text-right">
            {metrics.page_load_time ? (
              <>
                <span className={`font-bold ${getScoreColor(metrics.page_load_time < 2000 ? 90 : 50)}`}>
                  {metrics.page_load_time}ms
                </span>
                {metrics.page_load_time < 2000 && (
                  <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Fast</Badge>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-sm">Chưa đo</span>
            )}
          </div>
        </div>

        {/* API Response Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon.Activity size={16} className="text-gray-500" />
            <span className="text-sm font-medium">API Response</span>
          </div>
          <div className="text-right">
            {metrics.api_response_time ? (
              <span className={`font-bold ${getScoreColor(metrics.api_response_time < 500 ? 90 : 50)}`}>
                {metrics.api_response_time}ms
              </span>
            ) : (
              <span className="text-gray-400 text-sm">Chưa đo</span>
            )}
          </div>
        </div>

        {/* Lighthouse Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon.Lightbulb size={16} className="text-gray-500" />
              <span className="text-sm font-medium">Lighthouse Score</span>
            </div>
            {metrics.lighthouse_score && (
              <Badge className={getScoreBadge(metrics.lighthouse_score)}>
                {metrics.lighthouse_score}/100
              </Badge>
            )}
          </div>
          {metrics.lighthouse_score && (
            <Progress value={metrics.lighthouse_score} className="h-2" />
          )}
        </div>

        {/* Bundle Size */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon.Package size={16} className="text-gray-500" />
            <span className="text-sm font-medium">Bundle Size</span>
          </div>
          <div className="text-right">
            {metrics.bundle_size_kb ? (
              <>
                <span className={`font-bold ${getScoreColor(metrics.bundle_size_kb < 200 ? 90 : 50)}`}>
                  {metrics.bundle_size_kb}KB
                </span>
                {metrics.bundle_size_kb < 200 && (
                  <Badge className="ml-2 bg-green-100 text-green-700 text-xs">Optimal</Badge>
                )}
              </>
            ) : (
              <span className="text-gray-400 text-sm">Chưa đo</span>
            )}
          </div>
        </div>

        {/* Last measured */}
        {metrics.last_measured_at && (
          <p className="text-xs text-gray-500 text-center pt-3 border-t">
            Đo lần cuối: {new Date(metrics.last_measured_at).toLocaleString('vi-VN')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
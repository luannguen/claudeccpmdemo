/**
 * AI Personalization Settings Component
 * 
 * Admin controls for AI system:
 * - View processing stats
 * - Manual trigger processing
 * - Cleanup old activities
 */

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { 
  Brain, Play, Trash2, RefreshCw, Users, Activity, 
  Clock, CheckCircle, AlertCircle, Loader2, BarChart3,
  Zap, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AIPersonalizationSettings() {
  const queryClient = useQueryClient();
  const [lastResult, setLastResult] = useState(null);

  // ========== STATS QUERIES ==========
  const { data: activityStats, isLoading: loadingStats, refetch: refetchStats } = useQuery({
    queryKey: ['ai-activity-stats'],
    queryFn: async () => {
      const [unprocessed, processed, profiles] = await Promise.all([
        base44.entities.UserActivity.filter({ is_processed: false }, '-created_date', 500),
        base44.entities.UserActivity.filter({ is_processed: true }, '-created_date', 100),
        base44.entities.UserProfileAI.list('-last_ai_processed', 100)
      ]);
      
      // Group unprocessed by user
      const userCounts = {};
      unprocessed.forEach(a => {
        const email = a.created_by;
        if (email) userCounts[email] = (userCounts[email] || 0) + 1;
      });
      
      const usersWithPending = Object.keys(userCounts).length;
      const avgPendingPerUser = usersWithPending > 0 
        ? Math.round(unprocessed.length / usersWithPending) 
        : 0;
      
      return {
        totalUnprocessed: unprocessed.length,
        totalProcessed: processed.length,
        usersWithPending,
        avgPendingPerUser,
        totalProfiles: profiles.length,
        recentProfiles: profiles.slice(0, 5),
        topPendingUsers: Object.entries(userCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([email, count]) => ({ email, count }))
      };
    },
    staleTime: 30000
  });

  // ========== MUTATIONS ==========
  const processMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('processUserPersonalization', {});
      return result.data;
    },
    onSuccess: (data) => {
      setLastResult({ type: 'process', ...data, timestamp: new Date() });
      queryClient.invalidateQueries({ queryKey: ['ai-activity-stats'] });
    },
    onError: (error) => {
      setLastResult({ type: 'error', message: error.message, timestamp: new Date() });
    }
  });

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('processUserPersonalization', { cleanup: true });
      return result.data;
    },
    onSuccess: (data) => {
      setLastResult({ type: 'cleanup', ...data, timestamp: new Date() });
      queryClient.invalidateQueries({ queryKey: ['ai-activity-stats'] });
    },
    onError: (error) => {
      setLastResult({ type: 'error', message: error.message, timestamp: new Date() });
    }
  });

  const isProcessing = processMutation.isPending || cleanupMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Personalization</h2>
            <p className="text-sm text-gray-500">Quản lý hệ thống cá nhân hóa AI</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetchStats()}
          disabled={loadingStats}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {activityStats?.totalUnprocessed || 0}
                </p>
                <p className="text-xs text-gray-500">Activities chờ xử lý</p>
              </div>
              <Activity className="w-8 h-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {activityStats?.usersWithPending || 0}
                </p>
                <p className="text-xs text-gray-500">Users cần xử lý</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {activityStats?.totalProfiles || 0}
                </p>
                <p className="text-xs text-gray-500">AI Profiles</p>
              </div>
              <Brain className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {activityStats?.avgPendingPerUser || 0}
                </p>
                <p className="text-xs text-gray-500">Avg pending/user</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Điều Khiển AI Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => processMutation.mutate()}
              disabled={isProcessing}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {processMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Chạy AI Processing
            </Button>

            <Button
              variant="outline"
              onClick={() => cleanupMutation.mutate()}
              disabled={isProcessing}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              {cleanupMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Cleanup Old Data
            </Button>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• <strong>AI Processing</strong>: Xử lý batch tất cả users có activities mới (max 20 users/lần)</p>
            <p>• <strong>Cleanup</strong>: Xóa activities đã xử lý {'>'}7 ngày</p>
            <p>• Nên setup CRON job gọi API này định kỳ 30-60 phút</p>
          </div>

          {/* Last Result */}
          {lastResult && (
            <div className={`p-3 rounded-lg text-sm ${
              lastResult.type === 'error' 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-start gap-2">
                {lastResult.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                )}
                <div>
                  {lastResult.type === 'error' ? (
                    <p className="text-red-700">Lỗi: {lastResult.message}</p>
                  ) : lastResult.type === 'cleanup' ? (
                    <p className="text-green-700">
                      Đã xóa <strong>{lastResult.deleted}</strong> activities cũ
                    </p>
                  ) : (
                    <p className="text-green-700">
                      Đã xử lý <strong>{lastResult.processed}</strong> users 
                      {lastResult.failed > 0 && ` (${lastResult.failed} lỗi)`}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {lastResult.timestamp?.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users with Pending Activities */}
      {activityStats?.topPendingUsers?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Top Users Chờ Xử Lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activityStats.topPendingUsers.map((user, i) => (
                <div key={user.email} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">#{i + 1}</span>
                    <span className="text-sm text-gray-700">{user.email}</span>
                  </div>
                  <Badge variant="secondary">{user.count} activities</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent AI Profiles */}
      {activityStats?.recentProfiles?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              AI Profiles Gần Đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activityStats.recentProfiles.map((profile) => {
                const segmentLabels = {
                  'loyal_buyer': '🛒 Khách trung thành',
                  'deal_hunter': '💰 Săn deal',
                  'organic_enthusiast': '🌿 Yêu organic',
                  'community_active': '👥 Cộng đồng',
                  'browser': '👀 Xem nhiều',
                  'new_user': '🆕 Mới'
                };
                
                return (
                  <div key={profile.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900">{profile.user_email}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {profile.personalized_summary || 'Chưa có phân tích'}
                        </p>
                        {profile.conversion_metrics?.view_to_cart_rate && (
                          <p className="text-xs text-blue-600 mt-1">
                            📊 Cart rate: {(profile.conversion_metrics.view_to_cart_rate * 100).toFixed(1)}%
                            {profile.conversion_metrics.avg_order_value && ` | AOV: ${profile.conversion_metrics.avg_order_value.toLocaleString()}đ`}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 ml-2">
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          {segmentLabels[profile.user_segment] || profile.user_segment || '🆕 Mới'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {profile.engagement_level || 'new'}
                        </Badge>
                      </div>
                    </div>
                    {profile.last_ai_processed && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(profile.last_ai_processed).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CRON Setup Instructions */}
      <Card className="border-dashed border-2 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Database className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-2">Setup CRON Job (Khuyến nghị)</p>
              <p className="mb-2">Để hệ thống AI chạy tự động, setup CRON gọi API:</p>
              <code className="block bg-gray-100 p-2 rounded text-xs mb-2">
                POST /api/functions/processUserPersonalization
              </code>
              <ul className="text-xs space-y-1 text-gray-500">
                <li>• Mỗi 30-60 phút cho batch processing</li>
                <li>• Mỗi ngày 1 lần với body: {`{ "cleanup": true }`}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
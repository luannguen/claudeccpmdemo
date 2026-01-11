/**
 * TesterDashboardPage - Trang Dashboard cá nhân cho Tester
 * 
 * Bao gồm:
 * - Test Cases Tuần Này (chart)
 * - Phân Bổ Kết Quả (pie chart)
 * - Performance Metrics
 * - So Sánh Performance
 * - Bảng Xếp Hạng Tester
 */

import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  TestTube, ArrowLeft, TrendingUp, Award, Target, Users, BarChart3
} from "lucide-react";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Components
import TesterStatsCharts from "@/components/tester/TesterStatsCharts";
import TesterComparison from "@/components/tester/TesterComparison";
import TestTimeline from "@/components/tester/TestTimeline";
import TesterLeaderboard from "@/components/tester/TesterLeaderboard";

// Hooks
import { useTesterPortal } from "@/components/hooks/useTesterPortal";
import { useTesterComparison, useTesterTimeStats } from "@/components/hooks/useTesterDashboardEnhanced";

export default function TesterDashboardPage() {
  const {
    user,
    isLoading: isLoadingAuth,
    isAuthenticated,
    testerEmail,
    testerName,
    profile,
    stats
  } = useTesterPortal();

  const { data: comparisonData } = useTesterComparison(testerEmail);
  const { data: timeStats } = useTesterTimeStats(testerEmail);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Icon.Spinner className="w-8 h-8 text-violet-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <TestTube className="w-12 h-12 text-violet-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-500 mb-4">Bạn cần đăng nhập để xem dashboard</p>
          <Link to={createPageUrl('TesterPortal')}>
            <Button>Đến Tester Portal</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('TesterPortal')}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại Portal
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-500" />
              <h1 className="text-lg font-bold text-gray-900">Dashboard Cá Nhân</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Profile Summary */}
          <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white/80" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold">{profile?.display_name || testerName}</h2>
                  <p className="text-violet-100">{testerEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <p className="text-3xl font-bold">{profile?.total_tests_completed || 0}</p>
                  <p className="text-xs text-violet-100">Tests hoàn thành</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <p className="text-3xl font-bold text-green-300">{profile?.total_passed || 0}</p>
                  <p className="text-xs text-violet-100">Passed</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <p className="text-3xl font-bold text-red-300">{profile?.total_failed || 0}</p>
                  <p className="text-xs text-violet-100">Failed</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-300">{profile?.total_bugs_found || 0}</p>
                  <p className="text-xs text-violet-100">Bugs Found</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <TesterStatsCharts profile={profile} stats={stats} />

          {/* Enhanced Features Row */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Comparison */}
            <TesterComparison comparisonData={comparisonData} />
            
            {/* Timeline */}
            <TestTimeline dailyStats={timeStats?.dailyStats} />
            
            {/* Leaderboard */}
            <TesterLeaderboard 
              leaderboard={comparisonData?.leaderboard} 
              currentEmail={testerEmail}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
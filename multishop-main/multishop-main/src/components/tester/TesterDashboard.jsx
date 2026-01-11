/**
 * TesterDashboard - Dashboard cá nhân cho Tester
 */

import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  TestTube, CheckCircle2, XCircle, Clock, RefreshCw, AlertTriangle,
  BarChart3, TrendingUp, User, ChevronRight, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { statusConfig, categoryConfig } from "@/components/services/featureService";
import ReadyForRetestBanner from "./ReadyForRetestBanner";

function StatCard({ icon: Icon, label, value, color, subtext }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
            {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const priorityColors = {
  critical: 'border-l-4 border-red-500',
  high: 'border-l-4 border-orange-500',
  medium: 'border-l-4 border-blue-500',
  low: 'border-l-4 border-gray-300'
};

const priorityLabels = {
  critical: { label: 'Critical', color: 'bg-red-100 text-red-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700' }
};

function FeatureCard({ feature, testerEmail }) {
  const status = statusConfig[feature.status] || statusConfig.planned;
  const category = categoryConfig[feature.category] || categoryConfig.other;
  const priorityStyle = priorityColors[feature.priority] || '';
  const priorityLabel = priorityLabels[feature.priority];
  
  // Calculate test stats for this feature
  const testCases = feature.test_cases || [];
  const myTestCases = testCases.filter(tc => 
    tc.tester_email === testerEmail || tc.assigned_tester === testerEmail
  );
  const readyForRetest = testCases.filter(tc => tc.status === 'ready_for_retest');
  const pending = testCases.filter(tc => tc.status === 'pending');

  return (
    <Link 
      to={createPageUrl(`TesterPortal?feature=${feature.id}`)}
      className="block"
    >
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${priorityStyle}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{feature.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className={status.color}>{status.icon} {status.label}</Badge>
                <Badge className={category.color}>{category.label}</Badge>
                {priorityLabel && (
                  <Badge className={priorityLabel.color}>{priorityLabel.label}</Badge>
                )}
                {feature.version && <Badge variant="outline">v{feature.version}</Badge>}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>

          {/* Test Progress */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Test Cases</span>
              <span className="font-medium">{testCases.length}</span>
            </div>
            
            {readyForRetest.length > 0 && (
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-700 font-medium">
                  {readyForRetest.length} cần test lại
                </span>
              </div>
            )}
            
            {pending.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{pending.length} chờ test</span>
              </div>
            )}
            
            {myTestCases.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-violet-600">
                <User className="w-4 h-4" />
                <span>{myTestCases.length} được gán cho bạn</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function TestCaseListItem({ testCase, onNavigate }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'ready_for_retest': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'blocked': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Guard: Don't render if missing required data
  if (!testCase?.id || !testCase?.featureId) {
    console.warn('TestCaseListItem: Invalid testCase data', testCase);
    return null;
  }

  const handleClick = () => {
    if (onNavigate && testCase.featureId) {
      onNavigate(testCase.featureId, testCase.id);
    }
  };

  return (
    <div 
      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
      onClick={handleClick}
    >
      {getStatusIcon(testCase.status)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{testCase.title || 'Untitled'}</p>
        <p className="text-xs text-gray-500">{testCase.featureName || 'Unknown Feature'}</p>
      </div>
      {testCase.featureVersion && (
        <Badge variant="outline" className="text-xs">v{testCase.featureVersion}</Badge>
      )}
    </div>
  );
}

export default function TesterDashboard({ 
  profile,
  stats,
  dashboardStats,
  assignedFeatures,
  onNavigateToFeature,
  filters = {}
}) {
  const [activeSection, setActiveSection] = React.useState('ready_for_retest');

  // Filter features based on filters prop
  const filteredFeatures = React.useMemo(() => {
    if (!assignedFeatures) return [];
    
    return assignedFeatures.filter(f => {
      const matchesSearch = !filters.search || 
        f.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        f.description?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || !filters.category || 
        f.category === filters.category;
      
      const matchesPriority = filters.priority === 'all' || !filters.priority || 
        f.priority === filters.priority;
      
      // Status filter: filter test cases within features
      const matchesStatus = filters.status === 'all' || !filters.status;
      
      return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
    });
  }, [assignedFeatures, filters]);

  const handleNavigate = (featureId, testCaseId) => {
    if (!featureId) {
      console.error('TesterDashboard.handleNavigate: Missing featureId');
      return;
    }
    if (onNavigateToFeature) {
      onNavigateToFeature(featureId, testCaseId);
    }
  };

  // Calculate progress
  const totalTests = stats?.total || 0;
  const completedTests = (stats?.passed || 0) + (stats?.failed || 0);
  const progressPercent = totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Ready for Retest Banner - Priority */}
      {dashboardStats?.readyForRetest?.length > 0 && (
        <ReadyForRetestBanner 
          testCases={dashboardStats.readyForRetest.filter(tc => tc?.id && tc?.featureId)}
          onNavigate={handleNavigate}
        />
      )}

      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Xin chào, {profile?.display_name || 'Tester'}! 👋
              </h1>
              <p className="text-violet-100 mt-1">
                Bạn có {dashboardStats?.readyForRetest?.length || 0} test case cần test lại
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{completedTests}/{totalTests}</p>
              <p className="text-violet-100 text-sm">Test cases hoàn thành</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span>Tiến độ tổng thể</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2 bg-violet-400" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={RefreshCw}
          label="Cần test lại"
          value={dashboardStats?.readyForRetest?.length || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={Clock}
          label="Chờ test"
          value={dashboardStats?.pendingTests?.length || 0}
          color="bg-gray-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Đã passed"
          value={stats?.passed || 0}
          color="bg-green-500"
        />
        <StatCard
          icon={XCircle}
          label="Đã failed"
          value={stats?.failed || 0}
          color="bg-red-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Test Cases Priority */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Actions */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Ưu tiên xử lý
                </CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={activeSection === 'ready_for_retest' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveSection('ready_for_retest')}
                    className={activeSection === 'ready_for_retest' ? 'bg-blue-600' : ''}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Test lại ({dashboardStats?.readyForRetest?.length || 0})
                  </Button>
                  <Button
                    variant={activeSection === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveSection('pending')}
                    className={activeSection === 'pending' ? 'bg-gray-600' : ''}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    Chờ test ({dashboardStats?.pendingTests?.length || 0})
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {activeSection === 'ready_for_retest' ? (
                  dashboardStats?.readyForRetest?.length > 0 ? (
                    <div className="space-y-2">
                      {dashboardStats.readyForRetest
                        .filter(tc => tc?.id && tc?.featureId)
                        .map((tc) => (
                          <TestCaseListItem 
                            key={`retest-${tc.featureId}-${tc.id}`} 
                            testCase={tc} 
                            onNavigate={handleNavigate}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Không có test case nào cần test lại</p>
                    </div>
                  )
                ) : (
                  dashboardStats?.pendingTests?.length > 0 ? (
                    <div className="space-y-2">
                      {dashboardStats.pendingTests
                        .filter(tc => tc?.id && tc?.featureId)
                        .map((tc) => (
                          <TestCaseListItem 
                            key={`pending-${tc.featureId}-${tc.id}`} 
                            testCase={tc} 
                            onNavigate={handleNavigate}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Không có test case nào chờ test</p>
                    </div>
                  )
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Activity - My Completed Tests */}
          <Card id="section-completed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-500" />
                Hoạt động gần đây (Đã test)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[280px]">
                {dashboardStats?.recentlyTested?.length > 0 ? (
                  <div className="space-y-2">
                    {dashboardStats.recentlyTested.map((tc, i) => (
                      <div 
                        key={`recent-${tc.featureId}-${tc.id}-${i}`} 
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => handleNavigate(tc.featureId, tc.id)}
                      >
                        {tc.status === 'passed' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : tc.status === 'failed' ? (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        ) : tc.status === 'blocked' ? (
                          <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        ) : (
                          <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{tc.title}</p>
                          <p className="text-xs text-gray-500 truncate">{tc.featureName}</p>
                          <p className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(tc.tested_at), { addSuffix: true, locale: vi })}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={tc.status === 'passed' ? 'default' : tc.status === 'failed' ? 'destructive' : 'outline'} className="text-xs">
                            {tc.status === 'passed' ? 'Passed' : tc.status === 'failed' ? 'Failed' : tc.status}
                          </Badge>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Chưa có hoạt động nào</p>
                    <p className="text-xs mt-1">Test các test case để xem lại lịch sử tại đây</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Assigned Features */}
        <div className="space-y-6" id="section-features">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TestTube className="w-5 h-5 text-violet-500" />
                Tính năng được gán ({filteredFeatures.length}/{assignedFeatures?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {filteredFeatures.length > 0 ? (
                  <div className="space-y-3">
                    {filteredFeatures.map(feature => (
                      <FeatureCard 
                        key={feature.id} 
                        feature={feature} 
                        testerEmail={profile?.user_email}
                      />
                    ))}
                  </div>
                ) : assignedFeatures?.length > 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <TestTube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Không tìm thấy tính năng phù hợp với bộ lọc</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <TestTube className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Chưa có tính năng nào được gán</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Profile Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-500" />
                Thống kê cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Tổng test đã thực hiện</span>
                <span className="font-bold">{profile?.total_tests_completed || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700">Tổng passed</span>
                <span className="font-bold text-green-700">{profile?.total_passed || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-red-700">Tổng bugs tìm thấy</span>
                <span className="font-bold text-red-700">{profile?.total_bugs_found || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
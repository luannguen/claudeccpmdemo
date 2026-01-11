/**
 * TesterPortal - Trang Tester Portal nâng cao
 * 
 * Yêu cầu đăng nhập, hỗ trợ:
 * - Dashboard cá nhân
 * - Test feature cụ thể
 * - Thông báo
 * - Lịch sử test
 * - Bộ lọc test case
 */

import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  TestTube, Home, LogOut, AlertCircle, Check, History, BookOpen
} from "lucide-react";
import { Icon } from "@/components/ui/AnimatedIcon.jsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createPageUrl } from "@/utils";

// Components
import TesterLoginPrompt from "@/components/tester/TesterLoginPrompt";
import TesterDashboard from "@/components/tester/TesterDashboard";
import TesterNotificationBell from "@/components/tester/TesterNotificationBell";
import TestCaseCardEnhanced from "@/components/tester/TestCaseCardEnhanced";
import TesterStatsCharts from "@/components/tester/TesterStatsCharts";
import BatchTestingToolbar from "@/components/tester/BatchTestingToolbar";
import ExportTestReportButton from "@/components/tester/ExportTestReportButton";
import QuickBugReportModal from "@/components/tester/QuickBugReportModal";
import TesterComparison from "@/components/tester/TesterComparison";
import SuggestedTests from "@/components/tester/SuggestedTests";
import TestTimeline from "@/components/tester/TestTimeline";
import TesterLeaderboard from "@/components/tester/TesterLeaderboard";
import TestFilters from "@/components/tester/TestFilters";
import KeyboardShortcutsGuide from "@/components/tester/KeyboardShortcutsGuide";
import TesterHandbookModal from "@/components/tester/TesterHandbookModal";
import TesterProfileDropdown from "@/components/tester/TesterProfileDropdown";
import TesterFeatureFilters from "@/components/tester/TesterFeatureFilters";
import ImageLightbox from "@/components/admin/testers/ImageLightbox";

// Hooks
import { useTesterPortal, useFeatureTesting } from "@/components/hooks/useTesterPortal";
import { useTesterComparison, useTesterTimeStats, useSuggestedTests } from "@/components/hooks/useTesterDashboardEnhanced";
import { statusConfig, categoryConfig, priorityConfig } from "@/components/services/featureService";
import { testCaseStatusConfig } from "@/components/services/testerService";
import { usePermissionCheck } from "@/components/hooks/useAdminNavigation";

// ========== FEATURE TESTING VIEW ==========
function FeatureTestingView({ testerInfo, onBack }) {
  const [searchParams] = useSearchParams();
  const featureId = searchParams.get('feature');
  const token = searchParams.get('token');
  
  const { 
    feature, 
    testStats, 
    isLoading, 
    error,
    submitResult,
    isSubmitting 
  } = useFeatureTesting(featureId);

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    assigned: 'all',
    severity: 'all'
  });
  const [batchMode, setBatchMode] = useState(false);
  const [selectedTestCases, setSelectedTestCases] = useState([]);
  const [quickBugModal, setQuickBugModal] = useState({ open: false, testCase: null });
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });

  const handleOpenLightbox = (images, index) => {
    setLightbox({ open: true, images, index });
  };

  // Filter test cases
  const filteredTestCases = useMemo(() => {
    if (!feature?.test_cases) return [];
    
    return feature.test_cases.filter(tc => {
      const matchesSearch = !filters.search || 
        tc.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        tc.steps?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || tc.status === filters.status;
      
      const matchesAssigned = filters.assigned === 'all' || 
        (filters.assigned === 'mine' && (tc.tester_email === testerInfo.email || tc.assigned_tester === testerInfo.email)) ||
        (filters.assigned === 'unassigned' && !tc.assigned_tester);
      
      const matchesSeverity = filters.severity === 'all' || 
        tc.severity === filters.severity ||
        (filters.severity !== 'all' && tc.status !== 'failed');
      
      return matchesSearch && matchesStatus && matchesAssigned && matchesSeverity;
    });
  }, [feature?.test_cases, filters, testerInfo?.email]);

  const filterStats = useMemo(() => {
    if (!feature?.test_cases) return {};
    return {
      total: feature.test_cases.length,
      pending: feature.test_cases.filter(tc => tc.status === 'pending').length,
      passed: feature.test_cases.filter(tc => tc.status === 'passed').length,
      failed: feature.test_cases.filter(tc => tc.status === 'failed').length,
      ready_for_retest: feature.test_cases.filter(tc => tc.status === 'ready_for_retest').length,
      blocked: feature.test_cases.filter(tc => tc.status === 'blocked').length,
      skipped: feature.test_cases.filter(tc => tc.status === 'skipped').length
    };
  }, [feature?.test_cases]);

  const handleSubmitResult = async (testCaseId, result) => {
    await submitResult({
      testCaseId,
      result,
      testerInfo: {
        email: testerInfo.email,
        name: testerInfo.name
      }
    });
  };

  // Batch testing handlers
  const toggleBatchMode = () => {
    setBatchMode(!batchMode);
    setSelectedTestCases([]);
  };

  const toggleSelectTestCase = (tcId) => {
    setSelectedTestCases(prev =>
      prev.includes(tcId) ? prev.filter(id => id !== tcId) : [...prev, tcId]
    );
  };

  const handleBatchPass = async () => {
    for (const tcId of selectedTestCases) {
      await submitResult({
        testCaseId: tcId,
        result: {
          status: 'passed',
          actual_result: 'Passed in batch testing'
        },
        testerInfo
      });
    }
    setSelectedTestCases([]);
    setBatchMode(false);
  };

  const handleBatchFail = async () => {
    for (const tcId of selectedTestCases) {
      await submitResult({
        testCaseId: tcId,
        result: {
          status: 'failed',
          actual_result: 'Failed in batch testing',
          error_description: 'Marked as failed in batch mode'
        },
        testerInfo
      });
    }
    setSelectedTestCases([]);
    setBatchMode(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icon.Spinner className="w-8 h-8 text-violet-500" />
      </div>
    );
  }

  if (error || !feature) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy</h2>
        <p className="text-gray-600 mb-4">{error?.message || 'Tính năng không tồn tại hoặc không công khai'}</p>
        <Button onClick={onBack}>Quay lại Dashboard</Button>
      </div>
    );
  }

  const status = statusConfig[feature.status] || statusConfig.planned;
  const category = categoryConfig[feature.category] || categoryConfig.other;
  const priority = priorityConfig[feature.priority] || priorityConfig.medium;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <Home className="w-4 h-4" />
        Quay lại Dashboard
      </Button>

      {/* Feature Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{feature.name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={status.color}>{status.icon} {status.label}</Badge>
                <Badge className={category.color}>{category.label}</Badge>
                <Badge className={priority.color}>{priority.label}</Badge>
                {feature.version && (
                  <Badge variant="outline" className="bg-violet-50">
                    📦 v{feature.version}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {feature.description && (
            <p className="text-gray-600 mb-4">{feature.description}</p>
          )}

          {/* Acceptance Criteria */}
          {feature.acceptance_criteria?.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">✅ Tiêu chí nghiệm thu</h4>
              <ul className="space-y-1">
                {feature.acceptance_criteria.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Test Stats */}
          <div className="grid grid-cols-3 md:grid-cols-7 gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">{testStats.total}</p>
              <p className="text-xs text-gray-500">Tổng</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">{testStats.ready_for_retest}</p>
              <p className="text-xs text-gray-500">Test lại</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-400">{testStats.pending}</p>
              <p className="text-xs text-gray-500">Chờ</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-600">{testStats.passed}</p>
              <p className="text-xs text-gray-500">Passed</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-red-600">{testStats.failed}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-orange-500">{testStats.blocked}</p>
              <p className="text-xs text-gray-500">Blocked</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-yellow-500">{testStats.skipped}</p>
              <p className="text-xs text-gray-500">Skipped</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters & Actions */}
      <div className="flex items-center gap-3">
        <TestFilters
          filters={filters}
          onFilterChange={setFilters}
          onClearFilters={() => setFilters({ search: '', status: 'all', assigned: 'all', severity: 'all' })}
          testStats={filterStats}
        />
        
        <div className="flex items-center gap-2">
          <KeyboardShortcutsGuide />
          <ExportTestReportButton
            feature={feature}
            testCases={filteredTestCases}
            testerName={testerInfo.name}
          />
          <Button
            variant={batchMode ? "default" : "outline"}
            size="sm"
            onClick={toggleBatchMode}
            className={batchMode ? "bg-violet-600" : ""}
          >
            {batchMode ? '✓ Batch Mode' : 'Batch Testing'}
          </Button>
        </div>
      </div>

      {/* Test Cases */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <TestTube className="w-5 h-5 text-violet-500" />
          Test Cases ({filteredTestCases.length})
        </h2>

        {filteredTestCases.length === 0 ? (
          <Card className="p-8 text-center">
            <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {feature.test_cases?.length === 0 
                ? 'Chưa có test case nào'
                : 'Không tìm thấy test case phù hợp với bộ lọc'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTestCases.map((tc, index) => (
              <TestCaseCardEnhanced
                key={tc.id}
                testCase={tc}
                index={index}
                featureVersion={feature.version}
                onSubmitResult={handleSubmitResult}
                isSubmitting={isSubmitting}
                testerInfo={testerInfo}
                isAssignedToMe={tc.tester_email === testerInfo.email || tc.assigned_tester === testerInfo.email}
                batchMode={batchMode}
                isSelected={selectedTestCases.includes(tc.id)}
                onToggleSelect={() => toggleSelectTestCase(tc.id)}
                onQuickBugReport={() => setQuickBugModal({ open: true, testCase: tc })}
              />
            ))}
          </div>
        )}

        {/* Batch Testing Toolbar */}
        <BatchTestingToolbar
          selectedCount={selectedTestCases.length}
          onClearSelection={() => setSelectedTestCases([])}
          onBatchPass={handleBatchPass}
          onBatchFail={handleBatchFail}
          isProcessing={isSubmitting}
        />

        {/* Quick Bug Report Modal */}
        <QuickBugReportModal
          isOpen={quickBugModal.open}
          onClose={() => setQuickBugModal({ open: false, testCase: null })}
          testCase={quickBugModal.testCase}
          featureName={feature?.name}
          onSubmit={(bugData) => {
            handleSubmitResult(quickBugModal.testCase.id, {
              status: 'failed',
              ...bugData
            });
            setQuickBugModal({ open: false, testCase: null });
          }}
        />

        {/* Image Lightbox */}
        <ImageLightbox
          images={lightbox.images}
          initialIndex={lightbox.index}
          isOpen={lightbox.open}
          onClose={() => setLightbox({ open: false, images: [], index: 0 })}
        />
        </div>

      {/* Footer */}
      <div className="mt-12 pt-8 border-t text-center text-sm text-gray-400">
        {feature.test_deadline && (
          <p className="mb-2">
            📅 Deadline: {new Date(feature.test_deadline).toLocaleDateString('vi-VN')}
          </p>
        )}
        <p>Powered by Tester Portal</p>
      </div>
    </div>
  );
}

// ========== MAIN PAGE ==========
export default function TesterPortalPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const featureId = searchParams.get('feature');
  const token = searchParams.get('token');

  const {
    user,
    isLoading: isLoadingAuth,
    isAuthenticated,
    login,
    logout,
    testerEmail,
    testerName,
    profile,
    isLoadingProfile,
    notifications,
    unreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    assignedFeatures,
    stats,
    dashboardStats,
    isLoading: isLoadingDashboard
  } = useTesterPortal();

  // Enhanced features
  const { data: comparisonData } = useTesterComparison(testerEmail);
  const { data: timeStats } = useTesterTimeStats(testerEmail);
  const { data: suggestedTests = [] } = useSuggestedTests(testerEmail);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [batchMode, setBatchMode] = useState(false);
  const [selectedTestCases, setSelectedTestCases] = useState([]);
  const [showHandbook, setShowHandbook] = useState(false);
  const [featureFilters, setFeatureFilters] = useState({
    search: '',
    status: 'all',
    category: 'all',
    priority: 'all'
  });
  const { hasPermission } = usePermissionCheck();
  
  // Tester role: READ ONLY (chỉ view, submit test results)
  const canEditFeatures = hasPermission('features.update');
  const canDeleteFeatures = hasPermission('features.delete');
  const canManageTesters = hasPermission('testers.manage');

  // Navigate to feature
  const handleNavigateToFeature = (featureId, testCaseId) => {
    if (!featureId) {
      console.error('handleNavigateToFeature: Missing featureId');
      return;
    }
    setSearchParams({ feature: featureId });
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    setSearchParams({});
    setBatchMode(false);
    setSelectedTestCases([]);
  };

  // Batch testing handlers
  const toggleBatchMode = () => {
    setBatchMode(!batchMode);
    setSelectedTestCases([]);
  };

  const toggleSelectTestCase = (tcId) => {
    setSelectedTestCases(prev =>
      prev.includes(tcId) ? prev.filter(id => id !== tcId) : [...prev, tcId]
    );
  };

  // Show loading
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Icon.Spinner className="w-8 h-8 text-violet-500" />
      </div>
    );
  }

  // Require login (unless using public token)
  if (!isAuthenticated && !token) {
    return <TesterLoginPrompt onLogin={login} />;
  }

  const testerInfo = {
    email: testerEmail || 'guest@tester.com',
    name: testerName || 'Guest Tester'
  };

  // If viewing a specific feature
  const isViewingFeature = featureId || token;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <TestTube className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tester Portal</h1>
                <p className="text-sm text-gray-500">
                  {profile?.display_name || testerInfo.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Navigation - Only show when not viewing feature */}
              {!isViewingFeature && isAuthenticated && (
                <nav className="hidden md:flex items-center gap-1 mr-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => document.getElementById('section-features')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-600 hover:text-violet-600"
                  >
                    <TestTube className="w-4 h-4 mr-1" />
                    Tính năng
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => document.getElementById('section-completed')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-600 hover:text-violet-600"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Đã test
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowHandbook(true)}
                    className="text-gray-600 hover:text-violet-600"
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    Sổ tay
                  </Button>
                </nav>
              )}
              
              {/* Notifications */}
              {isAuthenticated && (
                <TesterNotificationBell
                  notifications={notifications}
                  unreadCount={unreadNotifications}
                  onMarkAsRead={markNotificationAsRead}
                  onMarkAllAsRead={markAllNotificationsAsRead}
                  onNavigateToFeature={handleNavigateToFeature}
                />
              )}

              {/* User Profile Dropdown */}
              {isAuthenticated && (
                <TesterProfileDropdown
                  profile={profile}
                  testerEmail={testerEmail}
                  testerName={testerName}
                  onLogout={logout}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 mt-2">
        {isViewingFeature ? (
          <FeatureTestingView 
            testerInfo={testerInfo}
            onBack={handleBackToDashboard}
          />
        ) : (
          <div className="space-y-6">
            {/* Quick Jump Bar - Mobile */}
            <div className="flex md:hidden gap-2 overflow-x-auto pb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('section-features')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-shrink-0"
              >
                <TestTube className="w-4 h-4 mr-1" />
                Tính năng ({assignedFeatures?.length || 0})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('section-completed')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex-shrink-0"
              >
                <History className="w-4 h-4 mr-1" />
                Đã test
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHandbook(true)}
                className="flex-shrink-0"
              >
                <BookOpen className="w-4 h-4 mr-1" />
                Sổ tay
              </Button>
            </div>
            
            {/* Feature Filters */}
            <TesterFeatureFilters
              filters={featureFilters}
              onFilterChange={setFeatureFilters}
              onClearFilters={() => setFeatureFilters({ search: '', status: 'all', category: 'all', priority: 'all' })}
              stats={stats}
            />

            {/* Suggested Tests */}
            {suggestedTests.length > 0 && (
              <SuggestedTests 
                suggestions={suggestedTests}
                onNavigate={handleNavigateToFeature}
              />
            )}
            
            {/* Dashboard */}
            <TesterDashboard
              profile={profile}
              stats={stats}
              dashboardStats={dashboardStats}
              assignedFeatures={assignedFeatures}
              onNavigateToFeature={handleNavigateToFeature}
              filters={featureFilters}
            />
          </div>
        )}
      </main>

      {/* Handbook Modal */}
      <TesterHandbookModal 
        isOpen={showHandbook} 
        onClose={() => setShowHandbook(false)} 
      />
    </div>
  );
}
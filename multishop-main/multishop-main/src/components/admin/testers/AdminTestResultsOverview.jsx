/**
 * AdminTestResultsOverview - Tổng quan kết quả test cho Admin
 */

import React, { useState, useMemo } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  TestTube, Search, CheckCircle2, XCircle, Clock, RefreshCw,
  AlertTriangle, Filter, ChevronDown, Eye, BarChart3, ExternalLink,
  Download, FileText, Send
} from "lucide-react";
import TestCaseDetailModal from "./TestCaseDetailModal";
import ExportTestReportAdmin from "./ExportTestReportAdmin";
import DevResponseModal from "@/components/features/DevResponseModal";
import TesterPerformanceCard from "./TesterPerformanceCard";
import { useMarkReadyForRetest } from "@/components/hooks/useFeatures";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { testCaseStatusConfig } from "@/components/services/testerService";
import { categoryConfig, priorityConfig } from "@/components/services/featureService";

export default function AdminTestResultsOverview({ testResults, initialTesterFilter }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [testerFilter, setTesterFilter] = useState(initialTesterFilter || 'all');
  const [expandedFeatures, setExpandedFeatures] = useState(new Set());
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [devResponseModal, setDevResponseModal] = useState({ open: false, testCase: null, featureId: null });
  const { markReadyForRetest, isMarking } = useMarkReadyForRetest();

  // Update tester filter when initialTesterFilter changes
  React.useEffect(() => {
    if (initialTesterFilter) {
      setTesterFilter(initialTesterFilter);
    }
  }, [initialTesterFilter]);

  const handleDevResponse = async (devResponse) => {
    await markReadyForRetest({
      featureId: devResponseModal.featureId,
      testCaseId: devResponseModal.testCase.id,
      devResponse: {
        ...devResponse,
        responded_by: 'Admin'
      }
    });
    setDevResponseModal({ open: false, testCase: null, featureId: null });
  };

  const handleOpenDevResponse = (testCase, featureId) => {
    setDevResponseModal({ open: true, testCase, featureId });
  };

  const { testCases = [], statusCounts = {}, testerStats = [], passRate = 0 } = testResults || {};

  // Handle tester card click to filter
  const handleTesterCardClick = (email) => {
    setTesterFilter(email === testerFilter ? 'all' : email);
  };

  // Filter test cases
  const filteredTestCases = useMemo(() => {
    return testCases.filter(tc => {
      const matchesSearch = !search || 
        tc.title?.toLowerCase().includes(search.toLowerCase()) ||
        tc.featureName?.toLowerCase().includes(search.toLowerCase()) ||
        tc.tester_name?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || tc.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || tc.featureCategory === categoryFilter;
      const matchesTester = testerFilter === 'all' || 
        tc.tester_email === testerFilter || 
        tc.assigned_tester === testerFilter;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesTester;
    });
  }, [testCases, search, statusFilter, categoryFilter, testerFilter]);

  // Group by feature
  const groupedByFeature = useMemo(() => {
    const groups = {};
    filteredTestCases.forEach(tc => {
      if (!groups[tc.featureId]) {
        groups[tc.featureId] = {
          featureId: tc.featureId,
          featureName: tc.featureName,
          featureCategory: tc.featureCategory,
          featurePriority: tc.featurePriority,
          testCases: []
        };
      }
      groups[tc.featureId].testCases.push(tc);
    });
    return Object.values(groups);
  }, [filteredTestCases]);

  const toggleFeature = (featureId) => {
    setExpandedFeatures(prev => {
      const next = new Set(prev);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'ready_for_retest': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'blocked': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const config = testCaseStatusConfig[status] || testCaseStatusConfig.pending;
    return (
      <Badge className={config.color}>
        {config.icon} {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{testCases.length}</p>
            <p className="text-sm text-gray-500">Tổng test cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{statusCounts.passed || 0}</p>
            <p className="text-sm text-gray-500">Passed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-red-600">{statusCounts.failed || 0}</p>
            <p className="text-sm text-gray-500">Failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{statusCounts.ready_for_retest || 0}</p>
            <p className="text-sm text-gray-500">Cần retest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-gray-400">{statusCounts.pending || 0}</p>
            <p className="text-sm text-gray-500">Chờ test</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-violet-600">{passRate}%</p>
            <p className="text-sm text-violet-600">Pass Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Pass Rate Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-500" />
            Tiến độ test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Passed ({statusCounts.passed || 0})</span>
                <span className="text-green-600">{testCases.length > 0 ? Math.round((statusCounts.passed / testCases.length) * 100) : 0}%</span>
              </div>
              <Progress value={testCases.length > 0 ? (statusCounts.passed / testCases.length) * 100 : 0} className="h-2 bg-gray-100" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Failed ({statusCounts.failed || 0})</span>
                <span className="text-red-600">{testCases.length > 0 ? Math.round((statusCounts.failed / testCases.length) * 100) : 0}%</span>
              </div>
              <Progress value={testCases.length > 0 ? (statusCounts.failed / testCases.length) * 100 : 0} className="h-2 bg-gray-100 [&>div]:bg-red-500" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Pending ({statusCounts.pending || 0})</span>
                <span className="text-gray-500">{testCases.length > 0 ? Math.round((statusCounts.pending / testCases.length) * 100) : 0}%</span>
              </div>
              <Progress value={testCases.length > 0 ? (statusCounts.pending / testCases.length) * 100 : 0} className="h-2 bg-gray-100 [&>div]:bg-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      {testerStats.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-500" />
            Top Testers
            {testerFilter !== 'all' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTesterFilter('all')}
                className="ml-auto"
              >
                Xóa filter
              </Button>
            )}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {testerStats.slice(0, 6).map((tester, index) => {
              // Map tester stats to TesterProfile-like structure
              const testerProfile = {
                user_email: tester.email,
                display_name: tester.name,
                avatar_url: null,
                total_tests_completed: tester.total,
                total_passed: tester.passed,
                total_failed: tester.failed,
                total_bugs_found: tester.failed // Approximate
              };
              
              return (
                <TesterPerformanceCard
                  key={tester.email}
                  tester={testerProfile}
                  rank={index + 1}
                  onClick={handleTesterCardClick}
                  isSelected={testerFilter === tester.email}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm test case, feature, tester..."
            className="pl-10"
          />
        </div>

        <ExportTestReportAdmin testResults={testResults} />

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(testCaseStatusConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.icon} {cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            {Object.entries(categoryConfig).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={testerFilter} onValueChange={setTesterFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả Testers</SelectItem>
            {testerStats.map(tester => (
              <SelectItem key={tester.email} value={tester.email}>
                {tester.name} ({tester.total})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-gray-500">
          {filteredTestCases.length} / {testCases.length} test cases
        </span>
      </div>

      {/* Test Results by Feature */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TestTube className="w-5 h-5 text-violet-500" />
            Kết quả test theo Feature ({groupedByFeature.length})
          </CardTitle>
          <p className="text-xs text-gray-500">Click vào row để xem chi tiết</p>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {groupedByFeature.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <TestTube className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Không tìm thấy test case nào</p>
              </div>
            ) : (
              <div className="divide-y">
                {groupedByFeature.map(group => {
                  const passedCount = group.testCases.filter(tc => tc.status === 'passed').length;
                  const failedCount = group.testCases.filter(tc => tc.status === 'failed').length;
                  const isExpanded = expandedFeatures.has(group.featureId);
                  const category = categoryConfig[group.featureCategory] || categoryConfig.other;
                  const priority = priorityConfig[group.featurePriority] || priorityConfig.medium;
                  
                  return (
                    <Collapsible key={group.featureId} open={isExpanded}>
                      <CollapsibleTrigger asChild>
                        <div 
                          className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                          onClick={() => toggleFeature(group.featureId)}
                        >
                          <div className="flex items-center gap-3">
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            <div>
                              <p className="font-medium text-gray-900">{group.featureName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={category.color} variant="outline">{category.label}</Badge>
                                <Badge className={priority.color}>{priority.label}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-500">{group.testCases.length} tests</span>
                            <span className="text-green-600">✓ {passedCount}</span>
                            <span className="text-red-600">✗ {failedCount}</span>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Test Case</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Tester</TableHead>
                                <TableHead>Thời gian</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.testCases.map(tc => (
                                <TableRow 
                                  key={tc.id} 
                                  className="group cursor-pointer hover:bg-violet-50 transition-colors"
                                  onClick={() => setSelectedTestCase(tc)}
                                >
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{tc.title || 'Untitled'}</span>
                                      {tc.status === 'failed' && (
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="text-xs text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenDevResponse(tc, group.featureId);
                                          }}
                                        >
                                          <Send className="w-3 h-3 mr-1" />
                                          Đã sửa
                                        </Button>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {getStatusBadge(tc.status)}
                                  </TableCell>
                                  <TableCell>
                                    {tc.tester_name || tc.tester_email || tc.assigned_tester || (
                                      <span className="text-gray-400">Chưa gán</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {tc.tested_at ? (
                                        <span className="text-xs text-gray-500">
                                          {formatDistanceToNow(new Date(tc.tested_at), { addSuffix: true, locale: vi })}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-gray-400">-</span>
                                      )}
                                      <Eye className="w-4 h-4 text-violet-400 opacity-0 group-hover:opacity-100" />
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
      {/* Test Case Detail Modal */}
      <TestCaseDetailModal
        isOpen={!!selectedTestCase}
        onClose={() => setSelectedTestCase(null)}
        testCase={selectedTestCase}
        featureId={selectedTestCase?.featureId}
        featureName={selectedTestCase?.featureName}
        featureVersion={selectedTestCase?.tested_version}
      />

      {/* Dev Response Modal (Direct) */}
      <DevResponseModal
        isOpen={devResponseModal.open}
        onClose={() => setDevResponseModal({ open: false, testCase: null, featureId: null })}
        testCase={devResponseModal.testCase}
        featureName={devResponseModal.testCase?.featureName}
        currentVersion={devResponseModal.testCase?.tested_version}
        onSubmit={handleDevResponse}
        isSubmitting={isMarking}
      />
    </div>
  );
}
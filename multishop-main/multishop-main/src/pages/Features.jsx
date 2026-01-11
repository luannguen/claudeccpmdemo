/**
 * Features Page - Trang quản lý tính năng hệ thống
 * 
 * Landing page độc lập, không dùng ClientLayout hay AdminLayout.
 * Dành cho tester viết test case.
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import {
  Zap, Plus, Search, ChevronDown, Edit2, Trash2,
  Check, X, Clock, ArrowLeft, ExternalLink, TestTube,
  BarChart3, Loader2, RefreshCw, Home, Copy, Share2,
  FileText, UserPlus, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { useFeatures, useMarkReadyForRetest, useAssignTester, useBulkAssignTester } from "@/components/hooks/useFeatures";
import { statusConfig, categoryConfig, priorityConfig } from "@/components/services/featureService";
import FeatureFormModal from "@/components/features/FeatureFormModal";
import FeatureBulkActions from "@/components/features/FeatureBulkActions";
import DevResponseModal from "@/components/features/DevResponseModal";
import TestCaseAssignModal from "@/components/features/TestCaseAssignModal";
import BulkTestCaseAssignModal from "@/components/features/BulkTestCaseAssignModal";
import TestTemplateLibrary from "@/components/features/TestTemplateLibrary";
import FeatureDependencyGraph from "@/components/features/FeatureDependencyGraph";
import PerformanceMetrics from "@/components/features/PerformanceMetrics";
import ReleaseNotesGenerator from "@/components/features/ReleaseNotesGenerator";
import AutoRegressionSuite from "@/components/features/AutoRegressionSuite";
import AdminGuard from "@/components/AdminGuard";
import { Checkbox } from "@/components/ui/checkbox";

// ========== STATS CARDS ==========
function StatsCards({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: 'Tổng tính năng', value: stats.total, icon: Zap, color: 'bg-violet-500' },
    { label: 'Hoàn thành', value: stats.byStatus?.completed || 0, icon: Check, color: 'bg-green-500' },
    { label: 'Đang phát triển', value: stats.byStatus?.in_progress || 0, icon: Clock, color: 'bg-blue-500' },
    { label: 'Test Passed', value: stats.testCoverage?.passed || 0, icon: TestTube, color: 'bg-emerald-500' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white rounded-xl p-4 shadow-sm border"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ========== FEATURE ROW ==========
function FeatureRow({ feature, onEdit, onDelete, onUpdateTestCase, onGenerateLink, onRevokeLink, isSelected, onToggleSelect, onMarkReadyForRetest, onAssignTester }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = statusConfig[feature.status] || statusConfig.planned;
  const category = categoryConfig[feature.category] || categoryConfig.other;
  const priority = priorityConfig[feature.priority] || priorityConfig.medium;

  const publicUrl = feature.public_token 
    ? `${window.location.origin}/FeaturesPublic?token=${feature.public_token}`
    : null;

  const copyLink = async () => {
    if (publicUrl) {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const testStats = useMemo(() => {
    const tcs = feature.test_cases || [];
    return {
      total: tcs.length,
      passed: tcs.filter(tc => tc.status === 'passed').length,
      failed: tcs.filter(tc => tc.status === 'failed').length,
      readyForRetest: tcs.filter(tc => tc.status === 'ready_for_retest').length
    };
  }, [feature.test_cases]);

  return (
    <>
      <TableRow className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-violet-50' : ''}`} onClick={() => setExpanded(!expanded)}>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect(feature.id)}
          />
        </TableCell>
        <TableCell>
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </TableCell>
        <TableCell>
          <div>
            <p className="font-medium text-gray-900">{feature.name}</p>
            {feature.description && (
              <p className="text-sm text-gray-500 line-clamp-1">{feature.description}</p>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge className={category.color}>{category.label}</Badge>
        </TableCell>
        <TableCell>
          <Badge className={status.color}>
            {status.icon} {status.label}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge className={priority.color}>{priority.label}</Badge>
        </TableCell>
        <TableCell>
          <span className="text-sm font-mono">{feature.version || '-'}</span>
        </TableCell>
        <TableCell>
          {testStats.total > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="text-green-600">{testStats.passed}</span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{testStats.total}</span>
              </div>
              {testStats.failed > 0 && (
                <Badge variant="destructive" className="text-xs">{testStats.failed} failed</Badge>
              )}
              {testStats.readyForRetest > 0 && (
                <Badge className="text-xs bg-blue-100 text-blue-700">{testStats.readyForRetest} retest</Badge>
              )}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Public Link */}
            {feature.is_public && publicUrl ? (
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyLink}
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-blue-500" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(publicUrl, '_blank')}
                  title="Open link"
                >
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRevokeLink(feature.id)}
                  title="Revoke link"
                >
                  <X className="w-4 h-4 text-orange-500" />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onGenerateLink(feature.id)}
                title="Generate public link"
              >
                <Share2 className="w-4 h-4 text-violet-500" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onEdit(feature)}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(feature)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </TableCell>
      </TableRow>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <TableRow>
            <TableCell colSpan={9} className="bg-gray-50 p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 space-y-6">
                  {/* Acceptance Criteria */}
                  {feature.acceptance_criteria?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">✅ Tiêu chí nghiệm thu</h4>
                      <ul className="space-y-1">
                        {feature.acceptance_criteria.map((criteria, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {criteria}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Test Cases */}
                  {feature.test_cases?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">🧪 Test Cases</h4>
                      <div className="space-y-3">
                        {feature.test_cases.map((tc, i) => (
                          <div key={tc.id} className="bg-white border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">#{i + 1} {tc.title || 'Untitled'}</span>
                              <Select
                                value={tc.status}
                                onValueChange={(status) => onUpdateTestCase(feature.id, tc.id, status)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">⏳ Pending</SelectItem>
                                  <SelectItem value="passed">✅ Passed</SelectItem>
                                  <SelectItem value="failed">❌ Failed</SelectItem>
                                  <SelectItem value="skipped">⏭️ Skipped</SelectItem>
                                  <SelectItem value="blocked">🚫 Blocked</SelectItem>
                                  <SelectItem value="ready_for_retest">🔄 Ready for Retest</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {tc.steps && (
                              <div className="text-sm text-gray-600 mb-2">
                                <strong>Bước thực hiện:</strong>
                                <p className="whitespace-pre-wrap">{tc.steps}</p>
                              </div>
                            )}
                            {tc.expected && (
                              <div className="text-sm text-gray-600">
                                <strong>Kết quả mong đợi:</strong>
                                <p className="whitespace-pre-wrap">{tc.expected}</p>
                              </div>
                            )}
                            
                            {/* Dev actions for failed test cases */}
                            {tc.status === 'failed' && (
                              <div className="mt-3 pt-3 border-t">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600 border-blue-200"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkReadyForRetest(feature, tc);
                                  }}
                                >
                                  <RefreshCw className="w-4 h-4 mr-1" />
                                  Đánh dấu sẵn sàng test lại
                                </Button>
                              </div>
                            )}
                            
                            {/* Show dev response */}
                            {tc.dev_response && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-center gap-2 text-blue-700 text-sm font-medium">
                                  <RefreshCw className="w-4 h-4" />
                                  Phản hồi từ Dev
                                </div>
                                <p className="text-sm text-blue-600 mt-1">{tc.dev_response.message}</p>
                                {tc.dev_response.fixed_in_version && (
                                  <Badge className="mt-2 bg-blue-100 text-blue-700">
                                    v{tc.dev_response.fixed_in_version}
                                  </Badge>
                                )}
                              </div>
                            )}

                            {/* Assigned tester */}
                            {tc.assigned_tester && (
                              <div className="mt-2 text-xs text-gray-500">
                                👤 Assigned: {tc.assigned_tester}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Assign Tester Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAssignTester(feature);
                        }}
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Gán Tester
                      </Button>
                    </div>
                  )}

                  {/* Related Pages/Components */}
                  <div className="flex flex-wrap gap-4">
                    {feature.related_pages?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">📄 Trang liên quan</h4>
                        <div className="flex flex-wrap gap-1">
                          {feature.related_pages.map(page => (
                            <Badge key={page} variant="outline">{page}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {feature.related_components?.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">🧩 Components</h4>
                        <div className="flex flex-wrap gap-1">
                          {feature.related_components.map(comp => (
                            <Badge key={comp} variant="outline">{comp}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Links & Notes */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {feature.jira_link && (
                      <a 
                        href={feature.jira_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="w-4 h-4" /> Jira Link
                      </a>
                    )}
                    {feature.release_date && (
                      <span className="text-gray-500">
                        📅 Release: {feature.release_date}
                      </span>
                    )}
                  </div>

                  {feature.notes && (
                    <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                      <strong>📝 Ghi chú:</strong> {feature.notes}
                    </div>
                  )}
                </div>
              </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </>
  );
}

// ========== MAIN PAGE ==========
function FeaturesContent() {
  const { 
    features, stats, isLoading, 
    createFeature, updateFeature, deleteFeature, updateTestCase,
    generatePublicLink, revokePublicLink,
    bulkUpdateStatus, bulkUpdatePriority, bulkUpdateCategory,
    bulkDelete, bulkGenerateLinks, bulkRevokeLinks,
    isCreating, isUpdating, isBulkProcessing 
  } = useFeatures();

  const { markReadyForRetest, isMarking } = useMarkReadyForRetest();
  const { assignTester, isAssigning } = useAssignTester();
  const { bulkAssignTester, isBulkAssigning } = useBulkAssignTester();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Dev Response Modal state
  const [devResponseModal, setDevResponseModal] = useState({ open: false, feature: null, testCase: null });
  // Assign Tester Modal state
  const [assignModal, setAssignModal] = useState({ open: false, feature: null });
  // New modals state
  const [showTestTemplates, setShowTestTemplates] = useState(false);
  const [showReleaseNotes, setShowReleaseNotes] = useState(false);
  const [selectedForDependency, setSelectedForDependency] = useState(null);
  const [selectedForPerformance, setSelectedForPerformance] = useState(null);
  // Bulk assign modal
  const [showBulkAssign, setShowBulkAssign] = useState(false);

  // Filter features
  const filteredFeatures = useMemo(() => {
    return features.filter(f => {
      const matchSearch = !search || 
        f.name?.toLowerCase().includes(search.toLowerCase()) ||
        f.description?.toLowerCase().includes(search.toLowerCase()) ||
        f.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = statusFilter === 'all' || f.status === statusFilter;
      const matchCategory = categoryFilter === 'all' || f.category === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [features, search, statusFilter, categoryFilter]);

  // Handlers
  const handleEdit = (feature) => {
    setEditingFeature(feature);
    setIsFormOpen(true);
  };

  const handleSave = async (data) => {
    if (editingFeature) {
      await updateFeature({ id: editingFeature.id, data });
    } else {
      await createFeature(data);
    }
    setIsFormOpen(false);
    setEditingFeature(null);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteFeature(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleUpdateTestCase = async (featureId, testCaseId, status) => {
    await updateTestCase({ featureId, testCaseId, status });
  };

  // Selection handlers
  const toggleSelectFeature = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredFeatures.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredFeatures.map(f => f.id));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  // Handle mark ready for retest
  const handleMarkReadyForRetest = (feature, testCase) => {
    setDevResponseModal({ open: true, feature, testCase });
  };

  const handleDevResponseSubmit = async (devResponse) => {
    await markReadyForRetest({
      featureId: devResponseModal.feature.id,
      testCaseId: devResponseModal.testCase.id,
      devResponse: {
        ...devResponse,
        responded_by: 'Admin' // TODO: get current user name
      }
    });
    setDevResponseModal({ open: false, feature: null, testCase: null });
  };

  // Handle assign tester
  const handleOpenAssignModal = (feature) => {
    setAssignModal({ open: true, feature });
  };

  const handleAssignTester = async (testCaseIds, testerEmail) => {
    for (const tcId of testCaseIds) {
      await assignTester({
        featureId: assignModal.feature.id,
        testCaseId: tcId,
        testerEmail
      });
    }
    setAssignModal({ open: false, feature: null });
  };

  // Handle bulk assign
  const handleBulkAssign = async (assignments) => {
    await bulkAssignTester(assignments);
    setShowBulkAssign(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl("AdminDashboard")} className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Features Registry</h1>
                  <p className="text-sm text-gray-500">Quản lý tính năng hệ thống</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Bulk Assign Button - Nổi bật */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBulkAssign(true)}
                className="border-violet-300 text-violet-700 hover:bg-violet-50"
              >
                <UserPlus className="w-4 h-4 mr-2" /> Gán Hàng Loạt
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Zap className="w-4 h-4 mr-2" /> Tools
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setShowBulkAssign(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Gán Hàng Loạt Test Cases
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowTestTemplates(true)}>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Templates
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowReleaseNotes(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Release Notes
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Performance Dashboard
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Link to={createPageUrl("AdminTesters")}>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                  <Users className="w-4 h-4 mr-2" /> Quản Lý Testers
                </Button>
              </Link>
              
              <Link to={createPageUrl("TesterPortal")}>
                <Button variant="outline" size="sm">
                  <TestTube className="w-4 h-4 mr-2" /> Trang Tester
                </Button>
              </Link>
              <Link to={createPageUrl("Home")}>
                <Button variant="ghost" size="sm">
                  <Home className="w-4 h-4 mr-2" /> Trang chủ
                </Button>
              </Link>
              <Button 
                onClick={() => { setEditingFeature(null); setIsFormOpen(true); }}
                className="bg-violet-600 hover:bg-violet-700"
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm tính năng
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Quick Tools Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <AutoRegressionSuite
            features={features}
            onRunTests={(results) => console.log('Test results:', results)}
          />
          {selectedForPerformance ? (
            <PerformanceMetrics feature={selectedForPerformance} />
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Icon.Zap size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chọn feature để xem performance metrics</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm tính năng..."
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.icon} {cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {Object.entries(categoryConfig).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(search || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <Button 
                variant="ghost" 
                onClick={() => { setSearch(''); setStatusFilter('all'); setCategoryFilter('all'); }}
              >
                <X className="w-4 h-4 mr-1" /> Xóa bộ lọc
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : filteredFeatures.length === 0 ? (
            <div className="text-center py-20">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có tính năng nào</p>
              <Button 
                className="mt-4" 
                onClick={() => { setEditingFeature(null); setIsFormOpen(true); }}
              >
                <Plus className="w-4 h-4 mr-2" /> Thêm tính năng đầu tiên
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length === filteredFeatures.length && filteredFeatures.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Tên tính năng</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ưu tiên</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Test Cases</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeatures.map(feature => (
                  <FeatureRow
                    key={feature.id}
                    feature={feature}
                    onEdit={handleEdit}
                    onDelete={setDeleteConfirm}
                    onUpdateTestCase={handleUpdateTestCase}
                    onGenerateLink={generatePublicLink}
                    onRevokeLink={revokePublicLink}
                    isSelected={selectedIds.includes(feature.id)}
                    onToggleSelect={toggleSelectFeature}
                    onMarkReadyForRetest={handleMarkReadyForRetest}
                    onAssignTester={handleOpenAssignModal}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-500 text-center">
          Hiển thị {filteredFeatures.length} / {features.length} tính năng
        </div>
      </main>

      {/* Form Modal */}
      <FeatureFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingFeature(null); }}
        feature={editingFeature}
        onSave={handleSave}
        isSaving={isCreating || isUpdating}
      />

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa tính năng "{deleteConfirm?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Actions Toolbar */}
      <FeatureBulkActions
        selectedIds={selectedIds}
        features={features}
        onClearSelection={clearSelection}
        onBulkUpdateStatus={bulkUpdateStatus}
        onBulkUpdatePriority={bulkUpdatePriority}
        onBulkUpdateCategory={bulkUpdateCategory}
        onBulkDelete={bulkDelete}
        onBulkGenerateLinks={bulkGenerateLinks}
        onBulkRevokeLinks={bulkRevokeLinks}
        isProcessing={isBulkProcessing}
      />

      {/* Dev Response Modal */}
      <DevResponseModal
        isOpen={devResponseModal.open}
        onClose={() => setDevResponseModal({ open: false, feature: null, testCase: null })}
        testCase={devResponseModal.testCase}
        featureName={devResponseModal.feature?.name}
        currentVersion={devResponseModal.feature?.version}
        onSubmit={handleDevResponseSubmit}
        isSubmitting={isMarking}
      />

      {/* Assign Tester Modal */}
      <TestCaseAssignModal
        isOpen={assignModal.open}
        onClose={() => setAssignModal({ open: false, feature: null })}
        testCases={assignModal.feature?.test_cases || []}
        assignedTesters={assignModal.feature?.assigned_testers || []}
        onAssign={handleAssignTester}
        isSubmitting={isAssigning}
      />

      {/* Test Template Library */}
      <TestTemplateLibrary
        isOpen={showTestTemplates}
        onClose={() => setShowTestTemplates(false)}
        onSelectTemplate={(template) => {
          // TODO: Add to current editing feature
          console.log('Selected template:', template);
        }}
      />

      {/* Release Notes Generator */}
      <ReleaseNotesGenerator
        isOpen={showReleaseNotes}
        onClose={() => setShowReleaseNotes(false)}
        features={features}
      />

      {/* Bulk Assign Modal */}
      <BulkTestCaseAssignModal
        isOpen={showBulkAssign}
        onClose={() => setShowBulkAssign(false)}
        features={features}
        onBulkAssign={handleBulkAssign}
        isSubmitting={isBulkAssigning}
      />

      {/* Dependency Graph Sidebar */}
      {selectedForDependency && (
        <div className="fixed right-0 top-0 w-96 h-full bg-white shadow-2xl z-50 overflow-auto">
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h3 className="font-bold">Dependency Graph</h3>
            <Button size="sm" variant="ghost" onClick={() => setSelectedForDependency(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4">
            <FeatureDependencyGraph
              features={features}
              selectedFeatureId={selectedForDependency}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ========== EXPORT WITH GUARD ==========
export default function FeaturesPage() {
  return (
    <AdminGuard>
      <FeaturesContent />
    </AdminGuard>
  );
}
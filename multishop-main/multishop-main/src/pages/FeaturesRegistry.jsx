/**
 * FeaturesRegistry - Trang công khai danh sách tất cả tính năng
 * 
 * URL: /FeaturesRegistry (public, không cần đăng nhập)
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Zap, TestTube, Check, X, Clock, ChevronDown, ChevronRight,
  Search, Filter, Loader2, ExternalLink, BarChart3, CheckCircle2,
  AlertCircle, Package, ShoppingCart, Users, CreditCard, FileText,
  Bell, Gift, Box, Settings, Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { base44 } from "@/api/base44Client";
import { statusConfig, categoryConfig, priorityConfig } from "@/components/services/featureService";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

// Category icons
const categoryIcons = {
  core: Layers,
  admin: Settings,
  client: Users,
  payment: CreditCard,
  cms: FileText,
  notification: Bell,
  referral: Gift,
  order: ShoppingCart,
  product: Package,
  customer: Users,
  integration: Zap,
  other: Box
};

// ========== STATS CARDS ==========
function StatsCards({ features }) {
  const stats = useMemo(() => {
    const byStatus = {};
    const byCategory = {};
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    features.forEach(f => {
      byStatus[f.status] = (byStatus[f.status] || 0) + 1;
      byCategory[f.category] = (byCategory[f.category] || 0) + 1;
      
      (f.test_cases || []).forEach(tc => {
        totalTests++;
        if (tc.status === 'passed') passedTests++;
        else if (tc.status === 'failed') failedTests++;
      });
    });

    return {
      total: features.length,
      byStatus,
      byCategory,
      testCoverage: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
      totalTests,
      passedTests,
      failedTests,
      pendingTests: totalTests - passedTests - failedTests
    };
  }, [features]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats.total}</p>
              <p className="text-sm opacity-80">Tổng tính năng</p>
            </div>
            <Zap className="w-10 h-10 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats.passedTests}</p>
              <p className="text-sm opacity-80">Tests Passed</p>
            </div>
            <CheckCircle2 className="w-10 h-10 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats.failedTests}</p>
              <p className="text-sm opacity-80">Tests Failed</p>
            </div>
            <AlertCircle className="w-10 h-10 opacity-50" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">{stats.testCoverage}%</p>
              <p className="text-sm opacity-80">Test Coverage</p>
            </div>
            <BarChart3 className="w-10 h-10 opacity-50" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ========== FEATURE CARD ==========
function FeatureCard({ feature }) {
  const [expanded, setExpanded] = useState(false);
  
  const status = statusConfig[feature.status] || statusConfig.planned;
  const category = categoryConfig[feature.category] || categoryConfig.other;
  const priority = priorityConfig[feature.priority] || priorityConfig.medium;
  const CategoryIcon = categoryIcons[feature.category] || Box;

  const testStats = useMemo(() => {
    const tcs = feature.test_cases || [];
    return {
      total: tcs.length,
      passed: tcs.filter(tc => tc.status === 'passed').length,
      failed: tcs.filter(tc => tc.status === 'failed').length,
      pending: tcs.filter(tc => tc.status === 'pending').length
    };
  }, [feature.test_cases]);

  const progressPercent = testStats.total > 0 
    ? Math.round(((testStats.passed + testStats.failed) / testStats.total) * 100) 
    : 0;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4" style={{
      borderLeftColor: feature.status === 'completed' ? '#22c55e' : 
                       feature.status === 'testing' ? '#eab308' :
                       feature.status === 'in_progress' ? '#3b82f6' : '#9ca3af'
    }}>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg ${category.color} flex items-center justify-center`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">{feature.name}</CardTitle>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge className={status.color}>{status.icon} {status.label}</Badge>
                <Badge className={priority.color}>{priority.label}</Badge>
                {feature.version && <Badge variant="outline">v{feature.version}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Test progress mini */}
            {testStats.total > 0 && (
              <div className="text-right hidden md:block">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">{testStats.passed}✓</span>
                  <span className="text-red-600">{testStats.failed}✗</span>
                  <span className="text-gray-400">{testStats.pending}⏳</span>
                </div>
                <Progress value={progressPercent} className="w-24 h-1.5 mt-1" />
              </div>
            )}
            {expanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 space-y-4">
              {/* Description */}
              {feature.description && (
                <p className="text-gray-600">{feature.description}</p>
              )}

              {/* Acceptance Criteria */}
              {feature.acceptance_criteria?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 text-sm">✅ Tiêu chí nghiệm thu</h4>
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

              {/* Test Cases Summary */}
              {testStats.total > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-3 text-sm flex items-center gap-2">
                    <TestTube className="w-4 h-4" /> Test Cases ({testStats.total})
                  </h4>
                  <div className="space-y-2">
                    {feature.test_cases.slice(0, 5).map((tc, i) => (
                      <div key={tc.id} className="flex items-center gap-2 text-sm">
                        {tc.status === 'passed' ? <Check className="w-4 h-4 text-green-500" /> :
                         tc.status === 'failed' ? <X className="w-4 h-4 text-red-500" /> :
                         <Clock className="w-4 h-4 text-gray-400" />}
                        <span className={tc.status === 'passed' ? 'text-green-700' : 
                                       tc.status === 'failed' ? 'text-red-700' : 'text-gray-600'}>
                          {tc.title}
                        </span>
                      </div>
                    ))}
                    {feature.test_cases.length > 5 && (
                      <p className="text-sm text-gray-400">+{feature.test_cases.length - 5} more...</p>
                    )}
                  </div>
                </div>
              )}

              {/* Related Pages */}
              {feature.related_pages?.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 text-sm">📄 Trang liên quan</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.related_pages.map((page, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{page}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex items-center gap-4 pt-2 border-t">
                {feature.is_public && feature.public_token && (
                  <Link 
                    to={`${createPageUrl('FeaturesPublic')}?token=${feature.public_token}`}
                    className="text-sm text-violet-600 hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" /> Mở Tester Portal
                  </Link>
                )}
                {feature.jira_link && (
                  <a href={feature.jira_link} target="_blank" rel="noopener noreferrer" 
                     className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" /> Jira
                  </a>
                )}
                {feature.figma_link && (
                  <a href={feature.figma_link} target="_blank" rel="noopener noreferrer"
                     className="text-sm text-pink-600 hover:underline flex items-center gap-1">
                    <ExternalLink className="w-4 h-4" /> Figma
                  </a>
                )}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ========== MAIN PAGE ==========
export default function FeaturesRegistryPage() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Fetch all features
  const { data: features = [], isLoading } = useQuery({
    queryKey: ['features-public'],
    queryFn: () => base44.entities.Feature.list('-created_date'),
    staleTime: 30000
  });

  // Filter features
  const filteredFeatures = useMemo(() => {
    return features.filter(f => {
      const matchSearch = !search || 
        f.name?.toLowerCase().includes(search.toLowerCase()) ||
        f.description?.toLowerCase().includes(search.toLowerCase()) ||
        f.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      
      const matchCategory = filterCategory === 'all' || f.category === filterCategory;
      const matchStatus = filterStatus === 'all' || f.status === filterStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [features, search, filterCategory, filterStatus]);

  // Group by category
  const groupedFeatures = useMemo(() => {
    const groups = {};
    filteredFeatures.forEach(f => {
      const cat = f.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    });
    return groups;
  }, [filteredFeatures]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Features Registry</h1>
                <p className="text-sm text-gray-500">Quản lý tính năng hệ thống</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>{features.length} tính năng</p>
              <p>Cập nhật: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <StatsCards features={features} />

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm tính năng..."
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {Object.entries(categoryConfig).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              {Object.entries(statusConfig).map(([key, val]) => (
                <SelectItem key={key} value={key}>{val.icon} {val.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Feature List by Category */}
        {Object.keys(groupedFeatures).length === 0 ? (
          <Card className="p-12 text-center">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Không tìm thấy tính năng</h3>
            <p className="text-gray-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => {
              const catConfig = categoryConfig[category] || categoryConfig.other;
              const CatIcon = categoryIcons[category] || Box;
              
              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-lg ${catConfig.color} flex items-center justify-center`}>
                      <CatIcon className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">{catConfig.label}</h2>
                    <Badge variant="outline">{categoryFeatures.length}</Badge>
                  </div>
                  <div className="grid gap-4">
                    {categoryFeatures.map(feature => (
                      <FeatureCard key={feature.id} feature={feature} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-400">
          <p>Features Registry • {new Date().getFullYear()}</p>
        </div>
      </main>
    </div>
  );
}
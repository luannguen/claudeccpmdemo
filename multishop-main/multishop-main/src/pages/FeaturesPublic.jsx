/**
 * FeaturesPublic - Trang công khai cho Tester
 * 
 * Tester truy cập qua public link mà không cần đăng nhập.
 * URL: /FeaturesPublic?token=xxx hoặc /FeaturesPublic?feature=xxx
 */

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, TestTube, Check, X, Clock, AlertCircle, Camera, Upload,
  ChevronDown, ExternalLink, Send, Loader2, AlertTriangle, Bug,
  Monitor, Smartphone, Globe, Play, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { statusConfig, categoryConfig, priorityConfig } from "@/components/services/featureService";

// ========== TEST CASE CARD FOR TESTER ==========
function TestCaseCard({ testCase, index, onUpdate, isUpdating }) {
  const [expanded, setExpanded] = useState(false);
  const [formData, setFormData] = useState({
    status: testCase.status || 'pending',
    actual_result: testCase.actual_result || '',
    error_code: testCase.error_code || '',
    error_description: testCase.error_description || '',
    tester_name: testCase.tester_name || '',
    environment: testCase.environment || 'staging',
    browser_info: testCase.browser_info || '',
    severity: testCase.severity || 'major'
  });
  const [screenshots, setScreenshots] = useState(testCase.screenshots || []);
  const [isUploading, setIsUploading] = useState(false);

  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-gray-500" />,
    passed: <Check className="w-4 h-4 text-green-500" />,
    failed: <X className="w-4 h-4 text-red-500" />,
    skipped: <AlertCircle className="w-4 h-4 text-yellow-500" />,
    blocked: <AlertTriangle className="w-4 h-4 text-orange-500" />
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await base44.integrations.Core.UploadFile({ file });
        return result.file_url;
      });
      const urls = await Promise.all(uploadPromises);
      setScreenshots(prev => [...prev, ...urls]);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    onUpdate(testCase.id, {
      ...formData,
      screenshots,
      tested_at: new Date().toISOString()
    });
  };

  const removeScreenshot = (url) => {
    setScreenshots(prev => prev.filter(s => s !== url));
  };

  return (
    <Card className={`border-l-4 ${
      testCase.status === 'passed' ? 'border-l-green-500' :
      testCase.status === 'failed' ? 'border-l-red-500' :
      testCase.status === 'blocked' ? 'border-l-orange-500' :
      'border-l-gray-300'
    }`}>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </span>
            <div>
              <CardTitle className="text-base">{testCase.title || 'Untitled Test Case'}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {statusIcons[testCase.status]}
                <span className="text-sm text-gray-500 capitalize">{testCase.status}</span>
                {testCase.tested_at && (
                  <span className="text-xs text-gray-400">
                    • Tested: {new Date(testCase.tested_at).toLocaleString('vi-VN')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="pt-0 space-y-4">
              {/* Steps & Expected */}
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">📝 Các bước thực hiện</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{testCase.steps || 'Chưa có'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">✅ Kết quả mong đợi</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{testCase.expected || 'Chưa có'}</p>
                </div>
              </div>

              {/* Test Form */}
              <div className="border-t pt-4 space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <TestTube className="w-4 h-4" /> Kết quả Test
                </h4>

                {/* Tester Info */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên Tester</label>
                    <Input
                      value={formData.tester_name}
                      onChange={(e) => setFormData({...formData, tester_name: e.target.value})}
                      placeholder="Tên của bạn"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Môi trường</label>
                    <Select value={formData.environment} onValueChange={(v) => setFormData({...formData, environment: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="development">🔧 Development</SelectItem>
                        <SelectItem value="staging">🧪 Staging</SelectItem>
                        <SelectItem value="production">🚀 Production</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Browser/Device</label>
                    <Input
                      value={formData.browser_info}
                      onChange={(e) => setFormData({...formData, browser_info: e.target.value})}
                      placeholder="Chrome 120, Windows 11"
                    />
                  </div>
                </div>

                {/* Status & Severity */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái *</label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">⏳ Pending</SelectItem>
                        <SelectItem value="passed">✅ Passed</SelectItem>
                        <SelectItem value="failed">❌ Failed</SelectItem>
                        <SelectItem value="skipped">⏭️ Skipped</SelectItem>
                        <SelectItem value="blocked">🚫 Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.status === 'failed' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mức độ nghiêm trọng</label>
                      <Select value={formData.severity} onValueChange={(v) => setFormData({...formData, severity: v})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blocker">🔴 Blocker</SelectItem>
                          <SelectItem value="critical">🟠 Critical</SelectItem>
                          <SelectItem value="major">🟡 Major</SelectItem>
                          <SelectItem value="minor">🟢 Minor</SelectItem>
                          <SelectItem value="trivial">⚪ Trivial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Actual Result */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kết quả thực tế</label>
                  <Textarea
                    value={formData.actual_result}
                    onChange={(e) => setFormData({...formData, actual_result: e.target.value})}
                    placeholder="Mô tả kết quả thực tế khi test..."
                    rows={3}
                  />
                </div>

                {/* Error Info (only if failed) */}
                {formData.status === 'failed' && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-4">
                    <h5 className="font-medium text-red-800 flex items-center gap-2">
                      <Bug className="w-4 h-4" /> Thông tin lỗi
                    </h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-red-700 mb-1">Mã lỗi</label>
                        <Input
                          value={formData.error_code}
                          onChange={(e) => setFormData({...formData, error_code: e.target.value})}
                          placeholder="VD: ERR_001, 500, VALIDATION_ERROR"
                          className="border-red-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-red-700 mb-1">Mô tả lỗi chi tiết</label>
                        <Input
                          value={formData.error_description}
                          onChange={(e) => setFormData({...formData, error_description: e.target.value})}
                          placeholder="Mô tả ngắn gọn lỗi..."
                          className="border-red-200"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Screenshots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Camera className="w-4 h-4 inline mr-1" /> Ảnh chụp màn hình
                  </label>
                  
                  {/* Existing screenshots */}
                  {screenshots.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {screenshots.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt={`Screenshot ${i+1}`} className="w-24 h-24 object-cover rounded-lg border" />
                          <button
                            onClick={() => removeScreenshot(url)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="absolute bottom-1 right-1 w-6 h-6 bg-black/50 text-white rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload */}
                  <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
                    {isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                    ) : (
                      <Upload className="w-5 h-5 text-gray-400" />
                    )}
                    <span className="text-sm text-gray-500">
                      {isUploading ? 'Đang tải lên...' : 'Click để tải ảnh lên'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    onClick={handleSubmit}
                    disabled={isUpdating || !formData.tester_name}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Gửi kết quả
                  </Button>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ========== MAIN PAGE ==========
export default function FeaturesPublicPage() {
  const [feature, setFeature] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingTestCase, setUpdatingTestCase] = useState(null);

  // Get token/feature from URL
  useEffect(() => {
    const loadFeature = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const featureId = params.get('feature');

        if (!token && !featureId) {
          setError('Missing token or feature ID');
          return;
        }

        let features;
        if (token) {
          features = await base44.entities.Feature.filter({ public_token: token, is_public: true });
        } else {
          features = await base44.entities.Feature.filter({ id: featureId });
        }

        if (!features.length) {
          setError('Feature not found or not public');
          return;
        }

        setFeature(features[0]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeature();
  }, []);

  const handleUpdateTestCase = async (testCaseId, updates) => {
    if (!feature) return;
    setUpdatingTestCase(testCaseId);

    try {
      const testCases = [...(feature.test_cases || [])];
      const tcIndex = testCases.findIndex(tc => tc.id === testCaseId);
      
      if (tcIndex !== -1) {
        // Add to history
        const history = testCases[tcIndex].test_history || [];
        history.push({
          status: updates.status,
          tester: updates.tester_name,
          timestamp: new Date().toISOString(),
          note: updates.actual_result?.substring(0, 100)
        });

        testCases[tcIndex] = {
          ...testCases[tcIndex],
          ...updates,
          test_history: history
        };

        await base44.entities.Feature.update(feature.id, { test_cases: testCases });
        setFeature(prev => ({ ...prev, test_cases: testCases }));
      }
    } catch (err) {
      console.error('Update error:', err);
    } finally {
      setUpdatingTestCase(null);
    }
  };

  // Test case stats
  const testStats = useMemo(() => {
    const tcs = feature?.test_cases || [];
    return {
      total: tcs.length,
      passed: tcs.filter(tc => tc.status === 'passed').length,
      failed: tcs.filter(tc => tc.status === 'failed').length,
      pending: tcs.filter(tc => tc.status === 'pending').length,
      blocked: tcs.filter(tc => tc.status === 'blocked').length
    };
  }, [feature?.test_cases]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error || !feature) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy</h1>
          <p className="text-gray-600">{error || 'Tính năng không tồn tại hoặc không công khai'}</p>
        </div>
      </div>
    );
  }

  const status = statusConfig[feature.status] || statusConfig.planned;
  const category = categoryConfig[feature.category] || categoryConfig.other;
  const priority = priorityConfig[feature.priority] || priorityConfig.medium;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TestTube className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Tester Portal</h1>
              <p className="text-sm text-gray-500">Kiểm thử tính năng</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Feature Info */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{feature.name}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={status.color}>{status.icon} {status.label}</Badge>
                  <Badge className={category.color}>{category.label}</Badge>
                  <Badge className={priority.color}>{priority.label}</Badge>
                  {feature.version && <Badge variant="outline">v{feature.version}</Badge>}
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
            <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{testStats.total}</p>
                <p className="text-xs text-gray-500">Tổng</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{testStats.passed}</p>
                <p className="text-xs text-gray-500">Passed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{testStats.failed}</p>
                <p className="text-xs text-gray-500">Failed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">{testStats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{testStats.blocked}</p>
                <p className="text-xs text-gray-500">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Cases */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <TestTube className="w-5 h-5 text-violet-500" />
            Test Cases ({testStats.total})
          </h2>

          {(feature.test_cases || []).length === 0 ? (
            <Card className="p-8 text-center">
              <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Chưa có test case nào</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {feature.test_cases.map((tc, index) => (
                <TestCaseCard
                  key={tc.id}
                  testCase={tc}
                  index={index}
                  onUpdate={handleUpdateTestCase}
                  isUpdating={updatingTestCase === tc.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-400">
          {feature.test_deadline && (
            <p className="mb-2">
              📅 Deadline: {new Date(feature.test_deadline).toLocaleDateString('vi-VN')}
            </p>
          )}
          <p>Powered by Features Registry</p>
        </div>
      </main>
    </div>
  );
}
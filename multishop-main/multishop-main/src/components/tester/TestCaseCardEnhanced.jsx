/**
 * TestCaseCardEnhanced - Card test case nâng cao cho Tester Portal
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check, X, Clock, AlertCircle, AlertTriangle, RefreshCw, Bug,
  ChevronDown, Send, Loader2, Camera, Upload, Video, User, History, ZoomIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { base44 } from "@/api/base44Client";
import TestCaseHistory from "./TestCaseHistory";
import QuickBugReportModal from "./QuickBugReportModal";
import ImageLightbox from "@/components/admin/testers/ImageLightbox";
import QuickActions from "./QuickActions";
import TestProgressIndicator from "./TestProgressIndicator";
import { testCaseStatusConfig } from "@/components/services/testerService";

const statusIcons = {
  pending: Clock,
  passed: Check,
  failed: X,
  skipped: AlertCircle,
  blocked: AlertTriangle,
  ready_for_retest: RefreshCw
};

const borderColors = {
  pending: 'border-l-gray-300',
  passed: 'border-l-green-500',
  failed: 'border-l-red-500',
  skipped: 'border-l-yellow-500',
  blocked: 'border-l-orange-500',
  ready_for_retest: 'border-l-blue-500'
};

export default function TestCaseCardEnhanced({ 
  testCase, 
  index, 
  featureVersion,
  onSubmitResult, 
  isSubmitting,
  testerInfo,
  isAssignedToMe,
  onQuickBugReport
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('test');
  const [showBugReport, setShowBugReport] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const [showProgress, setShowProgress] = useState(false);

  const handleOpenLightbox = (images, index) => {
    setLightbox({ open: true, images, index });
  };

  const toggleProgressTracker = () => {
    setShowProgress(!showProgress);
  };
  
  const [formData, setFormData] = useState({
    status: testCase.status || 'pending',
    actual_result: testCase.actual_result || '',
    error_code: testCase.error_code || '',
    error_description: testCase.error_description || '',
    environment: testCase.environment || testerInfo?.preferred_environment || 'staging',
    browser_info: testCase.browser_info || testerInfo?.default_browser_info || '',
    severity: testCase.severity || 'major',
    screenshots: testCase.screenshots || [],
    video_url: testCase.video_url || ''
  });

  // Auto-expand if ready for retest
  useEffect(() => {
    if (testCase.status === 'ready_for_retest') {
      setExpanded(true);
    }
  }, [testCase.status]);

  const StatusIcon = statusIcons[testCase.status] || Clock;
  const statusCfg = testCaseStatusConfig[testCase.status] || testCaseStatusConfig.pending;

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
      setFormData(prev => ({ ...prev, screenshots: [...prev.screenshots, ...urls] }));
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('Video không được vượt quá 50MB');
      return;
    }

    setIsUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, video_url: result.file_url }));
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const removeScreenshot = (url) => {
    setFormData(prev => ({
      ...prev,
      screenshots: prev.screenshots.filter(s => s !== url)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.status) return;
    if (formData.status === 'failed' && !formData.actual_result?.trim()) {
      alert('Vui lòng mô tả kết quả thực tế khi test failed');
      return;
    }

    await onSubmitResult(testCase.id, {
      ...formData,
      tested_version: featureVersion
    });
  };

  const handleQuickBugReport = async (bugData) => {
    await onSubmitResult(testCase.id, {
      status: 'failed',
      actual_result: bugData.description,
      error_code: bugData.error_code,
      error_description: bugData.title,
      screenshots: bugData.screenshots,
      video_url: bugData.video_url,
      environment: bugData.environment,
      browser_info: bugData.browser_info,
      severity: bugData.severity,
      tested_version: featureVersion
    });
    setShowBugReport(false);
  };

  const handleOpenBugReport = () => {
    if (onQuickBugReport) {
      onQuickBugReport();
    } else {
      setShowBugReport(true);
    }
  };

  return (
    <>
      <Card className={`border-l-4 ${borderColors[testCase.status] || borderColors.pending} overflow-hidden`}>
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors py-4"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Index */}
              <span className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {testCase.title || 'Untitled Test Case'}
                  {isAssignedToMe && (
                    <Badge variant="outline" className="text-xs bg-violet-50">
                      <User className="w-3 h-3 mr-1" />
                      Được gán
                    </Badge>
                  )}
                </CardTitle>
                
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={statusCfg.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusCfg.label}
                  </Badge>
                  
                  {testCase.tested_version && (
                    <Badge variant="outline" className="text-xs">
                      v{testCase.tested_version}
                    </Badge>
                  )}
                  
                  {testCase.retest_count > 0 && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Test lại {testCase.retest_count}x
                    </Badge>
                  )}
                  
                  {testCase.tested_at && (
                    <span className="text-xs text-gray-400">
                      • {new Date(testCase.tested_at).toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Bug Report Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenBugReport();
                }}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Bug className="w-4 h-4 mr-1" />
                Báo lỗi
              </Button>
              
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {/* Dev Response Alert */}
          {testCase.status === 'ready_for_retest' && testCase.dev_response && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">
                    Đã được sửa lỗi - Sẵn sàng test lại!
                  </p>
                  <p className="text-sm text-blue-600 mt-1">{testCase.dev_response.message}</p>
                  {testCase.dev_response.fixed_in_version && (
                    <Badge className="mt-2 bg-blue-100 text-blue-700">
                      Phiên bản: v{testCase.dev_response.fixed_in_version}
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </CardHeader>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="pt-0 border-t">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="test">🧪 Test</TabsTrigger>
                    <TabsTrigger value="history">
                      <History className="w-4 h-4 mr-1" />
                      Lịch sử ({testCase.test_history?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  {/* Test Tab */}
                  <TabsContent value="test" className="space-y-4 mt-4">
                    {/* Quick Actions */}
                    <div className="flex items-center justify-between">
                      <QuickActions
                        testCase={testCase}
                        onSubmit={onSubmitResult}
                        isSubmitting={isSubmitting}
                        disabled={testCase.status === 'passed' || testCase.status === 'blocked'}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleProgressTracker}
                      >
                        {showProgress ? 'Ẩn progress' : '📊 Track progress'}
                      </Button>
                    </div>

                    {/* Progress Tracker (Optional) */}
                    {showProgress && (
                      <TestProgressIndicator testCase={testCase} />
                    )}

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
                    <div className="space-y-4 pt-4 border-t">
                      {/* Version Info */}
                      {featureVersion && (
                        <div className="flex items-center gap-2 p-3 bg-violet-50 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-violet-500" />
                          <span className="text-sm text-violet-700">
                            Đang test phiên bản: <strong>v{featureVersion}</strong>
                          </span>
                        </div>
                      )}

                      {/* Environment & Browser */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Môi trường</label>
                          <Select value={formData.environment} onValueChange={(v) => setFormData(prev => ({ ...prev, environment: v }))}>
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
                            onChange={(e) => setFormData(prev => ({ ...prev, browser_info: e.target.value }))}
                            placeholder="Chrome 120, Windows 11"
                          />
                        </div>
                      </div>

                      {/* Status & Severity */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái *</label>
                          <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
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
                            <Select value={formData.severity} onValueChange={(v) => setFormData(prev => ({ ...prev, severity: v }))}>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kết quả thực tế {formData.status === 'failed' && '*'}
                        </label>
                        <Textarea
                          value={formData.actual_result}
                          onChange={(e) => setFormData(prev => ({ ...prev, actual_result: e.target.value }))}
                          placeholder="Mô tả kết quả thực tế khi test..."
                          rows={3}
                        />
                      </div>

                      {/* Error Info (if failed) */}
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
                                onChange={(e) => setFormData(prev => ({ ...prev, error_code: e.target.value }))}
                                placeholder="ERR_001"
                                className="border-red-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-red-700 mb-1">Mô tả lỗi</label>
                              <Input
                                value={formData.error_description}
                                onChange={(e) => setFormData(prev => ({ ...prev, error_description: e.target.value }))}
                                placeholder="Mô tả ngắn..."
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
                        
                        {formData.screenshots.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {formData.screenshots.map((url, i) => (
                              <div key={i} className="relative group">
                                <button
                                  type="button"
                                  onClick={() => handleOpenLightbox(formData.screenshots, i)}
                                  className="block w-24 h-24 rounded-lg border overflow-hidden hover:ring-2 hover:ring-violet-500 transition-all"
                                >
                                  <img src={url} alt={`Screenshot ${i+1}`} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                    <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeScreenshot(url);
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
                          {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-violet-500" /> : <Upload className="w-5 h-5 text-gray-400" />}
                          <span className="text-sm text-gray-500">{isUploading ? 'Đang tải...' : 'Click để tải ảnh lên'}</span>
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

                      {/* Video */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Video className="w-4 h-4 inline mr-1" /> Video (max 50MB)
                        </label>
                        
                        {formData.video_url ? (
                          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                            <Video className="w-5 h-5 text-green-600" />
                            <span className="text-sm text-green-700 flex-1">Video đã tải lên</span>
                            <Button variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors">
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5 text-gray-400" />}
                            <span className="text-sm text-gray-500">{isUploading ? 'Đang tải...' : 'Click để tải video lên'}</span>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                          </label>
                        )}
                      </div>

                      {/* Submit */}
                      <div className="flex justify-end pt-4 border-t">
                        <Button 
                          onClick={handleSubmit}
                          disabled={isSubmitting || isUploading}
                          className="bg-violet-600 hover:bg-violet-700"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                          Gửi kết quả
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* History Tab */}
                  <TabsContent value="history" className="mt-4">
                    <TestCaseHistory 
                      history={testCase.test_history} 
                      testCase={testCase}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Quick Bug Report Modal */}
      {!onQuickBugReport && (
        <QuickBugReportModal
          isOpen={showBugReport}
          onClose={() => setShowBugReport(false)}
          testCase={testCase}
          featureVersion={featureVersion}
          onSubmit={handleQuickBugReport}
          isSubmitting={isSubmitting}
          testerInfo={testerInfo}
        />
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        images={lightbox.images}
        initialIndex={lightbox.index}
        isOpen={lightbox.open}
        onClose={() => setLightbox({ open: false, images: [], index: 0 })}
      />
    </>
  );
}
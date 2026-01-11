/**
 * TestCaseDetailModal - Modal xem chi tiết test case
 */

import React, { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { vi } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  CheckCircle2, XCircle, Clock, RefreshCw, AlertTriangle,
  User, Calendar, Monitor, FileText, Image, Video, ExternalLink,
  Bug, History, ChevronRight, Send
} from "lucide-react";

// Icons imported from lucide-react for test case detail display
import ImageLightbox from "./ImageLightbox";
import DevResponseModal from "@/components/features/DevResponseModal";
import { useMarkReadyForRetest } from "@/components/hooks/useFeatures";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { testCaseStatusConfig } from "@/components/services/testerService";

export default function TestCaseDetailModal({ isOpen, onClose, testCase, featureId, featureName, featureVersion }) {
  const [lightbox, setLightbox] = useState({ open: false, images: [], index: 0 });
  const [devResponseModal, setDevResponseModal] = useState(false);
  const { markReadyForRetest, isMarking } = useMarkReadyForRetest();

  if (!testCase) return null;

  const statusConfig = testCaseStatusConfig[testCase.status] || testCaseStatusConfig.pending;

  const handleOpenLightbox = (images, index) => {
    setLightbox({ open: true, images, index });
  };

  const handleDevResponse = async (devResponse) => {
    await markReadyForRetest({
      featureId: featureId || testCase.featureId,
      testCaseId: testCase.id,
      devResponse: {
        ...devResponse,
        responded_by: 'Admin'
      }
    });
    setDevResponseModal(false);
    onClose();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'ready_for_retest': return <RefreshCw className="w-5 h-5 text-blue-500" />;
      case 'blocked': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const severityColors = {
    blocker: 'bg-red-600 text-white',
    critical: 'bg-red-500 text-white',
    major: 'bg-orange-500 text-white',
    minor: 'bg-yellow-500 text-white',
    trivial: 'bg-gray-400 text-white'
  };

  return (
    <>
      <Dialog open={isOpen && !lightbox.open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStatusIcon(testCase.status)}
            <span className="flex-1">{testCase.title || 'Untitled Test Case'}</span>
            <Badge className={statusConfig.color}>
              {statusConfig.icon} {statusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Feature Link */}
            {testCase.featureName && (
              <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                <div>
                  <p className="text-sm text-violet-600">Feature</p>
                  <p className="font-medium text-violet-900">{testCase.featureName}</p>
                </div>
                <Link to={createPageUrl(`TesterPortal?feature=${featureId || testCase.featureId}`)}>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Xem Feature
                  </Button>
                </Link>
              </div>
            )}

            {/* Test Steps */}
            {testCase.steps && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Các bước test
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">
                  {testCase.steps}
                </div>
              </div>
            )}

            {/* Expected Result */}
            {testCase.expected && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Kết quả mong đợi</h4>
                <div className="p-3 bg-green-50 rounded-lg text-sm text-green-800">
                  {testCase.expected}
                </div>
              </div>
            )}

            {/* Actual Result */}
            {testCase.actual_result && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Kết quả thực tế</h4>
                <div className={`p-3 rounded-lg text-sm ${
                  testCase.status === 'passed' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {testCase.actual_result}
                </div>
              </div>
            )}

            {/* Error Info (for failed) */}
            {testCase.status === 'failed' && (testCase.error_code || testCase.error_description) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-red-500" />
                  Thông tin lỗi
                </h4>
                <div className="p-3 bg-red-50 rounded-lg space-y-2">
                  {testCase.error_code && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-red-600">Mã lỗi:</span>
                      <code className="px-2 py-0.5 bg-red-100 rounded text-xs text-red-800">
                        {testCase.error_code}
                      </code>
                    </div>
                  )}
                  {testCase.error_description && (
                    <p className="text-sm text-red-800">{testCase.error_description}</p>
                  )}
                  {testCase.severity && (
                    <Badge className={severityColors[testCase.severity] || 'bg-gray-500'}>
                      {testCase.severity.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Dev Response */}
            {testCase.dev_response?.message && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Phản hồi từ Developer</h4>
                <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                  <p className="text-sm text-blue-800">{testCase.dev_response.message}</p>
                  {testCase.dev_response.fixed_in_version && (
                    <Badge variant="outline" className="bg-blue-100">
                      Sửa trong: {testCase.dev_response.fixed_in_version}
                    </Badge>
                  )}
                  {testCase.dev_response.responded_at && (
                    <p className="text-xs text-blue-600">
                      {format(new Date(testCase.dev_response.responded_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      {testCase.dev_response.responded_by && ` • ${testCase.dev_response.responded_by}`}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Separator />

            {/* Test Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tester */}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Tester</p>
                  <p className="text-sm font-medium">
                    {testCase.tester_name || testCase.tester_email || testCase.assigned_tester || 'Chưa gán'}
                  </p>
                </div>
              </div>

              {/* Test Time */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Thời gian test</p>
                  <p className="text-sm font-medium">
                    {testCase.tested_at 
                      ? format(new Date(testCase.tested_at), 'dd/MM/yyyy HH:mm', { locale: vi })
                      : 'Chưa test'}
                  </p>
                </div>
              </div>

              {/* Environment */}
              {testCase.environment && (
                <div className="flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Môi trường</p>
                    <Badge variant="outline">{testCase.environment}</Badge>
                  </div>
                </div>
              )}

              {/* Browser Info */}
              {testCase.browser_info && (
                <div className="flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Browser/Device</p>
                    <p className="text-sm">{testCase.browser_info}</p>
                  </div>
                </div>
              )}

              {/* Version */}
              {testCase.tested_version && (
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Phiên bản test</p>
                    <Badge variant="outline">v{testCase.tested_version}</Badge>
                  </div>
                </div>
              )}

              {/* Retest Count */}
              {testCase.retest_count > 0 && (
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Số lần test lại</p>
                    <Badge variant="outline">{testCase.retest_count}</Badge>
                  </div>
                </div>
              )}
            </div>

            {/* Screenshots */}
            {testCase.screenshots?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4 text-gray-500" />
                  Screenshots ({testCase.screenshots.length})
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {testCase.screenshots.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => handleOpenLightbox(testCase.screenshots, i)}
                      className="block aspect-video bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-violet-500 transition-all cursor-pointer"
                    >
                      <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Video */}
            {testCase.video_url && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Video className="w-4 h-4 text-gray-500" />
                  Video Recording
                </h4>
                <a 
                  href={testCase.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Video className="w-5 h-5 text-violet-500" />
                  <span className="text-sm text-violet-600 underline">Xem video</span>
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                </a>
              </div>
            )}

            {/* Test History */}
            {testCase.test_history?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-500" />
                  Lịch sử test ({testCase.test_history.length})
                </h4>
                <div className="space-y-2">
                  {testCase.test_history.slice().reverse().map((h, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg">
                      {getStatusIcon(h.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{h.tester || 'Unknown'}</span>
                          {h.version && <Badge variant="outline" className="text-xs">v{h.version}</Badge>}
                        </div>
                        {h.note && <p className="text-xs text-gray-600 mt-0.5 truncate">{h.note}</p>}
                        {h.timestamp && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {format(new Date(h.timestamp), 'dd/MM/yyyy HH:mm', { locale: vi })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Link to={createPageUrl(`TesterPortal?feature=${featureId || testCase.featureId}`)}>
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Tester Portal
              </Button>
            </Link>
            {testCase.status === 'failed' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                onClick={() => setDevResponseModal(true)}
              >
                <RefreshCw className="w-4 h-4" />
                Đánh dấu đã sửa
              </Button>
            )}
          </div>
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>

      {/* Dev Response Modal */}
      <DevResponseModal
        isOpen={devResponseModal}
        onClose={() => setDevResponseModal(false)}
        testCase={testCase}
        featureName={featureName || testCase.featureName}
        currentVersion={featureVersion}
        onSubmit={handleDevResponse}
        isSubmitting={isMarking}
      />
    </Dialog>

    {/* Image Lightbox - Render outside Dialog */}
    <ImageLightbox
      images={lightbox.images}
      initialIndex={lightbox.index}
      isOpen={lightbox.open}
      onClose={() => setLightbox({ open: false, images: [], index: 0 })}
    />
    </>
  );
}
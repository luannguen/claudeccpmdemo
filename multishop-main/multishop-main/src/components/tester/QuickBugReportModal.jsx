/**
 * QuickBugReportModal - Modal báo lỗi nhanh
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bug, X, Send, Loader2, Upload, Camera, Video, AlertTriangle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";

const SEVERITY_OPTIONS = [
  { value: 'blocker', label: 'Blocker', desc: 'Không thể tiếp tục test', color: 'bg-red-600' },
  { value: 'critical', label: 'Critical', desc: 'Ảnh hưởng nghiêm trọng', color: 'bg-orange-500' },
  { value: 'major', label: 'Major', desc: 'Chức năng chính bị lỗi', color: 'bg-yellow-500' },
  { value: 'minor', label: 'Minor', desc: 'Lỗi nhỏ, có thể workaround', color: 'bg-green-500' },
  { value: 'trivial', label: 'Trivial', desc: 'UI/UX nhỏ', color: 'bg-gray-400' }
];

export default function QuickBugReportModal({ 
  isOpen, 
  onClose, 
  testCase,
  featureVersion,
  onSubmit,
  isSubmitting,
  testerInfo
}) {
  const [formData, setFormData] = useState({
    title: testCase?.title ? `Bug: ${testCase.title}` : 'Bug Report',
    description: '',
    error_code: '',
    severity: 'major',
    environment: 'staging',
    browser_info: navigator.userAgent.split(' ').slice(-2).join(' '),
    screenshots: [],
    video_url: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.description?.trim()) {
      newErrors.description = 'Vui lòng mô tả lỗi';
    }
    if (formData.description?.length < 20) {
      newErrors.description = 'Mô tả phải có ít nhất 20 ký tự';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter(f => f.size <= maxSize);
    if (validFiles.length < files.length) {
      setErrors(prev => ({ ...prev, files: 'Một số file vượt quá 10MB' }));
    }

    if (!validFiles.length) return;

    setIsUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const result = await base44.integrations.Core.UploadFile({ file });
        return result.file_url;
      });
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        screenshots: [...prev.screenshots, ...urls]
      }));
      setErrors(prev => ({ ...prev, files: null }));
    } catch (err) {
      setErrors(prev => ({ ...prev, files: 'Lỗi upload file' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate video file
    if (!file.type.startsWith('video/')) {
      setErrors(prev => ({ ...prev, video: 'Vui lòng chọn file video' }));
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, video: 'Video không được vượt quá 50MB' }));
      return;
    }

    setIsUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, video_url: result.file_url }));
      setErrors(prev => ({ ...prev, video: null }));
    } catch (err) {
      setErrors(prev => ({ ...prev, video: 'Lỗi upload video' }));
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
    if (!validate()) return;

    await onSubmit({
      ...formData,
      tested_version: featureVersion
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-red-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <Bug className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Báo Lỗi Nhanh</h2>
                <p className="text-sm text-gray-500">Test Case: {testCase?.title}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-auto">
            {/* Version Info */}
            {featureVersion && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-blue-700">
                  Đang test phiên bản: <strong>v{featureVersion}</strong>
                </span>
              </div>
            )}

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mức độ nghiêm trọng *</label>
              <Select value={formData.severity} onValueChange={(v) => setFormData(prev => ({ ...prev, severity: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                        <span>{opt.label}</span>
                        <span className="text-gray-400 text-xs">- {opt.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã lỗi (nếu có)</label>
              <Input
                value={formData.error_code}
                onChange={(e) => setFormData(prev => ({ ...prev, error_code: e.target.value }))}
                placeholder="VD: ERR_500, VALIDATION_ERROR"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả lỗi *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Mô tả chi tiết lỗi gặp phải:&#10;- Các bước tái hiện&#10;- Kết quả thực tế&#10;- Kết quả mong đợi"
                rows={5}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            {/* Environment & Browser */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Môi trường</label>
                <Select value={formData.environment} onValueChange={(v) => setFormData(prev => ({ ...prev, environment: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Browser/Device</label>
                <Input
                  value={formData.browser_info}
                  onChange={(e) => setFormData(prev => ({ ...prev, browser_info: e.target.value }))}
                  placeholder="Chrome 120"
                />
              </div>
            </div>

            {/* Screenshots */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="w-4 h-4 inline mr-1" />
                Ảnh chụp màn hình
              </label>
              
              {formData.screenshots.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.screenshots.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`Screenshot ${i+1}`} className="w-20 h-20 object-cover rounded-lg border" />
                      <button
                        type="button"
                        onClick={() => removeScreenshot(url)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-gray-400" />}
                <span className="text-sm text-gray-500">{isUploading ? 'Đang tải...' : 'Tải ảnh lên (max 10MB)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
              {errors.files && <p className="text-sm text-red-500 mt-1">{errors.files}</p>}
            </div>

            {/* Video */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Video className="w-4 h-4 inline mr-1" />
                Video mô tả lỗi (tùy chọn)
              </label>
              
              {formData.video_url ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <Video className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-700 flex-1">Video đã tải lên</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, video_url: '' }))}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-400 hover:bg-red-50 transition-colors">
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4 text-gray-400" />}
                  <span className="text-sm text-gray-500">{isUploading ? 'Đang tải...' : 'Tải video lên (max 50MB)'}</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              )}
              {errors.video && <p className="text-sm text-red-500 mt-1">{errors.video}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <div className="text-sm text-gray-500">
              Báo cáo bởi: <strong>{testerInfo?.name || 'Unknown'}</strong>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>Hủy</Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting || isUploading}
                className="bg-red-600 hover:bg-red-700 gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Gửi báo lỗi
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
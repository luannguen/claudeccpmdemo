/**
 * DevResponseModal - Modal cho Developer phản hồi và đánh dấu Ready for Retest
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, RefreshCw, MessageSquare, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export default function DevResponseModal({
  isOpen,
  onClose,
  testCase,
  featureName,
  currentVersion,
  onSubmit,
  isSubmitting
}) {
  const [formData, setFormData] = useState({
    message: '',
    fixed_in_version: currentVersion || ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.message?.trim()) {
      newErrors.message = 'Vui lòng nhập nội dung phản hồi';
    }
    if (!formData.fixed_in_version?.trim()) {
      newErrors.fixed_in_version = 'Vui lòng nhập phiên bản đã sửa';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await onSubmit(formData);
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
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Đánh dấu Ready for Retest</h2>
                <p className="text-sm text-gray-500">{featureName}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Test Case Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Test Case:</p>
              <p className="text-sm text-gray-900">{testCase?.title}</p>
              {testCase?.error_description && (
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    {testCase.error_code || 'ERROR'}
                  </Badge>
                  <span className="text-xs text-red-600">{testCase.error_description}</span>
                </div>
              )}
            </div>

            {/* Fixed Version */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Tag className="w-4 h-4 inline mr-1" />
                Phiên bản đã sửa lỗi *
              </label>
              <Input
                value={formData.fixed_in_version}
                onChange={(e) => setFormData(prev => ({ ...prev, fixed_in_version: e.target.value }))}
                placeholder="VD: 1.0.1"
                className={errors.fixed_in_version ? 'border-red-500' : ''}
              />
              {errors.fixed_in_version && (
                <p className="text-sm text-red-500 mt-1">{errors.fixed_in_version}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Nội dung phản hồi *
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Mô tả những gì đã được sửa..."
                rows={4}
                className={errors.message ? 'border-red-500' : ''}
              />
              {errors.message && (
                <p className="text-sm text-red-500 mt-1">{errors.message}</p>
              )}
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                💡 Tester sẽ được thông báo tự động và test case này sẽ chuyển sang trạng thái "Sẵn sàng test lại"
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>Hủy</Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Gửi & Đánh dấu
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
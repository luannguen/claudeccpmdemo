/**
 * FeedbackModal - Modal for submitting feedback
 * UI Layer - Presentation Only
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useCreateFeedback } from '@/components/hooks/useFeedback';
import FeedbackService from '@/components/services/FeedbackService';

export default function FeedbackModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    user_name: '',
    user_email: ''
  });
  const [screenshot, setScreenshot] = useState(null);
  const [uploading, setUploading] = useState(false);

  const createMutation = useCreateFeedback();

  // Auto-fill user info
  useEffect(() => {
    async function loadUserInfo() {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const user = await base44.auth.me();
          setFormData(prev => ({
            ...prev,
            user_name: user.full_name || '',
            user_email: user.email || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    }
    if (isOpen) {
      loadUserInfo();
    }
  }, [isOpen]);

  const handleScreenshot = async (file) => {
    if (!file) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setScreenshot(file_url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await createMutation.mutateAsync({
      ...formData,
      screenshot_url: screenshot
    });

    // Reset và đóng
    setFormData({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      user_name: formData.user_name,
      user_email: formData.user_email
    });
    setScreenshot(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <MessageCircle size={24} className="text-white" />
            </div>
            Gửi Feedback
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-2">
            Ý kiến của bạn giúp chúng tôi cải thiện ứng dụng tốt hơn mỗi ngày
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Loại feedback *</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FeedbackService.CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mức độ ưu tiên</label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FeedbackService.PRIORITY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* User Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tên của bạn *</label>
              <Input
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                placeholder="email@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Để nhận phản hồi</p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Tiêu đề *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Tóm tắt vấn đề hoặc đề xuất của bạn"
              required
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 ký tự</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Mô tả chi tiết *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết vấn đề, cách tái hiện, hoặc đề xuất cải thiện..."
              rows={6}
              required
              minLength={FeedbackService.RATE_LIMITS.MIN_DESCRIPTION_LENGTH}
              maxLength={FeedbackService.RATE_LIMITS.MAX_DESCRIPTION_LENGTH}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/{FeedbackService.RATE_LIMITS.MAX_DESCRIPTION_LENGTH} ký tự 
              (tối thiểu {FeedbackService.RATE_LIMITS.MIN_DESCRIPTION_LENGTH})
            </p>
          </div>

          {/* Screenshot */}
          <div>
            <label className="block text-sm font-medium mb-2">Screenshot (tùy chọn)</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleScreenshot(e.target.files[0])}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors">
                  <Camera size={18} />
                  <span className="text-sm">{uploading ? 'Đang tải...' : 'Chọn ảnh'}</span>
                </div>
              </label>
              {screenshot && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle size={16} />
                  Đã tải lên
                </div>
              )}
            </div>
            {screenshot && (
              <img src={screenshot} alt="Screenshot" className="mt-3 max-w-full h-32 object-contain rounded-lg border" />
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Thông tin trang hiện tại và trình duyệt sẽ tự động được gửi kèm</li>
                  <li>• Chúng tôi sẽ xem xét và phản hồi trong vòng 24-48h</li>
                  <li>• Bạn có thể gửi tối đa {FeedbackService.RATE_LIMITS.USER_DAILY_LIMIT} feedback/ngày</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || uploading}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              {createMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang gửi...
                </div>
              ) : (
                'Gửi Feedback'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import EmojiRatingSelector from './EmojiRatingSelector';
import EnhancedMediaUpload from './EnhancedMediaUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateFeedbackEnhanced } from '@/components/hooks/useFeedbackEnhanced';

export default function FeedbackQuickCreateModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    rating: null,
    screenshot_url: ''
  });

  const createMutation = useCreateFeedbackEnhanced();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      return;
    }

    await createMutation.mutateAsync(formData);
    onClose();
    setFormData({
      title: '',
      description: '',
      category: 'other',
      priority: 'medium',
      rating: null,
      screenshot_url: ''
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon.MessageCircle size={24} className="text-[#7CB342]" />
            Gửi Feedback Nhanh
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Emoji Rating */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              Bạn cảm thấy thế nào về trải nghiệm?
            </label>
            <EmojiRatingSelector
              value={formData.rating}
              onChange={(rating) => setFormData({ ...formData, rating })}
            />
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium mb-2 block">Tiêu đề</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Mô tả ngắn gọn vấn đề..."
              required
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Loại</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">🐛 Lỗi</SelectItem>
                  <SelectItem value="feature_request">✨ Tính năng mới</SelectItem>
                  <SelectItem value="improvement">📈 Cải tiến</SelectItem>
                  <SelectItem value="ui_ux">🎨 UI/UX</SelectItem>
                  <SelectItem value="performance">⚡ Hiệu năng</SelectItem>
                  <SelectItem value="other">📝 Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Mức độ</label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Thấp</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="critical">Khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium mb-2 block">Chi tiết</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả chi tiết vấn đề hoặc ý tưởng của bạn..."
              rows={5}
              required
            />
          </div>

          {/* Media Upload */}
          <div>
            <label className="text-sm font-medium mb-3 block">Đính kèm ảnh/video (không bắt buộc)</label>
            <EnhancedMediaUpload
              onUpload={(urls) => setFormData({ ...formData, screenshot_url: urls[0] || '' })}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="flex-1 bg-[#7CB342] hover:bg-[#5a8f31]"
            >
              {createMutation.isPending ? (
                <>
                  <Icon.Spinner className="mr-2" />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Icon.Send className="mr-2" />
                  Gửi Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
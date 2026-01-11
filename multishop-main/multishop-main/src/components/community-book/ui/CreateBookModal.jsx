/**
 * CreateBookModal - Modal to create a new book
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { base44 } from '@/api/base44Client';
import { 
  BOOK_CATEGORIES, 
  BOOK_CATEGORY_LABELS,
  BOOK_VISIBILITY,
  BOOK_VISIBILITY_LABELS 
} from '../types';

export default function CreateBookModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting = false 
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_image: '',
    category: BOOK_CATEGORIES.KNOWLEDGE,
    tags: '',
    visibility: BOOK_VISIBILITY.PUBLIC,
    allow_contributions: true,
    allow_fork: true
  });
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      handleChange('cover_image', file_url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tiêu đề sách';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Parse tags
    const tags = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const result = await onSubmit({
      ...formData,
      tags
    });

    if (result) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        cover_image: '',
        category: BOOK_CATEGORIES.KNOWLEDGE,
        tags: '',
        visibility: BOOK_VISIBILITY.PUBLIC,
        allow_contributions: true,
        allow_fork: true
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Icon.FileText size={24} className="text-[#7CB342]" />
              Tạo Sách Mới
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Icon.X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa</label>
              <div className="flex items-center gap-4">
                {formData.cover_image ? (
                  <div className="relative w-24 h-32 rounded-xl overflow-hidden bg-gray-100">
                    <img 
                      src={formData.cover_image} 
                      alt="Cover" 
                      className="w-full h-full object-cover" 
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('cover_image', '')}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                    >
                      <Icon.X size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-32 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#7CB342] transition-colors">
                    {isUploadingCover ? (
                      <Icon.Spinner size={24} />
                    ) : (
                      <>
                        <Icon.Upload size={24} className="text-gray-400" />
                        <span className="text-xs text-gray-400 mt-1">Upload</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                      disabled={isUploadingCover}
                    />
                  </label>
                )}
                <p className="text-xs text-gray-500">
                  Tỉ lệ khuyến nghị: 3:4
                </p>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Nhập tiêu đề sách..."
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                  errors.title 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-[#7CB342]'
                }`}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả ngắn về nội dung sách..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thể loại</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
              >
                {Object.entries(BOOK_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="tag1, tag2, tag3 (phân cách bằng dấu phẩy)"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342] transition-colors"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Độ hiển thị</label>
              <div className="flex gap-2">
                {Object.entries(BOOK_VISIBILITY_LABELS).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleChange('visibility', value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                      formData.visibility === value
                        ? 'bg-[#7CB342] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allow_contributions}
                  onChange={(e) => handleChange('allow_contributions', e.target.checked)}
                  className="w-5 h-5 rounded text-[#7CB342] focus:ring-[#7CB342]"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Cho phép đóng góp</span>
                  <p className="text-xs text-gray-500">Người khác có thể đề xuất thêm nội dung</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allow_fork}
                  onChange={(e) => handleChange('allow_fork', e.target.checked)}
                  className="w-5 h-5 rounded text-[#7CB342] focus:ring-[#7CB342]"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">Cho phép Fork</span>
                  <p className="text-xs text-gray-500">Người khác có thể tạo bản sao và phát triển riêng</p>
                </div>
              </label>
            </div>
          </form>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploadingCover}
              className="flex-1 py-3 bg-gradient-to-r from-[#7CB342] to-[#558B2F] text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Icon.Spinner size={20} />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Icon.Plus size={20} />
                  Tạo Sách
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
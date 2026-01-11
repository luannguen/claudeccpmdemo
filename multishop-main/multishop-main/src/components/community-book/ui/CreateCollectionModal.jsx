/**
 * CreateCollectionModal - Create or edit a book collection
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  initialData = null,
  isSubmitting = false
}) {
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setVisibility(initialData.visibility || 'public');
      setTags(initialData.tags?.join(', ') || '');
      setCoverImage(initialData.cover_image || '');
    } else {
      setTitle('');
      setDescription('');
      setVisibility('public');
      setTags('');
      setCoverImage('');
    }
  }, [initialData, isOpen]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast('Chỉ cho phép upload ảnh', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCoverImage(file_url);
    } catch (err) {
      addToast('Không thể upload ảnh', 'error');
    }
    setIsUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      addToast('Vui lòng nhập tên bộ sưu tập', 'error');
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim(),
      visibility,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      cover_image: coverImage
    };

    if (isEditing) {
      onUpdate?.(initialData.id, data);
    } else {
      onCreate?.(data);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">
              {isEditing ? 'Chỉnh sửa bộ sưu tập' : 'Tạo bộ sưu tập mới'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <Icon.X size={20} />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh bìa
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center overflow-hidden">
                  {coverImage ? (
                    <img src={coverImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Icon.Image size={32} className="text-purple-300" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 inline-flex items-center gap-2">
                      {isUploading ? <Icon.Spinner size={16} /> : <Icon.Upload size={16} />}
                      Upload ảnh
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {coverImage && (
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="ml-2 text-xs text-red-500 hover:underline"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên bộ sưu tập *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Sách hay về nông nghiệp..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả ngắn về bộ sưu tập..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hiển thị
              </label>
              <div className="flex gap-3">
                <label className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  visibility === 'public' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <Icon.Globe size={18} className={visibility === 'public' ? 'text-purple-500' : 'text-gray-400'} />
                    <span className="text-sm font-medium">Công khai</span>
                  </div>
                </label>
                <label className={`flex-1 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                  visibility === 'private' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={(e) => setVisibility(e.target.value)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <Icon.Lock size={18} className={visibility === 'private' ? 'text-purple-500' : 'text-gray-400'} />
                    <span className="text-sm font-medium">Riêng tư</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (phân cách bằng dấu phẩy)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="nông nghiệp, hữu cơ, kinh nghiệm..."
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || isSubmitting || isUploading}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <Icon.Spinner size={18} />
              ) : (
                <Icon.Plus size={18} />
              )}
              {isEditing ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
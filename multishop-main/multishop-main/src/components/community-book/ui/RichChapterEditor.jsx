/**
 * RichChapterEditor - Rich text editor for book chapters
 * Supports markdown, images, and videos
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/components/NotificationToast';

// Toolbar button component
function ToolbarButton({ icon: IconComponent, label, onClick, active = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-2 rounded-lg transition-colors ${
        active 
          ? 'bg-[#7CB342] text-white' 
          : disabled 
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {IconComponent}
    </button>
  );
}

export default function RichChapterEditor({
  initialData = {},
  onSave,
  onCancel,
  isSaving = false,
  bookId
}) {
  const { addToast } = useToast();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [excerpt, setExcerpt] = useState(initialData.excerpt || '');
  const [images, setImages] = useState(initialData.images || []);
  const [videoUrl, setVideoUrl] = useState(initialData.video_url || '');
  
  const [showPreview, setShowPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);

  // Insert text at cursor position
  const insertAtCursor = useCallback((textBefore, textAfter = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    const newContent = before + textBefore + selectedText + textAfter + after;
    setContent(newContent);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + textBefore.length + selectedText.length + textAfter.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }, [content]);

  // Toolbar actions
  const handleBold = () => insertAtCursor('**', '**');
  const handleItalic = () => insertAtCursor('*', '*');
  const handleHeading = () => insertAtCursor('\n## ');
  const handleList = () => insertAtCursor('\n- ');
  const handleNumberedList = () => insertAtCursor('\n1. ');
  const handleQuote = () => insertAtCursor('\n> ');
  const handleCode = () => insertAtCursor('`', '`');
  const handleLink = () => insertAtCursor('[', '](url)');

  // Image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls = [];

    for (const file of files) {
      // Validate file
      if (!file.type.startsWith('image/')) {
        addToast('Chỉ cho phép upload ảnh', 'error');
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        addToast(`File ${file.name} quá lớn (max 5MB)`, 'error');
        continue;
      }

      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(file_url);
      } catch (err) {
        addToast(`Không thể upload ${file.name}`, 'error');
      }
    }

    if (uploadedUrls.length > 0) {
      setImages(prev => [...prev, ...uploadedUrls]);
      // Also insert markdown images
      uploadedUrls.forEach(url => {
        insertAtCursor(`\n![Ảnh](${url})\n`);
      });
      addToast(`Đã upload ${uploadedUrls.length} ảnh`, 'success');
    }

    setIsUploading(false);
    e.target.value = '';
  };

  // Add video URL
  const handleAddVideo = () => {
    if (!videoUrl.trim()) return;
    
    // Validate video URL
    const validPatterns = [
      /youtube\.com\/watch\?v=/,
      /youtu\.be\//,
      /vimeo\.com\//,
      /facebook\.com\/.*\/videos\//
    ];
    
    const isValid = validPatterns.some(pattern => pattern.test(videoUrl));
    if (!isValid && !videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
      addToast('URL video không hợp lệ', 'error');
      return;
    }

    insertAtCursor(`\n[Video](${videoUrl})\n`);
    setShowVideoInput(false);
    addToast('Đã thêm video', 'success');
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle save
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      addToast('Vui lòng nhập tiêu đề chương', 'error');
      return;
    }
    if (!content.trim()) {
      addToast('Vui lòng nhập nội dung chương', 'error');
      return;
    }

    onSave({
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || content.substring(0, 200).trim(),
      images,
      video_url: videoUrl.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h3 className="font-bold text-gray-900">
          {initialData.id ? 'Chỉnh sửa chương' : 'Thêm chương mới'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showPreview ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {showPreview ? 'Sửa' : 'Xem trước'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tiêu đề chương *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chương 1: Giới thiệu..."
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50"
          />
        </div>

        {/* Toolbar */}
        {!showPreview && (
          <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-xl flex-wrap">
            <ToolbarButton icon={<span className="font-bold">B</span>} label="Bold" onClick={handleBold} />
            <ToolbarButton icon={<span className="italic">I</span>} label="Italic" onClick={handleItalic} />
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <ToolbarButton icon={<Icon.List size={18} />} label="Heading" onClick={handleHeading} />
            <ToolbarButton icon={<span>•</span>} label="Bullet list" onClick={handleList} />
            <ToolbarButton icon={<span>1.</span>} label="Numbered list" onClick={handleNumberedList} />
            <ToolbarButton icon={<span>"</span>} label="Quote" onClick={handleQuote} />
            <ToolbarButton icon={<Icon.Code size={18} />} label="Code" onClick={handleCode} />
            <ToolbarButton icon={<Icon.Link size={18} />} label="Link" onClick={handleLink} />
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <ToolbarButton 
              icon={<Icon.Image size={18} />} 
              label="Upload ảnh" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            />
            <ToolbarButton 
              icon={<Icon.Video size={18} />} 
              label="Thêm video" 
              onClick={() => setShowVideoInput(!showVideoInput)}
            />
          </div>
        )}

        {/* Video URL input */}
        <AnimatePresence>
          {showVideoInput && !showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2"
            >
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="URL video (YouTube, Vimeo, MP4...)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50"
              />
              <button
                type="button"
                onClick={handleAddVideo}
                className="px-3 py-2 bg-[#7CB342] text-white rounded-lg text-sm"
              >
                Thêm
              </button>
              <button
                type="button"
                onClick={() => setShowVideoInput(false)}
                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm"
              >
                Hủy
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Editor / Preview */}
        {showPreview ? (
          <div className="border border-gray-200 rounded-xl p-4 min-h-[300px] prose prose-sm max-w-none">
            <ReactMarkdown>{content || '*Chưa có nội dung*'}</ReactMarkdown>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung (Markdown) *
            </label>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết nội dung chương ở đây... Hỗ trợ Markdown."
              rows={15}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50 resize-y font-mono text-sm"
            />
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Uploaded images preview */}
        {images.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh đính kèm ({images.length})
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((url, index) => (
                <div key={index} className="relative flex-shrink-0 group">
                  <img
                    src={url}
                    alt={`Ảnh ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Icon.X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tóm tắt (tùy chọn)
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Tóm tắt ngắn về chương này..."
            rows={2}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50 resize-none text-sm"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {content.length} ký tự • ~{Math.ceil(content.split(/\s+/).length / 200)} phút đọc
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-xl hover:bg-[#558B2F] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Icon.Spinner size={18} />
                Đang lưu...
              </>
            ) : (
              <>
                <Icon.Save size={18} />
                Lưu chương
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
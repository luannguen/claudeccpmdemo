/**
 * FeedbackReplyForm - Form phản hồi comment với quote và images
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import FeedbackImageUpload from './FeedbackImageUpload';

export default function FeedbackReplyForm({ 
  onSubmit, 
  isSubmitting = false,
  quotedComment = null,
  onCancelQuote,
  isAdmin = false,
  placeholder = "Viết phản hồi..."
}) {
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [isInternal, setIsInternal] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    await onSubmit({
      content: content.trim(),
      images,
      isInternal,
      quotedComment
    });
    
    // Reset form
    setContent('');
    setImages([]);
    setIsInternal(false);
    setShowImageUpload(false);
    onCancelQuote?.();
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter to submit
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 bg-white border-2 border-gray-200 rounded-xl space-y-3">
      {/* Quoted Content Preview */}
      {quotedComment && (
        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border-l-4 border-[#7CB342]">
          <Icon.CornerDownLeft size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600">{quotedComment.author_name}</p>
            <p className="text-sm text-gray-700 line-clamp-2">{quotedComment.content}</p>
          </div>
          <button
            type="button"
            onClick={onCancelQuote}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <Icon.X size={14} className="text-gray-400" />
          </button>
        </div>
      )}

      {/* Text Input */}
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={3}
        className="resize-none"
      />

      {/* Image Upload */}
      {showImageUpload && (
        <FeedbackImageUpload
          images={images}
          onImagesChange={setImages}
          maxFiles={5}
        />
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Toggle Image Upload */}
          <button
            type="button"
            onClick={() => setShowImageUpload(!showImageUpload)}
            className={`p-2 rounded-lg transition-colors ${
              showImageUpload || images.length > 0
                ? 'text-[#7CB342] bg-green-50'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Đính kèm ảnh"
          >
            <Icon.Image size={18} />
            {images.length > 0 && (
              <span className="ml-1 text-xs">{images.length}</span>
            )}
          </button>

          {/* Internal Note Toggle (Admin only) */}
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-gray-300 text-[#7CB342] focus:ring-[#7CB342]"
              />
              <span className="text-gray-600 text-xs">
                Ghi chú nội bộ
              </span>
            </label>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Ctrl+Enter để gửi</span>
          <Button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="bg-[#7CB342] hover:bg-[#5a8f31]"
          >
            {isSubmitting ? (
              <Icon.Spinner className="mr-2" size={16} />
            ) : (
              <Icon.Send className="mr-2" size={16} />
            )}
            Gửi
          </Button>
        </div>
      </div>
    </div>
  );
}
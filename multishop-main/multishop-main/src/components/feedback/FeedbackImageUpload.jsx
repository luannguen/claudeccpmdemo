/**
 * FeedbackImageUpload - Upload ảnh cho feedback/comment
 * Validation: max 5MB, max 5 files, only images
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export default function FeedbackImageUpload({ 
  images = [], 
  onImagesChange, 
  maxFiles = MAX_FILES,
  compact = false 
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const validateFile = (file) => {
    // Check type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: `File "${file.name}" không đúng định dạng. Chỉ hỗ trợ: JPG, PNG, GIF, WebP` };
    }
    
    // Check size
    if (file.size > MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return { valid: false, error: `File "${file.name}" quá lớn (${sizeMB}MB). Tối đa 5MB mỗi file` };
    }
    
    return { valid: true };
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    await uploadFiles(droppedFiles);
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    await uploadFiles(selectedFiles);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async (filesToUpload) => {
    // Check total count
    if (images.length + filesToUpload.length > maxFiles) {
      addToast(`Chỉ có thể tải lên tối đa ${maxFiles} ảnh`, 'warning');
      return;
    }

    // Validate all files first
    const validFiles = [];
    for (const file of filesToUpload) {
      const validation = validateFile(file);
      if (!validation.valid) {
        addToast(validation.error, 'error');
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        return file_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedUrls];
      onImagesChange(newImages);
      addToast(`Đã tải lên ${uploadedUrls.length} ảnh`, 'success');
    } catch (error) {
      addToast('Lỗi khi tải ảnh lên', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxFiles}
          className="p-2 text-gray-500 hover:text-[#7CB342] hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
          title="Đính kèm ảnh"
        >
          {uploading ? <Icon.Spinner size={20} /> : <Icon.Image size={20} />}
        </button>
        
        {images.length > 0 && (
          <span className="text-xs text-gray-500">{images.length}/{maxFiles}</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all ${
          dragActive
            ? 'border-[#7CB342] bg-green-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex items-center justify-center gap-3">
          <Icon.Image size={24} className="text-gray-400" />
          <div className="text-left">
            <p className="text-sm text-gray-600">
              Kéo thả hoặc{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= maxFiles}
                className="text-[#7CB342] hover:underline disabled:opacity-50"
              >
                chọn ảnh
              </button>
            </p>
            <p className="text-xs text-gray-400">
              Tối đa {maxFiles} ảnh, mỗi ảnh ≤ 5MB (JPG, PNG, GIF, WebP)
            </p>
          </div>
        </div>

        {uploading && (
          <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
            <Icon.Spinner size={24} className="text-[#7CB342]" />
          </div>
        )}
      </div>

      {/* Preview Images */}
      <AnimatePresence>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((url, index) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <img
                  src={url}
                  alt={`Attachment ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <Icon.X size={12} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
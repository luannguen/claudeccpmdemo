import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export default function EnhancedMediaUpload({ onUpload, maxFiles = 5 }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  const validateFile = (file) => {
    // Check type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: `File "${file.name}" không đúng định dạng. Chỉ hỗ trợ: JPG, PNG, GIF, WebP, MP4, WebM` };
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
    if (files.length + filesToUpload.length > maxFiles) {
      addToast(`Chỉ có thể tải lên tối đa ${maxFiles} file`, 'warning');
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
        return { url: file_url, name: file.name, type: file.type };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const newFiles = [...files, ...uploadedFiles];
      setFiles(newFiles);
      onUpload(newFiles.map(f => f.url));
      addToast(`Đã tải lên ${uploadedFiles.length} file`, 'success');
    } catch (error) {
      addToast('Lỗi khi tải file', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onUpload(newFiles.map(f => f.url));
  };

  const captureCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // TODO: Implement camera capture modal
      addToast('Tính năng đang phát triển', 'info');
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      addToast('Không thể truy cập camera', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          dragActive
            ? 'border-[#7CB342] bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Icon.Upload size={48} className="mx-auto mb-4 text-gray-400" />
        
        <p className="text-sm font-medium text-gray-700 mb-2">
          Kéo thả file vào đây hoặc
        </p>
        
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#5a8f31] transition-colors disabled:opacity-50"
          >
            {uploading ? 'Đang tải...' : 'Chọn File'}
          </button>
          
          <button
            type="button"
            onClick={captureCamera}
            disabled={uploading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <Icon.Camera size={20} />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Hỗ trợ ảnh (JPG, PNG, GIF, WebP), video (MP4, WebM)
        </p>
        <p className="text-xs text-gray-400">
          Tối đa {maxFiles} file, mỗi file ≤ 5MB
        </p>
      </div>

      {/* Uploaded Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {files.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                {file.type.startsWith('image/') ? (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon.FileVideo size={32} className="text-gray-400" />
                  </div>
                )}
                
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Icon.X size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
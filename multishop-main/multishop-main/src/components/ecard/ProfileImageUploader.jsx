/**
 * ProfileImageUploader - Upload ảnh đại diện E-Card
 * UI Component
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';

export default function ProfileImageUploader({ currentImageUrl, onImageUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl);
  const { addToast } = useToast();

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      addToast('Vui lòng chọn file ảnh', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      addToast('Ảnh không được vượt quá 5MB', 'error');
      return;
    }

    try {
      setUploading(true);

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);

      // Upload to server
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      onImageUploaded(file_url);
      addToast('Đã upload ảnh đại diện', 'success');
    } catch (error) {
      addToast('Không thể upload ảnh', 'error');
      setPreview(currentImageUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
          {preview ? (
            <img src={preview} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7CB342] to-[#558B2F] text-white text-4xl font-bold">
              <Icon.User size={48} />
            </div>
          )}
        </div>

        <label
          htmlFor="profile-image-upload"
          className="absolute bottom-0 right-0 w-10 h-10 bg-[#7CB342] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-[#689F38] transition-colors shadow-lg"
        >
          {uploading ? (
            <Icon.Spinner size={20} />
          ) : (
            <Icon.Camera size={20} />
          )}
        </label>

        <input
          id="profile-image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </div>

      <p className="text-xs text-gray-500 text-center">
        Click để thay đổi ảnh đại diện<br />
        (Tối đa 5MB)
      </p>
    </div>
  );
}
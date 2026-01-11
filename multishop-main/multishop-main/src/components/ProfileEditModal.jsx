import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Upload, Camera, Loader2, Check, AlertCircle, 
  User, MapPin, Sparkles, Image as ImageIcon, Crop
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function ProfileEditModal({ isOpen, onClose, profile, currentUser }) {
  const [formData, setFormData] = React.useState({
    display_name: profile?.display_name || currentUser?.full_name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    interests: profile?.interests || []
  });

  const [avatarFile, setAvatarFile] = React.useState(null);
  const [avatarPreview, setAvatarPreview] = React.useState(profile?.avatar_url || null);
  const [coverFile, setCoverFile] = React.useState(null);
  const [coverPreview, setCoverPreview] = React.useState(profile?.cover_photo_url || null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState({ avatar: 0, cover: 0 });
  const [errors, setErrors] = React.useState({});
  const [newInterest, setNewInterest] = React.useState('');

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const validateImage = (file, type) => {
    const errors = [];

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File quá lớn (tối đa 5MB)`);
    }

    // Check file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      errors.push('Chỉ chấp nhận: JPG, PNG, WebP, GIF');
    }

    // Check image dimensions
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => {
        if (type === 'avatar') {
          if (img.width < 200 || img.height < 200) {
            errors.push('Avatar tối thiểu 200x200px');
          }
          if (img.width > 2000 || img.height > 2000) {
            errors.push('Avatar tối đa 2000x2000px');
          }
        } else if (type === 'cover') {
          if (img.width < 800 || img.height < 300) {
            errors.push('Cover photo tối thiểu 800x300px');
          }
          if (img.width > 4000 || img.height > 2000) {
            errors.push('Cover photo tối đa 4000x2000px');
          }
        }
        resolve(errors);
      };
      img.onerror = () => {
        errors.push('File không hợp lệ');
        resolve(errors);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationErrors = await validateImage(file, 'avatar');
    if (validationErrors.length > 0) {
      setErrors({ ...errors, avatar: validationErrors.join(', ') });
      return;
    }

    setErrors({ ...errors, avatar: null });
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationErrors = await validateImage(file, 'cover');
    if (validationErrors.length > 0) {
      setErrors({ ...errors, cover: validationErrors.join(', ') });
      return;
    }

    setErrors({ ...errors, cover: null });
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Tên hiển thị không được để trống';
    } else if (formData.display_name.length < 2) {
      newErrors.display_name = 'Tên hiển thị tối thiểu 2 ký tự';
    } else if (formData.display_name.length > 50) {
      newErrors.display_name = 'Tên hiển thị tối đa 50 ký tự';
    }

    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = 'Bio tối đa 200 ký tự';
    }

    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Địa điểm tối đa 100 ký tự';
    }

    if (formData.interests.length > 10) {
      newErrors.interests = 'Tối đa 10 sở thích';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    
    try {
      let avatarUrl = profile?.avatar_url || null;
      let coverUrl = profile?.cover_photo_url || null;

      // Upload avatar if changed
      if (avatarFile) {
        setUploadProgress({ ...uploadProgress, avatar: 30 });
        const { file_url } = await base44.integrations.Core.UploadFile({ file: avatarFile });
        avatarUrl = file_url;
        setUploadProgress({ ...uploadProgress, avatar: 100 });
      }

      // Upload cover if changed
      if (coverFile) {
        setUploadProgress({ ...uploadProgress, cover: 30 });
        const { file_url } = await base44.integrations.Core.UploadFile({ file: coverFile });
        coverUrl = file_url;
        setUploadProgress({ ...uploadProgress, cover: 100 });
      }

      const profileData = {
        user_email: currentUser.email,
        display_name: formData.display_name.trim(),
        bio: formData.bio?.trim() || '',
        location: formData.location?.trim() || '',
        interests: formData.interests,
        avatar_url: avatarUrl,
        cover_photo_url: coverUrl,
        last_active: new Date().toISOString()
      };

      if (profile) {
        await base44.entities.UserProfile.update(profile.id, profileData);
      } else {
        await base44.entities.UserProfile.create({
          ...profileData,
          joined_date: new Date().toISOString(),
          status: 'active'
        });
      }

      // Also update User entity if display_name changed
      if (formData.display_name !== currentUser.full_name) {
        await base44.auth.updateMe({ full_name: formData.display_name });
      }

      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-24 right-6 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[300] animate-slide-up';
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span class="font-medium">✅ Đã cập nhật profile!</span>
        </div>
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      onClose();
      window.location.reload(); // Reload to update all places
    } catch (error) {
      console.error('Profile update error:', error);
      setErrors({ submit: 'Có lỗi xảy ra: ' + error.message });
    } finally {
      setIsUploading(false);
      setUploadProgress({ avatar: 0, cover: 0 });
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && formData.interests.length < 10) {
      if (!formData.interests.includes(newInterest.trim())) {
        setFormData({ ...formData, interests: [...formData.interests, newInterest.trim()] });
        setNewInterest('');
      }
    }
  };

  const removeInterest = (interest) => {
    setFormData({ 
      ...formData, 
      interests: formData.interests.filter(i => i !== interest) 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[250] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-[#0F0F0F]">
            ✏️ Chỉnh Sửa Profile
          </h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Cover Photo Upload */}
          <div>
            <label className="block text-sm font-bold mb-3">Ảnh Bìa</label>
            <div className="relative h-48 bg-gradient-to-r from-[#7CB342] to-[#FF9800] rounded-2xl overflow-hidden group cursor-pointer"
              onClick={() => coverInputRef.current?.click()}>
              {coverPreview ? (
                <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-white/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                <div className="bg-white/90 px-6 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  <span className="font-medium">Đổi Ảnh Bìa</span>
                </div>
              </div>
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
            {errors.cover && (
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.cover}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Khuyến nghị: 1920x480px, tối đa 5MB (JPG, PNG, WebP, GIF)
            </p>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-bold mb-3">Ảnh Đại Diện</label>
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#7CB342] to-[#FF9800] flex items-center justify-center text-white font-bold text-5xl border-4 border-white shadow-xl overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16" />
                  )}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-full transition-all flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-4 py-2 bg-[#7CB342] text-white rounded-lg font-medium hover:bg-[#FF9800] transition-colors flex items-center gap-2 mb-2"
                >
                  <Upload className="w-4 h-4" />
                  Tải Ảnh Lên
                </button>
                <p className="text-xs text-gray-500">
                  Khuyến nghị: 400x400px trở lên, tối đa 5MB
                </p>
                {errors.avatar && (
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.avatar}
                  </p>
                )}
              </div>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-bold mb-2">Tên Hiển Thị *</label>
            <input
              type="text"
              required
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#7CB342] ${
                errors.display_name ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Nhập tên của bạn"
              maxLength={50}
            />
            {errors.display_name && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.display_name}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.display_name.length}/50 ký tự
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-bold mb-2">Giới Thiệu</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#7CB342] resize-none ${
                errors.bio ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Viết vài dòng về bạn..."
              maxLength={200}
            />
            {errors.bio && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.bio}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/200 ký tự
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#7CB342]" />
              Địa Điểm
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-[#7CB342] ${
                errors.location ? 'border-red-400' : 'border-gray-200'
              }`}
              placeholder="Hà Nội, Việt Nam"
              maxLength={100}
            />
            {errors.location && (
              <p className="text-xs text-red-600 mt-1">{errors.location}</p>
            )}
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7CB342]" />
              Sở Thích
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
                placeholder="Thêm sở thích..."
                maxLength={20}
              />
              <button
                type="button"
                onClick={addInterest}
                className="px-4 py-2 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
                disabled={formData.interests.length >= 10}
              >
                Thêm
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.interests.map((interest, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2">
                  {interest}
                  <button type="button" onClick={() => removeInterest(interest)} className="hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            {errors.interests && (
              <p className="text-xs text-red-600 mt-2">{errors.interests}</p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              {formData.interests.length}/10 sở thích
            </p>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Lỗi</p>
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-3 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Lưu Thay Đổi
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}
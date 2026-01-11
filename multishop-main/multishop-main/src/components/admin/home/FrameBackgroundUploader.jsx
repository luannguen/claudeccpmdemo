/**
 * FrameBackgroundUploader - Upload background cho frame
 * Hỗ trợ: Image, Video (upload hoặc YouTube link)
 */

import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/ui/AnimatedIcon";
import { useToast } from "@/components/NotificationToast";

// Helper: Extract YouTube video ID từ URL
function extractYouTubeId(url) {
  if (!url) return null;
  
  // Các pattern YouTube hỗ trợ
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Helper: Check if URL is a YouTube URL
function isYouTubeUrl(url) {
  return extractYouTubeId(url) !== null;
}

// Helper: Convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  // Thêm autoplay, mute, loop cho background video
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&rel=0&enablejsapi=1`;
}

export default function FrameBackgroundUploader({
  type,
  desktopUrl,
  mobileUrl,
  onDesktopChange,
  onMobileChange
}) {
  const [uploading, setUploading] = useState({ desktop: false, mobile: false });
  const { addToast } = useToast();

  const handleUpload = async (file, target) => {
    if (!file) return;

    // Validate file size
    const maxSize = type === 'video' ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB video, 5MB image
    if (file.size > maxSize) {
      addToast(`File quá lớn. Tối đa ${type === 'video' ? '50MB' : '5MB'}`, 'error');
      return;
    }

    setUploading(prev => ({ ...prev, [target]: true }));

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (target === 'desktop') {
        onDesktopChange(file_url);
      } else {
        onMobileChange(file_url);
      }
      
      addToast('Upload thành công', 'success');
    } catch (err) {
      addToast('Lỗi upload: ' + err.message, 'error');
    } finally {
      setUploading(prev => ({ ...prev, [target]: false }));
    }
  };

  // Validate và xử lý URL input (hỗ trợ YouTube)
  const handleUrlChange = (url, target) => {
    if (target === 'desktop') {
      onDesktopChange(url);
    } else {
      onMobileChange(url);
    }
  };

  const acceptTypes = type === 'video' ? 'video/mp4,video/webm' : 'image/*';
  const isYouTube = type === 'video' && isYouTubeUrl(desktopUrl);

  // Render preview cho desktop
  const renderDesktopPreview = () => {
    if (!desktopUrl) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Icon.Image size={48} className="text-gray-300" />
        </div>
      );
    }

    if (type === 'video') {
      // Check nếu là YouTube
      if (isYouTubeUrl(desktopUrl)) {
        const embedUrl = getYouTubeEmbedUrl(desktopUrl);
        return (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; encrypted-media"
            frameBorder="0"
            allowFullScreen
          />
        );
      }
      // Video file thường
      return (
        <video 
          src={desktopUrl} 
          className="w-full h-full object-cover" 
          muted 
          loop 
          autoPlay
          playsInline
        />
      );
    }

    // Image
    return <img src={desktopUrl} alt="Desktop" className="w-full h-full object-cover" />;
  };

  return (
    <div className="space-y-6">
      {/* Video type hint */}
      {type === 'video' && (
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 flex items-center gap-2">
            <Icon.Info size={16} />
            <span>
              <strong>Hỗ trợ:</strong> Upload file video (MP4, WebM) hoặc dán link YouTube
            </span>
          </p>
          <p className="text-xs text-blue-600 mt-1 ml-6">
            Ví dụ: https://youtube.com/watch?v=xxxxx hoặc https://youtu.be/xxxxx
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Desktop */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Icon.Presentation size={16} />
            Desktop Background
            {type === 'video' && isYouTube && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">YouTube</span>
            )}
          </Label>
          
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative">
            {renderDesktopPreview()}
            
            {uploading.desktop && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Icon.Spinner size={32} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={desktopUrl}
              onChange={(e) => handleUrlChange(e.target.value, 'desktop')}
              placeholder={type === 'video' ? "URL video hoặc YouTube link" : "URL hình ảnh"}
              className="flex-1"
            />
            <label className="cursor-pointer">
              <input
                type="file"
                accept={acceptTypes}
                className="hidden"
                onChange={(e) => handleUpload(e.target.files?.[0], 'desktop')}
              />
              <Button type="button" variant="outline" size="icon" asChild>
                <span><Icon.Upload size={18} /></span>
              </Button>
            </label>
          </div>
        </div>

        {/* Mobile */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Icon.Phone size={16} />
            Mobile Background
            <span className="text-xs text-gray-500">(fallback to desktop if empty)</span>
          </Label>
          
          <div className="aspect-[9/16] max-h-[200px] bg-gray-100 rounded-lg overflow-hidden relative mx-auto">
            {(mobileUrl || (desktopUrl && type === 'image')) ? (
              <img 
                src={mobileUrl || desktopUrl} 
                alt="Mobile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center flex-col gap-2">
                <Icon.Image size={32} className="text-gray-300" />
                {type === 'video' && (
                  <p className="text-xs text-gray-400 text-center px-2">Nên upload ảnh tĩnh cho mobile</p>
                )}
              </div>
            )}
            
            {uploading.mobile && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Icon.Spinner size={24} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              value={mobileUrl}
              onChange={(e) => handleUrlChange(e.target.value, 'mobile')}
              placeholder="URL ảnh cho mobile"
              className="flex-1"
            />
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files?.[0], 'mobile')}
              />
              <Button type="button" variant="outline" size="icon" asChild>
                <span><Icon.Upload size={18} /></span>
              </Button>
            </label>
          </div>

          {type === 'video' && (
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <Icon.AlertCircle size={12} />
              Mobile sẽ dùng ảnh tĩnh thay vì video để tối ưu performance
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
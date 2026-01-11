/**
 * BackgroundLayer - Single background layer với cross-dissolve
 * 
 * Props:
 * - opacity: motion value từ useTransform
 * - backgroundUrl: URL image/video/YouTube
 * - backgroundType: 'image' | 'video'
 * - isMobile: boolean
 * 
 * Hỗ trợ:
 * - Hình ảnh (jpg, png, webp...)
 * - Video file (mp4, webm)
 * - YouTube video (tự động convert sang embed)
 */

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";

// Helper: Extract YouTube video ID từ URL
function extractYouTubeId(url) {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Helper: Check if URL is YouTube
function isYouTubeUrl(url) {
  return extractYouTubeId(url) !== null;
}

// Helper: Get YouTube embed URL for background
function getYouTubeEmbedUrl(url) {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&rel=0&enablejsapi=1&playsinline=1`;
}

export default function BackgroundLayer({ 
  opacity, 
  backgroundUrl, 
  backgroundType = 'image',
  isMobile = false 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  // Xác định loại media thực tế
  const mediaInfo = useMemo(() => {
    if (!backgroundUrl) return { type: 'none' };
    
    // Mobile luôn dùng image
    if (isMobile) return { type: 'image', url: backgroundUrl };
    
    // Nếu không phải video type, dùng image
    if (backgroundType !== 'video') return { type: 'image', url: backgroundUrl };
    
    // Check YouTube
    if (isYouTubeUrl(backgroundUrl)) {
      return { 
        type: 'youtube', 
        url: getYouTubeEmbedUrl(backgroundUrl),
        videoId: extractYouTubeId(backgroundUrl)
      };
    }
    
    // Video file thường
    return { type: 'video', url: backgroundUrl };
  }, [backgroundUrl, backgroundType, isMobile]);
  
  if (!backgroundUrl || mediaInfo.type === 'none') return null;
  
  return (
    <motion.div
      className="absolute inset-0 w-full h-full will-change-opacity"
      style={{ opacity }}
    >
      {/* YouTube Embed */}
      {mediaInfo.type === 'youtube' && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <iframe
            src={mediaInfo.url}
            className="absolute w-[300%] h-[300%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ 
              minWidth: '100vw', 
              minHeight: '100vh',
              border: 'none'
            }}
            allow="autoplay; encrypted-media"
            allowFullScreen
            title="Background video"
          />
        </div>
      )}
      
      {/* Video File */}
      {mediaInfo.type === 'video' && !videoError && (
        <video
          src={mediaInfo.url}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onError={() => setVideoError(true)}
        />
      )}
      
      {/* Image (or fallback from video error) */}
      {(mediaInfo.type === 'image' || (mediaInfo.type === 'video' && videoError)) && (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-900 animate-pulse" />
          )}
          <img
            src={backgroundUrl}
            alt=""
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="eager"
            onLoad={() => setImageLoaded(true)}
          />
        </>
      )}
      
      {/* Gradient overlay để text dễ đọc */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
    </motion.div>
  );
}
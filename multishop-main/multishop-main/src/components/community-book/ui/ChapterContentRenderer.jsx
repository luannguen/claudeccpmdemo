/**
 * ChapterContentRenderer - Render chapter content with media
 * Displays markdown, images, and embedded videos
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Icon } from '@/components/ui/AnimatedIcon';

// Video embed component
function VideoEmbed({ url }) {
  const getEmbedUrl = (videoUrl) => {
    // YouTube
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    // Vimeo
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    // Direct video URL
    if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return videoUrl;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(url);
  
  if (!embedUrl) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
        Xem video
      </a>
    );
  }

  // Direct video file
  if (embedUrl.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <video 
        src={embedUrl} 
        controls 
        className="w-full max-w-2xl mx-auto rounded-xl"
      >
        Trình duyệt không hỗ trợ video
      </video>
    );
  }

  // Embedded iframe (YouTube, Vimeo)
  return (
    <div className="aspect-video max-w-2xl mx-auto rounded-xl overflow-hidden">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video"
      />
    </div>
  );
}

// Image gallery/lightbox
function ImageGallery({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4">
        {images.map((url, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.02 }}
            onClick={() => setLightboxIndex(index)}
            className="aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100"
          >
            <img
              src={url}
              alt={`Ảnh ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white"
            >
              <Icon.X size={32} />
            </button>
            
            {/* Navigation */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
                className="absolute left-4 p-2 text-white/80 hover:text-white"
              >
                <Icon.ChevronLeft size={32} />
              </button>
            )}
            {lightboxIndex < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
                className="absolute right-4 p-2 text-white/80 hover:text-white"
              >
                <Icon.ChevronRight size={32} />
              </button>
            )}

            <motion.img
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={images[lightboxIndex]}
              alt=""
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 text-white/60 text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Custom markdown components
const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-gray-900 mt-5 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-700">{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#7CB342] pl-4 italic text-gray-600 my-4">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) => {
    if (inline) {
      return (
        <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded text-sm font-mono">
          {children}
        </code>
      );
    }
    return (
      <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto my-4">
        <code className="text-sm font-mono">{children}</code>
      </pre>
    );
  },
  a: ({ href, children }) => {
    // Check if it's a video link
    if (children === 'Video' || href?.match(/youtube|vimeo|\.mp4|\.webm/i)) {
      return <VideoEmbed url={href} />;
    }
    return (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-[#7CB342] hover:underline"
      >
        {children}
      </a>
    );
  },
  img: ({ src, alt }) => (
    <div className="my-4">
      <img
        src={src}
        alt={alt || ''}
        className="max-w-full rounded-xl shadow-md mx-auto"
        loading="lazy"
      />
      {alt && <p className="text-center text-sm text-gray-500 mt-2">{alt}</p>}
    </div>
  ),
  hr: () => <hr className="my-6 border-gray-200" />
};

export default function ChapterContentRenderer({ 
  content = '',
  images = [],
  videoUrl = '',
  className = ''
}) {
  return (
    <div className={`chapter-content ${className}`}>
      {/* Main markdown content */}
      <ReactMarkdown components={markdownComponents}>
        {content}
      </ReactMarkdown>

      {/* Additional images not in markdown */}
      {images.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Ảnh đính kèm</h4>
          <ImageGallery images={images} />
        </div>
      )}

      {/* Video if not embedded in content */}
      {videoUrl && !content.includes(videoUrl) && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-500 mb-3">Video đính kèm</h4>
          <VideoEmbed url={videoUrl} />
        </div>
      )}
    </div>
  );
}

export { VideoEmbed, ImageGallery };
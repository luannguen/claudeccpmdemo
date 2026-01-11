import React, { useState } from 'react';
import { Play } from 'lucide-react';

export default function LazyVideo({ videoUrl, getEmbedUrl }) {
  const [showVideo, setShowVideo] = useState(false);

  if (!videoUrl) return null;

  const embedUrl = getEmbedUrl(videoUrl);
  
  // Extract video thumbnail
  const getThumbnail = (url) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    
    // Vimeo - requires API but we'll use a placeholder
    return 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=800';
  };

  const thumbnail = getThumbnail(videoUrl);

  return (
    <div className="mb-4 rounded-xl overflow-hidden bg-black aspect-video relative">
      {!showVideo ? (
        // ✅ Thumbnail with Play button - No iframe loaded yet
        <button
          onClick={() => setShowVideo(true)}
          className="w-full h-full relative group"
        >
          <img 
            src={thumbnail}
            alt="Video thumbnail"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
              <Play className="w-10 h-10 text-white fill-current ml-1" />
            </div>
          </div>
        </button>
      ) : (
        // ✅ Actual iframe - Only load when user clicks
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}
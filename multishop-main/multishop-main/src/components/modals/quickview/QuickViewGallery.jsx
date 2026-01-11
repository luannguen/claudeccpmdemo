import React from "react";
import { motion } from "framer-motion";
import { Heart, Package, Play, Video, Sparkles } from "lucide-react";

// Icons imported from lucide-react for QuickView gallery controls

/**
 * QuickViewGallery - Gallery ảnh/video sản phẩm
 * 
 * Props:
 * - gallery: string[] - Danh sách URL ảnh
 * - selectedImage: number - Index ảnh đang chọn
 * - setSelectedImage: function
 * - showVideo: boolean
 * - setShowVideo: function
 * - videoEmbedUrl: string | null
 * - productName: string
 * - isFeatured: boolean
 * - isInWishlist: boolean
 * - onToggleWishlist: function
 * - hasDiscount: boolean
 * - discountPercent: number
 */
export default function QuickViewGallery({
  gallery,
  selectedImage,
  setSelectedImage,
  showVideo,
  setShowVideo,
  videoEmbedUrl,
  productName,
  isFeatured,
  isInWishlist,
  onToggleWishlist,
  hasDiscount,
  discountPercent
}) {
  return (
    <div>
      {/* Main Image/Video */}
      <MainDisplay
        gallery={gallery}
        selectedImage={selectedImage}
        showVideo={showVideo}
        videoEmbedUrl={videoEmbedUrl}
        productName={productName}
        setShowVideo={setShowVideo}
        setSelectedImage={setSelectedImage}
        isFeatured={isFeatured}
        isInWishlist={isInWishlist}
        onToggleWishlist={onToggleWishlist}
        hasDiscount={hasDiscount}
        discountPercent={discountPercent}
      />

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <Thumbnails
          gallery={gallery}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          showVideo={showVideo}
          setShowVideo={setShowVideo}
          videoEmbedUrl={videoEmbedUrl}
        />
      )}
    </div>
  );
}

// ========== SUB-COMPONENTS ==========

function MainDisplay({
  gallery, selectedImage, showVideo, videoEmbedUrl, productName,
  setShowVideo, setSelectedImage, isFeatured, isInWishlist, onToggleWishlist,
  hasDiscount, discountPercent
}) {
  return (
    <div 
      className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 shadow-lg" 
      style={{ aspectRatio: '1/1' }}
    >
      {/* Content */}
      {showVideo && videoEmbedUrl ? (
        <VideoPlayer url={videoEmbedUrl} />
      ) : gallery.length > 0 ? (
        <ImageDisplay 
          src={gallery[selectedImage]} 
          alt={productName} 
          imageKey={selectedImage}
        />
      ) : (
        <EmptyPlaceholder />
      )}

      {/* Video Button */}
      {videoEmbedUrl && !showVideo && (
        <VideoButton onClick={() => setShowVideo(true)} />
      )}

      {/* Badges */}
      <BadgesGroup 
        isFeatured={isFeatured} 
        hasDiscount={hasDiscount} 
        discountPercent={discountPercent} 
      />

      {/* Wishlist Button */}
      <WishlistButton 
        isInWishlist={isInWishlist} 
        onClick={onToggleWishlist} 
      />

      {/* Navigation Dots */}
      {!showVideo && gallery.length > 1 && (
        <NavigationDots 
          total={gallery.length} 
          current={selectedImage} 
          onSelect={setSelectedImage} 
        />
      )}
    </div>
  );
}

function VideoPlayer({ url }) {
  return (
    <iframe 
      src={url} 
      className="w-full h-full" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowFullScreen 
    />
  );
}

function ImageDisplay({ src, alt, imageKey }) {
  return (
    <motion.img
      key={imageKey}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      src={src}
      alt={alt}
      className="w-full h-full object-contain p-4"
    />
  );
}

function EmptyPlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Package className="w-24 h-24 text-gray-300" />
    </div>
  );
}

function VideoButton({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:bg-red-700 transition-colors z-10"
    >
      <Play className="w-5 h-5" />
      Xem Video
    </button>
  );
}

function BadgesGroup({ isFeatured, hasDiscount, discountPercent }) {
  return (
    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
      {isFeatured && (
        <span className="bg-gradient-to-r from-[#FF9800] to-[#ff6b00] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3" />NỔI BẬT
        </span>
      )}
      {hasDiscount && (
        <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
          -{discountPercent}%
        </span>
      )}
    </div>
  );
}

function WishlistButton({ isInWishlist, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all backdrop-blur-md z-10 ${
        isInWishlist
          ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white scale-110'
          : 'bg-white/90 text-gray-700 hover:bg-gradient-to-br hover:from-red-500 hover:to-pink-600 hover:text-white'
      }`}
    >
      <Heart className={`w-6 h-6 ${isInWishlist ? 'fill-current' : ''}`} />
    </motion.button>
  );
}

function NavigationDots({ total, current, onSelect }) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      {[...Array(total)].map((_, idx) => (
        <button 
          key={idx} 
          onClick={() => onSelect(idx)}
          className={`w-2 h-2 rounded-full transition-all ${
            idx === current ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/70'
          }`}
        />
      ))}
    </div>
  );
}

function Thumbnails({ gallery, selectedImage, setSelectedImage, showVideo, setShowVideo, videoEmbedUrl }) {
  const handleVideoClick = () => {
    setShowVideo(!showVideo);
    setSelectedImage(0);
  };

  const handleImageClick = (idx) => {
    setSelectedImage(idx);
    setShowVideo(false);
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      {/* Video Thumbnail */}
      {videoEmbedUrl && (
        <button 
          onClick={handleVideoClick}
          className={`aspect-square rounded-xl overflow-hidden transition-all shadow-md flex items-center justify-center ${
            showVideo ? 'ring-4 ring-red-500 ring-offset-2 bg-red-50' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Video className={`w-6 h-6 ${showVideo ? 'text-red-600' : 'text-gray-400'}`} />
        </button>
      )}

      {/* Image Thumbnails */}
      {gallery.slice(0, videoEmbedUrl ? 3 : 4).map((img, idx) => (
        <button 
          key={idx} 
          onClick={() => handleImageClick(idx)}
          className={`aspect-square rounded-xl overflow-hidden transition-all shadow-md ${
            idx === selectedImage && !showVideo 
              ? 'ring-4 ring-[#7CB342] ring-offset-2 scale-105' 
              : 'opacity-60 hover:opacity-100'
          }`}
        >
          <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  );
}
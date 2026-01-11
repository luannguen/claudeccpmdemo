import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronLeft, ChevronRight, ZoomIn, X, Play, Sparkles, Clock, TrendingUp } from "lucide-react";

export default function LotDetailGallery({ 
  gallery, 
  displayName, 
  videoEmbedUrl, 
  daysUntilHarvest, 
  priceIncrease, 
  discountPercent, 
  availablePercentage 
}) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <>
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden mb-4 relative group">
        {showVideo && videoEmbedUrl ? (
          <iframe
            src={videoEmbedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : gallery.length > 0 ? (
          <>
            <img src={gallery[selectedImage]} alt={displayName}
              className="w-full h-full object-cover cursor-zoom-in group-hover:scale-110 transition-transform duration-500"
              onClick={() => setIsImageZoomed(true)} />
            <button onClick={() => setIsImageZoomed(true)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg transition-opacity">
              <ZoomIn className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-32 h-32 text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" />BÁN TRƯỚC
          </span>
          {daysUntilHarvest < 7 && daysUntilHarvest > 0 && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              <Clock className="w-3 h-3 inline" /> Còn {daysUntilHarvest} ngày
            </span>
          )}
          {priceIncrease > 0 && (
            <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              <TrendingUp className="w-3 h-3 inline" /> +{priceIncrease}%
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              Tiết kiệm {discountPercent}%
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4">
          <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Còn {availablePercentage}%
          </span>
        </div>

        {videoEmbedUrl && !showVideo && (
          <button onClick={() => setShowVideo(true)}
            className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:bg-red-700">
            <Play className="w-5 h-5" />Xem Video
          </button>
        )}

        {gallery.length > 1 && !showVideo && (
          <>
            <button onClick={() => setSelectedImage((selectedImage - 1 + gallery.length) % gallery.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={() => setSelectedImage((selectedImage + 1) % gallery.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full shadow-lg flex items-center justify-center">
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {videoEmbedUrl && (
            <button onClick={() => setShowVideo(!showVideo)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center ${
                showVideo ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-100'
              }`}>
              <Play className={`w-8 h-8 ${showVideo ? 'text-red-600' : 'text-gray-400'}`} />
            </button>
          )}
          
          {gallery.map((img, idx) => (
            <button key={idx} onClick={() => { setSelectedImage(idx); setShowVideo(false); }}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === selectedImage && !showVideo ? 'border-[#7CB342] scale-110' : 'border-gray-200 opacity-60 hover:opacity-100'
              }`}>
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {isImageZoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsImageZoomed(false)}
            className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 cursor-zoom-out">
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              src={gallery[selectedImage]} alt={displayName}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); setIsImageZoomed(false); }}
              className="absolute top-6 right-6 w-14 h-14 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm">
              <X className="w-7 h-7 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
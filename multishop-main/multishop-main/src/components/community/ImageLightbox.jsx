import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';

// Icons imported directly from lucide-react for this component (not using AnimatedIcon)
// to avoid animation overhead in lightbox navigation controls

export default function ImageLightbox({ images, initialIndex = 0, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex];
    link.download = `image-${currentIndex + 1}.jpg`;
    link.click();
  };

  if (!isOpen || !images || images.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Image Counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom(Math.max(0.5, zoom - 0.25));
            }}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-white" />
          </button>
          <span className="text-white text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setZoom(Math.min(3, zoom + 0.25));
            }}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-white" />
          </button>
          <div className="w-px h-6 bg-white/30 mx-2" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <Download className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </>
        )}

        {/* Image */}
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: zoom }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          className="max-w-[90vw] max-h-[90vh] object-contain cursor-zoom-in"
          onClick={(e) => {
            e.stopPropagation();
            setZoom(zoom === 1 ? 2 : 1);
          }}
        />

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2 px-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  setZoom(1);
                }}
                className={`w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                  idx === currentIndex ? 'ring-4 ring-white scale-110' : 'opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Help Text */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs opacity-50">
          ← → để chuyển ảnh • Click ảnh để zoom • ESC để đóng
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
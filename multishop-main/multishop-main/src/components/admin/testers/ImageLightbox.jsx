/**
 * ImageLightbox - Modal xem ảnh full screen với navigation và zoom
 * Dùng chung cho Admin và Tester
 */

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Icons imported directly from lucide-react for this component (not using AnimatedIcon)
// to avoid animation overhead in lightbox navigation controls

export default function ImageLightbox({ images = [], initialIndex = 0, isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  // Reset index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
        setZoom(1);
        break;
      case 'ArrowRight':
        setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
        setZoom(1);
        break;
      default:
        break;
    }
  }, [isOpen, images.length, onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !images.length) return null;

  const currentImage = images[currentIndex];

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(currentImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `screenshot-${currentIndex + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const toggleZoom = (e) => {
    e.stopPropagation();
    setZoom(zoom === 1 ? 2 : 1);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full text-white text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 px-3 py-2 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8"
            onClick={toggleZoom}
          >
            {zoom === 1 ? <ZoomIn className="w-4 h-4" /> : <ZoomOut className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 h-8 w-8"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Previous Button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
            onClick={handlePrevious}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}

        {/* Next Button */}
        {images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
            onClick={handleNext}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}

        {/* Image */}
        <motion.img
          key={currentIndex}
          src={currentImage}
          alt={`Screenshot ${currentIndex + 1}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: zoom }}
          transition={{ duration: 0.2 }}
          className="max-w-[90vw] max-h-[85vh] object-contain"
          onClick={(e) => {
            e.stopPropagation();
            toggleZoom(e);
          }}
          style={{
            transformOrigin: 'center',
            cursor: zoom === 1 ? 'zoom-in' : 'zoom-out'
          }}
        />

        {/* Keyboard Hint */}
        <div className="absolute bottom-4 right-4 text-white/50 text-xs">
          {images.length > 1 ? '← → chuyển ảnh • ' : ''}ESC để đóng
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
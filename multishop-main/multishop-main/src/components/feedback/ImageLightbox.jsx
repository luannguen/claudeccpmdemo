/**
 * ImageLightbox - Xem ảnh full screen
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';

export default function ImageLightbox({ imageUrl, isOpen, onClose }) {
  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.img
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          src={imageUrl}
          alt="Preview"
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors"
        >
          <Icon.X size={24} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
/**
 * QuickActionsBar - Draggable glass floating actions
 * Redesign: Nhỏ hơn, glass effect, có thể kéo di chuyển
 */

import React, { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { motion, AnimatePresence } from "framer-motion";

export default function QuickActionsBar({ profile, onShare, onEdit, onShowQR }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Initialize position
  useEffect(() => {
    const savedPos = localStorage.getItem('ecard-fab-position');
    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch (e) {}
    }
  }, []);

  // Save position
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('ecard-fab-position', JSON.stringify(position));
    }
  }, [position]);

  const handleDragStart = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartRef.current = { 
      x: clientX - position.x, 
      y: clientY - position.y 
    };
  };

  const handleDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const newX = clientX - dragStartRef.current.x;
    const newY = clientY - dragStartRef.current.y;
    
    // Limit to viewport
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    
    setPosition({
      x: Math.max(-maxX + 80, Math.min(0, newX)),
      y: Math.max(-maxY + 100, Math.min(0, newY))
    });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDrag, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDrag);
        window.removeEventListener('touchend', handleDragEnd);
      };
    }
  }, [isDragging]);

  const actions = [
    { icon: 'Share', label: 'Chia sẻ', onClick: onShare },
    { icon: 'Edit', label: 'Sửa', onClick: onEdit },
    { icon: 'QrCode', label: 'QR', onClick: onShowQR },
  ];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-24 right-4 z-40"
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none'
      }}
    >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="mb-2 flex flex-col gap-2"
          >
            {actions.map((action, index) => {
              const ActionIcon = Icon[action.icon];
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={action.onClick}
                  className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-lg hover:bg-white/90 transition-all flex items-center justify-center text-gray-700 hover:text-[#7CB342]"
                  title={action.label}
                >
                  <ActionIcon size={18} />
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <button
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        onClick={() => !isDragging && setIsExpanded(!isExpanded)}
        className={`w-12 h-12 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-lg hover:shadow-xl transition-all flex items-center justify-center cursor-grab active:cursor-grabbing ${
          isExpanded ? 'bg-[#7CB342]/80 text-white' : 'text-[#7CB342]'
        }`}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon.Plus size={20} />
        </motion.div>
      </button>

      {/* Drag hint */}
      {!isExpanded && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
          Kéo để di chuyển
        </div>
      )}
    </motion.div>
  );
}
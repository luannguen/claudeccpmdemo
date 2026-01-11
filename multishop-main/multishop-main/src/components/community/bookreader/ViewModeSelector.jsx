/**
 * ViewModeSelector - Selector cho chế độ xem
 * Scroll / Book / Focus modes
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { VIEW_MODES } from './types';

const MODE_CONFIG = [
  {
    mode: VIEW_MODES.SCROLL,
    icon: 'List',
    label: 'Cuộn',
    description: 'Đọc liên tục như mạng xã hội',
    shortcut: '1'
  },
  {
    mode: VIEW_MODES.BOOK,
    icon: 'FileText',
    label: 'Sách',
    description: 'Lật trang như đọc sách',
    shortcut: '2'
  },
  {
    mode: VIEW_MODES.FOCUS,
    icon: 'Eye',
    label: 'Tập trung',
    description: 'Chỉ nội dung, không xao nhãng',
    shortcut: '3'
  }
];

export default function ViewModeSelector({ 
  currentMode, 
  onModeChange, 
  isOpen, 
  onClose,
  compact = false 
}) {
  // Compact mode - just buttons
  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
        {MODE_CONFIG.map(({ mode, icon, label }) => {
          const IconComp = Icon[icon];
          const isActive = currentMode === mode;
          
          return (
            <button
              key={mode}
              onClick={() => onModeChange(mode)}
              className={`relative px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive 
                  ? 'text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="viewModeIndicator"
                  className="absolute inset-0 bg-[#7CB342] rounded-lg"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <IconComp size={16} />
                <span className="hidden sm:inline">{label}</span>
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Full panel mode
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl z-50 p-6 pb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Chế độ đọc</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Icon.X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              {MODE_CONFIG.map(({ mode, icon, label, description, shortcut }) => {
                const IconComp = Icon[icon];
                const isActive = currentMode === mode;
                
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      onModeChange(mode);
                      onClose();
                    }}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                      isActive 
                        ? 'border-[#7CB342] bg-[#7CB342]/5' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isActive ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <IconComp size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{label}</span>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-[#7CB342] text-white text-xs rounded-full">
                            Đang dùng
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                    </div>
                    <div className="hidden md:block text-xs text-gray-400 font-mono">
                      {shortcut}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <p className="text-center text-xs text-gray-400 mt-6">
              Nhấn phím 1, 2, 3 để chuyển nhanh chế độ đọc
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
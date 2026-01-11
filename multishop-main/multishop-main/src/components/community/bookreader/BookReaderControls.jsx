/**
 * BookReaderControls - Controls và Settings cho Book Reader
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/AnimatedIcon';
import { VIEW_MODES, READING_THEMES, THEME_STYLES } from './types';

// Progress Bar
export function ReadingProgressBar({ progress, pages, onPageClick }) {
  return (
    <div className="relative">
      {/* Progress track */}
      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-[#7CB342] to-[#8BC34A]"
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Page indicators */}
      <div className="flex justify-between mt-1">
        {pages.map((page, idx) => (
          <button
            key={page.id}
            onClick={() => onPageClick(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx < progress.current 
                ? 'bg-[#7CB342]' 
                : idx === progress.current - 1
                ? 'bg-[#7CB342] ring-2 ring-[#7CB342]/30'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            title={`Trang ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// Navigation Buttons
export function NavigationButtons({ canGoPrev, canGoNext, onPrev, onNext, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className={`p-2 rounded-full transition-all ${
            canGoPrev 
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' 
              : 'opacity-30 cursor-not-allowed text-gray-400'
          }`}
        >
          <Icon.ChevronLeft size={20} />
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`p-2 rounded-full transition-all ${
            canGoNext 
              ? 'bg-[#7CB342] hover:bg-[#689F38] text-white' 
              : 'opacity-30 cursor-not-allowed text-gray-400'
          }`}
        >
          <Icon.ChevronRight size={20} />
        </button>
      </div>
    );
  }
  
  return (
    <>
      {/* Left nav area */}
      <button
        onClick={onPrev}
        disabled={!canGoPrev}
        className={`absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center transition-all ${
          canGoPrev ? 'hover:bg-black/5 cursor-pointer' : 'cursor-default'
        }`}
        style={{ touchAction: 'none' }}
      >
        {canGoPrev && (
          <div className="w-10 h-10 rounded-full bg-white/80 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon.ChevronLeft size={24} className="text-gray-700" />
          </div>
        )}
      </button>
      
      {/* Right nav area */}
      <button
        onClick={onNext}
        disabled={!canGoNext}
        className={`absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center transition-all ${
          canGoNext ? 'hover:bg-black/5 cursor-pointer' : 'cursor-default'
        }`}
        style={{ touchAction: 'none' }}
      >
        {canGoNext && (
          <div className="w-10 h-10 rounded-full bg-white/80 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon.ChevronRight size={24} className="text-gray-700" />
          </div>
        )}
      </button>
    </>
  );
}

// Settings Panel
export function SettingsPanel({ settings, onUpdateSettings, isOpen, onClose }) {
  if (!isOpen) return null;
  
  const { fontSize, theme, animationsEnabled, viewMode } = settings;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 min-w-[280px] z-[60]"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Cài đặt đọc</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <Icon.X size={18} />
          </button>
        </div>
        
        {/* Font Size */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-2 block">Cỡ chữ</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpdateSettings({ fontSize: fontSize - 2 })}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <span className="text-sm font-bold">A-</span>
            </button>
            <div className="flex-1 text-center font-medium">{fontSize}px</div>
            <button
              onClick={() => onUpdateSettings({ fontSize: fontSize + 2 })}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
            >
              <span className="text-lg font-bold">A+</span>
            </button>
          </div>
        </div>
        
        {/* Theme */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-2 block">Giao diện</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(READING_THEMES).map(([key, value]) => {
              const themeStyle = THEME_STYLES[value];
              return (
                <button
                  key={key}
                  onClick={() => onUpdateSettings({ theme: value })}
                  className={`h-10 rounded-lg ${themeStyle.bg} border-2 transition-all ${
                    theme === value 
                      ? 'border-[#7CB342] ring-2 ring-[#7CB342]/30' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={key}
                />
              );
            })}
          </div>
        </div>
        
        {/* View Mode */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-2 block">Chế độ xem</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: VIEW_MODES.SCROLL, icon: 'List', label: 'Cuộn' },
              { mode: VIEW_MODES.BOOK, icon: 'FileText', label: 'Sách' },
              { mode: VIEW_MODES.FOCUS, icon: 'Eye', label: 'Tập trung' }
            ].map(({ mode, icon, label }) => {
              const IconComp = Icon[icon];
              return (
                <button
                  key={mode}
                  onClick={() => onUpdateSettings({ viewMode: mode })}
                  className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                    viewMode === mode 
                      ? 'bg-[#7CB342] text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <IconComp size={18} />
                  <span className="text-xs">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Animations Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Hiệu ứng lật trang</span>
          <button
            onClick={() => onUpdateSettings({ animationsEnabled: !animationsEnabled })}
            className={`w-12 h-6 rounded-full transition-colors ${
              animationsEnabled ? 'bg-[#7CB342]' : 'bg-gray-300'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
              animationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Page Info
export function PageInfo({ progress, currentPage }) {
  const pageTypeLabels = {
    text: 'Nội dung',
    media: 'Hình ảnh',
    poll: 'Khảo sát',
    products: 'Sản phẩm'
  };
  
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="font-medium text-gray-900">
        Trang {progress.current}/{progress.total}
      </span>
      {currentPage && (
        <>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">
            {pageTypeLabels[currentPage.type] || 'Nội dung'}
          </span>
        </>
      )}
      <span className="text-gray-300">•</span>
      <span className="text-[#7CB342] font-medium">{progress.percentage}%</span>
    </div>
  );
}

// Resume Prompt
export function ResumePrompt({ savedProgress, onResume, onStartFresh }) {
  if (!savedProgress || savedProgress.currentPage === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute inset-x-4 bottom-20 bg-white rounded-2xl shadow-xl border border-gray-200 p-4 z-30"
    >
      <p className="text-sm text-gray-600 mb-3">
        Bạn đã dừng ở <strong>trang {savedProgress.currentPage + 1}</strong>. 
        Tiếp tục đọc?
      </p>
      <div className="flex gap-2">
        <button
          onClick={onResume}
          className="flex-1 py-2 bg-[#7CB342] text-white rounded-xl font-medium hover:bg-[#689F38] transition-colors"
        >
          Tiếp tục
        </button>
        <button
          onClick={onStartFresh}
          className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          Từ đầu
        </button>
      </div>
    </motion.div>
  );
}

export default {
  ReadingProgressBar,
  NavigationButtons,
  SettingsPanel,
  PageInfo,
  ResumePrompt
};
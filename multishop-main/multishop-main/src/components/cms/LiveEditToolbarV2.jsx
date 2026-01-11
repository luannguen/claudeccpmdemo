/**
 * LiveEditToolbarV2 - Floating Toolbar cho Live Edit
 * 
 * Features:
 * - Ẩn mặc định, hiện khi hover góc màn hình (TRÁI - để tránh chatbot)
 * - Khi edit mode: hiện toolbar với Save/Cancel
 * - Block navigation khi đang edit
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Save, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLiveEditContext } from "./LiveEditContext";
import LiveEditStyles from "./LiveEditStyles";

export function LiveEditToolbarV2() {
  const {
    isEditMode,
    isAdmin,
    enableEditMode,
    hasChanges,
    saveChanges,
    cancelChanges,
    isSaving
  } = useLiveEditContext();

  const [isHovered, setIsHovered] = useState(false);

  // Block link navigation in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const handleClick = (e) => {
      const target = e.target.closest('a[href]');
      if (target && !target.hasAttribute('data-live-edit-allow')) {
        const href = target.getAttribute('href');
        // Allow external links and anchor links
        if (href && !href.startsWith('#') && !href.startsWith('http')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [isEditMode]);

  // Add/remove edit mode class to body
  useEffect(() => {
    if (isEditMode) {
      document.body.classList.remove('live-edit-mode-ready');
      document.body.classList.add('live-edit-mode-active');
    } else if (isAdmin) {
      document.body.classList.remove('live-edit-mode-active');
      document.body.classList.add('live-edit-mode-ready');
    }

    return () => {
      document.body.classList.remove('live-edit-mode-active', 'live-edit-mode-ready');
    };
  }, [isEditMode, isAdmin]);

  if (!isAdmin) return null;

  return (
    <>
      {/* Global Live Edit Styles */}
      <LiveEditStyles isEditMode={isEditMode} />

      {/* Edit Mode Toolbar */}
      {isEditMode ? (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed bottom-20 left-6 z-[100] flex items-center gap-2"
        >
          <motion.div 
            className="bg-white rounded-full shadow-2xl border border-gray-200 px-4 py-2 flex items-center gap-3"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Đang sửa</span>
              {hasChanges && (
                <span className="text-xs text-orange-500 font-medium">(có thay đổi)</span>
              )}
            </div>
            
            <div className="w-px h-5 bg-gray-200" />
            
            <Button
              size="sm"
              variant="ghost"
              onClick={cancelChanges}
              disabled={isSaving}
              className="h-8 px-2 text-gray-600 hover:text-red-500"
              title="Hủy thay đổi"
            >
              <X className="w-4 h-4" />
            </Button>
            
            <Button
              size="sm"
              onClick={saveChanges}
              disabled={isSaving || !hasChanges}
              className="h-8 bg-[#7CB342] hover:bg-[#689F38] text-white disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Lưu
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <>
          {/* Hover zone - góc dưới TRÁI, cao hơn để tránh BackToTop */}
          <div 
            className="fixed bottom-12 left-0 w-24 h-24 z-[99]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          />
          
          <AnimatePresence>
            {isHovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={enableEditMode}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="fixed bottom-20 left-6 z-[100] w-12 h-12 bg-[#7CB342] hover:bg-[#689F38] text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 group"
                title="Bật chế độ chỉnh sửa nội dung"
              >
                <Edit3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </motion.button>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}

export default LiveEditToolbarV2;
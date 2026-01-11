import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckSquare, Trash2, Edit, Eye, EyeOff, X, Download } from "lucide-react";

export default function BulkActionToolbar({ 
  selectedCount, 
  onClearSelection,
  actions = []
}) {
  if (selectedCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
      >
        <div className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-6">
          {/* Selection Count */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-90">Đã chọn</p>
              <p className="text-xl font-bold">{selectedCount}</p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-12 bg-white/30" />

          {/* Actions */}
          <div className="flex items-center gap-2">
            {actions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 font-medium"
                title={action.label}
              >
                {action.icon}
                <span className="hidden md:inline">{action.label}</span>
              </button>
            ))}
          </div>

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            className="ml-2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            title="Bỏ chọn tất cả"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
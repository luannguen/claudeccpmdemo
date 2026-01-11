/**
 * ManualConnectInput - Nhập link/slug thủ công
 * UI Component - Separated from QR Scanner
 */

import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { motion, AnimatePresence } from "framer-motion";

export default function ManualConnectInput({ isOpen, onClose, onSubmit }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const slug = input.includes('?slug=') 
      ? input.split('?slug=')[1].split('&')[0]
      : input.trim();
    
    onSubmit(slug);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Nhập link E-Card</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon.X size={20} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link hoặc Username
              </label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://... hoặc username-123"
                autoFocus
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#7CB342] focus:border-transparent text-sm"
              />
              <p className="mt-2 text-xs text-gray-500">
                Nhập link đầy đủ hoặc chỉ username/slug của E-Card
              </p>
            </div>

            <div className="p-4 bg-amber-50 rounded-xl">
              <div className="flex gap-3">
                <Icon.Lightbulb size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">Ví dụ:</p>
                  <p className="text-amber-700">
                    nguyen-van-a-123<br />
                    hoặc https://app.com/ecard?slug=nguyen-van-a-123
                  </p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!input.trim()}
              className="w-full px-4 py-3 bg-[#7CB342] text-white rounded-xl hover:bg-[#689F38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              <Icon.UserPlus size={20} />
              <span>Kết nối ngay</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
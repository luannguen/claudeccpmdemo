/**
 * PreOrderTermsBadge - Badge hiển thị rõ đây là sản phẩm bán trước
 * Module 4: Transparency UI
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, FileText, ChevronRight } from 'lucide-react';

export default function PreOrderTermsBadge({ 
  variant = 'default', // default, compact, detailed
  harvestDate,
  depositPercent,
  onClick,
  className = ''
}) {
  const daysUntil = harvestDate ? Math.ceil((new Date(harvestDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;

  if (variant === 'compact') {
    return (
      <motion.div 
        whileHover={{ scale: 1.02 }}
        className={`inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 border border-amber-300 rounded-lg text-amber-800 text-xs font-medium ${className}`}
      >
        <Clock className="w-3 h-3" />
        <span>Bán trước</span>
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-amber-800">SẢN PHẨM BÁN TRƯỚC</span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs rounded-full">Pre-Order</span>
            </div>
            <p className="text-sm text-amber-700 mb-2">
              Sản phẩm chưa có sẵn, sẽ được giao sau khi thu hoạch.
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              {harvestDate && (
                <span className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-3 h-3" />
                  Giao sau ~{daysUntil} ngày
                </span>
              )}
              {depositPercent && depositPercent < 100 && (
                <span className="flex items-center gap-1 text-gray-600">
                  <AlertCircle className="w-3 h-3" />
                  Đặt cọc {depositPercent}%
                </span>
              )}
            </div>
            {onClick && (
              <button 
                onClick={onClick}
                className="mt-3 flex items-center gap-1 text-sm text-amber-700 hover:text-amber-900 font-medium"
              >
                <FileText className="w-4 h-4" />
                Xem điều khoản bán trước
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-2 bg-amber-100 border border-amber-300 rounded-xl text-amber-800 cursor-pointer hover:bg-amber-200 transition-colors ${className}`}
    >
      <Clock className="w-4 h-4" />
      <span className="font-medium text-sm">Bán trước</span>
      {daysUntil > 0 && (
        <span className="text-xs bg-amber-200 px-2 py-0.5 rounded-full">
          ~{daysUntil} ngày
        </span>
      )}
      {onClick && <ChevronRight className="w-4 h-4" />}
    </motion.div>
  );
}
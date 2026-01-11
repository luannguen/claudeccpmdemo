/**
 * SoldProgressBar - Progress bar hiển thị % đã bán với social proof
 * UI Layer - Presentation only
 */

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, AlertTriangle, Flame } from "lucide-react";

export default function SoldProgressBar({ 
  soldQuantity = 0, 
  totalQuantity = 100,
  availableQuantity,
  showSocialProof = true,
  variant = "default", // "default" | "compact" | "detailed"
  recentBuyers = 0 // Số người mua gần đây
}) {
  const [showPulse, setShowPulse] = useState(false);
  
  const sold = totalQuantity - (availableQuantity ?? (totalQuantity - soldQuantity));
  const soldPercent = totalQuantity > 0 ? (sold / totalQuantity) * 100 : 0;
  const availablePercent = 100 - soldPercent;
  
  const isLowStock = availablePercent <= 20;
  const isVeryLowStock = availablePercent <= 10;
  const isSoldOut = availablePercent <= 0;

  // Pulse animation when someone buys
  useEffect(() => {
    if (recentBuyers > 0) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [recentBuyers]);

  // Get status badge
  const getStatusBadge = () => {
    if (isSoldOut) {
      return { text: 'HẾT HÀNG', color: 'bg-gray-500', icon: null };
    }
    if (isVeryLowStock) {
      return { text: 'SẮP HẾT', color: 'bg-red-500', icon: AlertTriangle };
    }
    if (isLowStock) {
      return { text: 'CÒN ÍT', color: 'bg-orange-500', icon: Flame };
    }
    if (soldPercent >= 50) {
      return { text: 'BÁN CHẠY', color: 'bg-green-500', icon: TrendingUp };
    }
    return null;
  };

  const statusBadge = getStatusBadge();

  // Compact variant
  if (variant === "compact") {
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">Đã bán {soldPercent.toFixed(0)}%</span>
          {statusBadge && (
            <span className={`${statusBadge.color} text-white px-2 py-0.5 rounded-full text-[10px] font-bold`}>
              {statusBadge.text}
            </span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${soldPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full rounded-full ${
              isVeryLowStock 
                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                : isLowStock 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                  : 'bg-gradient-to-r from-[#7CB342] to-[#5a8f31]'
            }`}
          />
        </div>
      </div>
    );
  }

  // Detailed variant
  if (variant === "detailed") {
    return (
      <div className={`rounded-2xl p-4 ${
        isVeryLowStock 
          ? 'bg-red-50 border-2 border-red-200' 
          : isLowStock 
            ? 'bg-orange-50 border-2 border-orange-200'
            : 'bg-gray-50 border border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Tình trạng đặt hàng</span>
          </div>
          {statusBadge && (
            <motion.span 
              animate={isVeryLowStock ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`${statusBadge.color} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}
            >
              {statusBadge.icon && <statusBadge.icon className="w-3 h-3" />}
              {statusBadge.text}
            </motion.span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${soldPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full relative ${
                isVeryLowStock 
                  ? 'bg-gradient-to-r from-red-500 to-red-600' 
                  : isLowStock 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                    : 'bg-gradient-to-r from-[#7CB342] to-[#5a8f31]'
              }`}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </motion.div>
          </div>

          {/* Pulse animation when someone buys */}
          <AnimatePresence>
            {showPulse && (
              <motion.div
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-green-500 rounded-full"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div>
            <p className="text-lg font-bold text-gray-900">{sold}</p>
            <p className="text-xs text-gray-500">Đã bán</p>
          </div>
          <div>
            <p className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
              {availableQuantity ?? (totalQuantity - sold)}
            </p>
            <p className="text-xs text-gray-500">Còn lại</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{totalQuantity}</p>
            <p className="text-xs text-gray-500">Tổng cộng</p>
          </div>
        </div>

        {/* Social proof */}
        {showSocialProof && recentBuyers > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 flex items-center gap-2 bg-green-100 text-green-800 px-3 py-2 rounded-xl text-sm"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="font-medium">{recentBuyers} người vừa đặt trong 24h qua</span>
          </motion.div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Đã bán</span>
          <span className="font-bold text-[#7CB342]">{soldPercent.toFixed(0)}%</span>
        </div>
        {statusBadge && (
          <motion.span 
            animate={isLowStock ? { scale: [1, 1.03, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`${statusBadge.color} text-white px-2 py-0.5 rounded-full text-xs font-bold`}
          >
            {statusBadge.text}
          </motion.span>
        )}
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${soldPercent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${
            isVeryLowStock 
              ? 'bg-gradient-to-r from-red-500 to-red-600' 
              : isLowStock 
                ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                : 'bg-gradient-to-r from-[#7CB342] to-[#5a8f31]'
          }`}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>Còn {availableQuantity ?? (totalQuantity - sold)} / {totalQuantity}</span>
        {showSocialProof && soldPercent >= 30 && (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Đang bán chạy
          </span>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
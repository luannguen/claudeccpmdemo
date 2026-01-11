/**
 * LotCapacityIndicator - Hiển thị giới hạn năng lực của lot
 * Module 5: Capacity Management
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Package, AlertTriangle, TrendingUp, Users,
  CheckCircle2, XCircle, Clock
} from 'lucide-react';

export default function LotCapacityIndicator({
  totalYield,
  soldQuantity = 0,
  availableQuantity,
  reservedQuantity = 0, // Số lượng đang trong giỏ hàng/checkout
  moq = 1,
  variant = 'default', // default, compact, detailed
  showReservation = true,
  className = ''
}) {
  const effectiveAvailable = availableQuantity - reservedQuantity;
  const soldPercent = (soldQuantity / totalYield) * 100;
  const reservedPercent = (reservedQuantity / totalYield) * 100;
  const availablePercent = (effectiveAvailable / totalYield) * 100;

  // Capacity status
  const getStatus = () => {
    if (effectiveAvailable <= 0) return { label: 'Hết hàng', color: 'red', icon: XCircle };
    if (effectiveAvailable <= moq * 3) return { label: 'Sắp hết', color: 'amber', icon: AlertTriangle };
    if (soldPercent >= 70) return { label: 'Bán chạy', color: 'green', icon: TrendingUp };
    return { label: 'Còn hàng', color: 'blue', icon: CheckCircle2 };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <StatusIcon className={`w-4 h-4 text-${status.color}-500`} />
        <span className={`text-sm font-medium text-${status.color}-700`}>
          {status.label}
        </span>
        <span className="text-xs text-gray-500">
          ({effectiveAvailable} còn lại)
        </span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white border-2 border-gray-100 rounded-2xl p-5 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-${status.color}-100 rounded-xl flex items-center justify-center`}>
              <Package className={`w-5 h-5 text-${status.color}-600`} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Tình trạng kho</h3>
              <p className="text-sm text-gray-500">Lot có giới hạn số lượng</p>
            </div>
          </div>
          <div className={`px-3 py-1 bg-${status.color}-100 text-${status.color}-700 rounded-full text-sm font-medium`}>
            {status.label}
          </div>
        </div>

        {/* Progress bar with segments */}
        <div className="mb-4">
          <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
            {/* Sold segment */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${soldPercent}%` }}
              className="h-full bg-green-500"
              title={`Đã bán: ${soldQuantity}`}
            />
            {/* Reserved segment */}
            {showReservation && reservedQuantity > 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${reservedPercent}%` }}
                className="h-full bg-amber-400"
                title={`Đang giữ: ${reservedQuantity}`}
              />
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">{soldQuantity}</p>
            <p className="text-xs text-green-700">Đã bán</p>
          </div>
          {showReservation && reservedQuantity > 0 && (
            <div className="text-center p-3 bg-amber-50 rounded-xl">
              <p className="text-2xl font-bold text-amber-600">{reservedQuantity}</p>
              <p className="text-xs text-amber-700">Đang giữ</p>
            </div>
          )}
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{effectiveAvailable}</p>
            <p className="text-xs text-blue-700">Còn lại</p>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Package className="w-3 h-3" />
            Tổng: {totalYield}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            MOQ: {moq}
          </span>
        </div>

        {/* Warning if low stock */}
        {effectiveAvailable <= moq * 5 && effectiveAvailable > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Chỉ còn {Math.floor(effectiveAvailable / moq)} đơn hàng có thể đặt!
            </p>
          </div>
        )}
      </motion.div>
    );
  }

  // Default variant
  return (
    <div className={`bg-gray-50 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">Còn lại</span>
        <div className={`flex items-center gap-1 text-${status.color}-600`}>
          <StatusIcon className="w-4 h-4" />
          <span className="text-sm font-medium">{status.label}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${soldPercent + reservedPercent}%` }}
          className="h-full bg-gradient-to-r from-green-500 to-amber-500 rounded-full"
        />
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{soldQuantity} đã bán</span>
        <span className="font-semibold text-gray-700">{effectiveAvailable} còn lại</span>
      </div>

      {/* Real-time buyers indicator */}
      {reservedQuantity > 0 && showReservation && (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
          <Clock className="w-3 h-3 animate-pulse" />
          <span>{reservedQuantity} đang trong giỏ người khác</span>
        </div>
      )}
    </div>
  );
}
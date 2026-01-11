/**
 * PreOrderStatusBadge - Badge hiển thị trạng thái đơn hàng preorder
 * Module 2: Enhanced Order Status Flow
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Wallet, CheckCircle2, Leaf, Sun, 
  Package, Truck, Ban, RefreshCw, AlertTriangle
} from 'lucide-react';

const STATUS_CONFIG = {
  // Preorder specific
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: Clock
  },
  deposit_pending: {
    label: 'Chờ đặt cọc',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: Wallet,
    pulse: true
  },
  deposit_paid: {
    label: 'Đã đặt cọc',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: CheckCircle2
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: CheckCircle2
  },
  processing: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: Clock
  },
  in_production: {
    label: 'Đang chăm sóc',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: Leaf
  },
  awaiting_harvest: {
    label: 'Chờ thu hoạch',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    icon: Sun
  },
  quality_check: {
    label: 'Kiểm tra CL',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    icon: Sun
  },
  harvest_ready: {
    label: 'Sẵn sàng',
    color: 'bg-[#7CB342]/10 text-[#7CB342] border-[#7CB342]/30',
    icon: Package
  },
  harvested: {
    label: 'Đã thu hoạch',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: Package
  },
  partial_payment: {
    label: 'Chờ thanh toán',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: Wallet,
    pulse: true
  },
  shipping: {
    label: 'Đang giao',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    icon: Truck
  },
  delivered: {
    label: 'Đã giao',
    color: 'bg-green-100 text-green-700 border-green-300',
    icon: CheckCircle2
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: Ban
  },
  refunded: {
    label: 'Đã hoàn tiền',
    color: 'bg-red-100 text-red-700 border-red-300',
    icon: RefreshCw
  },
  return_approved: {
    label: 'Chờ trả hàng',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    icon: RefreshCw
  },
  returned_refunded: {
    label: 'Đã trả & hoàn',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    icon: RefreshCw
  }
};

export default function PreOrderStatusBadge({ 
  status, 
  depositStatus,
  size = 'default', // small, default, large
  showIcon = true,
  className = ''
}) {
  // Determine effective status for display
  let effectiveStatus = status;
  if (status === 'confirmed' && depositStatus === 'pending') {
    effectiveStatus = 'deposit_pending';
  } else if (depositStatus === 'paid' && ['pending', 'confirmed'].includes(status)) {
    effectiveStatus = 'deposit_paid';
  }

  const config = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  const sizeClasses = {
    small: 'px-2 py-0.5 text-xs gap-1',
    default: 'px-3 py-1 text-sm gap-1.5',
    large: 'px-4 py-1.5 text-base gap-2'
  };

  const iconSizes = {
    small: 'w-3 h-3',
    default: 'w-4 h-4',
    large: 'w-5 h-5'
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center rounded-full border font-medium
        ${config.color}
        ${sizeClasses[size]}
        ${config.pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </motion.div>
  );
}

// Export for use in other components
export { STATUS_CONFIG };
/**
 * WalletStatusCard - Hiển thị trạng thái ví escrow của đơn hàng
 * UI Layer
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, Clock, CheckCircle, AlertTriangle, 
  ArrowUpCircle, ArrowDownCircle, Shield, Lock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WALLET_STATUS } from '@/components/services/escrowCore';

const STATUS_CONFIG = {
  [WALLET_STATUS.PENDING_DEPOSIT]: {
    label: 'Chờ cọc',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
    description: 'Đang chờ khách thanh toán tiền cọc'
  },
  [WALLET_STATUS.DEPOSIT_HELD]: {
    label: 'Đã nhận cọc',
    color: 'bg-blue-100 text-blue-800',
    icon: Shield,
    description: 'Tiền cọc đang được giữ an toàn'
  },
  [WALLET_STATUS.PENDING_FINAL]: {
    label: 'Chờ thanh toán',
    color: 'bg-orange-100 text-orange-800',
    icon: Clock,
    description: 'Chờ thanh toán phần còn lại'
  },
  [WALLET_STATUS.FULLY_HELD]: {
    label: 'Đã thanh toán đủ',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Toàn bộ thanh toán đã được giữ'
  },
  [WALLET_STATUS.RELEASED_TO_SELLER]: {
    label: 'Đã chuyển seller',
    color: 'bg-emerald-100 text-emerald-800',
    icon: ArrowUpCircle,
    description: 'Tiền đã được chuyển cho người bán'
  },
  [WALLET_STATUS.REFUNDED]: {
    label: 'Đã hoàn tiền',
    color: 'bg-purple-100 text-purple-800',
    icon: ArrowDownCircle,
    description: 'Đã hoàn tiền cho khách hàng'
  },
  [WALLET_STATUS.PARTIAL_REFUNDED]: {
    label: 'Hoàn một phần',
    color: 'bg-indigo-100 text-indigo-800',
    icon: ArrowDownCircle,
    description: 'Đã hoàn một phần tiền'
  },
  [WALLET_STATUS.DISPUTED]: {
    label: 'Đang tranh chấp',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
    description: 'Đơn hàng đang có dispute'
  },
  [WALLET_STATUS.CANCELLED]: {
    label: 'Đã hủy',
    color: 'bg-gray-100 text-gray-800',
    icon: Lock,
    description: 'Ví đã bị hủy'
  }
};

export default function WalletStatusCard({ wallet, variant = 'default' }) {
  if (!wallet) return null;

  const statusConfig = STATUS_CONFIG[wallet.status] || STATUS_CONFIG[WALLET_STATUS.PENDING_DEPOSIT];
  const StatusIcon = statusConfig.icon;

  const totalAmount = (wallet.deposit_held || 0) + (wallet.final_payment_held || 0);
  const depositProgress = wallet.total_held > 0 
    ? ((wallet.deposit_held || 0) / wallet.total_held * 100) 
    : 0;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
        <StatusIcon className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium">{statusConfig.label}</span>
        <Badge variant="outline" className="ml-auto">
          {wallet.total_held?.toLocaleString()}đ
        </Badge>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border shadow-sm p-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Ví Escrow</h3>
            <p className="text-xs text-gray-500">#{wallet.order_number}</p>
          </div>
        </div>
        <Badge className={statusConfig.color}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Amounts */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Tiền cọc</span>
          <span className="font-medium text-gray-900">
            {(wallet.deposit_held || 0).toLocaleString()}đ
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Thanh toán cuối</span>
          <span className="font-medium text-gray-900">
            {(wallet.final_payment_held || 0).toLocaleString()}đ
          </span>
        </div>
        <div className="border-t pt-2 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Tổng đang giữ</span>
          <span className="font-bold text-lg text-blue-600">
            {(wallet.total_held || 0).toLocaleString()}đ
          </span>
        </div>
      </div>

      {/* Progress */}
      {wallet.total_held > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Cọc</span>
            <span>Thanh toán cuối</span>
          </div>
          <Progress value={depositProgress} className="h-2" />
        </div>
      )}

      {/* Refunded */}
      {wallet.refunded_amount > 0 && (
        <div className="p-2 bg-purple-50 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-700">Đã hoàn tiền</span>
            <span className="font-medium text-purple-800">
              -{wallet.refunded_amount.toLocaleString()}đ
            </span>
          </div>
        </div>
      )}

      {/* Release conditions */}
      {wallet.release_conditions && (
        <div className="border-t pt-3">
          <p className="text-xs font-medium text-gray-500 mb-2">Điều kiện release:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(wallet.release_conditions).map(([key, value]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                {value ? (
                  <CheckCircle className="w-3 h-3 text-green-500" />
                ) : (
                  <Clock className="w-3 h-3 text-gray-400" />
                )}
                <span className={value ? 'text-green-700' : 'text-gray-500'}>
                  {key.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-gray-500 mt-3 text-center">
        {statusConfig.description}
      </p>
    </motion.div>
  );
}
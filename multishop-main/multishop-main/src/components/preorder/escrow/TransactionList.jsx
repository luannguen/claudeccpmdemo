/**
 * TransactionList - Danh sách giao dịch ví
 * UI Layer
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownCircle, ArrowUpCircle, RefreshCw, 
  AlertCircle, CheckCircle, Clock, Minus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { TRANSACTION_TYPE } from '@/components/services/escrowCore';

const TYPE_CONFIG = {
  [TRANSACTION_TYPE.DEPOSIT_IN]: {
    label: 'Nhận cọc',
    icon: ArrowDownCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  [TRANSACTION_TYPE.FINAL_PAYMENT_IN]: {
    label: 'Thanh toán cuối',
    icon: ArrowDownCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  [TRANSACTION_TYPE.REFUND_OUT]: {
    label: 'Hoàn tiền',
    icon: ArrowUpCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  [TRANSACTION_TYPE.PARTIAL_REFUND_OUT]: {
    label: 'Hoàn một phần',
    icon: ArrowUpCircle,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  },
  [TRANSACTION_TYPE.SELLER_PAYOUT]: {
    label: 'Chuyển seller',
    icon: ArrowUpCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  [TRANSACTION_TYPE.COMMISSION_DEDUCT]: {
    label: 'Hoa hồng',
    icon: Minus,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  [TRANSACTION_TYPE.COMPENSATION_OUT]: {
    label: 'Bồi thường',
    icon: ArrowUpCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  [TRANSACTION_TYPE.DISPUTE_HOLD]: {
    label: 'Tạm giữ dispute',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  [TRANSACTION_TYPE.DISPUTE_RELEASE]: {
    label: 'Release dispute',
    icon: RefreshCw,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  [TRANSACTION_TYPE.ADJUSTMENT]: {
    label: 'Điều chỉnh',
    icon: RefreshCw,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
};

const STATUS_BADGE = {
  pending: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Xử lý', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Hoàn tất', color: 'bg-green-100 text-green-800' },
  failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-800' }
};

function TransactionItem({ transaction }) {
  const config = TYPE_CONFIG[transaction.transaction_type] || TYPE_CONFIG[TRANSACTION_TYPE.ADJUSTMENT];
  const statusConfig = STATUS_BADGE[transaction.status] || STATUS_BADGE.pending;
  const Icon = config.icon;
  const isPositive = transaction.amount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <div className={`p-2 rounded-full ${config.bgColor}`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 text-sm">{config.label}</span>
          <Badge className={`text-xs ${statusConfig.color}`}>
            {statusConfig.label}
          </Badge>
        </div>
        <p className="text-xs text-gray-500 truncate">
          {transaction.reason || transaction.order_number}
        </p>
        <p className="text-xs text-gray-400">
          {transaction.created_date && format(
            new Date(transaction.created_date), 
            'dd/MM/yyyy HH:mm', 
            { locale: vi }
          )}
        </p>
      </div>

      <div className="text-right">
        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{transaction.amount?.toLocaleString()}đ
        </span>
        <p className="text-xs text-gray-500">
          Sau: {transaction.balance_after?.toLocaleString()}đ
        </p>
      </div>
    </motion.div>
  );
}

export default function TransactionList({ 
  transactions = [], 
  isLoading = false,
  maxItems = 10,
  showEmpty = true 
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-5 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0 && showEmpty) {
    return (
      <div className="text-center py-8">
        <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Chưa có giao dịch nào</p>
      </div>
    );
  }

  const displayTransactions = transactions.slice(0, maxItems);

  return (
    <div className="divide-y">
      <AnimatePresence>
        {displayTransactions.map((tx, index) => (
          <TransactionItem key={tx.id || index} transaction={tx} />
        ))}
      </AnimatePresence>

      {transactions.length > maxItems && (
        <div className="pt-3 text-center">
          <span className="text-sm text-gray-500">
            +{transactions.length - maxItems} giao dịch khác
          </span>
        </div>
      )}
    </div>
  );
}
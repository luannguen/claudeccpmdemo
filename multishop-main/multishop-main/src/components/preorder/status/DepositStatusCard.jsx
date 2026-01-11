/**
 * DepositStatusCard - Card hiển thị trạng thái đặt cọc
 * Module 2: Enhanced Order Status Flow
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, Clock, CheckCircle2, AlertTriangle, 
  CreditCard, Ban, ChevronRight
} from 'lucide-react';
import { format, differenceInDays, differenceInHours } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Button } from '@/components/ui/button';

const DEPOSIT_STATUS_CONFIG = {
  none: {
    label: 'Không yêu cầu cọc',
    color: 'bg-gray-50 border-gray-200',
    textColor: 'text-gray-600',
    icon: Wallet
  },
  pending: {
    label: 'Chờ thanh toán cọc',
    color: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-700',
    icon: Clock,
    urgent: true
  },
  paid: {
    label: 'Đã thanh toán cọc',
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-700',
    icon: CheckCircle2
  },
  completed: {
    label: 'Đã thanh toán đủ',
    color: 'bg-green-50 border-green-200',
    textColor: 'text-green-700',
    icon: CheckCircle2
  },
  expired: {
    label: 'Hết hạn thanh toán',
    color: 'bg-red-50 border-red-200',
    textColor: 'text-red-700',
    icon: Ban
  }
};

export default function DepositStatusCard({
  depositStatus = 'none',
  depositAmount = 0,
  remainingAmount = 0,
  totalAmount = 0,
  depositPaidDate,
  paymentDeadline,
  onPayDeposit,
  onPayRemaining,
  variant = 'default', // default, compact, detailed
  className = ''
}) {
  const config = DEPOSIT_STATUS_CONFIG[depositStatus] || DEPOSIT_STATUS_CONFIG.none;
  const Icon = config.icon;
  const depositPercent = totalAmount > 0 ? Math.round((depositAmount / totalAmount) * 100) : 0;

  // Calculate time remaining for deadline
  const getTimeRemaining = () => {
    if (!paymentDeadline || depositStatus !== 'pending') return null;
    const deadline = new Date(paymentDeadline);
    const now = new Date();
    const hoursLeft = differenceInHours(deadline, now);
    const daysLeft = differenceInDays(deadline, now);
    
    if (hoursLeft < 0) return { expired: true };
    if (hoursLeft < 24) return { hours: hoursLeft, urgent: true };
    return { days: daysLeft, urgent: daysLeft <= 1 };
  };

  const timeRemaining = getTimeRemaining();

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${config.color} ${className}`}>
        <Icon className={`w-5 h-5 ${config.textColor}`} />
        <div className="flex-1">
          <p className={`font-medium ${config.textColor}`}>{config.label}</p>
          {depositStatus === 'pending' && (
            <p className="text-xs text-gray-500">
              Cọc: {depositAmount.toLocaleString('vi-VN')}đ ({depositPercent}%)
            </p>
          )}
        </div>
        {depositStatus === 'pending' && onPayDeposit && (
          <Button size="sm" onClick={onPayDeposit} className="bg-[#7CB342] hover:bg-[#558B2F]">
            Thanh toán
          </Button>
        )}
      </div>
    );
  }

  // Default & detailed variants
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 overflow-hidden ${config.color} ${className}`}
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          depositStatus === 'paid' || depositStatus === 'completed' 
            ? 'bg-green-100' 
            : depositStatus === 'pending' 
              ? 'bg-amber-100' 
              : 'bg-gray-100'
        }`}>
          <Icon className={`w-6 h-6 ${config.textColor}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-bold ${config.textColor}`}>{config.label}</h3>
          {depositPaidDate && depositStatus === 'paid' && (
            <p className="text-sm text-gray-500">
              Thanh toán lúc: {format(new Date(depositPaidDate), 'HH:mm dd/MM/yyyy', { locale: vi })}
            </p>
          )}
        </div>
        
        {/* Urgent badge */}
        {timeRemaining?.urgent && !timeRemaining.expired && (
          <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium animate-pulse">
            {timeRemaining.hours !== undefined 
              ? `Còn ${timeRemaining.hours}h`
              : `Còn ${timeRemaining.days} ngày`
            }
          </div>
        )}
      </div>

      {/* Amount breakdown */}
      {(depositStatus === 'pending' || depositStatus === 'paid') && variant === 'detailed' && (
        <div className="px-4 pb-4">
          <div className="bg-white/50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng đơn hàng</span>
              <span className="font-semibold">{totalAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tiền cọc ({depositPercent}%)</span>
              <span className={`font-semibold ${depositStatus === 'paid' ? 'text-green-600' : ''}`}>
                {depositAmount.toLocaleString('vi-VN')}đ
                {depositStatus === 'paid' && ' ✓'}
              </span>
            </div>
            {remainingAmount > 0 && (
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="text-gray-600">Còn lại khi nhận hàng</span>
                <span className="font-bold text-amber-600">
                  {remainingAmount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            )}

            {/* Progress bar */}
            <div className="mt-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${depositStatus === 'completed' ? 'bg-green-500' : 'bg-[#7CB342]'}`}
                  style={{ width: `${depositStatus === 'paid' ? depositPercent : depositStatus === 'completed' ? 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-right">
                {depositStatus === 'completed' ? '100%' : `${depositStatus === 'paid' ? depositPercent : 0}%`} đã thanh toán
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Deadline warning */}
      {depositStatus === 'pending' && paymentDeadline && (
        <div className="px-4 pb-4">
          <div className={`p-3 rounded-xl ${timeRemaining?.expired ? 'bg-red-100' : 'bg-amber-100/50'}`}>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className={`w-4 h-4 ${timeRemaining?.expired ? 'text-red-600' : 'text-amber-600'}`} />
              <span className={timeRemaining?.expired ? 'text-red-700' : 'text-amber-700'}>
                {timeRemaining?.expired 
                  ? 'Đã quá hạn thanh toán cọc'
                  : `Hạn thanh toán: ${format(new Date(paymentDeadline), 'HH:mm dd/MM/yyyy', { locale: vi })}`
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {(depositStatus === 'pending' || (depositStatus === 'paid' && remainingAmount > 0)) && (
        <div className="p-4 bg-white/30 border-t">
          {depositStatus === 'pending' && onPayDeposit && (
            <Button 
              onClick={onPayDeposit}
              className="w-full bg-[#7CB342] hover:bg-[#558B2F]"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Thanh toán cọc {depositAmount.toLocaleString('vi-VN')}đ
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          )}
          
          {depositStatus === 'paid' && remainingAmount > 0 && onPayRemaining && (
            <Button 
              onClick={onPayRemaining}
              variant="outline"
              className="w-full border-[#7CB342] text-[#7CB342] hover:bg-[#7CB342]/10"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Thanh toán phần còn lại
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
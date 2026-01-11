/**
 * OrderStatusTimeline - Timeline hiển thị trạng thái đơn hàng bán trước
 * Module 2: Enhanced Order Status Flow
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Circle, Clock, Package, Truck, 
  Leaf, Sun, Wallet, AlertTriangle, Ban, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

// Preorder specific statuses
export const PREORDER_STATUS_FLOW = [
  { 
    key: 'pending', 
    label: 'Chờ xác nhận', 
    icon: Clock,
    description: 'Đơn hàng đang chờ xác nhận'
  },
  { 
    key: 'deposit_pending', 
    label: 'Chờ đặt cọc', 
    icon: Wallet,
    description: 'Vui lòng thanh toán tiền cọc'
  },
  { 
    key: 'deposit_paid', 
    label: 'Đã đặt cọc', 
    icon: CheckCircle2,
    description: 'Đã nhận tiền cọc, đang chuẩn bị'
  },
  { 
    key: 'in_production', 
    label: 'Đang chăm sóc', 
    icon: Leaf,
    description: 'Sản phẩm đang được nuôi trồng'
  },
  { 
    key: 'quality_check', 
    label: 'Kiểm tra chất lượng', 
    icon: Sun,
    description: 'Đang kiểm tra chất lượng trước thu hoạch'
  },
  { 
    key: 'harvest_ready', 
    label: 'Sẵn sàng thu hoạch', 
    icon: Package,
    description: 'Sản phẩm sẵn sàng thu hoạch'
  },
  { 
    key: 'harvested', 
    label: 'Đã thu hoạch', 
    icon: Package,
    description: 'Đã thu hoạch, chuẩn bị giao hàng'
  },
  { 
    key: 'shipping', 
    label: 'Đang giao hàng', 
    icon: Truck,
    description: 'Đơn hàng đang trên đường giao'
  },
  { 
    key: 'delivered', 
    label: 'Đã giao hàng', 
    icon: CheckCircle2,
    description: 'Giao hàng thành công'
  }
];

// Map from order_status to display index
const STATUS_INDEX_MAP = {
  'pending': 0,
  'confirmed': 1,
  'deposit_pending': 1,
  'deposit_paid': 2,
  'processing': 3,
  'in_production': 3,
  'awaiting_harvest': 4,
  'quality_check': 4,
  'harvest_ready': 5,
  'harvested': 6,
  'partial_payment': 6,
  'shipping': 7,
  'delivered': 8,
  'cancelled': -1,
  'refunded': -2
};

function TimelineStep({ step, index, currentIndex, isLast, timestamp }) {
  const isCompleted = index < currentIndex;
  const isCurrent = index === currentIndex;
  const isPending = index > currentIndex;
  const Icon = step.icon;

  return (
    <div className="flex gap-4">
      {/* Vertical line and circle */}
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 ${
            isCompleted ? 'bg-green-500 border-green-500 text-white' :
            isCurrent ? 'bg-[#7CB342] border-[#7CB342] text-white' :
            'bg-gray-100 border-gray-300 text-gray-400'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5" />
          )}
        </motion.div>
        
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[40px] ${
            isCompleted ? 'bg-green-500' : 'bg-gray-200'
          }`} />
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`flex-1 pb-6 ${isPending ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center gap-2">
          <h4 className={`font-semibold ${
            isCurrent ? 'text-[#7CB342]' : 
            isCompleted ? 'text-green-600' : 'text-gray-500'
          }`}>
            {step.label}
          </h4>
          {isCurrent && (
            <span className="px-2 py-0.5 bg-[#7CB342]/10 text-[#7CB342] text-xs rounded-full">
              Hiện tại
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{step.description}</p>
        {timestamp && isCompleted && (
          <p className="text-xs text-gray-400 mt-1">
            {format(new Date(timestamp), 'HH:mm - dd/MM/yyyy', { locale: vi })}
          </p>
        )}
      </motion.div>
    </div>
  );
}

export default function OrderStatusTimeline({ 
  orderStatus,
  depositStatus,
  statusHistory = [],
  estimatedHarvestDate,
  variant = 'default', // default, compact, horizontal
  className = ''
}) {
  // Determine current status index
  let currentIndex = STATUS_INDEX_MAP[orderStatus] ?? 0;
  
  // Adjust for deposit status
  if (orderStatus === 'confirmed' && depositStatus === 'pending') {
    currentIndex = 1; // deposit_pending
  } else if (depositStatus === 'paid' && currentIndex < 2) {
    currentIndex = 2; // deposit_paid
  }

  // Handle cancelled/refunded
  if (orderStatus === 'cancelled' || orderStatus === 'refunded') {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-2xl p-6 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            {orderStatus === 'cancelled' ? (
              <Ban className="w-6 h-6 text-red-600" />
            ) : (
              <RefreshCw className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-red-800">
              {orderStatus === 'cancelled' ? 'Đơn hàng đã hủy' : 'Đã hoàn tiền'}
            </h3>
            <p className="text-sm text-red-600">
              {orderStatus === 'cancelled' 
                ? 'Đơn hàng này đã bị hủy bỏ'
                : 'Đã hoàn tiền cho đơn hàng này'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    const currentStep = PREORDER_STATUS_FLOW[currentIndex] || PREORDER_STATUS_FLOW[0];
    const Icon = currentStep.icon;
    const progress = ((currentIndex + 1) / PREORDER_STATUS_FLOW.length) * 100;

    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 ${className}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#7CB342]/10 rounded-full flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#7CB342]" />
          </div>
          <div>
            <p className="font-semibold text-gray-800">{currentStep.label}</p>
            <p className="text-xs text-gray-500">{currentStep.description}</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-gradient-to-r from-[#7CB342] to-[#558B2F] rounded-full"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-right">
          {currentIndex + 1}/{PREORDER_STATUS_FLOW.length} bước
        </p>
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-4 overflow-x-auto ${className}`}>
        <div className="flex items-center min-w-max">
          {PREORDER_STATUS_FLOW.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isCurrent ? 'bg-[#7CB342] text-white' :
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <p className={`text-xs mt-1 max-w-[80px] text-center ${
                    isCurrent ? 'text-[#7CB342] font-medium' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
                
                {index < PREORDER_STATUS_FLOW.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Default vertical timeline
  return (
    <div className={`bg-white border-2 border-gray-100 rounded-2xl p-6 ${className}`}>
      <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-[#7CB342]" />
        Tiến độ đơn hàng
      </h3>

      <div className="relative">
        {PREORDER_STATUS_FLOW.map((step, index) => {
          const historyEntry = statusHistory.find(h => h.status === step.key);
          
          return (
            <TimelineStep
              key={step.key}
              step={step}
              index={index}
              currentIndex={currentIndex}
              isLast={index === PREORDER_STATUS_FLOW.length - 1}
              timestamp={historyEntry?.timestamp}
            />
          );
        })}
      </div>

      {/* Estimated harvest info */}
      {estimatedHarvestDate && currentIndex < 5 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-amber-700">
            <AlertTriangle className="w-4 h-4" />
            <span>
              Thu hoạch dự kiến: <strong>
                {format(new Date(estimatedHarvestDate), 'dd/MM/yyyy', { locale: vi })}
              </strong>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Export status flow for use in other components
export { STATUS_INDEX_MAP };
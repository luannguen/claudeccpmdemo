/**
 * ResolutionSelector - UI cho khách chọn phương án giải quyết dispute
 * UI Layer
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, Gift, Coins, RefreshCw, 
  Truck, BadgePercent, Star, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RESOLUTION_TYPE } from '@/components/services/DisputeService';

const RESOLUTION_CONFIG = {
  [RESOLUTION_TYPE.FULL_REFUND]: {
    icon: RefreshCw,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500'
  },
  [RESOLUTION_TYPE.PARTIAL_REFUND]: {
    icon: RefreshCw,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500'
  },
  [RESOLUTION_TYPE.VOUCHER]: {
    icon: Gift,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500'
  },
  [RESOLUTION_TYPE.POINTS]: {
    icon: Coins,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-500'
  },
  [RESOLUTION_TYPE.SWAP_LOT]: {
    icon: RefreshCw,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-500'
  },
  [RESOLUTION_TYPE.RESHIP]: {
    icon: Truck,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-500'
  },
  [RESOLUTION_TYPE.DISCOUNT_NEXT_ORDER]: {
    icon: BadgePercent,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-500'
  },
  [RESOLUTION_TYPE.REPLACEMENT]: {
    icon: RefreshCw,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-500'
  }
};

export default function ResolutionSelector({
  options = [],
  ticketNumber,
  onSelect,
  isLoading = false
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [customerNote, setCustomerNote] = useState('');
  const [step, setStep] = useState('select'); // select | confirm

  const handleSelect = (option) => {
    setSelectedOption(option);
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    onSelect(selectedOption.option_id, customerNote);
  };

  if (options.length === 0) {
    return (
      <div className="text-center py-8">
        <RefreshCw className="w-10 h-10 text-gray-300 mx-auto mb-3 animate-spin" />
        <p className="text-gray-500">Đang chờ đề xuất phương án...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center pb-3 border-b">
        <h3 className="font-semibold text-gray-900">Chọn phương án giải quyết</h3>
        <p className="text-sm text-gray-500">Ticket #{ticketNumber}</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'select' ? (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {options.map((option) => {
              const config = RESOLUTION_CONFIG[option.type] || RESOLUTION_CONFIG[RESOLUTION_TYPE.VOUCHER];
              const Icon = config.icon;
              const isSelected = selectedOption?.option_id === option.option_id;

              return (
                <motion.button
                  key={option.option_id}
                  onClick={() => handleSelect(option)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? `${config.borderColor} ${config.bgColor}`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.bgColor}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {option.description}
                        </span>
                        {option.is_recommended && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Đề xuất
                          </Badge>
                        )}
                      </div>
                      {option.value > 0 && (
                        <p className={`text-sm font-semibold ${config.color} mt-1`}>
                          {option.type.includes('refund') 
                            ? `${option.value.toLocaleString()}đ` 
                            : option.type === 'points'
                              ? `+${option.value} điểm`
                              : `${option.value}%`
                          }
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle className={`w-5 h-5 ${config.color}`} />
                    )}
                  </div>
                </motion.button>
              );
            })}

            <Button
              onClick={() => setStep('confirm')}
              disabled={!selectedOption}
              className="w-full mt-4"
            >
              Tiếp tục
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Selected option summary */}
            {selectedOption && (
              <div className={`p-4 rounded-xl ${
                RESOLUTION_CONFIG[selectedOption.type]?.bgColor || 'bg-gray-50'
              }`}>
                <p className="text-sm text-gray-600 mb-1">Phương án đã chọn:</p>
                <p className="font-semibold text-gray-900">
                  {selectedOption.description}
                </p>
                {selectedOption.value > 0 && (
                  <p className={`text-lg font-bold ${
                    RESOLUTION_CONFIG[selectedOption.type]?.color || 'text-gray-900'
                  }`}>
                    {selectedOption.type.includes('refund') 
                      ? `${selectedOption.value.toLocaleString()}đ` 
                      : selectedOption.type === 'points'
                        ? `+${selectedOption.value} điểm`
                        : `${selectedOption.value}%`
                    }
                  </p>
                )}
              </div>
            )}

            {/* Note */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Ghi chú thêm (tùy chọn)
              </label>
              <Textarea
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                placeholder="Nhập ghi chú nếu có..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setStep('select')}
                className="flex-1"
              >
                Quay lại
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Sau khi xác nhận, phương án sẽ được áp dụng ngay.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
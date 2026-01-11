/**
 * PaymentStep - Step 3 of gift wizard
 * Show summary and payment options (NO COD)
 */

import React, { useState } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { DELIVERY_MODE_CONFIG, OCCASION_CONFIG } from '../../types';

const PAYMENT_METHODS = [
  {
    id: 'bank_transfer',
    label: 'Chuyển khoản',
    description: 'Quét QR để thanh toán',
    icon: 'CreditCard'
  },
  {
    id: 'momo',
    label: 'MoMo',
    description: 'Thanh toán qua ví MoMo',
    icon: 'Wallet'
  },
  {
    id: 'vnpay',
    label: 'VNPay',
    description: 'Thanh toán qua VNPay',
    icon: 'Banknote'
  }
];

export default function PaymentStep({ product, options, receiver, onBack, onSuccess, isProcessing }) {
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer');

  const price = product?.sale_price || product?.price || 0;
  const deliveryConfig = DELIVERY_MODE_CONFIG[options.delivery_mode];
  const occasionConfig = OCCASION_CONFIG[options.occasion];

  const handlePay = () => {
    onSuccess(selectedMethod);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-4">
        <h3 className="font-medium text-gray-900">Tóm tắt đơn quà</h3>
        
        {/* Product */}
        <div className="flex gap-3">
          <img
            src={product?.image_url}
            alt={product?.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{product?.name}</p>
            <p className="text-[#7CB342] font-bold">
              {price?.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 pt-3 border-t border-gray-200">
          <DetailRow
            label="Người nhận"
            value={receiver?.target_name}
            icon="User"
          />
          <DetailRow
            label="Hình thức gửi"
            value={deliveryConfig?.label}
            icon={deliveryConfig?.icon}
          />
          {options.delivery_mode === 'scheduled' && options.scheduled_delivery_date && (
            <DetailRow
              label="Ngày gửi"
              value={new Date(options.scheduled_delivery_date).toLocaleDateString('vi-VN')}
              icon="Calendar"
            />
          )}
          <DetailRow
            label="Dịp"
            value={`${occasionConfig?.emoji} ${occasionConfig?.label}`}
          />
          {options.message && (
            <div className="pt-2">
              <p className="text-sm text-gray-500 mb-1">Lời nhắn:</p>
              <p className="text-sm text-gray-700 italic">"{options.message}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Methods */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Phương thức thanh toán</h3>
        <div className="space-y-2">
          {PAYMENT_METHODS.map(method => {
            const MethodIcon = Icon[method.icon];
            const isSelected = selectedMethod === method.id;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedMethod(method.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? 'border-[#7CB342] bg-[#7CB342]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {MethodIcon && <MethodIcon size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{method.label}</p>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
                {isSelected && (
                  <Icon.CheckCircle size={20} className="text-[#7CB342]" />
                )}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          * Quà tặng không hỗ trợ thanh toán khi nhận hàng (COD)
        </p>
      </div>

      {/* Total & Pay */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-gray-600">Tổng thanh toán</span>
          <span className="text-2xl font-bold text-[#7CB342]">
            {price?.toLocaleString('vi-VN')}đ
          </span>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} disabled={isProcessing} className="flex-1">
            <Icon.ChevronLeft size={18} className="mr-1" />
            Quay lại
          </Button>
          <Button
            onClick={handlePay}
            disabled={isProcessing}
            className="flex-1 bg-[#7CB342] hover:bg-[#689F38]"
          >
            {isProcessing ? (
              <>
                <Icon.Spinner size={18} className="mr-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Icon.CreditCard size={18} className="mr-2" />
                Thanh toán
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, icon }) {
  const RowIcon = icon ? Icon[icon] : null;
  
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 flex items-center gap-2">
        {RowIcon && <RowIcon size={14} />}
        {label}
      </span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
import React from 'react';
import { CheckCircle, QrCode, Wallet, CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const ICON_MAP = {
  'QrCode': QrCode,
  'Wallet': Wallet,
  'CreditCard': CreditCard,
  'Smartphone': Smartphone
};

export default function PaymentMethodSelector({ 
  selected, 
  onSelect, 
  orderAmount = 0 
}) {
  const { data: paymentMethods = [], isLoading } = useQuery({
    queryKey: ['payment-methods-selector'],
    queryFn: async () => {
      try {
        const methods = await base44.entities.PaymentMethod.list('display_order', 50);
        return methods.filter(m => m.is_active);
      } catch (error) {
        console.log('No payment methods found, using defaults');
        return [];
      }
    },
    staleTime: 5 * 60 * 1000
  });

  // Filter by order amount
  const availableMethods = React.useMemo(() => {
    return paymentMethods.filter(m => {
      if (m.min_order_amount > 0 && orderAmount < m.min_order_amount) return false;
      if (m.max_order_amount > 0 && orderAmount > m.max_order_amount) return false;
      return true;
    });
  }, [paymentMethods, orderAmount]);

  // Auto-select default on mount
  React.useEffect(() => {
    if (availableMethods.length > 0 && !selected) {
      const defaultMethod = availableMethods.find(m => m.is_default) 
                         || availableMethods.find(m => m.is_recommended)
                         || availableMethods[0];
      onSelect(defaultMethod.method_id);
    }
  }, [availableMethods, selected, onSelect]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-xl h-24"></div>
        ))}
      </div>
    );
  }

  if (availableMethods.length === 0) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
        <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
        <p className="text-sm text-red-700 font-medium">
          Không có phương thức thanh toán khả dụng
        </p>
        <p className="text-xs text-red-600 mt-1">
          {orderAmount > 0 ? `Đơn hàng ${orderAmount.toLocaleString('vi-VN')}đ vượt giới hạn` : 'Vui lòng liên hệ admin'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {availableMethods.map((method) => {
        const IconComp = ICON_MAP[method.icon_name] || Wallet;
        const isSelected = selected === method.method_id;
        
        // Calculate fee
        let fee = 0;
        let feeText = '';
        if (method.fee_type === 'fixed' && method.fee > 0) {
          fee = method.fee;
          feeText = `+${fee.toLocaleString('vi-VN')}đ phí`;
        } else if (method.fee_type === 'percent' && method.fee_percent > 0) {
          fee = Math.round(orderAmount * (method.fee_percent / 100));
          feeText = `+${method.fee_percent}% (${fee.toLocaleString('vi-VN')}đ)`;
        }

        return (
          <button
            key={method.id}
            onClick={() => onSelect(method.method_id)}
            className={`w-full p-4 border-2 rounded-xl transition-all text-left ${
              isSelected 
                ? 'border-[#7CB342] bg-green-50 shadow-md ring-2 ring-[#7CB342]/20' 
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isSelected ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                <IconComp className="w-6 h-6" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">{method.method_name}</p>
                  {method.is_recommended && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      ⭐ Đề xuất
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">{method.description}</p>
                {feeText && (
                  <p className="text-xs text-orange-600 font-medium mt-1">{feeText}</p>
                )}
              </div>

              {isSelected && (
                <CheckCircle className="w-6 h-6 text-[#7CB342] flex-shrink-0" />
              )}
            </div>

            {/* Instructions */}
            {isSelected && method.instructions && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                  {method.instructions}
                </p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
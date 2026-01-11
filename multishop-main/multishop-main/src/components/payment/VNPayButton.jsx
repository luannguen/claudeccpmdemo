import React, { useState } from 'react';
import { CreditCard, Loader2, ExternalLink } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function VNPayButton({ 
  orderId, 
  amount, 
  orderInfo,
  onSuccess,
  onError,
  className = ''
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await base44.functions.invoke('paymentVNPay', {
        orderId,
        amount,
        orderInfo,
        returnUrl: `${window.location.origin}/payment/vnpay/callback`,
        ipAddr: '127.0.0.1'
      });

      if (response.data?.success && response.data?.paymentUrl) {
        // Redirect to VNPay
        window.location.href = response.data.paymentUrl;
      } else {
        throw new Error(response.data?.error || 'Không thể tạo link thanh toán');
      }
    } catch (error) {
      console.error('VNPay error:', error);
      onError?.(error.message);
      alert('❌ Lỗi VNPay: ' + error.message);
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isProcessing}
      className={`${className} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isProcessing ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Đang chuyển đến VNPay...
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          Thanh Toán VNPay
          <ExternalLink className="w-4 h-4" />
        </>
      )}
    </button>
  );
}
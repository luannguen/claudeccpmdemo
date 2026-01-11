import React from 'react';
import { CreditCard, Smartphone, AlertCircle, ArrowLeft } from 'lucide-react';
import VietQRDisplay from '@/components/payment/VietQRDisplay';
import VNPayButton from '@/components/payment/VNPayButton';
import MoMoButton from '@/components/payment/MoMoButton';

export default function CheckoutConfirmStep({
  paymentMethod,
  orderNumber,
  total,
  onPaymentConfirmed,
  onBack
}) {
  if (paymentMethod === 'bank_transfer') {
    return (
      <div className="space-y-4">
        <VietQRDisplay
          orderNumber={orderNumber}
          amount={total}
          onPaymentConfirmed={onPaymentConfirmed}
        />
        <BackButton onClick={onBack} />
      </div>
    );
  }

  if (paymentMethod === 'vnpay') {
    return (
      <VNPayPaymentSection
        orderNumber={orderNumber}
        total={total}
        onPaymentConfirmed={onPaymentConfirmed}
        onBack={onBack}
      />
    );
  }

  if (paymentMethod === 'momo') {
    return (
      <MoMoPaymentSection
        orderNumber={orderNumber}
        total={total}
        onPaymentConfirmed={onPaymentConfirmed}
        onBack={onBack}
      />
    );
  }

  // Fallback for unsupported methods
  return (
    <div className="text-center py-8">
      <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
      <p className="text-gray-600 mb-4">
        Phương thức thanh toán đang được phát triển
      </p>
      <button 
        onClick={onBack}
        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-300"
      >
        Chọn Phương Thức Khác
      </button>
    </div>
  );
}

function VNPayPaymentSection({ orderNumber, total, onPaymentConfirmed, onBack }) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
        <CreditCard className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Thanh Toán VNPay</h3>
        <p className="text-sm text-gray-600 mb-4">
          Bạn sẽ được chuyển đến cổng thanh toán VNPay
        </p>
        <VNPayButton
          orderId={orderNumber}
          amount={total}
          orderInfo={`Đơn hàng ${orderNumber}`}
          onSuccess={onPaymentConfirmed}
          onError={(err) => console.error('VNPay error:', err)}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        />
      </div>
      
      <BackButton onClick={onBack} />
    </div>
  );
}

function MoMoPaymentSection({ orderNumber, total, onPaymentConfirmed, onBack }) {
  return (
    <div className="space-y-4">
      <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-6 text-center">
        <Smartphone className="w-16 h-16 text-pink-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">Thanh Toán MoMo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Chọn cách thanh toán MoMo
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          <MoMoButton
            orderId={orderNumber}
            amount={total}
            orderInfo={`Đơn hàng ${orderNumber}`}
            showQR={true}
            onSuccess={onPaymentConfirmed}
            onError={(err) => console.error('MoMo error:', err)}
            className="bg-pink-600 text-white py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2 text-sm"
          />
          
          <MoMoButton
            orderId={orderNumber}
            amount={total}
            orderInfo={`Đơn hàng ${orderNumber}`}
            showQR={false}
            onSuccess={onPaymentConfirmed}
            onError={(err) => console.error('MoMo error:', err)}
            className="bg-pink-500 text-white py-3 rounded-xl font-bold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 text-sm"
          />
        </div>
      </div>
      
      <BackButton onClick={onBack} />
    </div>
  );
}

function BackButton({ onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
    >
      <ArrowLeft className="w-4 h-4" />
      Quay Lại
    </button>
  );
}
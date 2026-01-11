import React, { useState } from 'react';
import { Smartphone, Loader2, ExternalLink, QrCode } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function MoMoButton({ 
  orderId, 
  amount, 
  orderInfo,
  onSuccess,
  onError,
  showQR = false,
  className = ''
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await base44.functions.invoke('paymentMoMo', {
        orderId,
        amount,
        orderInfo,
        returnUrl: `${window.location.origin}/payment/momo/callback`,
        ipnUrl: `${window.location.origin}/api/payment/momo/ipn`
      });

      if (response.data?.success) {
        if (showQR && response.data?.qrCodeUrl) {
          // Show QR code modal
          setQrCodeUrl(response.data.qrCodeUrl);
          setShowQRModal(true);
          setIsProcessing(false);
        } else if (response.data?.payUrl) {
          // Redirect to MoMo
          window.location.href = response.data.payUrl;
        } else {
          throw new Error('Không nhận được payment URL');
        }
      } else {
        throw new Error(response.data?.error || 'MoMo API error');
      }
    } catch (error) {
      console.error('MoMo error:', error);
      onError?.(error.message);
      alert('❌ Lỗi MoMo: ' + error.message);
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className={`${className} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          <>
            <Smartphone className="w-5 h-5" />
            Thanh Toán MoMo
            {!showQR && <ExternalLink className="w-4 h-4" />}
            {showQR && <QrCode className="w-4 h-4" />}
          </>
        )}
      </button>

      {/* QR Code Modal */}
      {showQRModal && qrCodeUrl && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-center">Quét Mã QR MoMo</h3>
            <div className="bg-gray-100 rounded-xl p-4 mb-4">
              <img src={qrCodeUrl} alt="MoMo QR Code" className="w-full max-w-xs mx-auto" />
            </div>
            <p className="text-sm text-gray-600 text-center mb-4">
              Mở app MoMo, quét mã QR để thanh toán
            </p>
            <button
              onClick={() => {
                setShowQRModal(false);
                setQrCodeUrl(null);
              }}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-300"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  QrCode, Copy, Check, Info, CreditCard, Smartphone, 
  AlertCircle, CheckCircle, Clock, HelpCircle, Download
} from "lucide-react";

export default function PaymentQRCode({ 
  orderNumber, 
  amount, 
  bankAccount,
  onPaymentConfirmed 
}) {
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes

  // ✅ VietQR URL format
  const qrUrl = `https://img.vietqr.io/image/${bankAccount.bank_id}-${bankAccount.account_number}-compact2.jpg?amount=${amount}&addInfo=${orderNumber}&accountName=${encodeURIComponent(bankAccount.account_name)}`;

  // ✅ Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `payment-qr-${orderNumber}.jpg`;
    link.click();
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* ✅ Compact Header with Timer */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-3 sm:p-4 border-2 border-blue-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">Thanh Toán Chuyển Khoản</h3>
              <p className="text-xs text-gray-600">Quét mã QR để thanh toán</p>
            </div>
          </div>
          
          {timeRemaining > 0 ? (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border-2 border-orange-200 shadow-sm">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              <span className={`font-bold text-sm sm:text-base ${timeRemaining < 300 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          ) : (
            <div className="bg-red-100 px-3 py-1.5 rounded-full border-2 border-red-300">
              <span className="text-red-600 font-bold text-xs sm:text-sm">⏰ Hết hạn</span>
            </div>
          )}
        </div>

        {/* ✅ Compact Amount Display */}
        <div className="bg-white rounded-lg sm:rounded-xl p-3 border-2 border-blue-100">
          <p className="text-xs text-gray-600 mb-0.5">Số tiền cần thanh toán</p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">
            {amount.toLocaleString('vi-VN')}đ
          </p>
        </div>
      </div>

      {/* ✅ Compact QR Code Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-gray-200 shadow-lg">
        <div className="flex flex-col items-center">
          {/* ✅ Responsive QR Image */}
          <div className="relative mb-3">
            <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-gray-50 rounded-xl sm:rounded-2xl overflow-hidden border-4 border-blue-500 shadow-xl">
              <img
                src={qrUrl}
                alt="Payment QR Code"
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="256"%3E%3Crect fill="%23f3f4f6" width="256" height="256"/%3E%3Ctext x="50%25" y="50%25" font-size="14" text-anchor="middle" fill="%236b7280"%3EQR Code%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            
            {/* Bank Logo Badge */}
            <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-full border-2 border-blue-500 shadow-lg">
              <p className="text-xs font-bold text-blue-600">{bankAccount.bank_name}</p>
            </div>
          </div>

          {/* ✅ Compact Buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={downloadQR}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Tải mã QR</span>
              <span className="sm:hidden">Tải QR</span>
            </button>

            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-xs sm:text-sm font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {showInstructions ? 'Ẩn' : 'Hướng dẫn'}
            </button>
          </div>
        </div>

        {/* ✅ Compact Instructions */}
        <AnimatePresence>
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2 overflow-hidden"
            >
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-xs sm:text-sm">
                  <Smartphone className="w-4 h-4" />
                  Hướng Dẫn Thanh Toán
                </h4>
                <ol className="space-y-1.5 text-xs sm:text-sm text-blue-800">
                  <li className="flex gap-2">
                    <span className="font-bold min-w-5">1.</span>
                    <span>Mở app ngân hàng</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold min-w-5">2.</span>
                    <span>Chọn <strong>"Quét QR"</strong></span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold min-w-5">3.</span>
                    <span>Quét mã QR (thông tin tự động điền)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold min-w-5">4.</span>
                    <span>Xác nhận thanh toán</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold min-w-5">5.</span>
                    <span>Nhấn <strong>"Đã thanh toán"</strong> bên dưới</span>
                  </li>
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ✅ Compact Bank Details */}
      <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-3 sm:p-4 border-2 border-green-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-green-600" />
            Thông Tin Chuyển Khoản
          </h4>
          <span className="text-xs text-gray-600">(Nếu không quét được QR)</span>
        </div>
        
        <div className="space-y-2">
          {/* Bank Name */}
          <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-gray-200">
            <p className="text-xs text-gray-600 mb-0.5">Ngân hàng</p>
            <p className="font-bold text-sm text-gray-900">{bankAccount.bank_name}</p>
          </div>

          {/* Account Number */}
          <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-gray-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-600 mb-0.5">Số tài khoản</p>
                <p className="font-bold text-sm sm:text-base text-gray-900">{bankAccount.account_number}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankAccount.account_number, 'account')}
                className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
              >
                {copied === 'account' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Account Name */}
          <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-gray-200">
            <p className="text-xs text-gray-600 mb-0.5">Chủ tài khoản</p>
            <p className="font-bold text-sm text-gray-900">{bankAccount.account_name}</p>
          </div>

          {/* Amount */}
          <div className="bg-white rounded-lg p-2.5 sm:p-3 border border-gray-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-0.5">Số tiền</p>
                <p className="font-bold text-lg sm:text-xl text-green-600">{amount.toLocaleString('vi-VN')}đ</p>
              </div>
              <button
                onClick={() => copyToClipboard(amount.toString(), 'amount')}
                className="p-1.5 sm:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
              >
                {copied === 'amount' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Transfer Content - Highlighted */}
          <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-300">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-yellow-900">⚠️ Nội dung chuyển khoản (BẮT BUỘC)</p>
            </div>
            <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border-2 border-yellow-400">
              <p className="font-bold text-sm sm:text-base text-gray-900">{orderNumber}</p>
              <button
                onClick={() => copyToClipboard(orderNumber, 'content')}
                className="p-1.5 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors flex-shrink-0"
              >
                {copied === 'content' ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-yellow-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Compact Important Notes */}
      <div className="bg-red-50 rounded-lg sm:rounded-xl p-3 border-2 border-red-200">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-red-800 space-y-1">
            <p className="font-bold">⚠️ Lưu ý:</p>
            <ul className="space-y-0.5 ml-3 list-disc text-xs">
              <li>Chuyển <strong>ĐÚNG {amount.toLocaleString('vi-VN')}đ</strong></li>
              <li>Nội dung: <strong>{orderNumber}</strong></li>
              <li>Hiệu lực: <strong>15 phút</strong></li>
              <li>Nhấn <strong>"Đã thanh toán"</strong> sau khi chuyển</li>
            </ul>
          </div>
        </div>
      </div>

      {/* ✅ Payment Confirmation Button */}
      <button
        onClick={onPaymentConfirmed}
        disabled={timeRemaining === 0}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-[1.01] shadow-lg flex items-center justify-center gap-2"
      >
        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        {timeRemaining === 0 ? '⏰ Mã QR đã hết hạn' : '✅ Tôi Đã Thanh Toán'}
      </button>
    </div>
  );
}
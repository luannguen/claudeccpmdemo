import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function VietQRDisplay({ 
  orderNumber, 
  amount, 
  onPaymentConfirmed 
}) {
  const [qrCodeUrl, setQrCodeUrl] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const [bankInfo, setBankInfo] = React.useState(null);

  useEffect(() => {
    generateQR();
  }, [orderNumber, amount]);

  const generateQR = async () => {
    setIsLoading(true);
    try {
      // Get bank info from PaymentMethod
      const methods = await base44.entities.PaymentMethod.list('display_order', 50);
      const bankMethod = methods.find(m => m.method_id === 'bank_transfer');
      
      const bankCode = bankMethod?.payment_config?.bank_id || 'VCB';
      const accountNumber = bankMethod?.payment_config?.account_number || '1234567890';
      const accountName = bankMethod?.payment_config?.account_name || 'ZERO FARM';

      // Generate VietQR
      const response = await base44.functions.invoke('generateVietQR', {
        bankCode,
        accountNumber,
        accountName,
        amount,
        description: orderNumber
      });

      if (response.data?.success) {
        setQrCodeUrl(response.data.qrCodeUrl);
        setBankInfo(response.data.bankInfo);
      } else {
        throw new Error('Không thể tạo mã QR');
      }
    } catch (error) {
      console.error('QR generation error:', error);
      alert('Lỗi tạo mã QR: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyInfo = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* QR Code */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="w-12 h-12 text-[#7CB342] animate-spin" />
            <p className="text-sm text-gray-600">Đang tạo mã QR...</p>
          </div>
        ) : qrCodeUrl ? (
          <>
            <div className="bg-white rounded-xl p-4 inline-block mb-4 shadow-lg">
              <img src={qrCodeUrl} alt="VietQR Code" className="w-64 h-64 mx-auto" />
            </div>
            <p className="text-sm text-gray-700 font-medium mb-2">
              Quét mã QR bằng app ngân hàng
            </p>
            <button
              onClick={generateQR}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Làm mới QR
            </button>
          </>
        ) : (
          <div className="py-12">
            <QrCode className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Không thể tạo mã QR</p>
          </div>
        )}
      </div>

      {/* Bank Info */}
      {bankInfo && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4">
          <h4 className="font-bold mb-3 text-sm">Hoặc chuyển khoản thủ công:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Ngân hàng:</span>
              <span className="font-bold">{bankInfo.bankName}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Số TK:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold">{bankInfo.accountNumber}</span>
                <button
                  onClick={() => copyInfo(bankInfo.accountNumber)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Chủ TK:</span>
              <span className="font-bold">{bankInfo.accountName}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <span className="text-gray-600">Số tiền:</span>
              <span className="font-bold text-[#7CB342] text-lg">
                {amount?.toLocaleString('vi-VN')}đ
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg border border-blue-200">
              <span className="text-gray-600">Nội dung:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-blue-900">{orderNumber}</span>
                <button
                  onClick={() => copyInfo(orderNumber)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation */}
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
        <p className="text-sm text-green-800 mb-3 font-medium">
          ⚠️ <strong>LƯU Ý:</strong> Sau khi chuyển khoản thành công:
        </p>
        <ol className="text-sm text-green-700 space-y-1 ml-4 list-decimal">
          <li>Chụp màn hình giao dịch thành công</li>
          <li>Nhấn nút "Đã Thanh Toán" bên dưới</li>
          <li>Admin sẽ xác nhận trong vòng 5-10 phút</li>
        </ol>
      </div>

      {/* Confirm Button */}
      <button
        onClick={onPaymentConfirmed}
        className="w-full bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-4 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] transition-all shadow-lg flex items-center justify-center gap-2"
      >
        <Check className="w-5 h-5" />
        Tôi Đã Chuyển Khoản
      </button>
    </div>
  );
}
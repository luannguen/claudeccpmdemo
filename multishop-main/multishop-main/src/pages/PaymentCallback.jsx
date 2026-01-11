import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export default function PaymentCallback() {
  const [status, setStatus] = useState('processing'); // processing, success, failed
  const [message, setMessage] = useState('Đang xác minh thanh toán...');
  const [orderInfo, setOrderInfo] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const gateway = window.location.pathname.includes('vnpay') ? 'vnpay' : 'momo';

      // Convert URLSearchParams to object
      const params = {};
      for (const [key, value] of urlParams.entries()) {
        params[key] = value;
      }

      // Call verification function
      const response = await base44.functions.invoke(
        gateway === 'vnpay' ? 'paymentVNPay' : 'paymentMoMo',
        params
      );

      if (response.data?.success && response.data?.isSuccess) {
        setStatus('success');
        setMessage('Thanh toán thành công!');
        setOrderInfo({
          orderNumber: response.data.txnRef || response.data.orderId,
          amount: response.data.amount,
          transactionId: response.data.transactionNo || response.data.transId
        });

        // Clear cart
        localStorage.removeItem('zerofarm-cart');
        window.dispatchEvent(new Event('cart-cleared'));
        
        // ✅ REAL-TIME SYNC - Invalidate all order queries
        queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
        queryClient.invalidateQueries({ queryKey: ['my-orders-list'] });
        queryClient.invalidateQueries({ queryKey: ['user-orders-posts'] });
        
        console.log('✅ Payment success - All order queries invalidated for real-time sync');
      } else {
        setStatus('failed');
        setMessage(response.data?.message || 'Thanh toán thất bại');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
      setMessage('Có lỗi xảy ra khi xác minh thanh toán');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-12 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {status === 'processing' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Loader2 className="w-16 h-16 text-[#7CB342] animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Đang Xác Minh...</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-green-600">🎉 Thành Công!</h2>
            <p className="text-lg text-gray-700 mb-6">{message}</p>
            
            {orderInfo && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-gray-600 mb-2">Thông tin đơn hàng:</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Mã đơn:</span>
                    <span className="font-bold">#{orderInfo.orderNumber}</span>
                  </div>
                  {orderInfo.amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-bold text-[#7CB342]">
                        {orderInfo.amount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                  )}
                  {orderInfo.transactionId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mã GD:</span>
                      <span className="font-mono text-xs">{orderInfo.transactionId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to={createPageUrl('MyOrders')}
                className="block w-full bg-[#7CB342] text-white py-3 rounded-xl font-bold hover:bg-[#FF9800] transition-colors"
              >
                Xem Đơn Hàng
              </Link>
              <Link
                to={createPageUrl('Services')}
                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Tiếp Tục Mua Sắm
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-red-600">Thất Bại</h2>
            <p className="text-lg text-gray-700 mb-6">{message}</p>
            
            <div className="space-y-3">
              <button
                onClick={verifyPayment}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Thử Lại
              </button>
              <Link
                to={createPageUrl('Services')}
                className="block w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Quay Lại
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
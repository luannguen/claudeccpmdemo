import React from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

export default function PaymentStatusCards({ byPaymentStatus }) {
  if (!byPaymentStatus) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h3 className="text-lg font-bold mb-4">Trạng Thái Thanh Toán</h3>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600">
                {byPaymentStatus?.paid?.count || 0}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {((byPaymentStatus?.paid?.revenue || 0) / 1000000).toFixed(2)}M VNĐ
          </p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Chờ xử lý</p>
              <p className="text-2xl font-bold text-yellow-600">
                {byPaymentStatus?.pending?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-sm text-gray-600">Thất bại</p>
              <p className="text-2xl font-bold text-red-600">
                {byPaymentStatus?.failed?.count || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
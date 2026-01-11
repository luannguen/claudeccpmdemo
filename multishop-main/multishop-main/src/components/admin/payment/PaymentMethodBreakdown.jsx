import React from 'react';
import { PAYMENT_METHOD_ICONS, PAYMENT_METHOD_LABELS } from '@/components/hooks/useAdminPaymentAnalytics';
import { Wallet } from 'lucide-react';

export default function PaymentMethodBreakdown({ byPaymentMethod }) {
  if (!byPaymentMethod) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <h3 className="text-lg font-bold mb-4">Chi Tiết Theo Phương Thức</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(byPaymentMethod).map(([method, data]) => {
          const IconComp = PAYMENT_METHOD_ICONS[method] || Wallet;
          return (
            <div key={method} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <IconComp className="w-5 h-5 text-[#7CB342]" />
                </div>
                <h4 className="font-bold text-sm">
                  {PAYMENT_METHOD_LABELS[method] || method}
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Đơn hàng:</span>
                  <span className="font-bold">{data.count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Thành công:</span>
                  <span className="font-bold text-green-600">{data.paid_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Doanh thu:</span>
                  <span className="font-bold text-[#7CB342]">
                    {((data.revenue || 0) / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Tỷ lệ:</span>
                  <span className="font-bold">
                    {data.count > 0 ? ((data.paid_count / data.count) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
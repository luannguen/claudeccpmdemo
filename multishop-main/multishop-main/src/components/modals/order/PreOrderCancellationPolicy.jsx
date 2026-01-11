import React from 'react';
import { AlertTriangle, Calendar, Clock, DollarSign, Info, CheckCircle, XCircle } from 'lucide-react';
import { PREORDER_CANCELLATION_POLICY } from '@/components/services/PreOrderCancellationService';

/**
 * Component hiển thị chính sách hủy đơn preorder
 * + Tính toán refund dựa trên ngày thu hoạch
 */
export default function PreOrderCancellationPolicy({ order, refundCalc }) {
  if (!order?.has_preorder_items || !refundCalc) return null;

  const { daysBeforeHarvest, refundPercentage, refundAmount, penaltyAmount, depositAmount, policy } = refundCalc;

  return (
    <div className="space-y-4">
      {/* Policy Info Banner */}
      <div className={`rounded-xl p-4 border-2 ${
        refundPercentage === 100 ? 'bg-green-50 border-green-200' :
        refundPercentage > 0 ? 'bg-amber-50 border-amber-200' :
        'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-3">
          {refundPercentage === 100 ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : refundPercentage > 0 ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`font-bold mb-1 ${
              refundPercentage === 100 ? 'text-green-900' :
              refundPercentage > 0 ? 'text-amber-900' :
              'text-red-900'
            }`}>
              {policy?.label || 'Chính Sách Hủy Đơn'}
            </p>
            <p className={`text-sm ${
              refundPercentage === 100 ? 'text-green-700' :
              refundPercentage > 0 ? 'text-amber-700' :
              'text-red-700'
            }`}>
              {policy?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Harvest Date Info */}
      <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
        <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-900">
            <span className="font-medium">Ngày thu hoạch dự kiến:</span>{' '}
            {order.items?.find(i => i.estimated_harvest_date)?.estimated_harvest_date 
              ? new Date(order.items.find(i => i.estimated_harvest_date).estimated_harvest_date).toLocaleDateString('vi-VN')
              : 'Chưa xác định'
            }
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            Còn <strong>{daysBeforeHarvest}</strong> ngày trước thu hoạch
          </p>
        </div>
      </div>

      {/* Refund Calculation */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <DollarSign className="w-4 h-4" />
          Chi tiết hoàn tiền
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Tiền cọc đã đóng:</span>
            <span className="font-medium">{depositAmount.toLocaleString('vi-VN')}đ</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tỷ lệ hoàn:</span>
            <span className={`font-bold ${refundPercentage === 100 ? 'text-green-600' : refundPercentage > 0 ? 'text-amber-600' : 'text-red-600'}`}>
              {refundPercentage}%
            </span>
          </div>
          
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Số tiền được hoàn:</span>
              <span className="font-bold text-green-600">{refundAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            {penaltyAmount > 0 && (
              <div className="flex justify-between mt-1">
                <span className="text-gray-600">Phí xử lý:</span>
                <span className="font-medium text-red-600">-{penaltyAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Policy Tiers Reference */}
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Bảng chính sách hoàn cọc</span>
        </div>
        <div className="divide-y">
          {Object.entries(PREORDER_CANCELLATION_POLICY).map(([key, tier]) => {
            const isCurrentTier = refundCalc.policyTier === key;
            return (
              <div 
                key={key} 
                className={`px-4 py-2 flex justify-between items-center text-sm ${
                  isCurrentTier ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCurrentTier && <Clock className="w-4 h-4 text-blue-600" />}
                  <span className={isCurrentTier ? 'font-medium text-blue-900' : 'text-gray-700'}>
                    {tier.label}
                  </span>
                </div>
                <span className={`font-bold ${
                  tier.refund_percentage === 100 ? 'text-green-600' :
                  tier.refund_percentage > 0 ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  Hoàn {tier.refund_percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
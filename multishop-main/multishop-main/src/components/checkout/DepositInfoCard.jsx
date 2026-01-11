import React from "react";
import { AlertTriangle, Calendar, Wallet, Info, CheckCircle } from "lucide-react";

/**
 * DepositInfoCard - Hiển thị thông tin cọc cho Pre-Order
 * 
 * Props:
 * - depositAmount: number - Số tiền cọc
 * - remainingAmount: number - Số tiền còn lại
 * - depositPercentage: number - % cọc
 * - estimatedHarvestDate: string - Ngày thu hoạch dự kiến
 * - hasPreorderItems: boolean - Có sản phẩm preorder không
 */
export default function DepositInfoCard({
  depositAmount = 0,
  remainingAmount = 0,
  depositPercentage = 100,
  estimatedHarvestDate,
  hasPreorderItems = false
}) {
  if (!hasPreorderItems) return null;

  const isFullPayment = depositPercentage >= 100;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-amber-900">
            {isFullPayment ? '🎯 Thanh Toán Trước 100%' : '💰 Thanh Toán Đặt Cọc'}
          </h3>
          <p className="text-sm text-amber-700">
            Đơn hàng chứa sản phẩm bán trước (Pre-Order)
          </p>
        </div>
      </div>

      {/* Deposit Info */}
      {!isFullPayment && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Cọc ngay ({depositPercentage}%)</p>
            <p className="text-xl font-bold text-amber-600">
              {depositAmount.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <div className="bg-white/70 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Còn lại khi nhận</p>
            <p className="text-xl font-bold text-gray-700">
              {remainingAmount.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </div>
      )}

      {/* Harvest Date */}
      {estimatedHarvestDate && (
        <div className="flex items-center gap-2 bg-white/70 rounded-xl p-3">
          <Calendar className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Ngày giao hàng dự kiến</p>
            <p className="font-medium text-green-700">
              {new Date(estimatedHarvestDate).toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl p-3">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800">
          {isFullPayment ? (
            <span>
              <strong>Thanh toán 100%</strong> - Bạn sẽ được thông báo khi sản phẩm sẵn sàng giao.
            </span>
          ) : (
            <span>
              <strong>Đặt cọc {depositPercentage}%</strong> - Bạn sẽ thanh toán phần còn lại khi nhận hàng.
              Chúng tôi sẽ liên hệ trước ngày thu hoạch.
            </span>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-amber-800">✨ Lợi ích đặt trước:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-green-700">
            <CheckCircle className="w-3.5 h-3.5" />
            Giá tốt hơn thị trường
          </div>
          <div className="flex items-center gap-1.5 text-green-700">
            <CheckCircle className="w-3.5 h-3.5" />
            Đảm bảo nguồn hàng
          </div>
          <div className="flex items-center gap-1.5 text-green-700">
            <CheckCircle className="w-3.5 h-3.5" />
            Sản phẩm tươi nhất
          </div>
          <div className="flex items-center gap-1.5 text-green-700">
            <CheckCircle className="w-3.5 h-3.5" />
            Ưu tiên giao hàng
          </div>
        </div>
      </div>
    </div>
  );
}
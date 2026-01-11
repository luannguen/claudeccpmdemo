import React from "react";
import { Wallet, CreditCard, Truck } from "lucide-react";

/**
 * DepositSummary - Tóm tắt thanh toán với deposit
 * 
 * Props:
 * - subtotal: number
 * - shippingFee: number
 * - discount: number
 * - total: number
 * - depositAmount: number
 * - remainingAmount: number
 * - hasPreorderItems: boolean
 * - depositPercentage: number
 */
export default function DepositSummary({
  subtotal = 0,
  shippingFee = 0,
  discount = 0,
  total = 0,
  depositAmount = 0,
  remainingAmount = 0,
  hasPreorderItems = false,
  depositPercentage = 100
}) {
  const isFullPayment = depositPercentage >= 100 || !hasPreorderItems;
  const amountToPay = hasPreorderItems && !isFullPayment ? depositAmount : total;

  return (
    <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
      {/* Basic Summary */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tạm tính</span>
          <span>{subtotal.toLocaleString('vi-VN')}đ</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 flex items-center gap-1">
            <Truck className="w-4 h-4" />
            Phí vận chuyển
          </span>
          <span className={shippingFee === 0 ? 'text-green-600 font-medium' : ''}>
            {shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}
          </span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Giảm giá</span>
            <span className="text-green-600">-{discount.toLocaleString('vi-VN')}đ</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-3">
        <div className="flex justify-between font-bold">
          <span>Tổng đơn hàng</span>
          <span className="text-lg">{total.toLocaleString('vi-VN')}đ</span>
        </div>
      </div>

      {/* Deposit Section for PreOrder */}
      {hasPreorderItems && !isFullPayment && (
        <>
          <div className="border-t-2 border-dashed border-amber-300 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-amber-700 font-medium flex items-center gap-1">
                <Wallet className="w-4 h-4" />
                Đặt cọc ({depositPercentage}%)
              </span>
              <span className="font-bold text-amber-600">
                {depositAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Còn lại khi nhận hàng</span>
              <span className="text-gray-600">
                {remainingAmount.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          {/* Amount to pay now */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-4 text-center">
            <p className="text-sm opacity-90 mb-1">Thanh toán ngay</p>
            <p className="text-2xl font-bold">
              {amountToPay.toLocaleString('vi-VN')}đ
            </p>
          </div>
        </>
      )}

      {/* Full Payment Display */}
      {(isFullPayment || !hasPreorderItems) && (
        <div className="bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white rounded-xl p-4 text-center">
          <p className="text-sm opacity-90 mb-1 flex items-center justify-center gap-1">
            <CreditCard className="w-4 h-4" />
            Thanh toán
          </p>
          <p className="text-2xl font-bold">
            {total.toLocaleString('vi-VN')}đ
          </p>
        </div>
      )}
    </div>
  );
}
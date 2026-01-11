/**
 * PaymentStep - Payment method selection step
 * UI Layer - Presentation only
 */

import React from 'react';
import { Package, ArrowLeft, ArrowRight, Wallet } from 'lucide-react';
import PaymentMethodSelector from '@/components/PaymentMethodSelector';
import DepositInfoCard from '@/components/checkout/DepositInfoCard';

export default function PaymentStep({
  cartItems,
  calculations,
  paymentMethod,
  setPaymentMethod,
  isSubmitting,
  onBack,
  onSubmit
}) {
  const { 
    subtotal, 
    shippingFee, 
    discount, 
    total,
    hasPreorderItems,
    depositAmount,
    remainingAmount,
    depositPercentage,
    estimatedHarvestDate,
    hasDeposit
  } = calculations;

  const amountToPay = hasPreorderItems && hasDeposit ? depositAmount : total;

  return (
    <div className="space-y-3">
      {/* Deposit Info for Pre-Order */}
      {hasPreorderItems && (
        <DepositInfoCard
          depositAmount={depositAmount}
          remainingAmount={remainingAmount}
          depositPercentage={depositPercentage}
          estimatedHarvestDate={estimatedHarvestDate}
          hasPreorderItems={hasPreorderItems}
        />
      )}

      {/* Compact Order Summary */}
      <OrderSummaryCompact 
        itemCount={cartItems.length}
        subtotal={subtotal}
        shippingFee={shippingFee}
        discount={discount}
        total={total}
        hasPreorderItems={hasPreorderItems}
        depositAmount={depositAmount}
        remainingAmount={remainingAmount}
        hasDeposit={hasDeposit}
        amountToPay={amountToPay}
      />

      {/* Payment Method Selector */}
      <div>
        <h4 className="font-bold text-xs sm:text-sm text-gray-700 mb-2">
          Phương thức thanh toán:
        </h4>
        <PaymentMethodSelector
          selected={paymentMethod}
          onSelect={setPaymentMethod}
          orderAmount={total}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 sm:gap-3 pt-1">
        <button 
          onClick={onBack}
          className="flex-1 border-2 border-gray-300 text-gray-700 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Quay Lại</span>
          <span className="sm:hidden">Lại</span>
        </button>
        <button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-[2] bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm hover:from-[#FF9800] hover:to-[#ff6b00] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Đang xử lý...</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">Xác Nhận Đơn Hàng</span>
              <span className="sm:hidden">Xác Nhận</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function OrderSummaryCompact({ 
  itemCount, 
  subtotal, 
  shippingFee, 
  discount, 
  total,
  hasPreorderItems = false,
  depositAmount = 0,
  remainingAmount = 0,
  hasDeposit = false,
  amountToPay = 0
}) {
  return (
    <div className={`${hasDeposit ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-[#7CB342] to-[#5a8f31]'} text-white rounded-xl p-3 sm:p-4 shadow-lg`}>
      <div className="flex items-center gap-2 mb-2">
        {hasDeposit ? <Wallet className="w-4 h-4" /> : <Package className="w-4 h-4" />}
        <h4 className="font-bold text-sm">
          {hasDeposit ? 'Thanh Toán Đặt Cọc' : 'Tóm Tắt Đơn Hàng'}
        </h4>
      </div>
      <div className="space-y-1 text-xs sm:text-sm">
        <div className="flex justify-between opacity-90">
          <span>{itemCount} sản phẩm:</span>
          <span className="font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
        </div>
        <div className="flex justify-between opacity-90">
          <span>Phí ship:</span>
          <span className="font-medium">
            {shippingFee > 0 ? `${shippingFee.toLocaleString('vi-VN')}đ` : 'Miễn phí ✨'}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-yellow-300">
            <span>Giảm giá:</span>
            <span className="font-medium">-{discount.toLocaleString('vi-VN')}đ</span>
          </div>
        )}
        <div className="flex justify-between pt-1.5 border-t border-white/30 opacity-90">
          <span>Tổng đơn hàng:</span>
          <span>{total.toLocaleString('vi-VN')}đ</span>
        </div>
        
        {hasDeposit && (
          <>
            <div className="flex justify-between pt-1 border-t border-white/20">
              <span className="opacity-75">Còn lại khi nhận:</span>
              <span className="opacity-75">{remainingAmount.toLocaleString('vi-VN')}đ</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-white/30 text-base sm:text-lg font-bold">
              <span>💰 Thanh toán ngay:</span>
              <span>{amountToPay.toLocaleString('vi-VN')}đ</span>
            </div>
          </>
        )}
        
        {!hasDeposit && (
          <div className="flex justify-between pt-1.5 border-t border-white/30 text-base sm:text-lg font-bold">
            <span>Tổng:</span>
            <span>{total.toLocaleString('vi-VN')}đ</span>
          </div>
        )}
      </div>
    </div>
  );
}
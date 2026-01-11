import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import CheckoutCartSection from './CheckoutCartSection';
import CheckoutCustomerFormEnhanced from './CheckoutCustomerFormEnhanced';

export default function CheckoutCartStep({
  cartItems,
  calculations,
  checkoutForm,
  currentUser,
  saveInfo,
  setSaveInfo,
  onUpdateQuantity,
  onRemoveItem,
  onNext
}) {
  const { subtotal, shippingFee, discount, total } = calculations;
  const hasItems = cartItems && cartItems.length > 0;

  return (
    <div className="space-y-4">
      {/* Empty Cart Warning */}
      {!hasItems && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <Icon.AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-900">Giỏ hàng trống!</p>
            <p className="text-sm text-red-700">Vui lòng thêm sản phẩm.</p>
          </div>
        </div>
      )}

      {/* Cart Items Section */}
      <CheckoutCartSection
        cartItems={cartItems}
        subtotal={subtotal}
        shippingFee={shippingFee}
        discount={discount}
        total={total}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveItem={onRemoveItem}
      />

      {/* Customer Info Form */}
      <CheckoutCustomerFormEnhanced
        formData={checkoutForm.formData}
        errors={checkoutForm.errors}
        touched={checkoutForm.touched}
        checkingPhone={checkoutForm.checkingPhone}
        checkingEmail={checkoutForm.checkingEmail}
        handleChange={checkoutForm.handleChange}
        handleBlur={checkoutForm.handleBlur}
        completionRate={checkoutForm.completionRate}
        currentUser={currentUser}
        saveInfo={saveInfo}
        setSaveInfo={setSaveInfo}
      />

      {/* Action Button */}
      <button 
        onClick={onNext}
        disabled={!hasItems || !checkoutForm.isValid || checkoutForm.checkingPhone || checkoutForm.checkingEmail}
        className="w-full bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-3.5 rounded-xl font-bold text-base hover:from-[#FF9800] hover:to-[#ff6b00] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        Tiếp Theo - Chọn Thanh Toán
        <Icon.ArrowRight size={20} />
      </button>
    </div>
  );
}
/**
 * CheckoutModal - Main checkout modal component
 * UI Layer - Orchestrates checkout UI
 * 
 * @module features/checkout/ui/CheckoutModal
 */

import React from 'react';
import EnhancedModal from '@/components/EnhancedModal';
import { useCheckout } from '../hooks';
import CheckoutStepIndicator from '@/components/modals/checkout/CheckoutStepIndicator';
import ReferralCodeSection from '@/components/modals/checkout/ReferralCodeSection';
import { CartStep, PaymentStep, ConfirmStep, SuccessView } from './steps';
import { CHECKOUT_STEPS } from '../types/CheckoutDTO';

/**
 * CheckoutModal - Modal thanh toán đơn hàng
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 * @param {Array} props.cartItems - Initial cart items
 */
export default function CheckoutModal({ isOpen, onClose, cartItems: initialCartItems }) {
  const checkout = useCheckout(isOpen, initialCartItems);

  const {
    // State
    step,
    cartItems,
    paymentMethod,
    setPaymentMethod,
    isSubmitting,
    orderSuccess,
    saveInfo,
    setSaveInfo,
    createdOrderId,
    createdOrder,
    orderNumber,
    showOrderDetail,
    setShowOrderDetail,
    currentUser,
    calculations,
    checkoutForm,
    
    // Referral
    referralCheckout,
    
    // Actions
    updateQuantity,
    removeItem,
    validateAndProceed,
    createOrder,
    confirmPayment,
    goBack,
    
    // Helpers
    getTitle
  } = checkout;

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      maxWidth="4xl"
      persistPosition={false}
      positionKey="checkout-modal"
      zIndex={100}
      mobileFixed={true}
      enableDrag={false}
    >
      <div className="p-3 sm:p-4 md:p-6">
        {/* Step Indicator */}
        <CheckoutStepIndicator currentStep={step} />

        {/* Step 1: Cart & Customer Info */}
        {step === CHECKOUT_STEPS.CART_INFO && (
          <>
            <CartStep
              cartItems={cartItems}
              calculations={calculations}
              checkoutForm={checkoutForm}
              currentUser={currentUser}
              saveInfo={saveInfo}
              setSaveInfo={setSaveInfo}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onNext={validateAndProceed}
            />
            
            {/* Referral Code Section */}
            <div className="mt-4">
              <ReferralCodeSection
                referralCode={referralCheckout.referralCode}
                referrer={referralCheckout.referrer}
                onApplyCustomCode={referralCheckout.applyCustomCode}
                onRemove={referralCheckout.removeReferralCode}
                isValidating={referralCheckout.isValidating}
              />
            </div>
          </>
        )}

        {/* Step 2: Payment Method */}
        {step === CHECKOUT_STEPS.PAYMENT && (
          <PaymentStep
            cartItems={cartItems}
            calculations={calculations}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            isSubmitting={isSubmitting}
            onBack={goBack}
            onSubmit={createOrder}
          />
        )}

        {/* Step 3: Payment Confirmation */}
        {step === CHECKOUT_STEPS.CONFIRM && (
          <ConfirmStep
            paymentMethod={paymentMethod}
            orderNumber={orderNumber}
            total={calculations.total}
            onPaymentConfirmed={() => confirmPayment(createdOrderId)}
            onBack={goBack}
          />
        )}

        {/* Step 4: Success */}
        {step === CHECKOUT_STEPS.SUCCESS && orderSuccess && (
          <SuccessView
            orderNumber={orderNumber}
            createdOrder={createdOrder}
            showOrderDetail={showOrderDetail}
            setShowOrderDetail={setShowOrderDetail}
            onClose={onClose}
          />
        )}
      </div>
    </EnhancedModal>
  );
}
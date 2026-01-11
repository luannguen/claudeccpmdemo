/**
 * useCheckout - Main orchestrator hook
 * Hooks Layer - Orchestrates all checkout functionality
 * 
 * @module features/checkout/hooks/useCheckout
 */

import { useCallback } from 'react';
import { useCheckoutState } from './useCheckoutState';
import { useCheckoutCart } from './useCheckoutCart';
import { useCheckoutForm } from './useCheckoutForm';
import { useCheckoutOrder } from './useCheckoutOrder';
import { useCheckoutCalculations } from './useCheckoutCalculations';
import { useCheckoutData } from './useCheckoutData';
import { useReferralCheckout } from '@/components/hooks/useReferralCheckout';
import { useToast } from '@/components/NotificationToast';
import { checkoutRules, cartHelpers } from '../domain';
import { CHECKOUT_STEPS, PAYMENT_METHODS } from '../types/CheckoutDTO';

/**
 * Main checkout hook - orchestrates all sub-hooks
 * @param {boolean} isOpen - Modal open state
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} initialCartItems - Initial cart items
 * @returns {Object} Complete checkout state and actions
 */
export function useCheckout(isOpen, initialCartItems) {
  const { addToast } = useToast();
  
  // Data fetching
  const checkoutData = useCheckoutData();
  const { user: currentUser, customer: existingCustomer } = checkoutData;
  
  // State management
  const state = useCheckoutState(isOpen, initialCartItems);
  
  // Cart operations
  const cartActions = useCheckoutCart(state.cartItems, state.setCartItems);
  
  // Form management with profile data
  const checkoutForm = useCheckoutForm({
    initialData: {
      name: currentUser?.full_name || '',
      email: currentUser?.email || ''
    },
    existingCustomer
  });
  
  // Calculations
  const calculations = useCheckoutCalculations(state.cartItems);
  
  // Order creation
  const orderActions = useCheckoutOrder();
  
  // Referral handling
  const referralCheckout = useReferralCheckout();

  /**
   * Validate and proceed to payment step
   */
  const validateAndProceed = useCallback(async () => {
    // Validate form
    const isValid = checkoutForm.validateAll();
    if (!isValid) {
      addToast('Vui lòng điền đầy đủ thông tin hợp lệ', 'warning');
      return false;
    }

    // Validate cart
    try {
      await orderActions.validateCartWithLots(state.cartItems, calculations.total);
    } catch (error) {
      addToast(error.message, 'error');
      return false;
    }

    state.setStep(CHECKOUT_STEPS.PAYMENT);
    return true;
  }, [checkoutForm, orderActions, state, calculations.total, addToast]);

  /**
   * Create order
   */
  const createOrder = useCallback(async () => {
    // Re-validate
    const isValid = checkoutForm.validateAll();
    if (!isValid) {
      addToast('Vui lòng điền đầy đủ thông tin hợp lệ', 'warning');
      return;
    }

    state.setIsSubmitting(true);

    try {
      // Map form data to customer info
      const customerInfo = {
        name: checkoutForm.formData.name,
        email: checkoutForm.formData.email,
        phone: checkoutForm.formData.phone,
        city: checkoutForm.formData.city,
        district: checkoutForm.formData.district,
        ward: checkoutForm.formData.ward,
        address: checkoutForm.formData.address,
        note: checkoutForm.formData.note,
        referral_code: referralCheckout.referralCode
      };

      const { order, orderNumber } = await orderActions.createOrder({
        cartItems: state.cartItems,
        customerInfo,
        paymentMethod: state.paymentMethod,
        calculations,
        hasPreorderItems: calculations.hasPreorderItems,
        saveCustomer: state.saveInfo,
        existingCustomer
      });

      // Store order info
      state.completeOrder(order, orderNumber);

      // Send notifications
      console.log('📤 [useCheckout] Sending notifications for order:', orderNumber);
      try {
        await orderActions.sendNotifications(order, customerInfo, state.paymentMethod);
        console.log('✅ [useCheckout] Notifications sent successfully');
      } catch (notifyError) {
        console.error('⚠️ [useCheckout] Notification error (non-blocking):', notifyError);
        // Don't throw - notification failure shouldn't block order success
      }

      // Invalidate queries
      orderActions.invalidateQueries();

      // Navigate based on payment method
      if (state.paymentMethod === PAYMENT_METHODS.COD) {
        state.setOrderSuccess(true);
        state.setStep(CHECKOUT_STEPS.SUCCESS);
        cartHelpers.clearCart();
        addToast('Đặt hàng thành công!', 'success');
      } else {
        state.setStep(CHECKOUT_STEPS.CONFIRM);
      }
    } catch (error) {
      console.error('Order error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Có lỗi xảy ra';

      if (errorMessage.includes('chỉ còn') || errorMessage.includes('không còn')) {
        addToast(`${errorMessage}. Vui lòng kiểm tra lại giỏ hàng.`, 'warning');
        orderActions.invalidateQueries();
        state.setStep(CHECKOUT_STEPS.CART_INFO);
      } else {
        addToast(errorMessage, 'error');
      }
    } finally {
      state.setIsSubmitting(false);
    }
  }, [
    checkoutForm, state, calculations, referralCheckout, 
    orderActions, existingCustomer, addToast
  ]);

  /**
   * Confirm payment (for bank transfer)
   */
  const confirmPayment = useCallback(async () => {
    try {
      await orderActions.confirmPayment(state.createdOrderId);
      state.setOrderSuccess(true);
      state.setStep(CHECKOUT_STEPS.SUCCESS);
      cartHelpers.clearCart();
      orderActions.invalidateQueries();
      addToast('Thanh toán thành công!', 'success');
    } catch (error) {
      console.error('Payment error:', error);
      addToast(error.message || 'Có lỗi xảy ra', 'error');
    }
  }, [state, orderActions, addToast]);

  /**
   * Get step title
   */
  const getTitle = useCallback(() => {
    return checkoutRules.getStepTitle(state.step);
  }, [state.step]);

  return {
    // State
    ...state,
    currentUser,
    existingCustomer,
    calculations,
    
    // Form
    checkoutForm,
    
    // Referral
    referralCheckout,
    
    // Cart actions
    updateQuantity: cartActions.updateQuantity,
    removeItem: cartActions.removeItem,
    
    // Order actions
    validateAndProceed,
    createOrder,
    confirmPayment,
    goBack: state.prevStep,
    
    // Helpers
    getTitle
  };
}

export default useCheckout;
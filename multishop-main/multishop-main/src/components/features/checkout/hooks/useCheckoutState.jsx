/**
 * useCheckoutState - State management hook
 * Hooks Layer - Single Goal: State only
 * 
 * @module features/checkout/hooks/useCheckoutState
 */

import { useState, useEffect, useCallback } from 'react';
import { CHECKOUT_STEPS, PAYMENT_METHODS } from '../types/CheckoutDTO';

/**
 * Manage checkout modal state
 * @param {boolean} isOpen - Modal open state
 * @param {import('../types/CheckoutDTO').CartItemDTO[]} initialCartItems - Initial cart items
 * @returns {Object} State and setters
 */
export function useCheckoutState(isOpen, initialCartItems) {
  const [step, setStep] = useState(CHECKOUT_STEPS.CART_INFO);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.BANK_TRANSFER);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [saveInfo, setSaveInfo] = useState(true);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Load cart items when modal opens
  useEffect(() => {
    if (isOpen && initialCartItems) {
      setCartItems(initialCartItems);
    }
  }, [isOpen, initialCartItems]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(CHECKOUT_STEPS.CART_INFO);
      setOrderSuccess(false);
      setCreatedOrderId(null);
      setCreatedOrder(null);
      setOrderNumber('');
      setIsSubmitting(false);
      setShowOrderDetail(false);
    }
  }, [isOpen]);

  // Step navigation helpers
  const nextStep = useCallback(() => {
    setStep(prev => Math.min(CHECKOUT_STEPS.SUCCESS, prev + 1));
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(CHECKOUT_STEPS.CART_INFO, prev - 1));
    setIsSubmitting(false);
  }, []);

  const goToStep = useCallback((targetStep) => {
    if (targetStep >= CHECKOUT_STEPS.CART_INFO && targetStep <= CHECKOUT_STEPS.SUCCESS) {
      setStep(targetStep);
    }
  }, []);

  // Order completion
  const completeOrder = useCallback((order, number) => {
    setCreatedOrder(order);
    setCreatedOrderId(order.id);
    setOrderNumber(number);
    setOrderSuccess(true);
  }, []);

  return {
    // State
    step,
    cartItems,
    paymentMethod,
    isSubmitting,
    orderSuccess,
    saveInfo,
    createdOrderId,
    createdOrder,
    orderNumber,
    showOrderDetail,
    
    // Setters
    setStep,
    setCartItems,
    setPaymentMethod,
    setIsSubmitting,
    setOrderSuccess,
    setSaveInfo,
    setCreatedOrderId,
    setCreatedOrder,
    setOrderNumber,
    setShowOrderDetail,
    
    // Helpers
    nextStep,
    prevStep,
    goToStep,
    completeOrder
  };
}

export default useCheckoutState;
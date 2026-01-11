/**
 * useGiftSend Hook
 * Orchestrates send gift flow
 */

import { useState } from 'react';
import { useGiftOrder } from './useGiftOrder';
import { canSendGift, validateDeliveryMode } from '../domain/giftRules';
import { validateReceiver } from '../domain/validators';
import { useEcardCache } from '@/components/features/ecard';

export function useGiftSend(connection) {
  const [step, setStep] = useState(1); // 1=product, 2=options, 3=payment, 4=success
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [giftOptions, setGiftOptions] = useState({
    delivery_mode: 'redeem_required',
    scheduled_delivery_date: null,
    gift_context: 'other', // ECARD-F19: New gift context field
    occasion: 'other', // Keep for backward compatibility
    message: '',
    can_swap: true
  });

  const giftOrder = useGiftOrder();
  const { onGiftAction } = useEcardCache();

  // Validate send
  const validateSend = (buyer, receiver) => {
    return canSendGift(buyer, receiver);
  };

  // Validate options
  const validateOptions = () => {
    return validateDeliveryMode(giftOptions.delivery_mode, giftOptions.scheduled_delivery_date);
  };

  // Process payment and send gift
  const processSend = async (buyer, paymentMethod) => {
    // Validate receiver
    const receiverValidation = validateReceiver({
      user_id: connection.target_user_id,
      name: connection.target_name
    });
    if (!receiverValidation.success) {
      throw new Error(receiverValidation.message);
    }

    // Create draft order
    const order = await giftOrder.createDraft({
      items: [{
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_image: selectedProduct.image_url,
        price: selectedProduct.price,
        quantity: 1
      }],
      giftConfig: {
        receiver_user_id: connection.target_user_id,
        receiver_name: connection.target_name,
        receiver_email: connection.target_user_id, // Using user_id as email fallback
        connection_id: connection.id,
        ...giftOptions
      }
    });

    // Mark pending payment
    await giftOrder.markPendingPayment({
      orderId: order.id,
      paymentMethod
    });

    // For now, simulate payment success (later integrate with payment gateway)
    // In production: redirect to payment page, then webhook calls onPaymentSuccess
    const result = await giftOrder.onPaymentSuccess({
      orderId: order.id,
      paymentId: `PAY-${Date.now()}`,
      giftConfig: {
        receiver_user_id: connection.target_user_id,
        receiver_name: connection.target_name,
        receiver_email: connection.target_user_id,
        connection_id: connection.id,
        ...giftOptions
      }
    });

    // Optimistic update ecard cache
    if (result.giftTransaction) {
      onGiftAction('sent', {
        id: result.giftTransaction.id,
        product_name: selectedProduct.name,
        product_image: selectedProduct.image_url,
        from_email: result.giftTransaction.from_user_email,
        to_email: connection.target_user_id,
        status: result.giftTransaction.status,
        created_date: result.giftTransaction.created_date
      });
    }

    return result;
  };

  return {
    step,
    setStep,
    selectedProduct,
    setSelectedProduct,
    giftOptions,
    setGiftOptions,
    validateSend,
    validateOptions,
    processSend,
    isProcessing: giftOrder.isProcessing
  };
}
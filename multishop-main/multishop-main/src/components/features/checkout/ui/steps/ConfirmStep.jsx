/**
 * ConfirmStep - Payment confirmation step
 * UI Layer - Presentation only
 */

import React from 'react';
import CheckoutConfirmStep from '@/components/modals/checkout/CheckoutConfirmStep';

export default function ConfirmStep({
  paymentMethod,
  orderNumber,
  total,
  onPaymentConfirmed,
  onBack
}) {
  return (
    <CheckoutConfirmStep
      paymentMethod={paymentMethod}
      orderNumber={orderNumber}
      total={total}
      onPaymentConfirmed={onPaymentConfirmed}
      onBack={onBack}
    />
  );
}
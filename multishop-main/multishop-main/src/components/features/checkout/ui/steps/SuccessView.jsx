/**
 * SuccessView - Order success display
 * UI Layer - Presentation only
 */

import React from 'react';
import CheckoutSuccessView from '@/components/modals/checkout/CheckoutSuccessView';

export default function SuccessView({
  orderNumber,
  createdOrder,
  showOrderDetail,
  setShowOrderDetail,
  onClose
}) {
  return (
    <CheckoutSuccessView
      orderNumber={orderNumber}
      createdOrder={createdOrder}
      showOrderDetail={showOrderDetail}
      setShowOrderDetail={setShowOrderDetail}
      onClose={onClose}
    />
  );
}
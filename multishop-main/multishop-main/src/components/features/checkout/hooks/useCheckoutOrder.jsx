/**
 * useCheckoutOrder - Order creation hook
 * Hooks Layer - Single Goal: Create and manage orders
 * 
 * ✅ MIGRATED v2.2: Event-driven email via EventBus + Email Pipeline
 * 
 * @module features/checkout/hooks/useCheckoutOrder
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { orderRepository, customerRepository, lotRepository } from '../data';
import { validators, depositCalculator, cartHelpers, checkoutRules } from '../domain';
import { useToast } from '@/components/NotificationToast';
// ✅ MIGRATED: Using features/notification module (v2.1) for push notifications
import { NotificationServiceFacade } from '@/components/features/notification';
// ✅ NEW: Event-driven email (v2.2 - Email Pipeline)
import { eventBus } from '@/components/shared/events';
import { EMAIL_EVENT_TYPES } from '@/components/features/email/types/EventPayloads';
import { getReferralCodeFromCookie } from '@/components/referral/ReferralLinkHandler';
import { applyReferralToOrder } from '@/components/features/bridges/checkoutReferralBridge';
import customerSyncService from '@/components/services/customerSyncService';
// ✅ Abandoned cart tracking
import { markCartAsCheckedOut } from '@/components/hooks/useShoppingCart';

/**
 * Order creation and management
 * @returns {Object} Order actions
 */
export function useCheckoutOrder() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  /**
   * Validate cart including lot availability
   */
  const validateCartWithLots = useCallback(async (cartItems, total) => {
    // Basic validation
    const basicValidation = validators.validateCart(cartItems, total);
    if (!basicValidation.valid) {
      throw new Error(basicValidation.error);
    }
    
    // Check lot availability for preorder items
    for (const item of cartItems) {
      if (item.is_preorder && item.lot_id) {
        const { available, message } = await lotRepository.checkLotAvailability(item.lot_id, item.quantity);
        if (!available) {
          throw new Error(message);
        }
      }
    }
    
    return true;
  }, []);

  /**
   * Create a new order
   */
  const createOrder = useCallback(async ({
    cartItems,
    customerInfo,
    paymentMethod,
    calculations,
    hasPreorderItems,
    saveCustomer = true,
    existingCustomer = null
  }) => {
    // Validate first
    await validateCartWithLots(cartItems, calculations.total);
    
    // Auto-apply referral code from cookie
    const referralCode = customerInfo.referral_code || getReferralCodeFromCookie();
    
    let order, orderNumber;
    
    if (hasPreorderItems) {
      // Use backend function for preorder to handle race conditions
      const depositInfo = depositCalculator.calculateDepositForItems(cartItems);
      
      const result = await orderRepository.createPreOrderCheckout({
        cartItems,
        customerInfo,
        paymentMethod,
        subtotal: calculations.subtotal,
        shippingFee: calculations.shippingFee,
        discount: calculations.discount,
        total: calculations.total,
        depositAmount: calculations.depositAmount,
        remainingAmount: calculations.remainingAmount,
        depositPercentage: calculations.depositPercentage,
        estimatedHarvestDate: depositInfo.estimatedHarvestDate,
        referralCode: referralCode || null
      });

      if (!result.success) {
        throw new Error(result.error || 'Có lỗi xảy ra');
      }

      order = result.order;
      orderNumber = result.order_number;
    } else {
      // Regular order
      orderNumber = cartHelpers.generateOrderNumber();
      
      order = await orderRepository.createOrder({
        order_number: orderNumber,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        shipping_address: customerInfo.address,
        shipping_city: customerInfo.city,
        shipping_district: customerInfo.district,
        shipping_ward: customerInfo.ward,
        items: cartItems.map(item => ({
          product_id: item.product_id || item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity,
          is_preorder: false,
          deposit_percentage: 100,
          deposit_amount: item.price * item.quantity
        })),
        has_preorder_items: false,
        subtotal: calculations.subtotal,
        shipping_fee: calculations.shippingFee,
        discount_amount: calculations.discount,
        total_amount: calculations.total,
        deposit_amount: calculations.total,
        remaining_amount: 0,
        deposit_status: 'none',
        payment_method: paymentMethod,
        payment_status: checkoutRules.getInitialPaymentStatus(paymentMethod),
        order_status: 'pending',
        note: customerInfo.note,
        referral_code_applied: referralCode || null,
        referral_commission_calculated: false
      });
    }

    // Process referral if code provided
    if (referralCode) {
      try {
        await applyReferralToOrder(order, customerInfo.email, referralCode);
      } catch (err) {
        console.error('Referral processing error:', err);
      }
    }

    // Save customer info if requested
    if (saveCustomer) {
      try {
        const savedCustomer = await customerRepository.saveCustomerInfo(customerInfo, existingCustomer);
        // Sync to user profile
        if (customerInfo.email) {
          await customerSyncService.syncCustomerToUserProfile(customerInfo.email);
        }
      } catch (err) {
        console.log('Customer save failed:', err);
      }
    }

    return { order, orderNumber };
  }, [validateCartWithLots]);

  /**
   * Send order notifications
   * ✅ MIGRATED v2.2: Event-driven email + Push notifications
   */
  const sendNotifications = useCallback(async (order, customerInfo, paymentMethod) => {
    console.log('📤 [useCheckoutOrder] sendNotifications called', {
      orderId: order?.id,
      orderNumber: order?.order_number,
      customerName: customerInfo?.name || order?.customer_name,
      customerEmail: customerInfo?.email || order?.customer_email
    });
    
    // ✅ 1. Push notifications (in-app) via NotificationServiceFacade
    try {
      console.log('📤 [useCheckoutOrder] Calling NotificationServiceFacade.notifyNewOrder...');
      const notifyResult = await NotificationServiceFacade.notifyNewOrder(order, customerInfo);
      console.log('✅ New order push notifications sent:', notifyResult);
    } catch (err) {
      console.error('❌ Push notification error:', err);
      // Re-throw để có thể debug
      // throw err; // Uncomment để debug
    }

    // ✅ 2. Publish ORDER_PLACED event → Email Pipeline handles email sending
    try {
      eventBus.publish(EMAIL_EVENT_TYPES.ORDER_PLACED, {
        orderId: order.id,
        orderNumber: order.order_number,
        customerEmail: order.customer_email,
        customerName: order.customer_name || customerInfo?.name,
        customerPhone: order.customer_phone || customerInfo?.phone,
        totalAmount: order.total_amount,
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        discountAmount: order.discount_amount,
        items: order.items,
        shippingAddress: order.shipping_address,
        paymentMethod: paymentMethod,
        createdDate: order.created_date || new Date().toISOString()
      });
      console.log('✅ ORDER_PLACED event published → Email Pipeline');
    } catch (err) {
      console.error('❌ Event publish error:', err);
    }

    // ✅ 3. Payment verification (admin alert)
    if (paymentMethod === 'bank_transfer') {
      try {
        await NotificationServiceFacade.notifyPaymentVerificationNeeded(order);
        console.log('✅ Payment verification notification sent');
      } catch (err) {
        console.error('❌ Payment notification error:', err);
      }
    }
    
    // ✅ 4. Dispatch AI tracking event
    window.dispatchEvent(new CustomEvent('checkout-success', { 
      detail: { order } 
    }));
    
    // ✅ 5. Mark cart as checked out (for abandoned cart tracking)
    try {
      await markCartAsCheckedOut(customerInfo?.email || order.customer_email);
      console.log('✅ Cart marked as checked out');
    } catch (err) {
      console.warn('Cart status update failed:', err);
    }
  }, []);

  /**
   * Confirm payment
   */
  const confirmPayment = useCallback(async (orderId) => {
    if (!orderId) {
      throw new Error('Không tìm thấy đơn hàng!');
    }
    
    await orderRepository.updateOrder(orderId, {
      payment_status: 'awaiting_verification'
    });
  }, []);

  /**
   * Invalidate related queries
   */
  const invalidateQueries = useCallback(() => {
    const queriesToInvalidate = [
      'public-product-lots',
      'lot-detail',
      'admin-product-lots',
      'admin-all-orders',
      'my-orders',
      'my-orders-list',
      'user-orders-posts',
      'admin-notifications',
      'admin-notifications-realtime',
      'admin-all-notifications'
    ];

    queriesToInvalidate.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });

    queryClient.refetchQueries({ queryKey: ['admin-all-orders'], type: 'active' });
    queryClient.refetchQueries({ queryKey: ['admin-notifications'], type: 'active' });
  }, [queryClient]);

  return {
    createOrder,
    sendNotifications,
    confirmPayment,
    invalidateQueries,
    validateCartWithLots
  };
}

export default useCheckoutOrder;
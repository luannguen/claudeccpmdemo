/**
 * CheckoutService - Xử lý logic tạo đơn hàng
 * Tách riêng để dễ test và bảo trì
 * 
 * ✅ MIGRATED v2.2: Event-driven email via EventBus + Email Pipeline
 */

import { base44 } from '@/api/base44Client';
import customerSyncService from './customerSyncService';
// ✅ MIGRATED: Using features/notification module (v2.1)
import { NotificationServiceFacade } from '@/components/features/notification';
// ✅ NEW: Event-driven email (v2.2 - Email Pipeline)
import { eventBus } from '@/components/shared/events';
import { EMAIL_EVENT_TYPES } from '@/components/features/email/types/EventPayloads';
import { getReferralCodeFromCookie } from '../referral/ReferralLinkHandler';
import orderCore from './orderCore';
import orderReferralBridge from './orderReferralBridge';

// ========== DEPOSIT CALCULATIONS (delegated to core) ==========

export function calculateDepositForItems(cartItems) {
  return orderCore.calculateDepositForItems(cartItems);
}

export function enrichCartItemsWithDeposit(cartItems, lots = []) {
  return orderCore.enrichCartItemsWithDeposit(cartItems, lots);
}

// ========== VALIDATION (delegated to core) ==========

export function validateCustomerInfo(customerInfo) {
  return orderCore.validateCustomerInfo(customerInfo);
}

export async function validateCart(cartItems, total) {
  return orderCore.validateCart(cartItems, total);
}

// ========== ORDER CREATION ==========

export async function createOrder({
  cartItems,
  customerInfo,
  paymentMethod,
  calculations,
  hasPreorderItems,
  depositInfo = null
}) {
  const { subtotal, shippingFee, discount, total } = calculations;
  
  // Auto-apply referral code from cookie if not already set
  const referralCode = customerInfo.referral_code || getReferralCodeFromCookie();

  if (hasPreorderItems) {
    // Calculate deposit if not provided
    const deposit = depositInfo || calculateDepositForItems(cartItems);
    
    // Use backend function for preorder checkout to handle race condition
    const response = await base44.functions.invoke('createPreOrderCheckout', {
      cartItems,
      customerInfo,
      paymentMethod,
      subtotal,
      shippingFee,
      discount,
      total,
      // Deposit info
      depositAmount: deposit.depositAmount,
      remainingAmount: deposit.remainingAmount,
      depositPercentage: deposit.depositPercentage,
      estimatedHarvestDate: deposit.estimatedHarvestDate,
      // Referral code
      referralCode: referralCode || null
    });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Có lỗi xảy ra');
    }

    return {
      order: response.data.order,
      orderNumber: response.data.order_number,
      depositInfo: deposit
    };
  }

  // Regular order (no preorder items)
  const newOrderNumber = orderCore.generateOrderNumber();

  const order = await base44.entities.Order.create({
    order_number: newOrderNumber,
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
    subtotal,
    shipping_fee: shippingFee,
    discount_amount: discount,
    total_amount: total,
    deposit_amount: total,
    remaining_amount: 0,
    deposit_status: 'none',
    payment_method: paymentMethod,
    payment_status: paymentMethod === 'cod' ? 'pending' : 'awaiting_confirmation',
    order_status: 'pending',
    note: customerInfo.note,
    // Referral tracking
    referral_code_applied: referralCode || null,
    referral_commission_calculated: false
  });

  // Process referral if code provided (dùng bridge)
  if (referralCode) {
    try {
      await orderReferralBridge.processReferralAfterOrder(order, customerInfo.email, referralCode);
    } catch (err) {
      console.error('Referral processing error:', err);
    }
  }

  return {
    order,
    orderNumber: newOrderNumber
  };
}

// ========== NOTIFICATIONS ==========

export async function sendOrderNotifications(order, customerInfo, paymentMethod) {
  // ✅ 1. Push notifications (in-app) via NotificationServiceFacade
  try {
    await NotificationServiceFacade.notifyNewOrder(order, customerInfo);
    console.log('✅ New order push notifications sent');
  } catch (err) {
    console.error('❌ Push notification error:', err);
  }

  // ✅ 2. Publish ORDER_PLACED event → Email Pipeline handles email sending
  try {
    eventBus.publish(EMAIL_EVENT_TYPES.ORDER_PLACED, {
      orderId: order.id,
      orderNumber: order.order_number,
      customerEmail: order.customer_email,
      customerName: order.customer_name || customerInfo.name,
      customerPhone: order.customer_phone || customerInfo.phone,
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

  // ✅ 3. Payment verification (still using notification for admin alerts)
  if (paymentMethod === 'bank_transfer') {
    try {
      await NotificationServiceFacade.notifyPaymentVerificationNeeded(order);
      console.log('✅ Payment verification notification sent');
    } catch (err) {
      console.error('❌ Payment notification error:', err);
    }
  }
  
  // ✅ 4. Trigger AI tracking for purchase
  window.dispatchEvent(new CustomEvent('checkout-success', { 
    detail: { order } 
  }));
}

// ========== CUSTOMER MANAGEMENT ==========

export async function saveCustomerInfo(customerInfo, existingCustomer) {
  try {
    let savedCustomer;
    
    if (existingCustomer) {
      await base44.entities.Customer.update(existingCustomer.id, {
        full_name: customerInfo.name,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        district: customerInfo.district,
        ward: customerInfo.ward
      });
      savedCustomer = { ...existingCustomer, ...customerInfo };
    } else {
      savedCustomer = await base44.entities.Customer.create({
        tenant_id: null,
        full_name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        district: customerInfo.district,
        ward: customerInfo.ward,
        customer_source: 'cart',
        status: 'active'
      });
    }
    
    // Auto-sync Customer → User.preferences after save
    if (customerInfo.email) {
      await customerSyncService.syncCustomerToUserProfile(customerInfo.email);
    }
    
    return savedCustomer;
  } catch (error) {
    console.log('Customer update failed:', error);
  }
}

// ========== PAYMENT CONFIRMATION ==========

export async function confirmPayment(orderId) {
  if (!orderId) {
    throw new Error('Không tìm thấy đơn hàng!');
  }

  await base44.entities.Order.update(orderId, {
    payment_status: 'awaiting_verification'
  });
}

// ========== CART MANAGEMENT (delegated to core) ==========

export function clearCart() {
  return orderCore.clearCart();
}

export function updateCartItem(cartItems, itemId, newQuantity) {
  return orderCore.updateCartItem(cartItems, itemId, newQuantity);
}

export function removeCartItem(cartItems, itemId) {
  return orderCore.removeCartItem(cartItems, itemId);
}

// ========== QUERY INVALIDATION (delegated to core) ==========

export function invalidateOrderQueries(queryClient) {
  return orderCore.invalidateOrderQueries(queryClient);
}
/**
 * orderCore - Logic nghiệp vụ chung cho order domain
 * Core Module - Không import service khác
 * 
 * Mục đích: Tách logic chung để tránh circular dependency
 */

import { base44 } from '@/api/base44Client';

// ========== CONSTANTS ==========

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned_refunded'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// ========== VALIDATION ==========

export function validateCustomerInfo(customerInfo) {
  const errors = {};
  if (!customerInfo.name?.trim()) errors.name = 'Vui lòng nhập họ tên';
  if (!customerInfo.email?.trim()) errors.email = 'Vui lòng nhập email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email)) errors.email = 'Email không hợp lệ';
  if (!customerInfo.phone?.trim()) errors.phone = 'Vui lòng nhập số điện thoại';
  else if (!/^[0-9]{10,11}$/.test(customerInfo.phone.replace(/\s/g, ''))) errors.phone = 'Số điện thoại không hợp lệ';
  if (!customerInfo.address?.trim()) errors.address = 'Vui lòng nhập địa chỉ';
  if (!customerInfo.district?.trim()) errors.district = 'Vui lòng nhập quận/huyện';
  if (!customerInfo.city?.trim()) errors.city = 'Vui lòng nhập thành phố';
  return errors;
}

export async function validateCart(cartItems, total) {
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi đặt hàng.');
  }
  if (total <= 0) {
    throw new Error('Tổng đơn hàng không hợp lệ!');
  }

  for (const item of cartItems) {
    if (item.is_preorder && item.lot_id) {
      const lots = await base44.entities.ProductLot.filter({ id: item.lot_id }, '-created_date', 1);
      if (!lots || lots.length === 0) {
        throw new Error(`Lot "${item.name}" không còn tồn tại!`);
      }
      
      const lot = lots[0];
      if (lot.available_quantity < item.quantity) {
        throw new Error(`Lot "${item.name}" chỉ còn ${lot.available_quantity} sản phẩm!`);
      }
      
      if (lot.status !== 'active') {
        throw new Error(`Lot "${item.name}" không còn mở bán!`);
      }
    }
  }

  return true;
}

// ========== DEPOSIT CALCULATIONS ==========

export function calculateDepositForItems(cartItems) {
  let totalDeposit = 0;
  let totalRemaining = 0;
  let earliestHarvestDate = null;
  let avgDepositPercentage = 100;

  const preorderItems = cartItems.filter(item => item.is_preorder);
  
  if (preorderItems.length === 0) {
    return {
      depositAmount: 0,
      remainingAmount: 0,
      hasDeposit: false,
      depositPercentage: 100,
      estimatedHarvestDate: null
    };
  }

  let totalDepositPercentage = 0;
  
  preorderItems.forEach(item => {
    const depositPct = item.deposit_percentage || 100;
    const itemTotal = item.price * item.quantity;
    const itemDeposit = Math.round(itemTotal * depositPct / 100);
    const itemRemaining = itemTotal - itemDeposit;
    
    totalDeposit += itemDeposit;
    totalRemaining += itemRemaining;
    totalDepositPercentage += depositPct;

    if (item.estimated_harvest_date) {
      const harvestDate = new Date(item.estimated_harvest_date);
      if (!earliestHarvestDate || harvestDate < earliestHarvestDate) {
        earliestHarvestDate = harvestDate;
      }
    }
  });

  avgDepositPercentage = Math.round(totalDepositPercentage / preorderItems.length);

  const regularItems = cartItems.filter(item => !item.is_preorder);
  regularItems.forEach(item => {
    totalDeposit += item.price * item.quantity;
  });

  return {
    depositAmount: totalDeposit,
    remainingAmount: totalRemaining,
    hasDeposit: avgDepositPercentage < 100,
    depositPercentage: avgDepositPercentage,
    estimatedHarvestDate: earliestHarvestDate ? earliestHarvestDate.toISOString() : null
  };
}

export function enrichCartItemsWithDeposit(cartItems, lots = []) {
  return cartItems.map(item => {
    if (!item.is_preorder || !item.lot_id) {
      return { ...item, deposit_percentage: 100 };
    }

    const lot = lots.find(l => l.id === item.lot_id);
    const depositPct = lot?.deposit_percentage || item.deposit_percentage || 100;
    const itemTotal = item.price * item.quantity;
    const depositAmt = Math.round(itemTotal * depositPct / 100);

    return {
      ...item,
      deposit_percentage: depositPct,
      deposit_amount: depositAmt,
      estimated_harvest_date: lot?.estimated_harvest_date || item.estimated_harvest_date
    };
  });
}

// ========== ORDER NUMBER GENERATION ==========

export function generateOrderNumber() {
  return 'ORD-' + Date.now().toString().slice(-8);
}

// ========== CART HELPERS ==========

export function clearCart() {
  localStorage.removeItem('zerofarm-cart');
  window.dispatchEvent(new Event('cart-updated'));
  window.dispatchEvent(new Event('cart-cleared'));
}

export function updateCartItem(cartItems, itemId, newQuantity) {
  const updated = cartItems.map(item => {
    if (item.id === itemId) {
      if (item.is_preorder && item.moq && newQuantity < item.moq) {
        return item;
      }
      if (newQuantity < 1) return item;
      return { ...item, quantity: newQuantity };
    }
    return item;
  });
  
  localStorage.setItem('zerofarm-cart', JSON.stringify(updated));
  window.dispatchEvent(new Event('cart-updated'));
  
  return updated;
}

export function removeCartItem(cartItems, itemId) {
  const updated = cartItems.filter(item => item.id !== itemId);
  localStorage.setItem('zerofarm-cart', JSON.stringify(updated));
  window.dispatchEvent(new Event('cart-updated'));
  
  if (updated.length === 0) {
    window.dispatchEvent(new Event('cart-cleared'));
  }
  
  return updated;
}

// ========== QUERY INVALIDATION ==========

export function invalidateOrderQueries(queryClient) {
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
}

export default {
  ORDER_STATUS,
  PAYMENT_STATUS,
  validateCustomerInfo,
  validateCart,
  calculateDepositForItems,
  enrichCartItemsWithDeposit,
  generateOrderNumber,
  clearCart,
  updateCartItem,
  removeCartItem,
  invalidateOrderQueries
};
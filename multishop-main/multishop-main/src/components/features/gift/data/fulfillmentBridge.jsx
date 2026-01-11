/**
 * Fulfillment Bridge
 * Creates Order for admin fulfillment from redeemed Gift
 * 
 * Bridge pattern: Gift module → Order/Checkout module
 */

import { base44 } from '@/api/base44Client';

/**
 * Create fulfillment order when gift is redeemed
 * @param {Object} gift - GiftTransaction
 * @param {Object} shippingInfo - Receiver shipping info
 * @returns {Promise<Order>}
 */
export const createFulfillmentOrder = async (gift, shippingInfo) => {
  // Create Order for admin to fulfill
  const order = await base44.entities.Order.create({
    // Order type & source
    order_number: `GIFT-${Date.now()}`,
    
    // Customer info (receiver)
    customer_name: gift.receiver_name,
    customer_email: gift.receiver_email,
    customer_phone: shippingInfo.phone,
    
    // Shipping
    shipping_address: shippingInfo.address,
    shipping_city: shippingInfo.city || '',
    shipping_district: shippingInfo.district || '',
    shipping_ward: shippingInfo.ward || '',
    
    // Items (from gift)
    items: [{
      product_id: gift.item_id,
      product_name: gift.item_name,
      quantity: 1,
      unit_price: gift.item_value,
      subtotal: gift.item_value
    }],
    
    // Pricing
    subtotal: gift.item_value,
    shipping_fee: 0, // Gift shipping usually free
    total_amount: gift.item_value,
    
    // Payment (already paid by sender)
    payment_method: 'prepaid',
    payment_status: 'paid',
    
    // Order status
    order_status: 'confirmed',
    
    // Gift metadata
    note: `🎁 Quà tặng từ ${gift.sender_name}. Lời nhắn: ${gift.message || 'Không có'}`,
    internal_note: `Gift Transaction ID: ${gift.id}. Sender: ${gift.sender_email}`,
    
    // Delivery
    delivery_date: shippingInfo.delivery_date || null,
    delivery_time: shippingInfo.delivery_time || null
  });

  return order;
};

/**
 * Update gift with fulfillment order ID
 */
export const linkFulfillmentOrder = async (giftId, orderId) => {
  return base44.entities.GiftTransaction.update(giftId, {
    fulfillment_order_id: orderId,
    status: 'fulfillment_created'
  });
};
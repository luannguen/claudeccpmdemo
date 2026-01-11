import { base44 } from "@/api/base44Client";

/**
 * ShopCheckoutService - Xử lý logic tạo đơn hàng cho shop
 */

// ========== ORDER CREATION ==========

export function buildOrderData(formData, cart, shop, paymentMethod, calculations) {
  const { subtotal, shippingFee, total } = calculations;
  
  return {
    shop_id: shop.id,
    shop_name: shop.organization_name,
    customer_name: formData.customer_name,
    customer_email: formData.customer_email,
    customer_phone: formData.customer_phone,
    shipping_address: formData.shipping_address,
    shipping_city: formData.shipping_city,
    shipping_district: formData.shipping_district,
    shipping_ward: formData.shipping_ward,
    items: cart.map(item => ({
      product_id: item.id,
      product_name: item.name,
      shop_product_id: item.shop_product_id,
      quantity: item.quantity,
      unit_price: item.price,
      subtotal: item.price * item.quantity,
      commission_rate: shop.commission_rate || 3,
      commission_amount: (item.price * item.quantity) * (shop.commission_rate || 3) / 100
    })),
    subtotal,
    shipping_fee: shippingFee,
    total_amount: total,
    commission_total: cart.reduce((sum, item) => 
      sum + (item.price * item.quantity * (shop.commission_rate || 3) / 100), 0
    ),
    shop_revenue: total - cart.reduce((sum, item) => 
      sum + (item.price * item.quantity * (shop.commission_rate || 3) / 100), 0
    ),
    payment_method: paymentMethod,
    note: formData.note,
    order_status: 'pending',
    payment_status: 'pending'
  };
}

export async function createOrder(orderData) {
  return await base44.entities.Order.create(orderData);
}

// ========== LOYALTY POINTS ==========

export function calculateLoyaltyPoints(total) {
  return Math.floor(total / 1000);
}

export function determineTier(totalOrders) {
  if (totalOrders >= 10) return 'platinum';
  if (totalOrders >= 5) return 'gold';
  if (totalOrders >= 2) return 'silver';
  return 'bronze';
}

export function getTierMultiplier(tier) {
  switch (tier) {
    case 'platinum': return 1.1;
    case 'gold': return 1.05;
    default: return 1.0;
  }
}

export async function updateLoyaltyAccount(userEmail, userName, total, order) {
  if (!userEmail) return;

  const pointsEarned = calculateLoyaltyPoints(total);
  
  try {
    const loyaltyAccounts = await base44.entities.LoyaltyAccount.list('-created_date', 500);
    const existingLoyalty = loyaltyAccounts.find(la => la.user_email === userEmail);
    
    if (existingLoyalty) {
      await updateExistingLoyalty(existingLoyalty, userName, total, pointsEarned, order);
    } else {
      await createNewLoyalty(userEmail, userName, total, pointsEarned, order);
    }
    
    return pointsEarned;
  } catch (error) {
    console.log('Loyalty update failed (non-critical):', error);
    return pointsEarned;
  }
}

async function updateExistingLoyalty(existingLoyalty, userName, total, pointsEarned, order) {
  const newTotalOrders = (existingLoyalty.total_orders_platform || 0) + 1;
  const newTotalSpent = (existingLoyalty.total_spent_platform || 0) + total;
  const newLifetimePoints = (existingLoyalty.lifetime_points || 0) + pointsEarned;
  
  const tier = determineTier(newTotalOrders);
  const multiplier = getTierMultiplier(tier);
  const bonusPoints = Math.floor(pointsEarned * (multiplier - 1));
  
  await base44.entities.LoyaltyAccount.update(existingLoyalty.id, {
    user_name: userName,
    total_points: (existingLoyalty.total_points || 0) + pointsEarned + bonusPoints,
    lifetime_points: newLifetimePoints + bonusPoints,
    total_orders_platform: newTotalOrders,
    total_spent_platform: newTotalSpent,
    avg_order_value: Math.round(newTotalSpent / newTotalOrders),
    last_order_date: new Date().toISOString(),
    tier,
    points_history: [
      ...(existingLoyalty.points_history || []),
      {
        date: new Date().toISOString(),
        points: pointsEarned + bonusPoints,
        type: 'earn',
        description: `Đơn hàng #${order.order_number || order.id?.slice(-8)}${bonusPoints > 0 ? ` (+${bonusPoints} bonus)` : ''}`,
        order_id: order.id
      }
    ]
  });
}

async function createNewLoyalty(userEmail, userName, total, pointsEarned, order) {
  await base44.entities.LoyaltyAccount.create({
    user_email: userEmail,
    user_name: userName,
    total_points: pointsEarned,
    lifetime_points: pointsEarned,
    total_orders_platform: 1,
    total_spent_platform: total,
    avg_order_value: total,
    first_order_date: new Date().toISOString(),
    last_order_date: new Date().toISOString(),
    tier: 'bronze',
    points_history: [{
      date: new Date().toISOString(),
      points: pointsEarned,
      type: 'earn',
      description: `Đơn hàng đầu tiên #${order.order_number || order.id?.slice(-8)}`,
      order_id: order.id
    }],
    status: 'active'
  });
}

// ========== CUSTOMER MANAGEMENT ==========

export async function updateCustomerRecord(formData, existingCustomer, shop, total) {
  try {
    if (existingCustomer) {
      await base44.entities.Customer.update(existingCustomer.id, {
        full_name: formData.customer_name,
        phone: formData.customer_phone,
        address: formData.shipping_address,
        city: formData.shipping_city,
        district: formData.shipping_district,
        ward: formData.shipping_ward,
        total_orders: (existingCustomer.total_orders || 0) + 1,
        total_spent: (existingCustomer.total_spent || 0) + total,
        last_order_date: new Date().toISOString()
      });
    } else {
      await base44.entities.Customer.create({
        tenant_id: shop.id,
        full_name: formData.customer_name,
        email: formData.customer_email,
        phone: formData.customer_phone,
        address: formData.shipping_address,
        city: formData.shipping_city,
        district: formData.shipping_district,
        ward: formData.shipping_ward,
        customer_source: 'order',
        total_orders: 1,
        total_spent: total,
        first_order_date: new Date().toISOString(),
        last_order_date: new Date().toISOString(),
        customer_type: 'new',
        status: 'active'
      });
    }
  } catch (error) {
    console.log('Customer update failed (non-critical):', error);
  }
}

// ========== CART MANAGEMENT ==========

export function clearShopCart(shopId) {
  localStorage.removeItem(`shop-cart-${shopId}`);
}

export function getShopCart(shopId) {
  return JSON.parse(localStorage.getItem(`shop-cart-${shopId}`) || '[]');
}

export function saveShopCart(shopId, cart) {
  localStorage.setItem(`shop-cart-${shopId}`, JSON.stringify(cart));
}
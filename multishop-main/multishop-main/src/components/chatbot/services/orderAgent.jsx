/**
 * Order Agent
 * 
 * RBAC-secured order queries
 * Users can only see their own orders
 * Architecture: Service Layer
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== ORDER STATUS MAPPING ==========

const ORDER_STATUS_DISPLAY = {
  'pending': { label: 'Chờ xác nhận', color: 'amber', icon: '⏳' },
  'confirmed': { label: 'Đã xác nhận', color: 'blue', icon: '✅' },
  'processing': { label: 'Đang xử lý', color: 'indigo', icon: '📦' },
  'shipping': { label: 'Đang giao', color: 'purple', icon: '🚚' },
  'delivered': { label: 'Đã giao', color: 'green', icon: '✔️' },
  'cancelled': { label: 'Đã hủy', color: 'red', icon: '❌' }
};

// ========== RBAC-SECURED QUERIES ==========

/**
 * Get user's orders (RBAC: own data only)
 */
export async function getUserOrders(userEmail, limit = 5) {
  if (!userEmail) {
    return failure('Vui lòng đăng nhập để xem đơn hàng', ErrorCodes.UNAUTHORIZED);
  }
  
  try {
    const orders = await base44.entities.Order.filter({ 
      customer_email: userEmail 
    });
    
    // Sort by date, newest first
    const sorted = orders.sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    );
    
    return success(sorted.slice(0, limit));
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get specific order by number (RBAC: own order only)
 */
export async function getOrderByNumber(orderNumber, userEmail) {
  if (!userEmail) {
    return failure('Vui lòng đăng nhập để xem đơn hàng', ErrorCodes.UNAUTHORIZED);
  }
  
  try {
    const orders = await base44.entities.Order.filter({ 
      order_number: orderNumber 
    });
    
    if (orders.length === 0) {
      return failure('Không tìm thấy đơn hàng', ErrorCodes.NOT_FOUND);
    }
    
    const order = orders[0];
    
    // RBAC check: user can only see own orders
    if (order.customer_email !== userEmail) {
      return failure('Bạn không có quyền xem đơn hàng này', ErrorCodes.FORBIDDEN);
    }
    
    return success(order);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get latest order (RBAC: own data only)
 */
export async function getLatestOrder(userEmail) {
  if (!userEmail) {
    return failure('Vui lòng đăng nhập để xem đơn hàng', ErrorCodes.UNAUTHORIZED);
  }
  
  try {
    const orders = await base44.entities.Order.filter({ 
      customer_email: userEmail 
    });
    
    if (orders.length === 0) {
      return success(null);
    }
    
    // Sort by date, get latest
    const sorted = orders.sort((a, b) => 
      new Date(b.created_date) - new Date(a.created_date)
    );
    
    return success(sorted[0]);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== RESPONSE FORMATTERS ==========

/**
 * Format order list response
 * ENHANCED: Include full order data for detail modal + voice text
 */
export function formatOrderListResponse(orders, userEmail) {
  if (!orders || orders.length === 0) {
    return {
      contentType: 'markdown',
      content: `Bạn chưa có đơn hàng nào. 🛒

**Khám phá sản phẩm ngay:**
- [Xem sản phẩm](/Services)
- [Combo tiết kiệm](/Services?category=combo)`,
      voiceText: 'Bác chưa có đơn hàng nào. Bác muốn đặt hàng không ạ?'
    };
  }
  
  // Build voice text
  const pendingCount = orders.filter(o => o.order_status === 'pending').length;
  const shippingCount = orders.filter(o => o.order_status === 'shipping').length;
  let voiceParts = [`Bác có ${orders.length} đơn hàng.`];
  if (pendingCount > 0) voiceParts.push(`${pendingCount} đơn chờ xác nhận.`);
  if (shippingCount > 0) voiceParts.push(`${shippingCount} đơn đang giao.`);
  voiceParts.push('Bác nhấn vào đơn để xem chi tiết nhé!');
  
  return {
    contentType: 'order_list',
    voiceText: voiceParts.join(' '),
    content: {
      title: `📦 Bạn có ${orders.length} đơn hàng`,
      orders: orders.map(o => ({
        // Identifiers
        id: o.id,
        orderNumber: o.order_number,
        order_number: o.order_number,
        
        // Status
        status: o.order_status,
        order_status: o.order_status,
        statusDisplay: ORDER_STATUS_DISPLAY[o.order_status] || ORDER_STATUS_DISPLAY.pending,
        
        // Money
        totalAmount: o.total_amount,
        total_amount: o.total_amount,
        subtotal: o.subtotal,
        shipping_fee: o.shipping_fee,
        
        // Items
        itemCount: o.items?.length || 0,
        items: o.items,
        firstItemName: o.items?.[0]?.product_name,
        
        // Dates
        date: o.created_date,
        created_date: o.created_date,
        
        // Payment
        paymentStatus: o.payment_status,
        payment_status: o.payment_status,
        payment_method: o.payment_method,
        
        // Shipping
        shipping_address: o.shipping_address,
        tracking_number: o.tracking_number,
        
        // Links (for navigation)
        detailUrl: `/MyOrders?highlight=${o.id}`
      })),
      actions: [
        { type: 'view_all_orders', label: 'Xem tất cả đơn hàng', url: '/MyOrders' }
      ],
      summary: {
        totalOrders: orders.length,
        pendingCount: orders.filter(o => o.order_status === 'pending').length,
        shippingCount: orders.filter(o => o.order_status === 'shipping').length
      }
    }
  };
}

/**
 * Format single order detail
 * ENHANCED: Full detail for modal integration + voice text
 */
export function formatOrderDetail(order) {
  const statusInfo = ORDER_STATUS_DISPLAY[order.order_status] || ORDER_STATUS_DISPLAY.pending;
  
  // Voice text for TTS
  const voiceText = `Đơn hàng ${order.order_number} đang ${statusInfo.label}. ` +
    `Tổng giá trị ${new Intl.NumberFormat('vi-VN').format(order.total_amount)} đồng. ` +
    `Có ${order.items?.length || 0} sản phẩm.`;
  
  return {
    contentType: 'order_detail',
    content: {
      order: {
        // Core IDs
        id: order.id,
        orderNumber: order.order_number,
        order_number: order.order_number,
        
        // Status
        status: order.order_status,
        order_status: order.order_status,
        statusDisplay: statusInfo,
        
        // Money
        totalAmount: order.total_amount,
        total_amount: order.total_amount,
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        shipping_fee: order.shipping_fee,
        discount_amount: order.discount_amount,
        
        // Payment
        paymentMethod: order.payment_method,
        payment_method: order.payment_method,
        paymentStatus: order.payment_status,
        payment_status: order.payment_status,
        
        // Items with full data
        items: order.items?.map(i => ({
          product_id: i.product_id,
          name: i.product_name,
          product_name: i.product_name,
          quantity: i.quantity,
          price: i.unit_price,
          unit_price: i.unit_price,
          subtotal: i.subtotal
        })),
        
        // Customer
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_email: order.customer_email,
        
        // Shipping
        shippingAddress: order.shipping_address,
        shipping_address: order.shipping_address,
        shipping_city: order.shipping_city,
        shipping_district: order.shipping_district,
        
        // Dates
        date: order.created_date,
        created_date: order.created_date,
        delivery_date: order.delivery_date,
        
        // Tracking
        trackingNumber: order.tracking_number,
        tracking_number: order.tracking_number,
        shipper_name: order.shipper_name,
        shipper_phone: order.shipper_phone,
        
        // Notes
        note: order.note,
        
        // For modal
        detailUrl: `/MyOrders?highlight=${order.id}`
      },
      message: `Đơn hàng **#${order.order_number}** ${statusInfo.icon} **${statusInfo.label}**`,
      actions: [
        { type: 'view_detail', label: 'Xem chi tiết', url: `/MyOrders?highlight=${order.id}` },
        { type: 'contact_support', label: 'Hỗ trợ', url: '/Contact' }
      ]
    },
    voiceText
  };
}

// ========== MAIN HANDLER ==========

/**
 * Handle order-related query (RBAC-secured)
 */
export async function handleOrderQuery(query, userContext = {}) {
  const userEmail = userContext?.securityContext?.currentUserEmail;
  
  // Not logged in
  if (!userEmail) {
    return success({
      contentType: 'text',
      content: '🔐 Vui lòng đăng nhập để xem thông tin đơn hàng của bạn.\n\nSau khi đăng nhập, tôi có thể giúp bạn:\n- Xem danh sách đơn hàng\n- Kiểm tra trạng thái giao hàng\n- Theo dõi vận chuyển',
      intent: 'order_status',
      requiresAuth: true
    });
  }
  
  // Check for specific order number
  const orderNumberMatch = query.match(/(?:đơn|order|mã)?\s*#?(\d{6,})/i);
  if (orderNumberMatch) {
    const orderNumber = orderNumberMatch[1];
    const result = await getOrderByNumber(orderNumber, userEmail);
    
    if (result.success) {
      return success({
        ...formatOrderDetail(result.data),
        intent: 'order_status',
        tokensUsed: 0
      });
    } else {
      return success({
        contentType: 'text',
        content: result.message,
        intent: 'order_status'
      });
    }
  }
  
  // Check for "latest order"
  if (query.match(/mới nhất|gần nhất|latest|recent/i)) {
    const result = await getLatestOrder(userEmail);
    if (result.success && result.data) {
      return success({
        ...formatOrderDetail(result.data),
        intent: 'order_status',
        tokensUsed: 0
      });
    }
  }
  
  // Default: show order list
  const result = await getUserOrders(userEmail, 5);
  if (result.success) {
    return success({
      ...formatOrderListResponse(result.data, userEmail),
      intent: 'order_status',
      tokensUsed: 0
    });
  }
  
  return failure(result.message, result.code);
}

export default {
  handleOrderQuery,
  getUserOrders,
  getOrderByNumber,
  getLatestOrder,
  formatOrderListResponse,
  formatOrderDetail,
  ORDER_STATUS_DISPLAY
};
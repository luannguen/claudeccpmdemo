import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, paymentMethod, proofUrl = null } = await req.json();

    if (!orderId) {
      return Response.json({ error: 'Order ID required' }, { status: 400 });
    }

    // Get order
    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    const order = orders[0];

    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Verify user owns this order
    if (order.customer_email !== user.email && !['admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check deposit status
    if (order.deposit_status !== 'pending') {
      return Response.json({ error: 'Deposit already processed' }, { status: 400 });
    }

    // Update order
    await base44.asServiceRole.entities.Order.update(orderId, {
      deposit_status: 'paid',
      deposit_paid_date: new Date().toISOString(),
      payment_status: 'deposit_paid',
      order_status: 'confirmed',
      internal_note: proofUrl ? `Payment proof: ${proofUrl}` : `Paid via ${paymentMethod}`
    });

    // Send notification to customer
    await base44.asServiceRole.entities.Notification.create({
      user_email: order.customer_email,
      type: 'payment_success',
      title: '✅ Thanh Toán Cọc Thành Công',
      message: `Đã nhận thanh toán ${order.deposit_amount.toLocaleString('vi-VN')}đ cho đơn #${order.order_number}`,
      link: '/MyOrders',
      priority: 'high',
      is_read: false
    });

    // Send notification to admin
    await base44.asServiceRole.entities.AdminNotification.create({
      type: 'payment_received',
      title: `💰 Nhận Cọc Pre-Order #${order.order_number}`,
      message: `${order.customer_name} đã thanh toán cọc ${order.deposit_amount.toLocaleString('vi-VN')}đ`,
      link: '/AdminOrders',
      priority: 'normal',
      is_read: false,
      requiresAction: false,
      relatedEntityType: 'Order',
      relatedEntityId: order.id
    });

    return Response.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        deposit_status: 'paid'
      }
    });

  } catch (error) {
    console.error('Deposit payment error:', error);
    return Response.json({ 
      error: error.message || 'Payment processing failed'
    }, { status: 500 });
  }
});
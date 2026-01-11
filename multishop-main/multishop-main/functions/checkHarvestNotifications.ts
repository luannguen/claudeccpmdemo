/**
 * 🌾 Check Harvest Notifications - Scheduled Job
 * 
 * Chạy hàng ngày để:
 * 1. Kiểm tra lots sắp thu hoạch (3-5 ngày trước)
 * 2. Gửi notification và email cho khách hàng
 * 3. Nhắc thanh toán phần còn lại
 * 
 * Call này nên được schedule chạy daily bằng external cron service
 * hoặc có thể gọi thủ công từ Admin Dashboard
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ✅ Allow manual trigger or scheduled job
    const url = new URL(req.url);
    const forceRun = url.searchParams.get('force') === 'true';
    
    console.log('🌾 Starting harvest notification check...');
    console.log('Force run:', forceRun);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ========== 1. GET ALL ACTIVE LOTS ==========
    const allLots = await base44.asServiceRole.entities.ProductLot.list('estimated_harvest_date', 500);
    const activeLots = allLots.filter(l => 
      l.status === 'active' || l.status === 'awaiting_harvest'
    );

    console.log(`📊 Found ${activeLots.length} active lots`);

    // ========== 2. GET ALL PREORDER ORDERS ==========
    const allOrders = await base44.asServiceRole.entities.Order.list('-created_date', 1000);
    const preorderOrders = allOrders.filter(o => 
      o.has_preorder_items && 
      !['cancelled', 'delivered', 'returned_refunded'].includes(o.order_status)
    );

    console.log(`📊 Found ${preorderOrders.length} active preorder orders`);

    const results = {
      lotsChecked: activeLots.length,
      ordersChecked: preorderOrders.length,
      harvestReminders: 0,
      harvestReady: 0,
      paymentReminders: 0,
      adminAlerts: 0,
      errors: []
    };

    // ========== 3. CHECK EACH LOT ==========
    for (const lot of activeLots) {
      try {
        if (!lot.estimated_harvest_date) continue;

        const harvestDate = new Date(lot.estimated_harvest_date);
        harvestDate.setHours(0, 0, 0, 0);
        
        const daysUntilHarvest = Math.ceil((harvestDate - today) / (1000 * 60 * 60 * 24));

        console.log(`📅 Lot ${lot.lot_name}: ${daysUntilHarvest} days until harvest`);

        // Find orders for this lot
        const lotOrders = preorderOrders.filter(order => 
          order.items?.some(item => item.lot_id === lot.id)
        );

        console.log(`📦 Found ${lotOrders.length} orders for lot ${lot.lot_name}`);

        // ========== CASE 1: Harvest is today or past - Mark as ready ==========
        if (daysUntilHarvest <= 0 && lot.status !== 'harvested' && lot.status !== 'fulfilled') {
          console.log(`🎉 Lot ${lot.lot_name} harvest day!`);

          // Update lot status
          await base44.asServiceRole.entities.ProductLot.update(lot.id, {
            status: 'harvested'
          });

          // Notify each customer
          for (const order of lotOrders) {
            await sendHarvestReadyNotification(base44, order, lot);
            results.harvestReady++;

            // Also update order status if pending/confirmed
            if (['pending', 'confirmed', 'awaiting_harvest'].includes(order.order_status)) {
              await base44.asServiceRole.entities.Order.update(order.id, {
                order_status: 'harvest_ready'
              });
            }
          }

          // Admin notification
          await sendAdminHarvestAlert(base44, lot, lotOrders.length, 'ready');
          results.adminAlerts++;
        }

        // ========== CASE 2: 3-5 days before harvest - Send reminder ==========
        else if (daysUntilHarvest >= 1 && daysUntilHarvest <= 5) {
          console.log(`📬 Lot ${lot.lot_name} - sending harvest reminders`);

          // Only send reminder once per day threshold (3, 5 days)
          const shouldNotify = daysUntilHarvest === 5 || daysUntilHarvest === 3 || daysUntilHarvest === 1;

          if (shouldNotify) {
            for (const order of lotOrders) {
              // Check if we already sent this notification today
              const existingNotif = await checkExistingNotification(
                base44, 
                order.customer_email, 
                'harvest_reminder', 
                lot.id,
                daysUntilHarvest
              );

              if (!existingNotif) {
                await sendHarvestReminder(base44, order, lot, daysUntilHarvest);
                results.harvestReminders++;

                // Send payment reminder if has remaining amount
                if (order.remaining_amount > 0) {
                  await sendPaymentReminder(base44, order, lot, daysUntilHarvest);
                  results.paymentReminders++;
                }
              }
            }

            // Admin alert
            await sendAdminHarvestAlert(base44, lot, lotOrders.length, 'upcoming', daysUntilHarvest);
            results.adminAlerts++;
          }
        }

        // ========== CASE 3: Update order status to awaiting_harvest ==========
        if (daysUntilHarvest > 0 && daysUntilHarvest <= 7) {
          for (const order of lotOrders) {
            if (order.order_status === 'confirmed' || order.order_status === 'processing') {
              await base44.asServiceRole.entities.Order.update(order.id, {
                order_status: 'awaiting_harvest'
              });
            }
          }
        }

      } catch (lotError) {
        console.error(`❌ Error processing lot ${lot.id}:`, lotError.message);
        results.errors.push({ lotId: lot.id, error: lotError.message });
      }
    }

    console.log('✅ Harvest notification check completed:', results);

    return Response.json({
      success: true,
      message: 'Harvest notification check completed',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Harvest notification check failed:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});

// ========== HELPER FUNCTIONS ==========

async function checkExistingNotification(base44, email, type, lotId, days) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const notifications = await base44.asServiceRole.entities.Notification.filter({
      recipient_email: email,
      type: type
    }, '-created_date', 10);

    return notifications.some(n => {
      const notifDate = new Date(n.created_date);
      notifDate.setHours(0, 0, 0, 0);
      return notifDate.getTime() === today.getTime() && 
             n.metadata?.lot_id === lotId &&
             n.metadata?.days_until_harvest === days;
    });
  } catch {
    return false;
  }
}

async function sendHarvestReminder(base44, order, lot, daysUntilHarvest) {
  const orderNumber = order.order_number || order.id?.slice(-8);
  const harvestDate = new Date(lot.estimated_harvest_date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Create notification
  await base44.asServiceRole.entities.Notification.create({
    recipient_email: order.customer_email,
    type: 'harvest_reminder',
    title: '🌾 Sản Phẩm Sắp Thu Hoạch!',
    message: `Đơn hàng #${orderNumber} - ${lot.product_name} sẽ được thu hoạch vào ${harvestDate} (còn ${daysUntilHarvest} ngày).`,
    link: '/MyOrders',
    priority: 'high',
    is_read: false,
    metadata: {
      order_number: orderNumber,
      order_id: order.id,
      lot_id: lot.id,
      lot_name: lot.lot_name,
      product_name: lot.product_name,
      harvest_date: lot.estimated_harvest_date,
      days_until_harvest: daysUntilHarvest
    }
  });

  // Send email
  await base44.integrations.Core.SendEmail({
    to: order.customer_email,
    subject: `🌾 [${orderNumber}] Sản phẩm sắp thu hoạch - còn ${daysUntilHarvest} ngày`,
    body: generateHarvestReminderEmail(order, lot, harvestDate, daysUntilHarvest)
  });

  console.log(`✅ Harvest reminder sent to ${order.customer_email} for lot ${lot.lot_name}`);
}

async function sendHarvestReadyNotification(base44, order, lot) {
  const orderNumber = order.order_number || order.id?.slice(-8);

  // Create notification
  await base44.asServiceRole.entities.Notification.create({
    recipient_email: order.customer_email,
    type: 'harvest_ready',
    title: '🎉 Sản Phẩm Đã Thu Hoạch!',
    message: `Đơn hàng #${orderNumber} - ${lot.product_name} đã được thu hoạch và đang chuẩn bị giao!`,
    link: '/MyOrders',
    priority: 'high',
    is_read: false,
    metadata: {
      order_number: orderNumber,
      order_id: order.id,
      lot_id: lot.id,
      product_name: lot.product_name
    }
  });

  // Send email
  await base44.integrations.Core.SendEmail({
    to: order.customer_email,
    subject: `🎉 [${orderNumber}] Sản phẩm đã thu hoạch - Chuẩn bị giao hàng!`,
    body: generateHarvestReadyEmail(order, lot)
  });

  console.log(`✅ Harvest ready notification sent to ${order.customer_email}`);
}

async function sendPaymentReminder(base44, order, lot, daysUntilDelivery) {
  const orderNumber = order.order_number || order.id?.slice(-8);
  const remainingAmount = order.remaining_amount || 0;

  // Create notification
  await base44.asServiceRole.entities.Notification.create({
    recipient_email: order.customer_email,
    type: 'final_payment_reminder',
    title: '💰 Nhắc Nhở Thanh Toán',
    message: `Đơn hàng #${orderNumber} sắp giao. Số tiền còn lại: ${remainingAmount.toLocaleString('vi-VN')}đ`,
    link: '/MyOrders',
    priority: 'high',
    is_read: false,
    metadata: {
      order_number: orderNumber,
      order_id: order.id,
      remaining_amount: remainingAmount,
      days_until_delivery: daysUntilDelivery
    }
  });

  // Send email
  await base44.integrations.Core.SendEmail({
    to: order.customer_email,
    subject: `💰 [${orderNumber}] Nhắc nhở thanh toán - ${remainingAmount.toLocaleString('vi-VN')}đ`,
    body: generatePaymentReminderEmail(order, remainingAmount)
  });

  console.log(`✅ Payment reminder sent to ${order.customer_email}`);
}

async function sendAdminHarvestAlert(base44, lot, ordersCount, type, daysUntilHarvest = 0) {
  const title = type === 'ready' 
    ? `🎉 Lot "${lot.lot_name}" Đã Thu Hoạch`
    : `🌾 Lot "${lot.lot_name}" sắp thu hoạch (${daysUntilHarvest} ngày)`;

  const message = type === 'ready'
    ? `${lot.product_name} đã sẵn sàng giao. ${ordersCount} đơn hàng đang chờ.`
    : `${lot.product_name} - còn ${daysUntilHarvest} ngày. ${ordersCount} đơn hàng đang chờ.`;

  await base44.asServiceRole.entities.AdminNotification.create({
    recipient_email: null,
    type: type === 'ready' ? 'harvest_ready' : 'harvest_upcoming',
    title,
    message,
    link: '/AdminProductLots',
    priority: type === 'ready' || daysUntilHarvest <= 2 ? 'urgent' : 'high',
    related_entity_type: 'ProductLot',
    related_entity_id: lot.id,
    requires_action: true,
    is_read: false,
    metadata: {
      lot_id: lot.id,
      lot_name: lot.lot_name,
      product_name: lot.product_name,
      harvest_date: lot.estimated_harvest_date,
      days_until_harvest: daysUntilHarvest,
      orders_count: ordersCount
    }
  });

  console.log(`✅ Admin alert created for lot ${lot.lot_name}`);
}

// ========== EMAIL TEMPLATES ==========

function generateHarvestReminderEmail(order, lot, harvestDate, daysUntilHarvest) {
  const orderNumber = order.order_number || order.id?.slice(-8);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #7CB342, #5a8f31); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🌾 Sắp Thu Hoạch!</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Xin chào <strong>${order.customer_name}</strong>,</p>
        <p>Sản phẩm bạn đặt trước sắp được thu hoạch:</p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #7CB342;">
          <p style="margin: 5px 0;"><strong>Đơn hàng:</strong> #${orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Sản phẩm:</strong> ${lot.product_name}</p>
          <p style="margin: 5px 0;"><strong>Lô hàng:</strong> ${lot.lot_name}</p>
          <p style="margin: 5px 0;"><strong>Ngày thu hoạch:</strong> ${harvestDate}</p>
          <p style="margin: 5px 0;"><strong>Còn:</strong> <span style="color: #FF9800; font-weight: bold;">${daysUntilHarvest} ngày</span></p>
        </div>

        ${order.remaining_amount > 0 ? `
        <div style="background: #FFF3E0; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #E65100;">
            💰 <strong>Số tiền còn lại:</strong> ${order.remaining_amount.toLocaleString('vi-VN')}đ
          </p>
        </div>
        ` : ''}

        <p>Chúng tôi sẽ liên hệ xác nhận thời gian giao hàng cụ thể.</p>
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          Cảm ơn bạn đã tin tưởng Farmer Smart! 🌿
        </p>
      </div>
    </div>
  `;
}

function generateHarvestReadyEmail(order, lot) {
  const orderNumber = order.order_number || order.id?.slice(-8);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #4CAF50, #2E7D32); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 Đã Thu Hoạch!</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Xin chào <strong>${order.customer_name}</strong>,</p>
        <p>Tin vui! Sản phẩm bạn đặt trước đã được thu hoạch:</p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #4CAF50;">
          <p style="margin: 5px 0;"><strong>Đơn hàng:</strong> #${orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Sản phẩm:</strong> ${lot.product_name}</p>
          <p style="margin: 5px 0;"><strong>Lô hàng:</strong> ${lot.lot_name}</p>
        </div>

        ${order.remaining_amount > 0 ? `
        <div style="background: #FFF3E0; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #E65100;">
            💰 <strong>Số tiền còn lại:</strong> ${order.remaining_amount.toLocaleString('vi-VN')}đ
          </p>
        </div>
        ` : ''}

        <p>Đang đóng gói và sẽ giao đến bạn trong thời gian sớm nhất!</p>
      </div>
    </div>
  `;
}

function generatePaymentReminderEmail(order, remainingAmount) {
  const orderNumber = order.order_number || order.id?.slice(-8);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #FF9800, #F57C00); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0;">💰 Nhắc Nhở Thanh Toán</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
        <p>Xin chào <strong>${order.customer_name}</strong>,</p>
        <p>Đơn hàng Pre-Order của bạn sắp được giao:</p>
        
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #FF9800;">
          <p style="margin: 5px 0;"><strong>Đơn hàng:</strong> #${orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Tổng đơn:</strong> ${(order.total_amount || 0).toLocaleString('vi-VN')}đ</p>
          <p style="margin: 5px 0;"><strong>Đã cọc:</strong> ${(order.deposit_amount || 0).toLocaleString('vi-VN')}đ</p>
          <p style="margin: 5px 0; font-size: 18px; color: #FF9800;"><strong>Còn lại:</strong> ${remainingAmount.toLocaleString('vi-VN')}đ</p>
        </div>

        <p>Bạn có thể thanh toán trước qua chuyển khoản hoặc khi nhận hàng (COD).</p>
      </div>
    </div>
  `;
}
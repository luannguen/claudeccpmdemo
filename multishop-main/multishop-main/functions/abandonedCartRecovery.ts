import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * 🛒 Abandoned Cart Recovery - Scheduled Job
 * 
 * Chạy mỗi giờ để phát hiện và gửi email khôi phục giỏ hàng bị bỏ quên
 * 
 * Trigger: Cron job (mỗi giờ)
 * Logic:
 * - Tìm giỏ hàng: active, last_activity > delay_hours, chưa gửi email
 * - Gửi email với sản phẩm + mã giảm giá (nếu bật)
 * - Cập nhật recovery_email_sent = true
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('🔍 Starting abandoned cart recovery check...');

    // Get configuration
    const configs = await base44.asServiceRole.entities.AbandonedCartConfig.list('-created_date', 1);
    const config = configs[0] || {
      enabled: true,
      delay_hours: 1,
      min_cart_value: 100000,
      discount_enabled: true,
      discount_type: 'percentage',
      discount_value: 10,
      urgency_hours: 24,
      max_emails_per_cart: 1
    };

    if (!config.enabled) {
      console.log('⏸️ Abandoned cart recovery is disabled');
      return Response.json({ message: 'Feature disabled', processed: 0 });
    }

    // Find abandoned carts
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - config.delay_hours * 60 * 60 * 1000);

    const allCarts = await base44.asServiceRole.entities.Cart.list('-last_activity', 500);
    
    const abandonedCarts = allCarts.filter(cart => {
      if (cart.status !== 'active') return false;
      if (cart.recovery_email_sent) return false;
      if ((cart.subtotal || 0) < config.min_cart_value) return false;
      
      const lastActivity = new Date(cart.last_activity || cart.created_date);
      if (lastActivity > cutoffTime) return false;

      return true;
    });

    console.log(`📊 Found ${abandonedCarts.length} abandoned carts`);

    let emailsSent = 0;
    let errors = 0;

    for (const cart of abandonedCarts) {
      try {
        // Generate discount code if enabled
        let discountCode = null;
        if (config.discount_enabled) {
          const codePrefix = config.discount_code_prefix || 'RECOVER';
          discountCode = `${codePrefix}${cart.id.slice(-6).toUpperCase()}`;
          
          // Create or update coupon
          const existingCoupons = await base44.asServiceRole.entities.Coupon.filter(
            { code: discountCode },
            '-created_date',
            1
          );

          if (existingCoupons.length === 0) {
            await base44.asServiceRole.entities.Coupon.create({
              code: discountCode,
              description: `Mã khôi phục giỏ hàng - ${config.discount_value}${config.discount_type === 'percentage' ? '%' : 'đ'} off`,
              discount_type: config.discount_type === 'percentage' ? 'percentage' : 'fixed_amount',
              discount_value: config.discount_value,
              min_order_amount: 0,
              usage_limit: 1,
              used_count: 0,
              start_date: new Date().toISOString().split('T')[0],
              end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              status: 'active',
              applicable_categories: []
            });
          }
        }

        // Build email HTML
        const emailHTML = generateAbandonedCartEmail(cart, config, discountCode);

        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'Farmer Smart',
          to: cart.user_email || cart.created_by,
          subject: config.email_subject || '🛒 Bạn đã quên giỏ hàng của mình?',
          body: emailHTML
        });

        // Update cart
        await base44.asServiceRole.entities.Cart.update(cart.id, {
          recovery_email_sent: true,
          recovery_email_date: now.toISOString(),
          metadata: {
            ...cart.metadata,
            discount_code: discountCode
          }
        });

        // Log communication
        await base44.asServiceRole.entities.CommunicationLog.create({
          customer_email: cart.user_email || cart.created_by,
          customer_name: 'Khách hàng',
          channel: 'email',
          type: 'cart_recovery',
          subject: config.email_subject,
          content: `Cart recovery email with ${cart.items?.length || 0} items`,
          status: 'sent',
          sent_date: now.toISOString(),
          metadata: {
            cart_id: cart.id,
            cart_value: cart.subtotal,
            discount_code: discountCode
          }
        });

        emailsSent++;
        console.log(`✅ Sent recovery email to ${cart.user_email || cart.created_by}`);
      } catch (err) {
        console.error(`❌ Failed to process cart ${cart.id}:`, err.message);
        errors++;
      }
    }

    // Update stats
    if (config.id) {
      await base44.asServiceRole.entities.AbandonedCartConfig.update(config.id, {
        stats: {
          ...(config.stats || {}),
          total_abandoned: (config.stats?.total_abandoned || 0) + abandonedCarts.length,
          emails_sent: (config.stats?.emails_sent || 0) + emailsSent
        }
      });
    }

    console.log(`✅ Completed: ${emailsSent} emails sent, ${errors} errors`);

    return Response.json({
      success: true,
      processed: abandonedCarts.length,
      emails_sent: emailsSent,
      errors
    });
  } catch (error) {
    console.error('❌ Abandoned cart recovery failed:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateAbandonedCartEmail(cart, config, discountCode) {
  const items = cart.items || [];
  const urgencyHours = config.urgency_hours || 24;
  
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Giỏ hàng của bạn đang chờ</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f5f9f3">
  <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f5f9f3">
    <tr>
      <td style="padding:40px 20px">
        <table role="presentation" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 12px rgba(0,0,0,0.1)">
          
          <!-- Header -->
          <tr>
            <td style="padding:40px 40px 30px;text-align:center;background:linear-gradient(135deg,#FF9800 0%,#F57C00 100%);border-radius:16px 16px 0 0">
              <div style="font-size:60px;margin-bottom:15px">🛒</div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600">Giỏ Hàng Đang Chờ Bạn!</h1>
              <p style="margin:10px 0 0;color:rgba(255,255,255,0.95);font-size:16px">Các sản phẩm tươi ngon đang chờ bạn hoàn tất đơn hàng</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px">
              <p style="margin:0 0 25px;color:#333;font-size:16px;line-height:1.6">Xin chào,</p>
              <p style="margin:0 0 30px;color:#666;font-size:15px;line-height:1.6">
                Chúng tôi nhận thấy bạn đã để lại <strong>${items.length} sản phẩm</strong> trong giỏ hàng. 
                Đừng bỏ lỡ những sản phẩm tươi ngon này nhé! 🌱
              </p>

              <!-- Urgency Box -->
              <div style="padding:20px;background:#FFF3E0;border-left:4px solid #FF9800;border-radius:8px;margin-bottom:30px">
                <p style="margin:0;color:#E65100;font-weight:600;font-size:14px">
                  ⏰ Giỏ hàng của bạn chỉ được giữ trong <strong>${urgencyHours} giờ</strong>!
                </p>
              </div>

              <!-- Cart Items -->
              <div style="margin-bottom:30px">
                <h3 style="margin:0 0 20px;color:#333;font-size:18px;font-weight:600">Sản phẩm trong giỏ:</h3>
                ${items.map(item => `
                  <div style="display:flex;gap:15px;padding:15px;background:#f8fdf5;border-radius:8px;margin-bottom:10px">
                    ${item.image_url ? `
                      <img src="${item.image_url}" alt="${item.product_name}" style="width:80px;height:80px;object-fit:cover;border-radius:8px">
                    ` : ''}
                    <div style="flex:1">
                      <p style="margin:0 0 5px;font-weight:600;color:#333">${item.product_name}</p>
                      <p style="margin:0;color:#666;font-size:14px">Số lượng: ${item.quantity}</p>
                      <p style="margin:5px 0 0;font-size:16px;font-weight:700;color:#7CB342">
                        ${(item.unit_price * item.quantity).toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Total -->
              <div style="padding:20px;background:linear-gradient(135deg,#E8F5E9 0%,#C8E6C9 100%);border-radius:12px;margin-bottom:30px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="font-size:18px;color:#2E7D32;font-weight:600">Tổng cộng:</span>
                  <span style="font-size:28px;font-weight:700;color:#2E7D32">${(cart.subtotal || 0).toLocaleString('vi-VN')}đ</span>
                </div>
              </div>

              ${discountCode ? `
                <!-- Discount Code -->
                <div style="padding:25px;background:linear-gradient(135deg,#FFE082 0%,#FFD54F 100%);border-radius:12px;margin-bottom:30px;text-align:center">
                  <p style="margin:0 0 10px;color:#F57F17;font-weight:600;font-size:16px">🎁 ĐẶC BIỆT CHỈ DÀNH CHO BẠN!</p>
                  <p style="margin:0 0 15px;color:#666;font-size:14px">Giảm ngay ${config.discount_value}${config.discount_type === 'percentage' ? '%' : 'đ'} khi hoàn tất đơn hàng:</p>
                  <div style="padding:15px 30px;background:#ffffff;border:2px dashed #FF9800;border-radius:8px;display:inline-block">
                    <p style="margin:0;font-size:24px;font-weight:700;color:#E65100;letter-spacing:2px">${discountCode}</p>
                  </div>
                  <p style="margin:15px 0 0;color:#666;font-size:12px">Có hiệu lực trong 7 ngày</p>
                </div>
              ` : ''}

              <!-- CTA Button -->
              <div style="text-align:center;margin-bottom:30px">
                <a href="${Deno.env.get('APP_URL') || 'https://farmersmart.vn'}/services" 
                   style="display:inline-block;padding:18px 50px;background:#7CB342;color:white;text-decoration:none;border-radius:12px;font-weight:700;font-size:18px;box-shadow:0 4px 12px rgba(124,179,66,0.3)">
                  🛒 Hoàn Tất Đơn Hàng Ngay
                </a>
              </div>

              <!-- Benefits -->
              <div style="padding:20px;background:#E3F2FD;border-radius:8px">
                <p style="margin:0 0 15px;color:#1976D2;font-weight:600">✨ Lợi ích khi đặt hàng:</p>
                <ul style="margin:0;padding-left:20px;color:#666;line-height:1.8">
                  <li>🚚 Giao hàng miễn phí đơn từ 200.000đ</li>
                  <li>🌱 Sản phẩm 100% organic, tươi ngon</li>
                  <li>⭐ Tích điểm đổi quà hấp dẫn</li>
                  <li>🔄 Đổi trả dễ dàng trong 7 ngày</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:30px 40px;text-align:center;background-color:#f5f9f3;border-radius:0 0 16px 16px">
              <p style="margin:0 0 10px;color:#666;font-size:14px">Cần hỗ trợ? Liên hệ: <a href="tel:+84987654321" style="color:#7CB342;text-decoration:none">098 765 4321</a></p>
              <p style="margin:0;color:#999;font-size:12px">© 2024 Farmer Smart 🌿</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
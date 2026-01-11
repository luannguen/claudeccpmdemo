/**
 * 🤖 Review Request Automation
 * Tự động gửi email yêu cầu đánh giá sau 3-7 ngày giao hàng
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Check if authenticated (cron job should use service role)
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🤖 Starting review request automation...');

    // Get all delivered orders from last 3-7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const orders = await base44.asServiceRole.entities.Order.list('-updated_date', 500);
    
    const eligibleOrders = orders.filter(order => {
      if (order.order_status !== 'delivered') return false;
      if (!order.updated_date) return false;
      
      const deliveredDate = new Date(order.updated_date);
      return deliveredDate >= sevenDaysAgo && deliveredDate <= threeDaysAgo;
    });

    console.log(`📊 Found ${eligibleOrders.length} eligible orders for review requests`);

    const results = [];
    for (const order of eligibleOrders) {
      try {
        // Check if review request already sent
        const metadata = order.metadata || {};
        if (metadata.review_request_sent) {
          console.log(`⏭️ Skipping order ${order.order_number} - already sent`);
          continue;
        }

        // Send review request email
        const emailSent = await sendReviewRequestEmail(order);
        
        if (emailSent) {
          // Mark as sent
          await base44.asServiceRole.entities.Order.update(order.id, {
            metadata: {
              ...metadata,
              review_request_sent: true,
              review_request_date: new Date().toISOString()
            }
          });

          results.push({
            order_id: order.id,
            order_number: order.order_number,
            customer_email: order.customer_email,
            status: 'sent'
          });

          console.log(`✅ Review request sent for order ${order.order_number}`);
        }
      } catch (error) {
        console.error(`❌ Failed to process order ${order.id}:`, error.message);
        results.push({
          order_id: order.id,
          status: 'failed',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('❌ Review automation error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});

async function sendReviewRequestEmail(order) {
  const orderNumber = order.order_number || order.id?.slice(-8);
  
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7CB342; margin: 0;">🌿 FARMER SMART</h1>
        <p style="color: #666; margin: 5px 0;">100% Organic</p>
      </div>

      <div style="background: #f5f9f3; padding: 30px; border-radius: 10px;">
        <h2 style="color: #0F0F0F; margin-top: 0;">Bạn thấy sản phẩm thế nào? ⭐</h2>
        
        <p style="color: #333; line-height: 1.6;">
          Xin chào <strong>${order.customer_name}</strong>,
        </p>

        <p style="color: #333; line-height: 1.6;">
          Cảm ơn bạn đã đặt hàng tại Farmer Smart! Đơn hàng <strong>#${orderNumber}</strong> 
          của bạn đã được giao thành công.
        </p>

        <p style="color: #333; line-height: 1.6;">
          Chúng tôi rất mong nhận được đánh giá của bạn về chất lượng sản phẩm và dịch vụ. 
          Ý kiến của bạn giúp chúng tôi ngày càng hoàn thiện hơn!
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${Deno.env.get('BASE_URL') || 'https://app.base44.com'}/MyOrders" 
             style="display: inline-block; background: #7CB342; color: white; padding: 15px 30px; 
                    text-decoration: none; border-radius: 8px; font-weight: bold;">
            ⭐ Đánh Giá Ngay
          </a>
        </div>

        <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <h3 style="color: #0F0F0F; margin-top: 0; font-size: 16px;">Đơn hàng của bạn:</h3>
          ${(order.items || []).map(item => `
            <div style="padding: 8px 0; border-bottom: 1px solid #eee;">
              <strong>${item.product_name}</strong> x ${item.quantity}
            </div>
          `).join('')}
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Nhận được đánh giá từ bạn sẽ giúp những khách hàng khác có thêm thông tin khi lựa chọn sản phẩm.
        </p>
      </div>

      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; margin: 5px 0;">
          Farmer Smart - Trang Trại Organic<br>
          Đường Trần Hưng Đạo, Phường 10, Đà Lạt, Lâm Đồng<br>
          📞 098 765 4321 | ✉️ info@farmersmart.vn
        </p>
      </div>
    </div>
  `;

  try {
    // Use Base44 integration to send email
    await fetch(`${Deno.env.get('BASE44_API_URL') || 'https://api.base44.com'}/integrations/Core/SendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('BASE44_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        from_name: 'Farmer Smart',
        to: order.customer_email,
        subject: `⭐ Đánh giá đơn hàng #${orderNumber} - Farmer Smart`,
        body: emailBody
      })
    });

    return true;
  } catch (error) {
    console.error('Failed to send review request email:', error);
    return false;
  }
}
/**
 * 📧 Shipping Notification Email Template
 * Responsive HTML email with inline CSS
 */

export function generateShippingNotificationEmail(order) {
  const orderNumber = order.order_number || order.id?.slice(-8);

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đơn hàng đang giao</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f9f3;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f9f3;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); border-radius: 12px 12px 0 0;">
              <div style="font-size: 60px; margin-bottom: 15px;">🚚</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Đơn Hàng Đang Được Giao!
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Đơn hàng của bạn đang trên đường đến 🎉
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 25px; color: #333333; font-size: 16px; line-height: 1.6;">
                Xin chào <strong style="color: #4A90E2;">${order.customer_name}</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                Tin vui! Đơn hàng <strong>#${orderNumber}</strong> của bạn đã được giao cho đơn vị vận chuyển và đang trên đường đến địa chỉ của bạn.
              </p>

              <!-- Tracking Info -->
              ${order.tracking_number ? `
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <div style="font-size: 13px; color: #1976D2; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Mã vận đơn</div>
                    <div style="font-size: 24px; font-weight: 700; color: #0D47A1; letter-spacing: 1px; font-family: 'Courier New', monospace;">${order.tracking_number}</div>
                    ${order.shipper_name ? `
                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(25, 118, 210, 0.2);">
                      <div style="font-size: 13px; color: #1976D2; margin-bottom: 5px;">Shipper</div>
                      <div style="font-size: 15px; font-weight: 600; color: #333333;">${order.shipper_name}</div>
                      ${order.shipper_phone ? `<div style="font-size: 14px; color: #666666; margin-top: 3px;">📱 ${order.shipper_phone}</div>` : ''}
                    </div>
                    ` : ''}
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- Delivery Timeline -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 20px; color: #333333; font-size: 16px; font-weight: 600;">📍 Trạng thái giao hàng</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="width: 40px; vertical-align: top; padding-bottom: 20px;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #7CB342; border: 3px solid #C5E1A5;"></div>
                    </td>
                    <td style="vertical-align: top; padding-bottom: 20px;">
                      <div style="font-weight: 600; color: #333333; font-size: 14px; margin-bottom: 3px;">Đơn hàng đã xác nhận</div>
                      <div style="color: #999999; font-size: 12px;">Đơn hàng đã được xác nhận và chuẩn bị</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 40px; vertical-align: top; padding-bottom: 20px; position: relative;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #4A90E2; border: 3px solid #90CAF9; animation: pulse 2s infinite;"></div>
                      <div style="position: absolute; left: 11px; top: -20px; bottom: 24px; width: 2px; background: linear-gradient(180deg, #7CB342 0%, #4A90E2 100%);"></div>
                    </td>
                    <td style="vertical-align: top; padding-bottom: 20px;">
                      <div style="font-weight: 600; color: #4A90E2; font-size: 14px; margin-bottom: 3px;">🚚 Đang giao hàng</div>
                      <div style="color: #4A90E2; font-size: 12px;">Đơn hàng đang trên đường đến bạn</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 40px; vertical-align: top;">
                      <div style="width: 24px; height: 24px; border-radius: 50%; background-color: #E0E0E0; border: 3px solid #F5F5F5;"></div>
                      <div style="position: absolute; left: 11px; top: 44px; bottom: 0; width: 2px; background: linear-gradient(180deg, #4A90E2 0%, #E0E0E0 100%);"></div>
                    </td>
                    <td style="vertical-align: top;">
                      <div style="font-weight: 600; color: #999999; font-size: 14px; margin-bottom: 3px;">Giao hàng thành công</div>
                      <div style="color: #CCCCCC; font-size: 12px;">Sắp đến nơi...</div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Delivery Address -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 16px; font-weight: 600;">📍 Địa chỉ giao hàng</h3>
                <p style="margin: 0; padding: 15px; background: #f5f9f3; border-left: 3px solid #4A90E2; border-radius: 4px; color: #555555; font-size: 14px; line-height: 1.6;">
                  ${order.shipping_address}${order.shipping_ward ? ', ' + order.shipping_ward : ''}${order.shipping_district ? ', ' + order.shipping_district : ''}${order.shipping_city ? ', ' + order.shipping_city : ''}
                </p>
              </div>

              <!-- Important Notes -->
              <div style="padding: 20px; background: #FFF3E0; border-left: 4px solid #FF9800; border-radius: 4px; margin-bottom: 30px;">
                <h4 style="margin: 0 0 10px; color: #F57C00; font-size: 14px; font-weight: 600;">⚠️ Lưu ý quan trọng</h4>
                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 13px; line-height: 1.7;">
                  <li>Vui lòng giữ điện thoại liên lạc</li>
                  <li>Shipper sẽ gọi trước khi đến</li>
                  <li>Kiểm tra hàng trước khi nhận</li>
                  ${order.payment_method === 'cod' ? '<li><strong>Chuẩn bị ' + (order.total_amount || 0).toLocaleString('vi-VN') + 'đ tiền mặt</strong></li>' : ''}
                </ul>
              </div>

              <!-- Contact Support -->
              <div style="padding: 20px; background: #f5f9f3; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                  Cần thay đổi địa chỉ hoặc hỗ trợ?
                </p>
                <p style="margin: 0; font-size: 14px;">
                  <a href="tel:+84987654321" style="color: #4A90E2; text-decoration: none; font-weight: 600;">📞 098 765 4321</a>
                  <span style="color: #cccccc; margin: 0 10px;">|</span>
                  <a href="mailto:info@farmersmart.vn" style="color: #4A90E2; text-decoration: none; font-weight: 600;">✉️ info@farmersmart.vn</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f5f9f3; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 10px; color: #999999; font-size: 12px;">
                Email này được gửi tự động, vui lòng không reply
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2024 Farmer Smart - Trang trại organic hàng đầu Việt Nam 🌿
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
  
  <style>
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }
  </style>
</body>
</html>
  `.trim();
}

export default generateShippingNotificationEmail;
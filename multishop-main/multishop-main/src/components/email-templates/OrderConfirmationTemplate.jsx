/**
 * 📧 Order Confirmation Email Template
 * Responsive HTML email with inline CSS
 */

export function generateOrderConfirmationEmail(order) {
  const orderNumber = order.order_number || order.id?.slice(-8);
  const orderDate = new Date(order.created_date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận đơn hàng</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f9f3;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f9f3;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #7CB342 0%, #558B2F 100%); border-radius: 12px 12px 0 0;">
              <div style="font-size: 60px; margin-bottom: 15px;">✅</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Đơn Hàng Đã Được Xác Nhận!
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Cảm ơn bạn đã tin tưởng Farmer Smart 🌿
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 25px; color: #333333; font-size: 16px; line-height: 1.6;">
                Xin chào <strong style="color: #7CB342;">${order.customer_name}</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                Đơn hàng của bạn đã được tiếp nhận và chúng tôi đang chuẩn bị sản phẩm tươi ngon nhất cho bạn!
              </p>

              <!-- Order Info Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f8fdf5; border-radius: 8px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 25px;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Mã đơn hàng:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #7CB342; font-size: 16px;">#${orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Ngày đặt:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 500; color: #333333; font-size: 14px;">${orderDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: #666666; font-size: 14px;">Phương thức:</td>
                        <td style="padding: 8px 0; text-align: right; font-weight: 500; color: #333333; font-size: 14px;">
                          ${order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng' : 
                            order.payment_method === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                            order.payment_method === 'momo' ? 'Ví MoMo' : 'VNPay'}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 16px; font-weight: 600;">📍 Địa chỉ giao hàng</h3>
                <p style="margin: 0; padding: 15px; background: #f5f9f3; border-left: 3px solid #7CB342; border-radius: 4px; color: #555555; font-size: 14px; line-height: 1.6;">
                  ${order.shipping_address}${order.shipping_ward ? ', ' + order.shipping_ward : ''}${order.shipping_district ? ', ' + order.shipping_district : ''}${order.shipping_city ? ', ' + order.shipping_city : ''}
                </p>
              </div>

              <!-- Order Items -->
              <h3 style="margin: 0 0 20px; color: #333333; font-size: 16px; font-weight: 600;">🛒 Chi tiết đơn hàng</h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                ${(order.items || []).map(item => `
                  <tr style="border-bottom: 1px solid #eeeeee;">
                    <td style="padding: 15px 10px 15px 0;">
                      <div style="font-weight: 500; color: #333333; font-size: 14px; margin-bottom: 4px;">${item.product_name}</div>
                      <div style="color: #999999; font-size: 12px;">Số lượng: ${item.quantity}</div>
                    </td>
                    <td style="padding: 15px 0; text-align: right; white-space: nowrap;">
                      <div style="font-weight: 600; color: #333333; font-size: 14px;">${(item.subtotal || 0).toLocaleString('vi-VN')}đ</div>
                    </td>
                  </tr>
                `).join('')}
              </table>

              <!-- Order Summary -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Tạm tính:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 500; color: #333333; font-size: 14px;">${(order.subtotal || 0).toLocaleString('vi-VN')}đ</td>
                </tr>
                ${order.shipping_fee ? `
                <tr>
                  <td style="padding: 8px 0; color: #666666; font-size: 14px;">Phí vận chuyển:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 500; color: #333333; font-size: 14px;">${order.shipping_fee.toLocaleString('vi-VN')}đ</td>
                </tr>
                ` : ''}
                ${order.discount_amount ? `
                <tr>
                  <td style="padding: 8px 0; color: #7CB342; font-size: 14px;">Giảm giá:</td>
                  <td style="padding: 8px 0; text-align: right; font-weight: 500; color: #7CB342; font-size: 14px;">-${order.discount_amount.toLocaleString('vi-VN')}đ</td>
                </tr>
                ` : ''}
                <tr style="border-top: 2px solid #7CB342;">
                  <td style="padding: 15px 0 0; color: #333333; font-size: 16px; font-weight: 600;">Tổng cộng:</td>
                  <td style="padding: 15px 0 0; text-align: right; font-weight: 700; color: #7CB342; font-size: 20px;">${(order.total_amount || 0).toLocaleString('vi-VN')}đ</td>
                </tr>
              </table>

              <!-- Note if exists -->
              ${order.note ? `
              <div style="padding: 15px; background: #fff9e6; border-left: 3px solid #FF9800; border-radius: 4px; margin-bottom: 30px;">
                <div style="font-weight: 600; color: #FF9800; font-size: 13px; margin-bottom: 5px;">📝 Ghi chú của bạn:</div>
                <div style="color: #666666; font-size: 13px; line-height: 1.5;">${order.note}</div>
              </div>
              ` : ''}

              <!-- Contact Info -->
              <div style="padding: 20px; background: #f5f9f3; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                  Cần hỗ trợ? Liên hệ ngay với chúng tôi
                </p>
                <p style="margin: 0; font-size: 14px;">
                  <a href="tel:+84987654321" style="color: #7CB342; text-decoration: none; font-weight: 600;">📞 098 765 4321</a>
                  <span style="color: #cccccc; margin: 0 10px;">|</span>
                  <a href="mailto:info@farmersmart.vn" style="color: #7CB342; text-decoration: none; font-weight: 600;">✉️ info@farmersmart.vn</a>
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
</body>
</html>
  `.trim();
}

export default generateOrderConfirmationEmail;
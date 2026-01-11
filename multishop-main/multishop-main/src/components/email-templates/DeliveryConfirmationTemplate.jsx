/**
 * 📧 Delivery Confirmation Email Template
 * Responsive HTML email with inline CSS
 */

export function generateDeliveryConfirmationEmail(order) {
  const orderNumber = order.order_number || order.id?.slice(-8);

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Giao hàng thành công</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f9f3;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f9f3;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); border-radius: 12px 12px 0 0;">
              <div style="font-size: 80px; margin-bottom: 15px; animation: bounceIn 0.8s;">🎉</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Giao Hàng Thành Công!
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Cảm ơn bạn đã mua sắm tại Farmer Smart 🌿
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 25px; color: #333333; font-size: 16px; line-height: 1.6;">
                Xin chào <strong style="color: #4CAF50;">${order.customer_name}</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                Đơn hàng <strong>#${orderNumber}</strong> của bạn đã được giao thành công! Chúc bạn thưởng thức những sản phẩm organic tươi ngon nhất. 🥬🍅
              </p>

              <!-- Success Icon -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border-radius: 12px; margin-bottom: 30px;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: #4CAF50; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);">
                      <div style="font-size: 40px; color: white;">✓</div>
                    </div>
                    <div style="font-size: 18px; font-weight: 600; color: #2E7D32; margin-bottom: 5px;">Đơn hàng đã giao thành công</div>
                    <div style="font-size: 14px; color: #66BB6A;">${new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                  </td>
                </tr>
              </table>

              <!-- Order Summary -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 16px; font-weight: 600;">📦 Thông tin đơn hàng</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f5f9f3; border-radius: 8px; padding: 20px;">
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #666666; font-size: 14px;">Mã đơn hàng:</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="font-weight: 600; color: #333333; font-size: 14px;">#${orderNumber}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #666666; font-size: 14px;">Tổng giá trị:</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="font-weight: 700; color: #4CAF50; font-size: 16px;">${(order.total_amount || 0).toLocaleString('vi-VN')}đ</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <span style="color: #666666; font-size: 14px;">Số sản phẩm:</span>
                    </td>
                    <td style="padding: 8px 0; text-align: right;">
                      <span style="font-weight: 600; color: #333333; font-size: 14px;">${(order.items || []).length} sản phẩm</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Review Request -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%); border-radius: 12px; margin-bottom: 30px; border: 2px solid #FFD54F;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <div style="font-size: 40px; margin-bottom: 15px;">⭐⭐⭐⭐⭐</div>
                    <h3 style="margin: 0 0 10px; color: #F57F17; font-size: 18px; font-weight: 700;">Hài lòng với đơn hàng?</h3>
                    <p style="margin: 0 0 20px; color: #666666; font-size: 14px; line-height: 1.6;">
                      Chia sẻ trải nghiệm của bạn để giúp những người khác đưa ra lựa chọn tốt hơn!
                    </p>
                    <table role="presentation" style="margin: 0 auto;">
                      <tr>
                        <td style="border-radius: 8px; background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);">
                          <a href="${process.env.BASE44_APP_URL || 'https://farmersmart.base44.com'}/my-orders" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 15px;">
                            ⭐ Đánh Giá Ngay
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin: 15px 0 0; color: #999999; font-size: 12px;">
                      🎁 Nhận ngay điểm thưởng khi đánh giá
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Product Care Tips -->
              <div style="padding: 20px; background: #E8F5E9; border-left: 4px solid #4CAF50; border-radius: 4px; margin-bottom: 30px;">
                <h4 style="margin: 0 0 12px; color: #2E7D32; font-size: 14px; font-weight: 600;">💡 Mẹo bảo quản sản phẩm</h4>
                <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 13px; line-height: 1.8;">
                  <li>Rau củ organic nên được bảo quản trong ngăn mát tủ lạnh</li>
                  <li>Rửa sạch trước khi sử dụng</li>
                  <li>Nên dùng trong vòng 3-5 ngày để đảm bảo độ tươi ngon</li>
                  <li>Tránh để chung với thực phẩm có mùi mạnh</li>
                </ul>
              </div>

              <!-- Loyalty Program -->
              <div style="padding: 25px; background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%); border-radius: 12px; text-align: center; margin-bottom: 30px;">
                <div style="font-size: 32px; margin-bottom: 10px;">🎯</div>
                <h4 style="margin: 0 0 10px; color: #6A1B9A; font-size: 16px; font-weight: 600;">Chương trình khách hàng thân thiết</h4>
                <p style="margin: 0; color: #666666; font-size: 13px; line-height: 1.6;">
                  Tích điểm với mỗi đơn hàng và nhận ưu đãi đặc biệt!
                </p>
              </div>

              <!-- Contact Support -->
              <div style="padding: 20px; background: #f5f9f3; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                  Có vấn đề với đơn hàng?
                </p>
                <p style="margin: 0; font-size: 14px;">
                  <a href="tel:+84987654321" style="color: #4CAF50; text-decoration: none; font-weight: 600;">📞 098 765 4321</a>
                  <span style="color: #cccccc; margin: 0 10px;">|</span>
                  <a href="mailto:info@farmersmart.vn" style="color: #4CAF50; text-decoration: none; font-weight: 600;">✉️ info@farmersmart.vn</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background-color: #f5f9f3; border-radius: 0 0 12px 12px;">
              <p style="margin: 0 0 15px; color: #333333; font-size: 14px; font-weight: 600;">
                Cảm ơn bạn đã tin tưởng Farmer Smart! 💚
              </p>
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
    @keyframes bounceIn {
      0% { transform: scale(0.3); opacity: 0; }
      50% { transform: scale(1.05); }
      70% { transform: scale(0.9); }
      100% { transform: scale(1); opacity: 1; }
    }
  </style>
</body>
</html>
  `.trim();
}

export default generateDeliveryConfirmationEmail;
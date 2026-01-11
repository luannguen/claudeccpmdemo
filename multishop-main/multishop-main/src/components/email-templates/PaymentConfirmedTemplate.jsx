/**
 * 📧 Payment Confirmed Email Template
 * Responsive HTML email with inline CSS
 */

export function generatePaymentConfirmedEmail(order) {
  const orderNumber = order.order_number || order.id?.slice(-8);

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận thanh toán</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f9f3;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f9f3;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #00C853 0%, #00E676 100%); border-radius: 12px 12px 0 0;">
              <div style="font-size: 60px; margin-bottom: 15px;">✅</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Thanh Toán Thành Công!
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Đơn hàng đang được chuẩn bị 🎉
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 25px; color: #333333; font-size: 16px; line-height: 1.6;">
                Xin chào <strong style="color: #00C853;">${order.customer_name}</strong>,
              </p>
              <p style="margin: 0 0 30px; color: #666666; font-size: 15px; line-height: 1.6;">
                Chúng tôi đã nhận được thanh toán của bạn cho đơn hàng <strong>#${orderNumber}</strong>. Đơn hàng của bạn đang được chuẩn bị và sẽ sớm được giao đến tay bạn!
              </p>

              <!-- Payment Success Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%); border-radius: 12px; margin-bottom: 30px; border: 2px solid #00C853;">
                <tr>
                  <td style="padding: 30px; text-align: center;">
                    <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: #00C853; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 200, 83, 0.3);">
                      <div style="font-size: 40px; color: white;">💳</div>
                    </div>
                    <div style="font-size: 18px; font-weight: 700; color: #1B5E20; margin-bottom: 8px;">Thanh toán đã được xác nhận</div>
                    <div style="font-size: 32px; font-weight: 700; color: #00C853; margin-bottom: 5px;">${(order.total_amount || 0).toLocaleString('vi-VN')}đ</div>
                    <div style="font-size: 13px; color: #66BB6A;">
                      ${order.payment_method === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                        order.payment_method === 'momo' ? 'Ví MoMo' :
                        order.payment_method === 'vnpay' ? 'VNPay' : 'Thanh toán'}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Order Info -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 16px; font-weight: 600;">📋 Thông tin đơn hàng</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f5f9f3; border-radius: 8px;">
                  <tr>
                    <td style="padding: 20px;">
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td style="padding: 8px 0; color: #666666; font-size: 14px;">Mã đơn hàng:</td>
                          <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #333333; font-size: 14px;">#${orderNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666666; font-size: 14px;">Ngày thanh toán:</td>
                          <td style="padding: 8px 0; text-align: right; font-weight: 500; color: #333333; font-size: 14px;">${new Date().toLocaleDateString('vi-VN')}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #666666; font-size: 14px;">Trạng thái:</td>
                          <td style="padding: 8px 0; text-align: right;">
                            <span style="display: inline-block; padding: 4px 12px; background: #00C853; color: white; border-radius: 20px; font-size: 12px; font-weight: 600;">Đã thanh toán</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Next Steps -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 20px; color: #333333; font-size: 16px; font-weight: 600;">🚀 Các bước tiếp theo</h3>
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="width: 40px; vertical-align: top; padding-bottom: 20px;">
                      <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #00C853 0%, #00E676 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">1</div>
                    </td>
                    <td style="vertical-align: top; padding-bottom: 20px; padding-left: 15px;">
                      <div style="font-weight: 600; color: #333333; font-size: 14px; margin-bottom: 4px;">Xác nhận thanh toán</div>
                      <div style="color: #00C853; font-size: 13px; font-weight: 600;">✓ Hoàn thành</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 40px; vertical-align: top; padding-bottom: 20px;">
                      <div style="width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 14px;">2</div>
                      <div style="position: absolute; left: 15px; top: 32px; bottom: 52px; width: 2px; background: linear-gradient(180deg, #00C853 0%, #4A90E2 100%); margin-left: 41px; margin-top: -20px; height: 20px;"></div>
                    </td>
                    <td style="vertical-align: top; padding-bottom: 20px; padding-left: 15px;">
                      <div style="font-weight: 600; color: #333333; font-size: 14px; margin-bottom: 4px;">Chuẩn bị hàng</div>
                      <div style="color: #4A90E2; font-size: 13px;">Đang xử lý...</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="width: 40px; vertical-align: top;">
                      <div style="width: 32px; height: 32px; border-radius: 50%; background: #E0E0E0; display: flex; align-items: center; justify-content: center; color: #999999; font-weight: 700; font-size: 14px;">3</div>
                      <div style="position: absolute; left: 15px; top: 84px; bottom: 0; width: 2px; background: linear-gradient(180deg, #4A90E2 0%, #E0E0E0 100%); margin-left: 41px; margin-top: -20px; height: 20px;"></div>
                    </td>
                    <td style="vertical-align: top; padding-left: 15px;">
                      <div style="font-weight: 600; color: #999999; font-size: 14px; margin-bottom: 4px;">Giao hàng</div>
                      <div style="color: #CCCCCC; font-size: 13px;">Chờ xử lý</div>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Order Items Preview -->
              <div style="margin-bottom: 30px;">
                <h3 style="margin: 0 0 15px; color: #333333; font-size: 16px; font-weight: 600;">🛒 Sản phẩm trong đơn</h3>
                <div style="padding: 20px; background: #f5f9f3; border-radius: 8px;">
                  <p style="margin: 0; color: #666666; font-size: 14px;">
                    <strong style="color: #333333;">${(order.items || []).length} sản phẩm</strong> organic tươi ngon đang được chuẩn bị
                  </p>
                </div>
              </div>

              <!-- Important Note -->
              <div style="padding: 20px; background: #E1F5FE; border-left: 4px solid #03A9F4; border-radius: 4px; margin-bottom: 30px;">
                <h4 style="margin: 0 0 10px; color: #0277BD; font-size: 14px; font-weight: 600;">ℹ️ Lưu ý</h4>
                <p style="margin: 0; color: #666666; font-size: 13px; line-height: 1.7;">
                  Chúng tôi sẽ gửi email thông báo khi đơn hàng được giao cho đơn vị vận chuyển. Bạn có thể theo dõi trạng thái đơn hàng bất kỳ lúc nào trên website hoặc app.
                </p>
              </div>

              <!-- Contact Support -->
              <div style="padding: 20px; background: #f5f9f3; border-radius: 8px; text-align: center;">
                <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                  Có thắc mắc về thanh toán?
                </p>
                <p style="margin: 0; font-size: 14px;">
                  <a href="tel:+84987654321" style="color: #00C853; text-decoration: none; font-weight: 600;">📞 098 765 4321</a>
                  <span style="color: #cccccc; margin: 0 10px;">|</span>
                  <a href="mailto:info@farmersmart.vn" style="color: #00C853; text-decoration: none; font-weight: 600;">✉️ info@farmersmart.vn</a>
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

export default generatePaymentConfirmedEmail;
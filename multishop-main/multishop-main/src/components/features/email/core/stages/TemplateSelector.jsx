/**
 * 📧 Template Selector Stage
 * 
 * Stage 2: Select template by email type
 * 
 * Input: context.emailPayload.emailType
 * Output: context.template (selected template with subject & body)
 */

import { emailTemplateRepository } from '../../infrastructure/repositories/emailTemplateRepository';
import { BUILT_IN_TEMPLATES } from '../../types/EmailDTO';

/**
 * Select template for email type
 * 
 * @param {Object} context - Pipeline context
 * @returns {Object} Updated context fields
 */
export async function templateSelector(context) {
  const { emailPayload } = context;
  
  if (!emailPayload) {
    throw new Error('Email payload not available. Run PayloadNormalizer first.');
  }

  const { emailType } = emailPayload;
  
  console.log(`📧 [TemplateSelector] Selecting template for: ${emailType}`);

  let template = null;

  // 1. Try to get custom template from database
  try {
    template = await emailTemplateRepository.getActiveTemplate(emailType);
    if (template) {
      console.log(`📧 [TemplateSelector] Found custom template: ${template.name}`);
    }
  } catch (error) {
    console.warn(`⚠️ [TemplateSelector] DB lookup failed: ${error.message}`);
  }

  // 2. Fallback to built-in template
  if (!template) {
    template = getBuiltInTemplate(emailType);
    if (template) {
      console.log(`📧 [TemplateSelector] Using built-in template for: ${emailType}`);
    }
  }

  // 3. Fallback to generic template
  if (!template) {
    template = getGenericTemplate(emailType, emailPayload);
    console.log(`📧 [TemplateSelector] Using generic fallback template`);
  }

  return { 
    template: {
      ...template,
      source: template.id ? 'database' : 'builtin',
      emailType
    }
  };
}

/**
 * Get built-in template by type
 */
function getBuiltInTemplate(emailType) {
  const templates = {
    order_confirmation: {
      name: 'Order Confirmation',
      subject: '✅ Xác nhận đơn hàng #{{order_number}}',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #7CB342, #558B2F); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Đơn Hàng Đã Xác Nhận</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Cảm ơn bạn đã đặt hàng! Đơn hàng #{{order_number}} đã được xác nhận.</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>Tổng tiền:</strong> {{total_amount_formatted}}</p>
              {{#if shipping_address}}
              <p><strong>Địa chỉ giao hàng:</strong> {{shipping_address}}</p>
              {{/if}}
            </div>
            
            <p>Chúng tôi sẽ thông báo khi đơn hàng được giao.</p>
            <p style="color: #666;">Cảm ơn bạn đã mua sắm tại Farmer Smart! 🌿</p>
          </div>
        </div>
      `
    },

    shipping_notification: {
      name: 'Shipping Notification',
      subject: '🚚 Đơn hàng #{{order_number}} đang được giao',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1976D2, #0D47A1); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🚚 Đang Giao Hàng</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Đơn hàng #{{order_number}} đang trên đường đến bạn!</p>
            
            {{#if tracking_number}}
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>Mã vận đơn:</strong> {{tracking_number}}</p>
              {{#if shipper_name}}
              <p><strong>Shipper:</strong> {{shipper_name}} - {{shipper_phone}}</p>
              {{/if}}
            </div>
            {{/if}}
            
            <p>Hãy chuẩn bị nhận hàng nhé! 📦</p>
          </div>
        </div>
      `
    },

    payment_confirmed: {
      name: 'Payment Confirmed',
      subject: '💳 Thanh toán thành công - Đơn #{{order_number}}',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #43A047, #2E7D32); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">💳 Thanh Toán Thành Công</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Chúng tôi đã nhận được thanh toán cho đơn hàng #{{order_number}}.</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>Số tiền:</strong> {{total_amount_formatted}}</p>
              <p><strong>Phương thức:</strong> {{payment_method}}</p>
            </div>
            
            <p>Đơn hàng đang được chuẩn bị. Cảm ơn bạn! 🙏</p>
          </div>
        </div>
      `
    },

    payment_failed: {
      name: 'Payment Failed',
      subject: '⚠️ Thanh toán thất bại - Đơn #{{order_number}}',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E53935, #C62828); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">⚠️ Thanh Toán Thất Bại</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Thanh toán cho đơn hàng #{{order_number}} không thành công.</p>
            
            <div style="background: #FFEBEE; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #C62828;">Vui lòng thử thanh toán lại hoặc liên hệ hỗ trợ.</p>
            </div>
          </div>
        </div>
      `
    },

    cart_recovery: {
      name: 'Cart Recovery',
      subject: '🛒 Bạn quên giỏ hàng rồi!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF9800, #F57C00); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🛒 Giỏ Hàng Đang Chờ Bạn!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào,</p>
            <p>Bạn có {{items_count}} sản phẩm trong giỏ hàng đang chờ thanh toán.</p>
            
            {{#if discount_code}}
            <div style="background: #FFF3E0; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
              <p style="margin: 0;">🎁 Mã giảm giá: <strong>{{discount_code}}</strong></p>
            </div>
            {{/if}}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{checkout_url}}" style="background: #FF9800; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Hoàn Tất Đơn Hàng
              </a>
            </div>
          </div>
        </div>
      `
    },

    welcome_email: {
      name: 'Welcome Email',
      subject: '🎉 Chào mừng bạn đến với Farmer Smart!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #7CB342, #558B2F); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🎉 Chào Mừng!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{full_name}}</strong>,</p>
            <p>Chào mừng bạn đến với Farmer Smart - nơi cung cấp nông sản sạch từ trang trại đến bàn ăn!</p>
            
            <p>Hãy khám phá các sản phẩm tươi ngon của chúng tôi ngay hôm nay. 🌱</p>
          </div>
        </div>
      `
    },

    harvest_ready: {
      name: 'Harvest Ready',
      subject: '🌾 Sản phẩm {{product_name}} đã thu hoạch!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8BC34A, #689F38); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🌾 Đã Thu Hoạch!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Tin vui! Sản phẩm <strong>{{product_name}}</strong> trong đơn hàng #{{order_number}} đã được thu hoạch.</p>
            
            <p>Chúng tôi đang đóng gói và sẽ giao đến bạn sớm nhất! 📦</p>
          </div>
        </div>
      `
    },

    referral_commission: {
      name: 'Referral Commission',
      subject: '💰 Bạn nhận được {{commission_amount_formatted}} hoa hồng!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FFC107, #FFA000); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">💰 Hoa Hồng Mới!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{name}}</strong>,</p>
            <p>Bạn vừa nhận được <strong>{{commission_amount_formatted}}</strong> hoa hồng từ đơn hàng của {{referred_customer}}!</p>
            
            <p>Tiếp tục giới thiệu để nhận thêm hoa hồng nhé! 🎉</p>
          </div>
        </div>
      `
    },

    // ========== SECURITY TEMPLATES (v2.6.0) ==========
    security_password_changed: {
      name: 'Password Changed',
      subject: '🔐 Mật khẩu của bạn đã được thay đổi',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1976D2, #0D47A1); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🔐 Mật Khẩu Đã Thay Đổi</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Mật khẩu tài khoản của bạn đã được thay đổi thành công vào lúc <strong>{{changed_date}}</strong>.</p>
            
            <div style="background: #E3F2FD; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Thiết bị:</strong> {{device_info}}</p>
            </div>
            
            <p style="color: #C62828;">⚠️ Nếu bạn không thực hiện thay đổi này, vui lòng liên hệ hỗ trợ ngay!</p>
          </div>
        </div>
      `
    },

    security_password_reset: {
      name: 'Password Reset Request',
      subject: '🔑 Yêu cầu đặt lại mật khẩu',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF9800, #F57C00); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🔑 Đặt Lại Mật Khẩu</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{reset_link}}" style="background: #FF9800; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Đặt Lại Mật Khẩu
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">Link này có hiệu lực trong {{expiry_time}}. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
          </div>
        </div>
      `
    },

    security_new_device: {
      name: 'New Device Login',
      subject: '⚠️ Đăng nhập từ thiết bị mới',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E53935, #C62828); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">⚠️ Đăng Nhập Mới</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Tài khoản của bạn vừa đăng nhập từ một thiết bị mới.</p>
            
            <div style="background: #FFEBEE; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Thiết bị:</strong> {{device_info}}</p>
              <p style="margin: 5px 0;"><strong>Thời gian:</strong> {{login_time}}</p>
              <p style="margin: 5px 0;"><strong>Vị trí:</strong> {{location}}</p>
            </div>
            
            <p style="color: #C62828;">Nếu đây không phải bạn, vui lòng đổi mật khẩu ngay và liên hệ hỗ trợ!</p>
          </div>
        </div>
      `
    },

    // ========== REFUND TEMPLATES (v2.6.0) ==========
    refund_requested: {
      name: 'Refund Requested',
      subject: '📝 Yêu cầu hoàn tiền #{{order_number}} đã nhận',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #607D8B, #455A64); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">📝 Yêu Cầu Hoàn Tiền</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Chúng tôi đã nhận được yêu cầu hoàn tiền cho đơn hàng #{{order_number}}.</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>Số tiền:</strong> {{amount}}đ</p>
              <p><strong>Lý do:</strong> {{reason}}</p>
            </div>
            
            <p>Chúng tôi sẽ xử lý trong vòng 2-3 ngày làm việc.</p>
          </div>
        </div>
      `
    },

    refund_approved: {
      name: 'Refund Approved',
      subject: '✅ Yêu cầu hoàn tiền #{{order_number}} đã được duyệt',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4CAF50, #388E3C); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">✅ Hoàn Tiền Được Duyệt</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Yêu cầu hoàn tiền cho đơn hàng #{{order_number}} đã được duyệt!</p>
            
            <div style="background: #E8F5E9; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>Số tiền hoàn:</strong> {{amount}}đ</p>
              <p><strong>Phương thức:</strong> {{refund_method}}</p>
            </div>
            
            <p>Tiền sẽ được chuyển về tài khoản trong 3-5 ngày làm việc.</p>
          </div>
        </div>
      `
    },

    refund_succeeded: {
      name: 'Refund Succeeded',
      subject: '💵 Hoàn tiền thành công #{{order_number}}',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #43A047, #2E7D32); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">💵 Hoàn Tiền Thành Công</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Hoàn tiền cho đơn hàng #{{order_number}} đã hoàn tất!</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>Số tiền:</strong> {{amount}}đ</p>
              <p><strong>Mã giao dịch:</strong> {{txn_id}}</p>
              <p><strong>Ngày hoàn:</strong> {{refund_date}}</p>
            </div>
            
            <p>Cảm ơn bạn đã mua sắm tại Farmer Smart! 🙏</p>
          </div>
        </div>
      `
    },

    // ========== LOYALTY TEMPLATES (v2.6.0) ==========
    loyalty_points_expiring: {
      name: 'Points Expiring Soon',
      subject: '⏰ {{points}} điểm sắp hết hạn!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF5722, #E64A19); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">⏰ Điểm Sắp Hết Hạn!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Bạn có <strong style="color: #FF5722; font-size: 24px;">{{points}}</strong> điểm sắp hết hạn vào ngày <strong>{{expiry_date}}</strong>!</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: #FF5722; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Sử Dụng Điểm Ngay
              </a>
            </div>
            
            <p style="color: #666;">Đừng để điểm thưởng của bạn bị mất!</p>
          </div>
        </div>
      `
    },

    loyalty_tier_upgraded: {
      name: 'Tier Upgraded',
      subject: '🎉 Chúc mừng bạn đã thăng hạng {{new_tier}}!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #9C27B0, #7B1FA2); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">🎉 Thăng Hạng!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{customer_name}}</strong>,</p>
            <p>Chúc mừng bạn đã thăng hạng lên <strong style="color: #9C27B0; font-size: 20px;">{{new_tier}}</strong>!</p>
            
            <div style="background: #F3E5F5; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="font-weight: bold; margin-bottom: 10px;">Quyền lợi mới của bạn:</p>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Giảm giá ưu đãi hơn</li>
                <li>Tích điểm nhanh hơn</li>
                <li>Ưu tiên giao hàng</li>
              </ul>
            </div>
            
            <p>Cảm ơn bạn đã đồng hành cùng Farmer Smart! 💜</p>
          </div>
        </div>
      `
    },

    // ========== SAAS TEMPLATES (v2.6.0) ==========
    saas_member_invited: {
      name: 'Member Invited',
      subject: '👋 Bạn được mời tham gia {{shop_name}}',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3F51B5, #303F9F); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">👋 Lời Mời Tham Gia</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào <strong>{{invitee_name}}</strong>,</p>
            <p><strong>{{inviter_name}}</strong> đã mời bạn tham gia <strong>{{shop_name}}</strong> với vai trò <strong>{{role}}</strong>.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{invite_link}}" style="background: #3F51B5; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Chấp Nhận Lời Mời
              </a>
            </div>
          </div>
        </div>
      `
    },

    saas_payment_failed: {
      name: 'Subscription Payment Failed',
      subject: '⚠️ Thanh toán thất bại - {{shop_name}}',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E53935, #C62828); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">⚠️ Thanh Toán Thất Bại</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào,</p>
            <p>Thanh toán gói dịch vụ cho <strong>{{shop_name}}</strong> không thành công.</p>
            
            <div style="background: #FFEBEE; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p><strong>Số tiền:</strong> {{amount}}đ</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{retry_link}}" style="background: #E53935; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Thử Lại Thanh Toán
              </a>
            </div>
          </div>
        </div>
      `
    },

    saas_expiry_warning: {
      name: 'Subscription Expiry Warning',
      subject: '⏰ Gói dịch vụ {{shop_name}} sắp hết hạn',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #FF9800, #F57C00); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">⏰ Sắp Hết Hạn</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào,</p>
            <p>Gói dịch vụ của <strong>{{shop_name}}</strong> sẽ hết hạn vào ngày <strong>{{expiry_date}}</strong>.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{renew_link}}" style="background: #FF9800; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Gia Hạn Ngay
              </a>
            </div>
            
            <p style="color: #666;">Gia hạn sớm để không bị gián đoạn dịch vụ.</p>
          </div>
        </div>
      `
    },

    saas_invoice: {
      name: 'Invoice Generated',
      subject: '📄 Hóa đơn #{{invoice_number}}',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #607D8B, #455A64); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0;">📄 Hóa Đơn</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
            <p>Xin chào,</p>
            <p>Hóa đơn mới cho <strong>{{shop_name}}</strong>:</p>
            
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p><strong>Mã hóa đơn:</strong> #{{invoice_number}}</p>
              <p><strong>Số tiền:</strong> {{amount}}đ</p>
              <p><strong>Hạn thanh toán:</strong> {{due_date}}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{invoice_link}}" style="background: #607D8B; color: white; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                Xem Hóa Đơn
              </a>
            </div>
          </div>
        </div>
      `
    }
  };

  return templates[emailType] || null;
}

/**
 * Get generic fallback template
 */
function getGenericTemplate(emailType, emailPayload) {
  return {
    name: 'Generic Template',
    subject: `Thông báo từ Farmer Smart`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #7CB342, #558B2F); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">Thông Báo</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
          <p>Xin chào <strong>{{recipientName}}</strong>,</p>
          <p>Bạn có thông báo mới từ Farmer Smart.</p>
          <p style="color: #666;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
        </div>
      </div>
    `
  };
}

export default templateSelector;
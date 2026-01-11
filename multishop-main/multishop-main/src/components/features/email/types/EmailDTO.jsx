/**
 * 📧 Email Module - DTOs & Type Definitions
 * 
 * Central place for all email-related types
 */

/**
 * @typedef {'order_confirmation' | 'shipping_notification' | 'delivery_confirmation' | 
 *           'payment_confirmed' | 'payment_failed' | 'order_cancelled' |
 *           'cart_recovery' | 'review_request' | 'welcome_email' |
 *           'harvest_reminder' | 'harvest_ready' | 'deposit_reminder' | 
 *           'price_alert' | 'low_stock_alert' | 'referral_welcome' |
 *           'referral_commission' | 'custom' |
 *           'security_password_changed' | 'security_password_reset' | 'security_new_device' |
 *           'refund_requested' | 'refund_approved' | 'refund_succeeded' |
 *           'loyalty_points_expiring' | 'loyalty_tier_upgraded' |
 *           'saas_member_invited' | 'saas_payment_failed' | 'saas_expiry_warning' | 'saas_invoice' |
 *           'preorder_delayed' | 'preorder_cancelled' | 'deposit_expired' |
 *           'review_response'} EmailType
 */

/**
 * @typedef {'pending' | 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced'} EmailStatus
 */

/**
 * @typedef {'low' | 'normal' | 'high' | 'urgent'} EmailPriority
 */

/**
 * Email Message DTO - Represents an email to be sent
 * @typedef {Object} EmailMessageDTO
 * @property {string} to - Recipient email address
 * @property {string} [toName] - Recipient name
 * @property {string} subject - Email subject line
 * @property {string} htmlBody - HTML content of the email
 * @property {string} [textBody] - Plain text fallback
 * @property {string} [from] - Sender email (default: system)
 * @property {string} [fromName] - Sender name (default: "Farmer Smart")
 * @property {EmailType} type - Type of email for tracking
 * @property {EmailPriority} [priority] - Priority level
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * Email Template DTO - Represents a stored email template
 * @typedef {Object} EmailTemplateDTO
 * @property {string} id - Template ID
 * @property {string} name - Template name
 * @property {EmailType} type - Email type this template is for
 * @property {string} subject - Subject template (with {{variables}})
 * @property {string} html_content - HTML template (with {{variables}})
 * @property {string} [text_content] - Plain text template
 * @property {string} [description] - Template description
 * @property {boolean} is_active - Whether template is active
 * @property {boolean} is_default - Whether this is the default for its type
 * @property {number} usage_count - Number of times used
 * @property {string} [preview_image] - Preview image URL
 * @property {string} [last_used_date] - Last usage date
 */

/**
 * Send Email Command - Command to send an email
 * @typedef {Object} SendEmailCommand
 * @property {EmailType} type - Type of email
 * @property {string} recipientEmail - Recipient email
 * @property {string} [recipientName] - Recipient name
 * @property {Object} data - Template data for variable replacement
 * @property {EmailPriority} [priority] - Priority level
 * @property {Object} [metadata] - Additional metadata for logging
 */

/**
 * Schedule Email Command - Command to schedule email for later
 * @typedef {Object} ScheduleEmailCommand
 * @property {EmailType} type - Type of email
 * @property {string} recipientEmail - Recipient email
 * @property {Object} data - Template data
 * @property {Date|string} scheduledDate - When to send
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * Email Send Result - Result of sending an email
 * @typedef {Object} EmailSendResult
 * @property {boolean} success - Whether send was successful
 * @property {string} [messageId] - Provider message ID
 * @property {string} [error] - Error message if failed
 * @property {string} provider - Provider used (Base44, SendGrid, etc.)
 */

/**
 * Communication Log DTO - Log entry for sent communications
 * @typedef {Object} CommunicationLogDTO
 * @property {string} customer_email - Recipient email
 * @property {string} [customer_name] - Recipient name
 * @property {'email' | 'sms' | 'push'} channel - Communication channel
 * @property {EmailType} type - Email type
 * @property {string} subject - Email subject
 * @property {string} content - Content summary
 * @property {string} [order_id] - Related order ID
 * @property {string} [order_number] - Related order number
 * @property {EmailStatus} status - Send status
 * @property {string} [error_message] - Error if failed
 * @property {string} sent_date - Send timestamp
 * @property {Object} [metadata] - Additional data
 */

/**
 * Template Variable - Variable available in templates
 * @typedef {Object} TemplateVariable
 * @property {string} name - Variable name (e.g., "customer_name")
 * @property {string} description - What this variable represents
 * @property {string} [example] - Example value
 */

/**
 * Common template variables available for all email types
 */
export const COMMON_TEMPLATE_VARIABLES = [
  { name: 'customer_name', description: 'Tên khách hàng', example: 'Nguyễn Văn A' },
  { name: 'customer_email', description: 'Email khách hàng', example: 'a@example.com' },
  { name: 'customer_phone', description: 'SĐT khách hàng', example: '0987654321' }
];

/**
 * Order-related template variables
 */
export const ORDER_TEMPLATE_VARIABLES = [
  { name: 'order_number', description: 'Mã đơn hàng', example: '#ABC12345' },
  { name: 'order_date', description: 'Ngày đặt hàng', example: '21/12/2024' },
  { name: 'total_amount', description: 'Tổng tiền', example: '500,000đ' },
  { name: 'shipping_address', description: 'Địa chỉ giao hàng', example: '123 ABC, Q1, HCM' },
  { name: 'payment_method', description: 'Phương thức thanh toán', example: 'COD' }
];

/**
 * Email type configuration
 */
export const EMAIL_TYPE_CONFIG = {
  order_confirmation: {
    label: 'Xác nhận đơn hàng',
    icon: '✅',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES]
  },
  shipping_notification: {
    label: 'Đang giao hàng',
    icon: '🚚',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES,
      { name: 'tracking_number', description: 'Mã vận đơn', example: 'VN123456789' },
      { name: 'shipper_name', description: 'Tên shipper', example: 'Anh Minh' },
      { name: 'shipper_phone', description: 'SĐT shipper', example: '0909123456' }
    ]
  },
  delivery_confirmation: {
    label: 'Đã giao hàng',
    icon: '🎉',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES]
  },
  payment_confirmed: {
    label: 'Thanh toán thành công',
    icon: '💳',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES]
  },
  payment_failed: {
    label: 'Thanh toán thất bại',
    icon: '⚠️',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES]
  },
  order_cancelled: {
    label: 'Đơn hàng đã hủy',
    icon: '❌',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES,
      { name: 'cancellation_reason', description: 'Lý do hủy', example: 'Khách yêu cầu' }
    ]
  },
  cart_recovery: {
    label: 'Khôi phục giỏ hàng',
    icon: '🛒',
    variables: [...COMMON_TEMPLATE_VARIABLES,
      { name: 'cart_total', description: 'Tổng giỏ hàng', example: '350,000đ' },
      { name: 'discount_code', description: 'Mã giảm giá', example: 'RECOVER10' }
    ]
  },
  review_request: {
    label: 'Yêu cầu đánh giá',
    icon: '⭐',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES]
  },
  welcome_email: {
    label: 'Chào mừng',
    icon: '👋',
    variables: [...COMMON_TEMPLATE_VARIABLES]
  },
  harvest_reminder: {
    label: 'Nhắc thu hoạch',
    icon: '🌾',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES,
      { name: 'harvest_date', description: 'Ngày thu hoạch', example: '25/12/2024' },
      { name: 'days_until_harvest', description: 'Còn bao nhiêu ngày', example: '3' },
      { name: 'lot_name', description: 'Tên lô hàng', example: 'Cà chua T12' }
    ]
  },
  harvest_ready: {
    label: 'Đã thu hoạch',
    icon: '🎉',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES,
      { name: 'lot_name', description: 'Tên lô hàng', example: 'Cà chua T12' }
    ]
  },
  deposit_reminder: {
    label: 'Nhắc đặt cọc',
    icon: '💰',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES,
      { name: 'deposit_amount', description: 'Số tiền cọc', example: '100,000đ' },
      { name: 'remaining_amount', description: 'Số tiền còn lại', example: '400,000đ' }
    ]
  },
  price_alert: {
    label: 'Cảnh báo giá',
    icon: '📈',
    variables: [...COMMON_TEMPLATE_VARIABLES,
      { name: 'product_name', description: 'Tên sản phẩm', example: 'Cà chua' },
      { name: 'old_price', description: 'Giá cũ', example: '50,000đ' },
      { name: 'new_price', description: 'Giá mới', example: '60,000đ' },
      { name: 'increase_percent', description: 'Tăng %', example: '20' }
    ]
  },
  low_stock_alert: {
    label: 'Sắp hết hàng',
    icon: '📉',
    variables: [...COMMON_TEMPLATE_VARIABLES,
      { name: 'product_name', description: 'Tên sản phẩm', example: 'Cà chua' },
      { name: 'available_quantity', description: 'Còn lại', example: '10' }
    ]
  },
  referral_welcome: {
    label: 'Chào mừng referral',
    icon: '🤝',
    variables: [...COMMON_TEMPLATE_VARIABLES,
      { name: 'referral_code', description: 'Mã giới thiệu', example: 'REF123' }
    ]
  },
  referral_commission: {
    label: 'Hoa hồng referral',
    icon: '💵',
    variables: [...COMMON_TEMPLATE_VARIABLES,
      { name: 'commission_amount', description: 'Số tiền hoa hồng', example: '50,000đ' },
      { name: 'referred_customer', description: 'Khách được giới thiệu', example: 'Nguyễn B' }
    ]
  },
  
  // Security (v2.6.0)
  security_password_changed: {
    label: 'Mật khẩu thay đổi',
    icon: '🔐',
    variables: [...COMMON_TEMPLATE_VARIABLES,
      { name: 'changed_date', description: 'Ngày thay đổi', example: '21/12/2024 15:30' },
      { name: 'device_info', description: 'Thông tin thiết bị', example: 'Chrome on Windows' }
    ]
  },
  security_password_reset: {
    label: 'Đặt lại mật khẩu',
    icon: '🔑',
    variables: [...COMMON_TEMPLATE_VARIABLES,
      { name: 'reset_link', description: 'Link đặt lại', example: 'https://...' },
      { name: 'expiry_time', description: 'Thời hạn', example: '24 giờ' }
    ]
  },
  security_new_device: {
    label: 'Đăng nhập thiết bị mới',
    icon: '⚠️',
    variables: [...COMMON_TEMPLATE_VARIABLES,
      { name: 'device_info', description: 'Thiết bị', example: 'iPhone 14' },
      { name: 'login_time', description: 'Thời gian', example: '21/12/2024 15:30' },
      { name: 'location', description: 'Vị trí', example: 'TP.HCM, VN' }
    ]
  },

  // Refund (v2.6.0)
  refund_requested: {
    label: 'Yêu cầu hoàn tiền',
    icon: '📝',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES,
      { name: 'amount', description: 'Số tiền hoàn', example: '500,000đ' },
      { name: 'reason', description: 'Lý do', example: 'Sản phẩm lỗi' }
    ]
  },
  refund_approved: {
    label: 'Hoàn tiền được duyệt',
    icon: '✅',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES,
      { name: 'amount', description: 'Số tiền', example: '500,000đ' },
      { name: 'refund_method', description: 'Phương thức', example: 'Chuyển khoản' }
    ]
  },
  refund_succeeded: {
    label: 'Hoàn tiền thành công',
    icon: '💵',
    variables: [...COMMON_TEMPLATE_VARIABLES, ...ORDER_TEMPLATE_VARIABLES,
      { name: 'amount', description: 'Số tiền', example: '500,000đ' },
      { name: 'txn_id', description: 'Mã giao dịch', example: 'TXN123456' },
      { name: 'refund_date', description: 'Ngày hoàn', example: '21/12/2024' }
    ]
  },

  // Loyalty (v2.6.0)
  loyalty_points_expiring: {
    label: 'Điểm sắp hết hạn',
    icon: '⏰',
    variables: [...COMMON_TEMPLATE_VARIABLES,
      { name: 'points', description: 'Số điểm', example: '500' },
      { name: 'expiry_date', description: 'Ngày hết hạn', example: '31/12/2024' }
    ]
  },
  loyalty_tier_upgraded: {
    label: 'Thăng hạng',
    icon: '🎉',
    variables: [...COMMON_TEMPLATE_VARIABLES,
      { name: 'new_tier', description: 'Hạng mới', example: 'Gold' }
    ]
  },

  // SaaS (v2.6.0)
  saas_member_invited: {
    label: 'Mời thành viên',
    icon: '👋',
    variables: [
      { name: 'invitee_name', description: 'Tên người được mời', example: 'Nguyễn B' },
      { name: 'inviter_name', description: 'Người mời', example: 'Nguyễn A' },
      { name: 'shop_name', description: 'Tên shop', example: 'My Shop' },
      { name: 'invite_link', description: 'Link mời', example: 'https://...' },
      { name: 'role', description: 'Vai trò', example: 'staff' }
    ]
  },
  saas_payment_failed: {
    label: 'Thanh toán SaaS thất bại',
    icon: '⚠️',
    variables: [
      { name: 'shop_name', description: 'Tên shop', example: 'My Shop' },
      { name: 'amount', description: 'Số tiền', example: '500,000đ' },
      { name: 'retry_link', description: 'Link thử lại', example: 'https://...' }
    ]
  },
  saas_expiry_warning: {
    label: 'Sắp hết hạn gói',
    icon: '⏰',
    variables: [
      { name: 'shop_name', description: 'Tên shop', example: 'My Shop' },
      { name: 'expiry_date', description: 'Ngày hết hạn', example: '31/12/2024' },
      { name: 'renew_link', description: 'Link gia hạn', example: 'https://...' }
    ]
  },
  saas_invoice: {
    label: 'Hóa đơn',
    icon: '📄',
    variables: [
      { name: 'shop_name', description: 'Tên shop', example: 'My Shop' },
      { name: 'invoice_number', description: 'Mã hóa đơn', example: 'INV-2024-001' },
      { name: 'amount', description: 'Số tiền', example: '500,000đ' },
      { name: 'due_date', description: 'Hạn thanh toán', example: '31/12/2024' },
      { name: 'invoice_link', description: 'Link hóa đơn', example: 'https://...' }
    ]
  },

  custom: {
    label: 'Tùy chỉnh',
    icon: '⚙️',
    variables: [...COMMON_TEMPLATE_VARIABLES]
  }
};

export default {
  COMMON_TEMPLATE_VARIABLES,
  ORDER_TEMPLATE_VARIABLES,
  EMAIL_TYPE_CONFIG
};
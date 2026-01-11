/**
 * 📧 Preview Template Use Case
 * 
 * Preview email template with sample data.
 */

import { emailTemplateRepository } from '../../infrastructure';
import { templateEngine } from '../../domain';

/**
 * Generate sample data for a template type
 * @param {string} type - Email type
 * @returns {Object} Sample data
 */
export function getSampleData(type) {
  const baseData = {
    customer_name: 'Nguyễn Văn A',
    customer_email: 'nguyenvana@example.com',
    customer_phone: '0987654321'
  };

  const orderData = {
    ...baseData,
    order_number: 'ORD-ABC123',
    order_date: new Date().toLocaleDateString('vi-VN'),
    total_amount: '500,000',
    shipping_address: '123 Đường ABC, Quận 1, TP.HCM',
    payment_method: 'COD',
    items: [
      { product_name: 'Cà chua organic', quantity: 2, subtotal: 100000 },
      { product_name: 'Dưa leo tươi', quantity: 3, subtotal: 75000 }
    ],
    subtotal: '175,000',
    shipping_fee: '25,000'
  };

  const typeData = {
    order_confirmation: orderData,
    shipping_notification: {
      ...orderData,
      tracking_number: 'VN123456789',
      shipper_name: 'Anh Minh',
      shipper_phone: '0909123456'
    },
    delivery_confirmation: orderData,
    payment_confirmed: orderData,
    payment_failed: orderData,
    order_cancelled: {
      ...orderData,
      cancellation_reason: 'Khách hàng yêu cầu hủy'
    },
    cart_recovery: {
      ...baseData,
      cart_total: '350,000',
      discount_code: 'RECOVER10',
      items: [
        { product_name: 'Rau muống', quantity: 2, unit_price: 25000, image_url: '' }
      ]
    },
    review_request: orderData,
    welcome_email: baseData,
    harvest_reminder: {
      ...orderData,
      harvest_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
      days_until_harvest: 3,
      lot_name: 'Cà chua T12 - Đà Lạt',
      remaining_amount: '400,000'
    },
    harvest_ready: {
      ...orderData,
      lot_name: 'Cà chua T12 - Đà Lạt'
    },
    deposit_reminder: {
      ...orderData,
      deposit_amount: '100,000',
      remaining_amount: '400,000'
    },
    price_alert: {
      ...baseData,
      product_name: 'Cà chua organic',
      old_price: '50,000',
      new_price: '60,000',
      increase_percent: 20
    },
    low_stock_alert: {
      ...baseData,
      product_name: 'Dưa leo tươi',
      available_quantity: 10
    },
    referral_welcome: {
      ...baseData,
      referral_code: 'REF-NGUYENA'
    },
    referral_commission: {
      ...baseData,
      commission_amount: '50,000',
      referred_customer: 'Trần Văn B'
    }
  };

  return typeData[type] || baseData;
}

/**
 * Preview a template with sample or custom data
 * 
 * @param {Object} params
 * @param {string} [params.templateId] - Template ID (if previewing existing)
 * @param {string} [params.type] - Template type (if fetching by type)
 * @param {string} [params.subject] - Custom subject (for new templates)
 * @param {string} [params.htmlContent] - Custom HTML (for new templates)
 * @param {Object} [params.data] - Custom data (overrides sample)
 * @returns {Promise<{subject: string, htmlBody: string, variables: string[]}>}
 */
export async function previewTemplate({
  templateId,
  type,
  subject: customSubject,
  htmlContent: customHtml,
  data: customData
}) {
  let template = null;

  // Get template from DB or use custom
  if (templateId) {
    template = await emailTemplateRepository.getById(templateId);
  } else if (type && !customSubject && !customHtml) {
    template = await emailTemplateRepository.getByType(type);
  }

  const subject = customSubject || template?.subject || 'Preview Subject';
  const htmlContent = customHtml || template?.html_content || '<p>No content</p>';

  // Get sample data for the type
  const effectiveType = type || template?.type || 'custom';
  const sampleData = getSampleData(effectiveType);
  const data = { ...sampleData, ...customData };

  // Render
  const renderedSubject = templateEngine.renderTemplate(subject, data);
  const renderedHtml = templateEngine.renderTemplate(htmlContent, data);

  // Extract variables used
  const variables = templateEngine.extractVariables(subject + htmlContent);

  return {
    subject: renderedSubject,
    htmlBody: renderedHtml,
    variables,
    type: effectiveType
  };
}

export default previewTemplate;
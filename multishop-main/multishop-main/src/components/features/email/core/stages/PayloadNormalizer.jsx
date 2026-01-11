/**
 * 📧 Payload Normalizer Stage
 * 
 * Stage 1: Normalize event payload → EmailPayload
 * 
 * Input: context.event (raw event from EventBus)
 * Output: context.emailPayload (normalized email data)
 */

import { EVENT_EMAIL_TYPE_MAP } from '../../types/EventPayloads';

/**
 * @typedef {Object} EmailPayload
 * @property {string} recipientEmail
 * @property {string} recipientName
 * @property {string} emailType
 * @property {'high'|'normal'|'low'} priority
 * @property {Object} variables - Template variables
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * Normalize event to email payload
 * 
 * @param {Object} context - Pipeline context
 * @returns {Object} Updated context fields
 */
export async function payloadNormalizer(context) {
  const { event } = context;
  
  if (!event) {
    throw new Error('No event provided');
  }

  // Determine email type from event
  const eventType = event.type || event.eventType;
  const emailType = event.emailType || EVENT_EMAIL_TYPE_MAP[eventType] || 'custom';
  
  // Extract recipient info
  const recipientEmail = extractRecipientEmail(event);
  const recipientName = extractRecipientName(event);
  
  if (!recipientEmail) {
    throw new Error('Recipient email not found in event');
  }

  // Validate email format
  if (!isValidEmail(recipientEmail)) {
    throw new Error(`Invalid email format: ${recipientEmail}`);
  }

  // Determine priority
  const priority = determinePriority(emailType, event);

  // Build variables object
  const variables = buildVariables(event, emailType);

  const emailPayload = {
    recipientEmail,
    recipientName: recipientName || 'Khách hàng',
    emailType,
    priority,
    variables,
    metadata: {
      eventType,
      eventId: event.id || event.eventId,
      source: event.source || 'event',
      timestamp: event.timestamp || new Date().toISOString()
    }
  };

  console.log(`📧 [PayloadNormalizer] Normalized: ${emailType} → ${recipientEmail}`);

  return { emailPayload };
}

/**
 * Extract recipient email from various event formats
 */
function extractRecipientEmail(event) {
  return event.customerEmail 
    || event.recipientEmail 
    || event.email 
    || event.user_email
    || event.to
    || event.data?.customerEmail
    || event.data?.email
    || event.order?.customer_email
    || null;
}

/**
 * Extract recipient name from various event formats
 */
function extractRecipientName(event) {
  return event.customerName 
    || event.recipientName 
    || event.name 
    || event.full_name
    || event.fullName
    || event.data?.customerName
    || event.order?.customer_name
    || null;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Determine email priority
 */
function determinePriority(emailType, event) {
  // Explicit priority from event
  if (event.priority) {
    return event.priority;
  }

  // Transactional emails are high priority
  const highPriority = [
    'order_confirmation',
    'payment_confirmed',
    'payment_failed',
    'shipping_notification',
    'password_reset'
  ];

  if (highPriority.includes(emailType)) {
    return 'high';
  }

  // Marketing emails are low priority
  const lowPriority = [
    'cart_recovery',
    'review_request',
    'promotional',
    'newsletter'
  ];

  if (lowPriority.includes(emailType)) {
    return 'low';
  }

  return 'normal';
}

/**
 * Build template variables from event
 */
function buildVariables(event, emailType) {
  // Start with all event data as potential variables
  const variables = { ...event };
  
  // Remove internal fields
  delete variables.type;
  delete variables.eventType;
  delete variables.emailType;
  delete variables.priority;
  
  // Add computed variables
  variables.current_date = new Date().toLocaleDateString('vi-VN');
  variables.current_year = new Date().getFullYear();
  
  // Format amounts
  if (variables.totalAmount) {
    variables.total_amount_formatted = formatCurrency(variables.totalAmount);
  }
  if (variables.amount) {
    variables.amount_formatted = formatCurrency(variables.amount);
  }
  if (variables.depositAmount) {
    variables.deposit_amount_formatted = formatCurrency(variables.depositAmount);
  }
  if (variables.remainingAmount) {
    variables.remaining_amount_formatted = formatCurrency(variables.remainingAmount);
  }
  if (variables.commissionAmount) {
    variables.commission_amount_formatted = formatCurrency(variables.commissionAmount);
  }

  // Flatten nested order data
  if (variables.order) {
    Object.entries(variables.order).forEach(([key, value]) => {
      if (!variables[key]) {
        variables[key] = value;
      }
    });
  }

  return variables;
}

/**
 * Format currency in VND
 */
function formatCurrency(amount) {
  if (typeof amount !== 'number') return amount;
  return amount.toLocaleString('vi-VN') + 'đ';
}

export default payloadNormalizer;
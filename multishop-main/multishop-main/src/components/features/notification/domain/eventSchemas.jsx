/**
 * Event Schemas - Payload validation for each event type
 * 
 * Pattern: Define required/optional fields + types
 */

// ========== SCHEMA DEFINITIONS ==========

export const EventSchemas = {
  // ========== ORDER EVENTS ==========
  'order.created': {
    order: { 
      required: true, 
      type: 'object', 
      properties: ['id', 'order_number', 'customer_email', 'total_amount'] 
    },
    customer: { required: false, type: 'object' }
  },
  
  'order.confirmed': {
    order: { required: true, type: 'object', properties: ['id', 'order_number'] }
  },
  
  'order.shipped': {
    order: { required: true, type: 'object' }
  },
  
  'order.delivered': {
    order: { required: true, type: 'object' }
  },
  
  'order.cancelled': {
    order: { required: true, type: 'object' },
    reason: { required: false, type: 'string' }
  },
  
  // ========== PAYMENT EVENTS ==========
  'payment.verification_needed': {
    order: { required: true, type: 'object', properties: ['id', 'order_number', 'total_amount'] }
  },
  
  'payment.confirmed': {
    order: { required: true, type: 'object' }
  },
  
  'payment.failed': {
    order: { required: true, type: 'object' },
    error: { required: false, type: 'string' }
  },
  
  'payment.deposit_received': {
    order: { required: true, type: 'object' }
  },
  
  'payment.deposit_reminder': {
    order: { required: true, type: 'object' },
    daysLeft: { required: false, type: 'number', min: 0 }
  },
  
  // ========== HARVEST EVENTS ==========
  'harvest.reminder': {
    order: { required: true, type: 'object' },
    lot: { 
      required: true, 
      type: 'object', 
      properties: ['id', 'lot_name', 'product_name', 'estimated_harvest_date'] 
    },
    daysUntilHarvest: { required: true, type: 'number', min: 0 }
  },
  
  'harvest.ready': {
    order: { required: true, type: 'object' },
    lot: { required: true, type: 'object' }
  },
  
  'harvest.upcoming': {
    lot: { required: true, type: 'object' },
    ordersCount: { required: true, type: 'number' },
    daysLeft: { required: true, type: 'number' }
  },
  
  // ========== PRICE EVENTS ==========
  'price.fomo': {
    lot: { required: true, type: 'object' },
    hoursUntilIncrease: { required: true, type: 'number' },
    currentPrice: { required: true, type: 'number' },
    nextPrice: { required: true, type: 'number' }
  },
  
  // ========== SOCIAL EVENTS ==========
  'social.post_liked': {
    post: { required: true, type: 'object' },
    liker: { required: true, type: 'object', properties: ['email', 'name'] },
    postAuthor: { required: true, type: 'object', properties: ['email'] }
  },
  
  'social.post_commented': {
    post: { required: true, type: 'object' },
    commenter: { required: true, type: 'object' },
    comment: { required: true, type: 'object' }
  },
  
  'social.user_mentioned': {
    post: { required: true, type: 'object' },
    mentionedUser: { required: true, type: 'object', properties: ['email'] },
    mentioner: { required: true, type: 'object' }
  },
  
  'social.user_followed': {
    follower: { required: true, type: 'object', properties: ['email', 'name'] },
    following: { required: true, type: 'object', properties: ['email'] }
  },
  
  // ========== REFERRAL EVENTS ==========
  'referral.commission_earned': {
    referrer: { required: true, type: 'object' },
    order: { required: true, type: 'object' },
    commission: { required: true, type: 'object', properties: ['amount', 'rate'] }
  },
  
  'referral.rank_upgraded': {
    member: { required: true, type: 'object' },
    oldRank: { required: true, type: 'string' },
    newRank: { required: true, type: 'string' }
  },
  
  // ========== TENANT EVENTS ==========
  'subscription.expiry_warning': {
    tenant: { required: true, type: 'object' },
    daysLeft: { required: true, type: 'number', min: 0 }
  },
  
  'usage.limit_warning': {
    tenant: { required: true, type: 'object' },
    resource: { required: true, type: 'string' },
    percentage: { required: true, type: 'number', min: 0, max: 100 }
  }
};

// ========== VALIDATION FUNCTION ==========

/**
 * Validate payload against schema
 * 
 * @param {Object} payload
 * @param {Object} schema
 * @returns {string[]} Array of error messages
 */
export function validatePayload(payload, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = payload[field];
    
    // Required check
    if (rules.required && (value === undefined || value === null)) {
      errors.push(`${field} is required`);
      continue;
    }
    
    // Skip further checks if value is undefined and not required
    if (value === undefined) continue;
    
    // Type check
    if (rules.type === 'object' && typeof value !== 'object') {
      errors.push(`${field} must be an object`);
    }
    if (rules.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    }
    if (rules.type === 'number' && typeof value !== 'number') {
      errors.push(`${field} must be a number`);
    }
    if (rules.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
    
    // Enum check
    if (rules.enum && !rules.enum.includes(value)) {
      errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
    }
    
    // Min/Max check (for numbers)
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
      errors.push(`${field} must be >= ${rules.min}`);
    }
    if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
      errors.push(`${field} must be <= ${rules.max}`);
    }
    
    // Required properties check (for objects)
    if (rules.properties && typeof value === 'object' && value !== null) {
      for (const prop of rules.properties) {
        if (value[prop] === undefined) {
          errors.push(`${field}.${prop} is required`);
        }
      }
    }
  }
  
  return errors;
}

/**
 * Get schema for event
 */
export function getSchema(eventName) {
  return EventSchemas[eventName] || null;
}

/**
 * Check if event has schema
 */
export function hasSchema(eventName) {
  return EventSchemas[eventName] !== undefined;
}

export default EventSchemas;
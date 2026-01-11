/**
 * 📧 Register Email Event Handlers
 * 
 * Khởi tạo tất cả event handlers cho Email Module.
 * File này phải được import TẠI 1 LẦN trong app entry point (Layout.js).
 * 
 * Tuân thủ: Section 19.5 - Cross-Module Communication via Events
 * 
 * ✅ Updated v2.7.0 - Static imports for all handlers
 */

// Static imports - handlers self-register on import
import './handlers/OrderEventHandler';
import './handlers/PaymentEventHandler';
import './handlers/CartEventHandler';
import './handlers/PreOrderEventHandler';
import './handlers/UserEventHandler';
import './handlers/SecurityEventHandler';
import './handlers/ReferralEventHandler';
import './handlers/LoyaltyEventHandler';
import './handlers/RefundEventHandler';
import './handlers/SaasEventHandler';

let initialized = false;

/**
 * Initialize email event system
 * 
 * Call this once in your app entry point (Layout.js)
 */
export function initializeEmailEventHandlers() {
  if (initialized) return { registered: true, handlers: [] };
  
  initialized = true;
  
  return {
    registered: true,
    handlers: [
      'OrderEventHandler',
      'PaymentEventHandler', 
      'CartEventHandler',
      'PreOrderEventHandler',
      'UserEventHandler',
      'SecurityEventHandler',
      'ReferralEventHandler',
      'LoyaltyEventHandler',
      'RefundEventHandler',
      'SaasEventHandler'
    ]
  };
}

export default initializeEmailEventHandlers;
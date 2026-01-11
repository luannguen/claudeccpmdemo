/**
 * Fraud Detector
 * Domain Layer - Business logic for fraud detection
 * 
 * @module features/referral/domain/fraudDetector
 */

/**
 * @typedef {Object} FraudRule
 * @property {number} [same_address_threshold] - Max customers with same address
 * @property {number} [same_phone_threshold] - Max orders from same phone
 * @property {number} [cod_non_delivery_limit] - Max cancelled COD orders
 * @property {number} [rapid_order_threshold] - Max orders in short time
 * @property {number} [rapid_order_minutes] - Time window for rapid orders
 */

/**
 * @typedef {Object} FraudCheckResult
 * @property {boolean} suspect - Is this suspicious?
 * @property {string[]} flags - List of fraud flags
 * @property {number} scoreIncrease - How much to increase fraud score
 * @property {string|null} reason - Combined reason string
 */

/**
 * Default fraud rules
 */
export const DEFAULT_FRAUD_RULES = {
  same_address_threshold: 3,
  same_phone_threshold: 3,
  cod_non_delivery_limit: 2,
  rapid_order_threshold: 5,
  rapid_order_minutes: 60
};

/**
 * Check for same address fraud
 * @param {Object} order
 * @param {Array} existingCustomers - Customers with same referrer
 * @param {number} threshold
 * @returns {string|null} Flag if suspicious
 */
export function checkSameAddress(order, existingCustomers, threshold) {
  if (!threshold || threshold <= 0 || !order.shipping_address) {
    return null;
  }
  
  const normalizedAddress = normalizeAddress(order.shipping_address);
  const sameAddress = existingCustomers.filter(c => 
    normalizeAddress(c.address) === normalizedAddress
  );
  
  if (sameAddress.length >= threshold) {
    return `Trùng địa chỉ với ${sameAddress.length} khách hàng khác`;
  }
  
  return null;
}

/**
 * Check for same phone fraud
 * @param {Object} order
 * @param {Array} existingOrders - Orders from same referrer
 * @param {number} threshold
 * @returns {string|null}
 */
export function checkSamePhone(order, existingOrders, threshold) {
  if (!threshold || threshold <= 0 || !order.customer_phone) {
    return null;
  }
  
  const normalizedPhone = normalizePhone(order.customer_phone);
  const samePhone = existingOrders.filter(o => 
    normalizePhone(o.customer_phone) === normalizedPhone
  );
  
  if (samePhone.length >= threshold) {
    return `SĐT đã đặt ${samePhone.length} đơn từ cùng người giới thiệu`;
  }
  
  return null;
}

/**
 * Check for COD non-delivery pattern
 * @param {Object} order
 * @param {Array} customerOrders - Previous orders from this customer
 * @param {number} limit
 * @returns {string|null}
 */
export function checkCODNonDelivery(order, customerOrders, limit) {
  if (!limit || limit <= 0 || order.payment_method !== 'cod') {
    return null;
  }
  
  const cancelledCOD = customerOrders.filter(o => 
    o.payment_method === 'cod' && o.order_status === 'cancelled'
  );
  
  if (cancelledCOD.length >= limit) {
    return `Khách hàng đã hủy ${cancelledCOD.length} đơn COD`;
  }
  
  return null;
}

/**
 * Check for rapid ordering pattern
 * @param {Object} order
 * @param {Array} recentOrders - Orders in time window
 * @param {number} threshold
 * @param {number} minutes
 * @returns {string|null}
 */
export function checkRapidOrdering(order, recentOrders, threshold, minutes) {
  if (!threshold || threshold <= 0 || !minutes) {
    return null;
  }
  
  const cutoff = new Date(Date.now() - minutes * 60 * 1000);
  const rapidOrders = recentOrders.filter(o => new Date(o.created_date) > cutoff);
  
  if (rapidOrders.length >= threshold) {
    return `${rapidOrders.length} đơn trong ${minutes} phút gần đây`;
  }
  
  return null;
}

/**
 * Run all fraud checks
 * @param {Object} params
 * @param {Object} params.order - Current order
 * @param {Array} params.existingCustomers - Customers from referrer
 * @param {Array} params.existingOrders - Orders from referrer
 * @param {Array} params.customerOrders - Orders from this customer
 * @param {Array} params.recentOrders - Recent orders from referrer
 * @param {FraudRule} params.rules - Fraud rules config
 * @returns {FraudCheckResult}
 */
export function runFraudChecks({
  order,
  existingCustomers = [],
  existingOrders = [],
  customerOrders = [],
  recentOrders = [],
  rules = DEFAULT_FRAUD_RULES
}) {
  const flags = [];
  
  // Check same address
  const addressFlag = checkSameAddress(order, existingCustomers, rules.same_address_threshold);
  if (addressFlag) flags.push(addressFlag);
  
  // Check same phone
  const phoneFlag = checkSamePhone(order, existingOrders, rules.same_phone_threshold);
  if (phoneFlag) flags.push(phoneFlag);
  
  // Check COD non-delivery
  const codFlag = checkCODNonDelivery(order, customerOrders, rules.cod_non_delivery_limit);
  if (codFlag) flags.push(codFlag);
  
  // Check rapid ordering
  const rapidFlag = checkRapidOrdering(order, recentOrders, rules.rapid_order_threshold, rules.rapid_order_minutes);
  if (rapidFlag) flags.push(rapidFlag);
  
  // Calculate score increase based on number and severity of flags
  const scoreIncrease = flags.length * 15;
  
  return {
    suspect: flags.length > 0,
    flags,
    scoreIncrease,
    reason: flags.length > 0 ? flags.join('; ') : null
  };
}

/**
 * Determine if member should be flagged based on fraud score
 * @param {number} currentScore
 * @param {number} threshold
 * @returns {boolean}
 */
export function shouldFlagMember(currentScore, threshold = 50) {
  return currentScore >= threshold;
}

/**
 * Calculate new fraud score
 * @param {number} currentScore
 * @param {number} increase
 * @returns {number}
 */
export function calculateNewFraudScore(currentScore, increase) {
  return Math.min(100, (currentScore || 0) + increase);
}

// ========== HELPERS ==========

function normalizeAddress(address) {
  if (!address) return '';
  return address.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

export default {
  DEFAULT_FRAUD_RULES,
  checkSameAddress,
  checkSamePhone,
  checkCODNonDelivery,
  checkRapidOrdering,
  runFraudChecks,
  shouldFlagMember,
  calculateNewFraudScore
};
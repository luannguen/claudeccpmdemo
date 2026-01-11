/**
 * Pre-Order Module - Type Definitions
 * 
 * DTOs for PreOrder system
 */

// ========== LOT TYPES ==========

/**
 * @typedef {Object} ProductLotDTO
 * @property {string} id
 * @property {string} lot_name
 * @property {string} preorder_product_id
 * @property {string} product_id
 * @property {string} product_name
 * @property {string} product_image
 * @property {string[]} product_gallery
 * @property {number} total_yield
 * @property {number} available_quantity
 * @property {number} sold_quantity
 * @property {number} initial_price
 * @property {number} current_price
 * @property {number} max_price
 * @property {number} deposit_percentage
 * @property {number} moq
 * @property {string} estimated_harvest_date
 * @property {string} status - 'draft'|'active'|'sold_out'|'harvested'|'cancelled'
 */

/**
 * @typedef {Object} EnrichedLotDTO
 * @property {ProductLotDTO} lot
 * @property {Object} preOrder
 * @property {Object} product
 */

// ========== CANCELLATION TYPES ==========

/**
 * @typedef {Object} CancellationPolicyTier
 * @property {number} days_before_harvest
 * @property {number} refund_percentage
 * @property {string} label
 * @property {string} description
 */

/**
 * @typedef {Object} RefundCalculation
 * @property {number} daysBeforeHarvest
 * @property {string} policyTier
 * @property {CancellationPolicyTier} policy
 * @property {number} depositAmount
 * @property {number} refundPercentage
 * @property {number} refundAmount
 * @property {number} penaltyAmount
 * @property {boolean} canCancel
 * @property {string} policyApplied - 'full_refund'|'partial_refund'|'no_refund'
 */

/**
 * @typedef {Object} CancellationRequestDTO
 * @property {string} order_id
 * @property {string[]} cancellation_reasons
 * @property {string} other_reason
 * @property {string} refund_method
 */

// ========== WALLET/ESCROW TYPES ==========

/**
 * @typedef {Object} WalletDTO
 * @property {string} id
 * @property {string} order_id
 * @property {string} order_number
 * @property {string} customer_email
 * @property {string} wallet_type - 'preorder'|'regular'
 * @property {number} deposit_held
 * @property {number} final_payment_held
 * @property {number} total_held
 * @property {number} refunded_amount
 * @property {string} status
 * @property {ReleaseConditions} release_conditions
 */

/**
 * @typedef {Object} ReleaseConditions
 * @property {boolean} harvest_confirmed
 * @property {boolean} delivery_confirmed
 * @property {boolean} customer_accepted
 * @property {boolean} dispute_resolved
 * @property {boolean} inspection_period_passed
 */

/**
 * @typedef {Object} WalletTransactionDTO
 * @property {string} id
 * @property {string} wallet_id
 * @property {string} order_id
 * @property {string} transaction_type
 * @property {number} amount
 * @property {number} balance_before
 * @property {number} balance_after
 * @property {string} status
 * @property {string} reason
 */

// ========== COMPENSATION TYPES ==========

/**
 * @typedef {Object} CompensationRule
 * @property {Function} trigger
 * @property {string} compensation_type
 * @property {number} compensation_value
 * @property {string} compensation_unit
 * @property {string} description
 */

/**
 * @typedef {Object} CompensationDTO
 * @property {string} order_id
 * @property {string} trigger_type
 * @property {Object} trigger_details
 * @property {string} compensation_type
 * @property {number} compensation_value
 * @property {string} status
 */

// ========== POLICY TYPES ==========

/**
 * @typedef {Object} PreOrderPolicyDTO
 * @property {string} name
 * @property {string} version
 * @property {Object} deposit_rules
 * @property {Object} cancellation_rules
 * @property {Object} refund_rules
 * @property {Object} delay_compensation
 * @property {Object} quality_guarantee
 * @property {string[]} risk_disclosure
 */

export const PREORDER_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  SOLD_OUT: 'sold_out',
  HARVESTED: 'harvested',
  CANCELLED: 'cancelled'
};

export const LOT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  SOLD_OUT: 'sold_out',
  HARVESTED: 'harvested',
  CANCELLED: 'cancelled'
};

export const WALLET_STATUS = {
  PENDING_DEPOSIT: 'pending_deposit',
  DEPOSIT_HELD: 'deposit_held',
  PENDING_FINAL: 'pending_final',
  FULLY_HELD: 'fully_held',
  PARTIAL_RELEASED: 'partial_released',
  RELEASED_TO_SELLER: 'released_to_seller',
  REFUNDED: 'refunded',
  PARTIAL_REFUNDED: 'partial_refunded',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled'
};

export const TRANSACTION_TYPE = {
  DEPOSIT_IN: 'deposit_in',
  FINAL_PAYMENT_IN: 'final_payment_in',
  REFUND_OUT: 'refund_out',
  PARTIAL_REFUND_OUT: 'partial_refund_out',
  SELLER_PAYOUT: 'seller_payout',
  COMMISSION_DEDUCT: 'commission_deduct',
  COMPENSATION_OUT: 'compensation_out',
  DISPUTE_HOLD: 'dispute_hold',
  DISPUTE_RELEASE: 'dispute_release',
  ADJUSTMENT: 'adjustment'
};

export const REFUND_TYPE = {
  CUSTOMER_CANCEL: 'customer_cancel',
  SELLER_CANCEL: 'seller_cancel',
  DELAY_COMPENSATION: 'delay_compensation',
  QUALITY_ISSUE: 'quality_issue',
  SHORTAGE: 'shortage',
  WRONG_ITEM: 'wrong_item',
  DAMAGE: 'damage',
  POLICY_AUTO: 'policy_auto',
  ADMIN_OVERRIDE: 'admin_override'
};
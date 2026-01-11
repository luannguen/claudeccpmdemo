/**
 * escrowCore.js - Core logic for escrow/wallet operations
 * Service Layer - KHÔNG import service khác cùng tầng
 * 
 * Quản lý: hold, release, refund tiền trong PaymentWallet
 */

import { base44 } from '@/api/base44Client';

// ========== CONSTANTS ==========

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

// ========== WALLET OPERATIONS ==========

/**
 * Tạo wallet mới cho order
 */
export async function createWallet(orderData) {
  const wallet = {
    order_id: orderData.id,
    order_number: orderData.order_number,
    customer_email: orderData.customer_email,
    customer_name: orderData.customer_name,
    lot_id: orderData.items?.[0]?.lot_id || null,
    lot_name: orderData.items?.[0]?.product_name || null,
    wallet_type: orderData.has_preorder_items ? 'preorder' : 'regular',
    deposit_held: 0,
    final_payment_held: 0,
    total_held: 0,
    seller_payout_amount: 0,
    platform_commission: 0,
    refunded_amount: 0,
    status: WALLET_STATUS.PENDING_DEPOSIT,
    release_conditions: {
      harvest_confirmed: false,
      delivery_confirmed: false,
      customer_accepted: false,
      dispute_resolved: true,
      inspection_period_passed: false
    }
  };

  return await base44.entities.PaymentWallet.create(wallet);
}

/**
 * Ghi nhận tiền cọc vào wallet
 */
export async function holdDeposit(walletId, amount, paymentDetails = {}) {
  const wallet = await base44.entities.PaymentWallet.list();
  const currentWallet = wallet.find(w => w.id === walletId);
  
  if (!currentWallet) throw new Error('Wallet not found');

  // Update wallet
  const newDepositHeld = (currentWallet.deposit_held || 0) + amount;
  const newTotalHeld = newDepositHeld + (currentWallet.final_payment_held || 0);

  await base44.entities.PaymentWallet.update(walletId, {
    deposit_held: newDepositHeld,
    deposit_held_date: new Date().toISOString(),
    total_held: newTotalHeld,
    status: WALLET_STATUS.DEPOSIT_HELD
  });

  // Create transaction
  await createTransaction({
    wallet_id: walletId,
    order_id: currentWallet.order_id,
    order_number: currentWallet.order_number,
    transaction_type: TRANSACTION_TYPE.DEPOSIT_IN,
    amount: amount,
    balance_before: currentWallet.total_held || 0,
    balance_after: newTotalHeld,
    payment_method: paymentDetails.payment_method,
    payment_transaction_id: paymentDetails.transaction_id,
    status: 'completed',
    initiated_by: 'customer',
    reason: 'Tiền cọc đơn hàng'
  });

  return { success: true, newBalance: newTotalHeld };
}

/**
 * Ghi nhận thanh toán cuối
 */
export async function holdFinalPayment(walletId, amount, paymentDetails = {}) {
  const wallet = await base44.entities.PaymentWallet.list();
  const currentWallet = wallet.find(w => w.id === walletId);
  
  if (!currentWallet) throw new Error('Wallet not found');

  const newFinalHeld = (currentWallet.final_payment_held || 0) + amount;
  const newTotalHeld = (currentWallet.deposit_held || 0) + newFinalHeld;

  await base44.entities.PaymentWallet.update(walletId, {
    final_payment_held: newFinalHeld,
    final_payment_date: new Date().toISOString(),
    total_held: newTotalHeld,
    status: WALLET_STATUS.FULLY_HELD
  });

  await createTransaction({
    wallet_id: walletId,
    order_id: currentWallet.order_id,
    order_number: currentWallet.order_number,
    transaction_type: TRANSACTION_TYPE.FINAL_PAYMENT_IN,
    amount: amount,
    balance_before: currentWallet.total_held || 0,
    balance_after: newTotalHeld,
    payment_method: paymentDetails.payment_method,
    payment_transaction_id: paymentDetails.transaction_id,
    status: 'completed',
    initiated_by: 'customer',
    reason: 'Thanh toán phần còn lại'
  });

  return { success: true, newBalance: newTotalHeld };
}

/**
 * Release tiền cho seller sau khi đủ điều kiện
 */
export async function releaseToSeller(walletId, commissionRate = 0) {
  const wallet = await base44.entities.PaymentWallet.list();
  const currentWallet = wallet.find(w => w.id === walletId);
  
  if (!currentWallet) throw new Error('Wallet not found');

  // Check release conditions
  const conditions = currentWallet.release_conditions || {};
  const allConditionsMet = conditions.delivery_confirmed && 
    conditions.dispute_resolved && 
    (conditions.customer_accepted || conditions.inspection_period_passed);

  if (!allConditionsMet) {
    return { 
      success: false, 
      error: 'Release conditions not met',
      conditions 
    };
  }

  const totalHeld = currentWallet.total_held || 0;
  const commission = totalHeld * (commissionRate / 100);
  const sellerPayout = totalHeld - commission;

  await base44.entities.PaymentWallet.update(walletId, {
    seller_payout_amount: sellerPayout,
    seller_payout_date: new Date().toISOString(),
    platform_commission: commission,
    total_held: 0,
    status: WALLET_STATUS.RELEASED_TO_SELLER
  });

  // Commission transaction
  if (commission > 0) {
    await createTransaction({
      wallet_id: walletId,
      order_id: currentWallet.order_id,
      transaction_type: TRANSACTION_TYPE.COMMISSION_DEDUCT,
      amount: -commission,
      balance_before: totalHeld,
      balance_after: sellerPayout,
      status: 'completed',
      initiated_by: 'system',
      reason: `Hoa hồng platform ${commissionRate}%`
    });
  }

  // Seller payout transaction
  await createTransaction({
    wallet_id: walletId,
    order_id: currentWallet.order_id,
    transaction_type: TRANSACTION_TYPE.SELLER_PAYOUT,
    amount: -sellerPayout,
    balance_before: sellerPayout,
    balance_after: 0,
    status: 'completed',
    initiated_by: 'system',
    reason: 'Chuyển tiền cho seller'
  });

  return { 
    success: true, 
    sellerPayout, 
    commission 
  };
}

/**
 * Update release condition
 */
export async function updateReleaseCondition(walletId, condition, value) {
  const wallet = await base44.entities.PaymentWallet.list();
  const currentWallet = wallet.find(w => w.id === walletId);
  
  if (!currentWallet) throw new Error('Wallet not found');

  const conditions = currentWallet.release_conditions || {};
  conditions[condition] = value;

  await base44.entities.PaymentWallet.update(walletId, {
    release_conditions: conditions
  });

  return { success: true, conditions };
}

// ========== REFUND OPERATIONS ==========

/**
 * Tính toán refund amount theo policy
 */
export function calculateRefundAmount(originalAmount, policy, daysBeforeHarvest, cancelReason) {
  const cancellationRules = policy?.cancellation_rules || {};
  const refundRules = policy?.refund_rules || {};

  // Seller cancel = 100% refund
  if (cancelReason === 'seller_cancel') {
    return {
      refund_percentage: 100,
      refund_amount: originalAmount,
      penalty_amount: 0,
      tier: 'seller_cancel'
    };
  }

  // Customer cancel - theo tier
  const freeCancelDays = cancellationRules.free_cancel_before_days || 7;
  const cancelFeePercent = cancellationRules.cancel_fee_percentage || 20;

  if (daysBeforeHarvest >= freeCancelDays) {
    // Tier 1: Free cancel
    return {
      refund_percentage: 100,
      refund_amount: originalAmount,
      penalty_amount: 0,
      tier: 'tier_1'
    };
  } else if (daysBeforeHarvest >= 3) {
    // Tier 2: Partial refund
    const refundPercent = 100 - cancelFeePercent;
    return {
      refund_percentage: refundPercent,
      refund_amount: Math.round(originalAmount * refundPercent / 100),
      penalty_amount: Math.round(originalAmount * cancelFeePercent / 100),
      tier: 'tier_2'
    };
  } else if (daysBeforeHarvest >= 1) {
    // Tier 3: High penalty
    const refundPercent = 50;
    return {
      refund_percentage: refundPercent,
      refund_amount: Math.round(originalAmount * refundPercent / 100),
      penalty_amount: Math.round(originalAmount * 50 / 100),
      tier: 'tier_3'
    };
  } else {
    // Tier 4: No refund
    return {
      refund_percentage: 0,
      refund_amount: 0,
      penalty_amount: originalAmount,
      tier: 'tier_4'
    };
  }
}

/**
 * Process refund request
 */
export async function processRefund(walletId, refundAmount, refundType, details = {}) {
  const wallet = await base44.entities.PaymentWallet.list();
  const currentWallet = wallet.find(w => w.id === walletId);
  
  if (!currentWallet) throw new Error('Wallet not found');
  if (refundAmount > currentWallet.total_held) {
    throw new Error('Refund amount exceeds held balance');
  }

  const newTotalHeld = currentWallet.total_held - refundAmount;
  const newRefunded = (currentWallet.refunded_amount || 0) + refundAmount;
  const isFullRefund = newTotalHeld === 0;

  await base44.entities.PaymentWallet.update(walletId, {
    total_held: newTotalHeld,
    refunded_amount: newRefunded,
    status: isFullRefund ? WALLET_STATUS.REFUNDED : WALLET_STATUS.PARTIAL_REFUNDED
  });

  const transactionType = isFullRefund 
    ? TRANSACTION_TYPE.REFUND_OUT 
    : TRANSACTION_TYPE.PARTIAL_REFUND_OUT;

  await createTransaction({
    wallet_id: walletId,
    order_id: currentWallet.order_id,
    order_number: currentWallet.order_number,
    transaction_type: transactionType,
    amount: -refundAmount,
    balance_before: currentWallet.total_held,
    balance_after: newTotalHeld,
    reference_type: 'refund_request',
    reference_id: details.refund_request_id,
    status: 'completed',
    initiated_by: details.initiated_by || 'system',
    reason: details.reason || `Hoàn tiền - ${refundType}`,
    auto_rule_applied: details.auto_rule
  });

  return {
    success: true,
    refund_amount: refundAmount,
    remaining_balance: newTotalHeld,
    is_full_refund: isFullRefund
  };
}

// ========== TRANSACTION HELPERS ==========

async function createTransaction(data) {
  return await base44.entities.WalletTransaction.create({
    ...data,
    status: data.status || 'pending'
  });
}

/**
 * Get wallet by order ID
 */
export async function getWalletByOrderId(orderId) {
  const wallets = await base44.entities.PaymentWallet.filter({ order_id: orderId });
  return wallets[0] || null;
}

/**
 * Get transactions for wallet
 */
export async function getWalletTransactions(walletId) {
  return await base44.entities.WalletTransaction.filter(
    { wallet_id: walletId },
    '-created_date'
  );
}

// ========== EXPORTS ==========

export const escrowCore = {
  WALLET_STATUS,
  TRANSACTION_TYPE,
  REFUND_TYPE,
  createWallet,
  holdDeposit,
  holdFinalPayment,
  releaseToSeller,
  updateReleaseCondition,
  calculateRefundAmount,
  processRefund,
  getWalletByOrderId,
  getWalletTransactions
};

export default escrowCore;
/**
 * escrowCore - Legacy Adapter
 * 
 * ⚠️ DEPRECATED: Sử dụng @/components/features/preorder thay thế
 * 
 * @deprecated Use @/components/features/preorder instead
 */

import {
  WALLET_STATUS,
  TRANSACTION_TYPE,
  REFUND_TYPE
} from '@/components/features/preorder';
import {
  walletRepository,
  transactionRepository
} from '@/components/features/preorder/data';
import {
  checkReleaseConditions,
  calculateSellerPayout,
  calculatePolicyRefund,
  getStatusAfterRefund,
  canProcessRefund
} from '@/components/features/preorder';

// Re-export constants
export { WALLET_STATUS, TRANSACTION_TYPE, REFUND_TYPE };

// Legacy functions
export async function createWallet(orderData) {
  return await walletRepository.createWallet(orderData);
}

export async function holdDeposit(walletId, amount, paymentDetails = {}) {
  const wallet = await walletRepository.getWalletById(walletId);
  if (!wallet) throw new Error('Wallet not found');

  const newDepositHeld = (wallet.deposit_held || 0) + amount;
  const newTotalHeld = newDepositHeld + (wallet.final_payment_held || 0);

  await walletRepository.updateWallet(walletId, {
    deposit_held: newDepositHeld,
    deposit_held_date: new Date().toISOString(),
    total_held: newTotalHeld,
    status: WALLET_STATUS.DEPOSIT_HELD
  });

  await transactionRepository.createDepositTransaction(wallet, amount, paymentDetails);

  return { success: true, newBalance: newTotalHeld };
}

export async function holdFinalPayment(walletId, amount, paymentDetails = {}) {
  const wallet = await walletRepository.getWalletById(walletId);
  if (!wallet) throw new Error('Wallet not found');

  const newFinalHeld = (wallet.final_payment_held || 0) + amount;
  const newTotalHeld = (wallet.deposit_held || 0) + newFinalHeld;

  await walletRepository.updateWallet(walletId, {
    final_payment_held: newFinalHeld,
    final_payment_date: new Date().toISOString(),
    total_held: newTotalHeld,
    status: WALLET_STATUS.FULLY_HELD
  });

  await transactionRepository.createTransaction({
    wallet_id: walletId,
    order_id: wallet.order_id,
    order_number: wallet.order_number,
    transaction_type: TRANSACTION_TYPE.FINAL_PAYMENT_IN,
    amount: amount,
    balance_before: wallet.total_held || 0,
    balance_after: newTotalHeld,
    payment_method: paymentDetails.payment_method,
    payment_transaction_id: paymentDetails.transaction_id,
    status: 'completed',
    initiated_by: 'customer',
    reason: 'Thanh toán phần còn lại'
  });

  return { success: true, newBalance: newTotalHeld };
}

export async function releaseToSeller(walletId, commissionRate = 0) {
  const wallet = await walletRepository.getWalletById(walletId);
  if (!wallet) throw new Error('Wallet not found');

  const conditions = wallet.release_conditions || {};
  if (!checkReleaseConditions(conditions)) {
    return { 
      success: false, 
      error: 'Release conditions not met',
      conditions 
    };
  }

  const { sellerPayout, commission } = calculateSellerPayout(wallet.total_held, commissionRate);

  await walletRepository.updateWallet(walletId, {
    seller_payout_amount: sellerPayout,
    seller_payout_date: new Date().toISOString(),
    platform_commission: commission,
    total_held: 0,
    status: WALLET_STATUS.RELEASED_TO_SELLER
  });

  await transactionRepository.createSellerPayoutTransaction(wallet, sellerPayout, commission);

  return { success: true, sellerPayout, commission };
}

export async function updateReleaseCondition(walletId, condition, value) {
  return await walletRepository.updateReleaseCondition(walletId, condition, value);
}

export { calculatePolicyRefund as calculateRefundAmount };

export async function processRefund(walletId, refundAmount, refundType, details = {}) {
  const wallet = await walletRepository.getWalletById(walletId);
  if (!wallet) throw new Error('Wallet not found');

  const { canRefund, reason } = canProcessRefund(wallet);
  if (!canRefund) throw new Error(reason);

  if (refundAmount > wallet.total_held) {
    throw new Error('Refund amount exceeds held balance');
  }

  const newTotalHeld = wallet.total_held - refundAmount;
  const newRefunded = (wallet.refunded_amount || 0) + refundAmount;
  const newStatus = getStatusAfterRefund(wallet.total_held, refundAmount);

  await walletRepository.updateWallet(walletId, {
    total_held: newTotalHeld,
    refunded_amount: newRefunded,
    status: newStatus
  });

  await transactionRepository.createRefundTransaction(wallet, refundAmount, refundType, details);

  return {
    success: true,
    refund_amount: refundAmount,
    remaining_balance: newTotalHeld,
    is_full_refund: newTotalHeld === 0
  };
}

export async function getWalletByOrderId(orderId) {
  return await walletRepository.getWalletByOrderId(orderId);
}

export async function getWalletTransactions(walletId) {
  return await transactionRepository.getWalletTransactions(walletId);
}

export const escrowCore = {
  WALLET_STATUS,
  TRANSACTION_TYPE,
  REFUND_TYPE,
  createWallet,
  holdDeposit,
  holdFinalPayment,
  releaseToSeller,
  updateReleaseCondition,
  calculateRefundAmount: calculatePolicyRefund,
  processRefund,
  getWalletByOrderId,
  getWalletTransactions
};

export default escrowCore;
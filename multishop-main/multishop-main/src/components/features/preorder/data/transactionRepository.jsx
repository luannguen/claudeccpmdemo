/**
 * Transaction Repository - Data Access Layer
 * 
 * CRUD operations for WalletTransaction entity
 */

import { base44 } from '@/api/base44Client';

/**
 * List transactions for a wallet
 */
export async function getWalletTransactions(walletId) {
  return await base44.entities.WalletTransaction.filter(
    { wallet_id: walletId },
    '-created_date'
  );
}

/**
 * Get transactions by order ID
 */
export async function getTransactionsByOrderId(orderId) {
  return await base44.entities.WalletTransaction.filter(
    { order_id: orderId },
    '-created_date'
  );
}

/**
 * Create transaction
 */
export async function createTransaction(data) {
  return await base44.entities.WalletTransaction.create({
    ...data,
    status: data.status || 'pending'
  });
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(id, status, metadata = {}) {
  return await base44.entities.WalletTransaction.update(id, {
    status,
    ...metadata
  });
}

/**
 * Create deposit transaction
 */
export async function createDepositTransaction(wallet, amount, paymentDetails = {}) {
  return await createTransaction({
    wallet_id: wallet.id,
    order_id: wallet.order_id,
    order_number: wallet.order_number,
    transaction_type: 'deposit_in',
    amount: amount,
    balance_before: wallet.total_held || 0,
    balance_after: (wallet.total_held || 0) + amount,
    payment_method: paymentDetails.payment_method,
    payment_transaction_id: paymentDetails.transaction_id,
    status: 'completed',
    initiated_by: 'customer',
    reason: 'Tiền cọc đơn hàng'
  });
}

/**
 * Create refund transaction
 */
export async function createRefundTransaction(wallet, amount, refundType, details = {}) {
  const isFullRefund = (wallet.total_held - amount) === 0;
  
  return await createTransaction({
    wallet_id: wallet.id,
    order_id: wallet.order_id,
    order_number: wallet.order_number,
    transaction_type: isFullRefund ? 'refund_out' : 'partial_refund_out',
    amount: -amount,
    balance_before: wallet.total_held,
    balance_after: wallet.total_held - amount,
    reference_type: 'refund_request',
    reference_id: details.refund_request_id,
    status: 'completed',
    initiated_by: details.initiated_by || 'system',
    reason: details.reason || `Hoàn tiền - ${refundType}`,
    auto_rule_applied: details.auto_rule
  });
}

/**
 * Create seller payout transaction
 */
export async function createSellerPayoutTransaction(wallet, payoutAmount, commission) {
  const transactions = [];
  
  // Commission deduction
  if (commission > 0) {
    transactions.push(await createTransaction({
      wallet_id: wallet.id,
      order_id: wallet.order_id,
      transaction_type: 'commission_deduct',
      amount: -commission,
      balance_before: wallet.total_held,
      balance_after: wallet.total_held - commission,
      status: 'completed',
      initiated_by: 'system',
      reason: `Hoa hồng platform`
    }));
  }
  
  // Seller payout
  transactions.push(await createTransaction({
    wallet_id: wallet.id,
    order_id: wallet.order_id,
    transaction_type: 'seller_payout',
    amount: -payoutAmount,
    balance_before: wallet.total_held - commission,
    balance_after: 0,
    status: 'completed',
    initiated_by: 'system',
    reason: 'Chuyển tiền cho seller'
  }));
  
  return transactions;
}

export const transactionRepository = {
  getWalletTransactions,
  getTransactionsByOrderId,
  createTransaction,
  updateTransactionStatus,
  createDepositTransaction,
  createRefundTransaction,
  createSellerPayoutTransaction
};

export default transactionRepository;
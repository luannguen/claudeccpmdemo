/**
 * Wallet Repository - Data Access Layer
 * 
 * CRUD operations for PaymentWallet entity
 */

import { base44 } from '@/api/base44Client';
import { getDefaultReleaseConditions } from '../domain';

/**
 * List all wallets
 */
export async function listWallets(sort = '-created_date', limit = 100) {
  return await base44.entities.PaymentWallet.list(sort, limit);
}

/**
 * Get wallet by order ID
 */
export async function getWalletByOrderId(orderId) {
  const wallets = await base44.entities.PaymentWallet.filter({ order_id: orderId });
  return wallets[0] || null;
}

/**
 * Get wallet by ID
 */
export async function getWalletById(id) {
  const wallets = await base44.entities.PaymentWallet.filter({ id });
  return wallets[0] || null;
}

/**
 * Create wallet for order
 */
export async function createWallet(orderData) {
  return await base44.entities.PaymentWallet.create({
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
    status: 'pending_deposit',
    release_conditions: getDefaultReleaseConditions()
  });
}

/**
 * Update wallet
 */
export async function updateWallet(id, data) {
  return await base44.entities.PaymentWallet.update(id, data);
}

/**
 * Update wallet status
 */
export async function updateWalletStatus(id, status) {
  return await base44.entities.PaymentWallet.update(id, { status });
}

/**
 * Update release condition
 */
export async function updateReleaseCondition(id, condition, value) {
  const wallet = await getWalletById(id);
  if (!wallet) throw new Error('Wallet not found');
  
  const conditions = wallet.release_conditions || getDefaultReleaseConditions();
  conditions[condition] = value;
  
  return await base44.entities.PaymentWallet.update(id, {
    release_conditions: conditions
  });
}

/**
 * Get wallets by status
 */
export async function getWalletsByStatus(status) {
  return await base44.entities.PaymentWallet.filter(
    { status },
    '-created_date'
  );
}

/**
 * Get pending release wallets
 */
export async function getPendingReleaseWallets() {
  const wallets = await base44.entities.PaymentWallet.filter(
    { status: 'fully_held' },
    '-created_date'
  );
  return wallets.filter(w => 
    w.release_conditions?.delivery_confirmed && 
    w.release_conditions?.dispute_resolved
  );
}

export const walletRepository = {
  listWallets,
  getWalletByOrderId,
  getWalletById,
  createWallet,
  updateWallet,
  updateWalletStatus,
  updateReleaseCondition,
  getWalletsByStatus,
  getPendingReleaseWallets
};

export default walletRepository;
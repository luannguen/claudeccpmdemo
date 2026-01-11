/**
 * checkWalletReleaseConditions - Scheduled function (Daily 3AM)
 * 
 * Kiểm tra điều kiện release wallet:
 * - Delivery confirmed
 * - Customer accepted OR inspection period passed
 * - No active disputes
 * 
 * Auto-release nếu đủ điều kiện
 * 
 * Uses PreOrder Module
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const asServiceRole = base44.asServiceRole;

    const results = {
      checked: 0,
      released: [],
      pending: [],
      errors: []
    };

    // Get wallets ready to check
    const walletsToCheck = await asServiceRole.entities.PaymentWallet.filter({
      status: { $in: ['fully_held', 'deposit_held'] },
      total_held: { $gt: 0 }
    });

    results.checked = walletsToCheck.length;

    for (const wallet of walletsToCheck) {
      try {
        const conditions = wallet.release_conditions || {};

        // Check 1: Delivery confirmed
        if (!conditions.delivery_confirmed) {
          // Check Order status
          const orders = await asServiceRole.entities.Order.filter({ id: wallet.order_id });
          const order = orders[0];
          
          if (order?.order_status === 'delivered') {
            conditions.delivery_confirmed = true;
            await asServiceRole.entities.PaymentWallet.update(wallet.id, {
              release_conditions: conditions
            });
          } else {
            results.pending.push({
              wallet_id: wallet.id,
              order_number: wallet.order_number,
              reason: 'delivery_not_confirmed'
            });
            continue;
          }
        }

        // Check 2: Inspection period passed (24h after delivery)
        if (!conditions.inspection_period_passed && !conditions.customer_accepted) {
          const orders = await asServiceRole.entities.Order.filter({ id: wallet.order_id });
          const order = orders[0];
          
          if (order?.delivery_date) {
            const deliveryDate = new Date(order.delivery_date);
            const hoursSinceDelivery = (Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60);
            
            if (hoursSinceDelivery >= 24) {
              conditions.inspection_period_passed = true;
              await asServiceRole.entities.PaymentWallet.update(wallet.id, {
                release_conditions: conditions
              });
            } else {
              results.pending.push({
                wallet_id: wallet.id,
                order_number: wallet.order_number,
                reason: 'inspection_period_not_passed',
                hours_remaining: Math.ceil(24 - hoursSinceDelivery)
              });
              continue;
            }
          }
        }

        // Check 3: No active disputes
        if (conditions.dispute_resolved) {
          const disputes = await asServiceRole.entities.DisputeTicket.filter({
            order_id: wallet.order_id,
            status: { $nin: ['resolved', 'closed', 'cancelled'] }
          });

          if (disputes.length > 0) {
            conditions.dispute_resolved = false;
            await asServiceRole.entities.PaymentWallet.update(wallet.id, {
              release_conditions: conditions,
              status: 'disputed',
              hold_reason: `Active dispute: ${disputes[0].ticket_number}`
            });
            
            results.pending.push({
              wallet_id: wallet.id,
              order_number: wallet.order_number,
              reason: 'active_dispute',
              dispute_ticket: disputes[0].ticket_number
            });
            continue;
          }
        }

        // Check all conditions met
        const allConditionsMet = 
          conditions.delivery_confirmed &&
          conditions.dispute_resolved &&
          (conditions.customer_accepted || conditions.inspection_period_passed);

        if (allConditionsMet) {
          // Auto-release to seller
          const totalHeld = wallet.total_held || 0;
          const commissionRate = 10; // Default 10%, should get from config
          const commission = Math.round(totalHeld * (commissionRate / 100));
          const sellerPayout = totalHeld - commission;

          // Update wallet
          await asServiceRole.entities.PaymentWallet.update(wallet.id, {
            seller_payout_amount: sellerPayout,
            seller_payout_date: new Date().toISOString(),
            platform_commission: commission,
            total_held: 0,
            status: 'released_to_seller',
            auto_release_date: new Date().toISOString()
          });

          // Create transactions
          // Commission deduct
          await asServiceRole.entities.WalletTransaction.create({
            wallet_id: wallet.id,
            order_id: wallet.order_id,
            order_number: wallet.order_number,
            transaction_type: 'commission_deduct',
            amount: -commission,
            balance_before: totalHeld,
            balance_after: sellerPayout,
            status: 'completed',
            initiated_by: 'system',
            reason: `Platform commission ${commissionRate}%`,
            auto_rule_applied: 'auto_release'
          });

          // Seller payout
          await asServiceRole.entities.WalletTransaction.create({
            wallet_id: wallet.id,
            order_id: wallet.order_id,
            order_number: wallet.order_number,
            transaction_type: 'seller_payout',
            amount: -sellerPayout,
            balance_before: sellerPayout,
            balance_after: 0,
            status: 'completed',
            initiated_by: 'system',
            reason: 'Auto-release to seller',
            auto_rule_applied: 'auto_release'
          });

          results.released.push({
            wallet_id: wallet.id,
            order_number: wallet.order_number,
            total_held: totalHeld,
            commission,
            seller_payout: sellerPayout
          });

          // TODO: Trigger seller payout notification/transfer
        } else {
          results.pending.push({
            wallet_id: wallet.id,
            order_number: wallet.order_number,
            reason: 'conditions_not_met',
            conditions
          });
        }

      } catch (error) {
        results.errors.push({
          wallet_id: wallet.id,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      summary: {
        total_checked: results.checked,
        released: results.released.length,
        pending: results.pending.length,
        errors: results.errors.length
      },
      details: results,
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});
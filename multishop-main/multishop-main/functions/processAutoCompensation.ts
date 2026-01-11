/**
 * processAutoCompensation - Scheduled function (Daily 2AM)
 * 
 * Tự động kiểm tra và tạo compensation:
 * - Delay compensation (trễ > 7/14/21/30 days)
 * - Shortage compensation (giao thiếu)
 * 
 * Uses PreOrder Module
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role for scheduled tasks
    const asServiceRole = base44.asServiceRole;

    const results = {
      delay_compensations: [],
      shortage_compensations: [],
      errors: []
    };

    // ==== 1. CHECK DELAY COMPENSATIONS ====
    
    // Get active preorders chưa delivered
    const activeOrders = await asServiceRole.entities.Order.filter({
      has_preorder_items: true,
      order_status: { $nin: ['delivered', 'cancelled', 'returned_refunded'] }
    });

    for (const order of activeOrders) {
      try {
        const lotId = order.items?.[0]?.lot_id;
        if (!lotId) continue;

        // Get lot info
        const lots = await asServiceRole.entities.ProductLot.filter({ id: lotId });
        const lot = lots[0];
        if (!lot?.estimated_harvest_date) continue;

        // Calculate delay
        const harvestDate = new Date(lot.estimated_harvest_date);
        const today = new Date();
        const delayDays = Math.floor((today - harvestDate) / (1000 * 60 * 60 * 24));

        if (delayDays <= 0) continue; // Not delayed

        // Check if already compensated for this tier
        const existingComps = await asServiceRole.entities.AutoCompensation.filter({
          order_id: order.id,
          trigger_type: 'delay_threshold'
        });

        // Determine which tier should be compensated
        let shouldCompensate = false;
        let tier = null;

        if (delayDays >= 30 && !existingComps.some(c => c.trigger_details?.days_delayed >= 30)) {
          shouldCompensate = true;
          tier = 'delay_30_days';
        } else if (delayDays >= 21 && !existingComps.some(c => c.trigger_details?.days_delayed >= 21)) {
          shouldCompensate = true;
          tier = 'delay_21_days';
        } else if (delayDays >= 14 && !existingComps.some(c => c.trigger_details?.days_delayed >= 14)) {
          shouldCompensate = true;
          tier = 'delay_14_days';
        } else if (delayDays >= 7 && !existingComps.some(c => c.trigger_details?.days_delayed >= 7)) {
          shouldCompensate = true;
          tier = 'delay_7_days';
        }

        if (shouldCompensate) {
          // Calculate compensation value
          let compensationType = 'voucher';
          let compensationValue = 0;

          if (tier === 'delay_30_days') {
            compensationType = 'partial_refund';
            compensationValue = Math.round(order.total_amount * 0.2); // 20%
          } else if (tier === 'delay_21_days') {
            compensationType = 'discount_current_order';
            compensationValue = Math.round(order.total_amount * 0.15); // 15%
          } else if (tier === 'delay_14_days') {
            compensationType = 'voucher';
            compensationValue = Math.round(order.total_amount * 0.1); // 10%
          } else if (tier === 'delay_7_days') {
            compensationType = 'voucher';
            compensationValue = Math.round(order.total_amount * 0.05); // 5%
          }

          // Create compensation
          const compensation = await asServiceRole.entities.AutoCompensation.create({
            order_id: order.id,
            order_number: order.order_number,
            customer_email: order.customer_email,
            customer_name: order.customer_name,
            lot_id: lotId,
            lot_name: lot.lot_name,
            trigger_type: 'delay_threshold',
            trigger_details: {
              days_delayed: delayDays,
              rule_id: tier,
              rule_description: `Delay ${delayDays} days - Tier ${tier}`
            },
            compensation_type: compensationType,
            compensation_value: compensationValue,
            compensation_unit: 'vnd',
            status: 'approved',
            auto_approved: true,
            applied_at: new Date().toISOString(),
            policy_reference: {
              rule_applied: tier
            },
            notes: `Auto-created: Delay ${delayDays} days`
          });

          results.delay_compensations.push({
            order_id: order.id,
            delay_days: delayDays,
            tier,
            value: compensationValue,
            compensation_id: compensation.id
          });

          // TODO: Apply compensation (create voucher, process refund, etc.)
          // Will implement in separate function
        }
      } catch (error) {
        results.errors.push({
          order_id: order.id,
          type: 'delay_check',
          error: error.message
        });
      }
    }

    // ==== 2. CHECK SHORTAGE COMPENSATIONS ====
    
    // Get recent fulfillments with remaining items
    const recentFulfillments = await asServiceRole.entities.FulfillmentRecord.filter({
      total_items_remaining: { $gt: 0 },
      remaining_action: 'refund_remaining'
    });

    for (const fulfillment of recentFulfillments) {
      try {
        // Check if already compensated
        const existingComps = await asServiceRole.entities.AutoCompensation.filter({
          order_id: fulfillment.order_id,
          trigger_type: 'shortage_delivery'
        });

        if (existingComps.length > 0) continue;

        // Calculate shortage
        const totalOrdered = fulfillment.items?.reduce((sum, item) => 
          sum + (item.ordered_quantity || 0), 0
        ) || 0;
        
        const totalShipped = fulfillment.items?.reduce((sum, item) => 
          sum + (item.shipped_quantity || 0), 0
        ) || 0;

        const shortage = totalOrdered - totalShipped;
        const shortagePercent = totalOrdered > 0 ? (shortage / totalOrdered * 100) : 0;

        if (shortage <= 0) continue;

        // Calculate shortage value
        const shortageValue = fulfillment.items?.reduce((sum, item) => {
          const itemShortage = (item.ordered_quantity || 0) - (item.shipped_quantity || 0);
          return sum + (itemShortage * (item.unit_price || 0));
        }, 0) || 0;

        let compensationType = 'partial_refund';
        let compensationValue = shortageValue;

        // Add bonus for severe shortage
        if (shortagePercent > 30) {
          compensationValue = Math.round(shortageValue * 1.05); // +5%
        }

        // Create compensation
        const compensation = await asServiceRole.entities.AutoCompensation.create({
          order_id: fulfillment.order_id,
          order_number: fulfillment.order_number,
          customer_email: fulfillment.customer_email || '',
          trigger_type: 'shortage_delivery',
          trigger_details: {
            shortage_quantity: shortage,
            shortage_percent: shortagePercent,
            shortage_value: shortageValue,
            fulfillment_id: fulfillment.id
          },
          compensation_type: compensationType,
          compensation_value: compensationValue,
          compensation_unit: 'vnd',
          status: 'approved',
          auto_approved: true,
          applied_at: new Date().toISOString(),
          notes: `Auto-created: Shortage ${shortage} items (${shortagePercent.toFixed(1)}%)`
        });

        results.shortage_compensations.push({
          order_id: fulfillment.order_id,
          shortage,
          shortage_percent: shortagePercent,
          value: compensationValue,
          compensation_id: compensation.id
        });

      } catch (error) {
        results.errors.push({
          fulfillment_id: fulfillment.id,
          type: 'shortage_check',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      summary: {
        delay_compensations_created: results.delay_compensations.length,
        shortage_compensations_created: results.shortage_compensations.length,
        errors_count: results.errors.length
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
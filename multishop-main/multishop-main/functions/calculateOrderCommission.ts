/**
 * calculateOrderCommission.js
 * Backend function to calculate and create commission for a completed order
 * 
 * Phase 1 - Task 1.2 of SaaS Upgrade Plan
 * Created: 2025-01-19
 * 
 * Trigger: Call manually or via webhook when order.status = 'delivered'
 * Input: { order_id: string }
 * Output: { success: boolean, commission_id?: string, error?: string }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const DEFAULT_COMMISSION_RATE = 3; // 3%

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate - allow service calls without user auth for webhooks
    let isAuthenticated = false;
    try {
      const user = await base44.auth.me();
      isAuthenticated = !!user;
    } catch {
      // Allow unauthenticated calls (for webhooks/cron)
    }
    
    // Parse request body
    const body = await req.json();
    const { order_id } = body;
    
    if (!order_id) {
      return Response.json({ 
        success: false, 
        error: 'order_id is required' 
      }, { status: 400 });
    }
    
    console.log(`[Commission] Processing order: ${order_id}`);
    
    // 1. Check if commission already exists
    const existingCommissions = await base44.asServiceRole.entities.Commission.filter({ 
      order_id: order_id 
    });
    
    if (existingCommissions.length > 0) {
      console.log(`[Commission] Already exists for order ${order_id}`);
      return Response.json({ 
        success: false, 
        error: 'Commission already exists for this order',
        existing_commission_id: existingCommissions[0].id
      });
    }
    
    // 2. Get order
    const orders = await base44.asServiceRole.entities.Order.filter({ 
      id: order_id 
    });
    const order = orders[0];
    
    if (!order) {
      return Response.json({ 
        success: false, 
        error: 'Order not found' 
      }, { status: 404 });
    }
    
    // 3. Check if order belongs to a shop
    if (!order.shop_id) {
      console.log(`[Commission] Order ${order_id} is not a shop order, skipping`);
      return Response.json({ 
        success: false, 
        error: 'Order does not belong to any shop - no commission applicable'
      });
    }
    
    // 4. Get tenant (shop)
    const tenants = await base44.asServiceRole.entities.Tenant.filter({ 
      id: order.shop_id 
    });
    const tenant = tenants[0];
    
    // 5. Calculate commission
    const commissionRate = tenant?.custom_commission_rate 
      || tenant?.commission_rate 
      || DEFAULT_COMMISSION_RATE;
    
    const orderAmount = order.total_amount || 0;
    const commissionAmount = Math.round(orderAmount * (commissionRate / 100));
    const shopRevenue = orderAmount - commissionAmount;
    
    console.log(`[Commission] Calculated: ${commissionRate}% of ${orderAmount} = ${commissionAmount}`);
    
    // 6. Generate period month
    const now = new Date();
    const periodMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    // 7. Create commission record
    const commission = await base44.asServiceRole.entities.Commission.create({
      order_id: order.id,
      order_number: order.order_number || `ORD-${order.id.slice(-8)}`,
      shop_id: order.shop_id,
      shop_name: tenant?.organization_name || order.shop_name || 'Unknown Shop',
      order_amount: orderAmount,
      commission_rate: commissionRate,
      commission_amount: commissionAmount,
      shop_revenue: shopRevenue,
      status: 'calculated',
      calculated_date: now.toISOString(),
      period_month: periodMonth
    });
    
    console.log(`[Commission] Created: ${commission.id}`);
    
    // 8. Update order with commission info
    await base44.asServiceRole.entities.Order.update(order_id, {
      commission_total: commissionAmount,
      shop_revenue: shopRevenue,
      commission_status: 'calculated'
    });
    
    // 9. Update tenant pending commission
    if (tenant) {
      const newPendingCommission = (tenant.pending_commission || 0) + commissionAmount;
      const newTotalRevenue = (tenant.total_revenue || 0) + orderAmount;
      
      await base44.asServiceRole.entities.Tenant.update(tenant.id, {
        pending_commission: newPendingCommission,
        total_revenue: newTotalRevenue
      });
      
      console.log(`[Commission] Updated tenant ${tenant.id} pending: ${newPendingCommission}`);
    }
    
    return Response.json({
      success: true,
      commission_id: commission.id,
      commission_amount: commissionAmount,
      commission_rate: commissionRate,
      shop_revenue: shopRevenue,
      period_month: periodMonth
    });
    
  } catch (error) {
    console.error('[Commission] Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});
/**
 * processMonthlyCommissionSettlement.js
 * Backend function to process monthly commission settlement
 * 
 * Phase 1 - Task 1.3 of SaaS Upgrade Plan
 * Created: 2025-01-19
 * 
 * Trigger: Scheduled to run on 1st of every month (via cron/scheduler)
 * Input: { period_month?: string } - Optional, defaults to previous month
 * Output: { success: boolean, processed_count: number, total_amount: number, shops_processed: number }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse request
    const body = await req.json().catch(() => ({}));
    
    // Calculate period (default: previous month)
    let periodMonth = body.period_month;
    if (!periodMonth) {
      const now = new Date();
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      periodMonth = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
    }
    
    console.log(`[Settlement] Processing period: ${periodMonth}`);
    
    // 1. Get all commissions for the period with status = 'calculated'
    const allCommissions = await base44.asServiceRole.entities.Commission.list('-created_date', 1000);
    const pendingCommissions = allCommissions.filter(c => 
      c.period_month === periodMonth && 
      (c.status === 'calculated' || c.status === 'pending')
    );
    
    console.log(`[Settlement] Found ${pendingCommissions.length} pending commissions`);
    
    if (pendingCommissions.length === 0) {
      return Response.json({
        success: true,
        message: 'No pending commissions to process',
        period_month: periodMonth,
        processed_count: 0,
        total_amount: 0,
        shops_processed: 0
      });
    }
    
    // 2. Group by shop
    const byShop = {};
    pendingCommissions.forEach(c => {
      if (!byShop[c.shop_id]) {
        byShop[c.shop_id] = {
          shop_id: c.shop_id,
          shop_name: c.shop_name,
          commissions: [],
          total_commission: 0,
          total_revenue: 0
        };
      }
      byShop[c.shop_id].commissions.push(c);
      byShop[c.shop_id].total_commission += c.commission_amount || 0;
      byShop[c.shop_id].total_revenue += c.order_amount || 0;
    });
    
    const shops = Object.values(byShop);
    console.log(`[Settlement] Processing ${shops.length} shops`);
    
    // 3. Process each shop
    const processedShops = [];
    let totalProcessed = 0;
    let totalAmount = 0;
    
    for (const shop of shops) {
      try {
        // Approve all commissions for this shop
        for (const commission of shop.commissions) {
          await base44.asServiceRole.entities.Commission.update(commission.id, {
            status: 'approved',
            approved_date: new Date().toISOString(),
            notes: `Auto-approved in monthly settlement ${periodMonth}`
          });
          totalProcessed++;
        }
        
        // Update tenant
        const tenants = await base44.asServiceRole.entities.Tenant.filter({ id: shop.shop_id });
        const tenant = tenants[0];
        
        if (tenant) {
          // Update total_commission_paid and pending_commission
          const newTotalPaid = (tenant.total_commission_paid || 0) + shop.total_commission;
          const newPending = Math.max(0, (tenant.pending_commission || 0) - shop.total_commission);
          
          await base44.asServiceRole.entities.Tenant.update(tenant.id, {
            total_commission_paid: newTotalPaid,
            pending_commission: newPending
          });
          
          console.log(`[Settlement] Updated tenant ${tenant.organization_name}: paid=${newTotalPaid}, pending=${newPending}`);
        }
        
        totalAmount += shop.total_commission;
        
        processedShops.push({
          shop_id: shop.shop_id,
          shop_name: shop.shop_name,
          commission_count: shop.commissions.length,
          total_commission: shop.total_commission
        });
        
      } catch (shopError) {
        console.error(`[Settlement] Error processing shop ${shop.shop_id}:`, shopError);
      }
    }
    
    // 4. Log settlement summary
    console.log(`[Settlement] Completed: ${totalProcessed} commissions, ${totalAmount} VND, ${processedShops.length} shops`);
    
    return Response.json({
      success: true,
      period_month: periodMonth,
      processed_count: totalProcessed,
      total_amount: totalAmount,
      shops_processed: processedShops.length,
      details: processedShops
    });
    
  } catch (error) {
    console.error('[Settlement] Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});
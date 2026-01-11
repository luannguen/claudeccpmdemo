/**
 * updateTenantUsage.js
 * Cron job để cập nhật usage counts cho tất cả tenants
 * 
 * Phase 4 - Task 4.2 of SaaS Upgrade Plan
 * Created: 2025-01-19
 * 
 * Trigger: Scheduled daily at 00:30
 * Input: {} - No input needed
 * Output: { success: boolean, updated_count: number }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('[Usage Update] Starting daily usage update...');
    
    // Get all tenants
    const tenants = await base44.asServiceRole.entities.Tenant.list('-created_date', 1000);
    
    console.log(`[Usage Update] Found ${tenants.length} tenants`);
    
    let updatedCount = 0;
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    for (const tenant of tenants) {
      try {
        // Count products
        const products = await base44.asServiceRole.entities.ShopProduct.filter({ shop_id: tenant.id });
        const productsCount = products.length;
        
        // Count customers
        const customers = await base44.asServiceRole.entities.Customer.filter({ shop_id: tenant.id });
        const customersCount = customers.length;
        
        // Count orders this month
        const allOrders = await base44.asServiceRole.entities.Order.filter({ shop_id: tenant.id });
        const ordersThisMonth = allOrders.filter(o => 
          o.created_date?.startsWith(currentMonth)
        ).length;
        
        // Count tenant users
        const tenantUsers = await base44.asServiceRole.entities.TenantUser.filter({ 
          tenant_id: tenant.id,
          status: 'active'
        });
        const usersCount = tenantUsers.length;
        
        // Calculate storage (simplified - would need actual file size tracking)
        const storageUsed = 0; // Placeholder
        
        // Update tenant usage
        const currentUsage = tenant.usage || {};
        const newUsage = {
          ...currentUsage,
          products_count: productsCount,
          customers_count: customersCount,
          orders_per_month_count: ordersThisMonth,
          users_count: usersCount,
          storage_mb_count: storageUsed,
          last_updated: now.toISOString(),
          last_updated_month: currentMonth
        };
        
        // Check if monthly reset needed
        const lastResetMonth = currentUsage.monthly_reset_month;
        if (lastResetMonth && lastResetMonth !== currentMonth) {
          newUsage.orders_per_month_count = ordersThisMonth; // Already counted only this month
          newUsage.monthly_reset_month = currentMonth;
        } else if (!lastResetMonth) {
          newUsage.monthly_reset_month = currentMonth;
        }
        
        await base44.asServiceRole.entities.Tenant.update(tenant.id, {
          usage: newUsage
        });
        
        updatedCount++;
        
        console.log(`[Usage Update] Updated ${tenant.organization_name}: products=${productsCount}, orders=${ordersThisMonth}, customers=${customersCount}`);
        
      } catch (tenantError) {
        console.error(`[Usage Update] Error updating ${tenant.id}:`, tenantError);
      }
    }
    
    console.log(`[Usage Update] Completed: ${updatedCount} tenants updated`);
    
    return Response.json({
      success: true,
      updated_count: updatedCount,
      total_tenants: tenants.length
    });
    
  } catch (error) {
    console.error('[Usage Update] Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});
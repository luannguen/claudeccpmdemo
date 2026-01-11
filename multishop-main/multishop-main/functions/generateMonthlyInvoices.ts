/**
 * generateMonthlyInvoices.js
 * Generate invoices cho tất cả subscriptions vào đầu tháng
 * 
 * Phase 2 - Task 2.1 of SaaS Upgrade Plan
 * Created: 2025-01-19
 * 
 * Trigger: Scheduled - chạy ngày 1 hàng tháng lúc 00:00
 * Input: {} - No input needed
 * Output: { success: boolean, generated_count: number, total_amount: number }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const PLAN_PRICES = {
  free: 0,
  starter: 199000,
  pro: 499000,
  enterprise: 1500000
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('[Invoice Generation] Starting monthly invoice generation...');
    
    // 1. Get all active subscriptions
    const allSubscriptions = await base44.asServiceRole.entities.Subscription.list('-created_date', 1000);
    const activeSubscriptions = allSubscriptions.filter(sub => 
      sub.status === 'active' || sub.status === 'trial'
    );
    
    console.log(`[Invoice Generation] Found ${activeSubscriptions.length} active subscriptions`);
    
    const generatedInvoices = [];
    let totalAmount = 0;
    
    // 2. Generate invoice for each subscription
    for (const subscription of activeSubscriptions) {
      try {
        // Skip free plans
        if (subscription.plan_name === 'free') {
          console.log(`[Invoice Generation] Skipping free plan: ${subscription.tenant_id}`);
          continue;
        }
        
        // Check if invoice already exists for current period
        const existingInvoices = await base44.asServiceRole.entities.Invoice.filter({
          subscription_id: subscription.id,
          billing_period_start: subscription.current_period_start
        });
        
        if (existingInvoices.length > 0) {
          console.log(`[Invoice Generation] Invoice already exists for ${subscription.tenant_id}`);
          continue;
        }
        
        // Get tenant
        const tenants = await base44.asServiceRole.entities.Tenant.filter({ id: subscription.tenant_id });
        const tenant = tenants[0];
        
        if (!tenant) continue;
        
        // Calculate amounts
        const now = new Date();
        const planPrice = PLAN_PRICES[subscription.plan_name] || 0;
        const subtotal = planPrice;
        const taxRate = 10;
        const taxAmount = Math.round(subtotal * (taxRate / 100));
        const total = subtotal + taxAmount;
        
        // Generate invoice number
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const invoiceNumber = `INV-${dateStr}-${random}`;
        
        // Due date (7 days from now)
        const dueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        // Create invoice
        const invoice = await base44.asServiceRole.entities.Invoice.create({
          tenant_id: tenant.id,
          subscription_id: subscription.id,
          invoice_number: invoiceNumber,
          invoice_date: now.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          billing_period_start: subscription.current_period_start,
          billing_period_end: subscription.current_period_end,
          plan_name: subscription.plan_name,
          billing_cycle: subscription.billing_cycle || 'monthly',
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          discount_amount: 0,
          total_amount: total,
          currency: 'VND',
          status: 'sent',
          sent_to_email: tenant.owner_email,
          sent_date: new Date().toISOString(),
          billing_address: {
            organization_name: tenant.organization_name,
            address: tenant.address,
            email: tenant.owner_email,
            phone: tenant.phone
          },
          line_items: [{
            description: `${subscription.plan_name.toUpperCase()} Plan - Monthly Subscription`,
            quantity: 1,
            unit_price: planPrice,
            amount: planPrice
          }]
        });
        
        generatedInvoices.push({
          invoice_id: invoice.id,
          tenant_id: tenant.id,
          shop_name: tenant.organization_name,
          amount: total
        });
        
        totalAmount += total;
        
        console.log(`[Invoice Generation] Created invoice ${invoiceNumber} for ${tenant.organization_name}: ${total}đ`);
        
      } catch (subError) {
        console.error(`[Invoice Generation] Error for subscription ${subscription.id}:`, subError);
      }
    }
    
    console.log(`[Invoice Generation] Completed: ${generatedInvoices.length} invoices, total: ${totalAmount}đ`);
    
    return Response.json({
      success: true,
      generated_count: generatedInvoices.length,
      total_amount: totalAmount,
      invoices: generatedInvoices
    });
    
  } catch (error) {
    console.error('[Invoice Generation] Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});
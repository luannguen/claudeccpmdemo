/**
 * processSubscriptionRenewal.js
 * Xử lý renewal/suspend cho subscriptions hết hạn
 * 
 * Phase 2 - Task 2.3 of SaaS Upgrade Plan
 * Created: 2025-01-19
 * 
 * Trigger: Scheduled daily at 01:00
 * Input: {} - No input needed
 * Output: { success: boolean, renewed_count: number, suspended_count: number }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('[Subscription Renewal] Starting renewal process...');
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Get all subscriptions
    const allSubscriptions = await base44.asServiceRole.entities.Subscription.list('-current_period_end', 1000);
    
    // Find subscriptions expiring today
    const expiringToday = allSubscriptions.filter(sub => 
      sub.current_period_end === today && 
      (sub.status === 'active' || sub.status === 'trial')
    );
    
    console.log(`[Subscription Renewal] Found ${expiringToday.length} subscriptions expiring today`);
    
    let renewedCount = 0;
    let suspendedCount = 0;
    
    for (const subscription of expiringToday) {
      try {
        // Get latest invoice for this subscription
        const invoices = await base44.asServiceRole.entities.Invoice.filter({ 
          subscription_id: subscription.id 
        });
        const latestInvoice = invoices.sort((a, b) => 
          new Date(b.invoice_date) - new Date(a.invoice_date)
        )[0];
        
        // Check if invoice is paid
        const invoicePaid = latestInvoice?.status === 'paid';
        
        if (invoicePaid || subscription.plan_name === 'free') {
          // Renew subscription
          const currentEnd = new Date(subscription.current_period_end);
          let nextEnd;
          
          if (subscription.billing_cycle === 'yearly') {
            nextEnd = new Date(currentEnd.getFullYear() + 1, currentEnd.getMonth(), currentEnd.getDate());
          } else if (subscription.billing_cycle === 'quarterly') {
            nextEnd = new Date(currentEnd.getFullYear(), currentEnd.getMonth() + 3, currentEnd.getDate());
          } else {
            nextEnd = new Date(currentEnd.getFullYear(), currentEnd.getMonth() + 1, currentEnd.getDate());
          }
          
          await base44.asServiceRole.entities.Subscription.update(subscription.id, {
            status: 'active',
            current_period_start: subscription.current_period_end,
            current_period_end: nextEnd.toISOString().split('T')[0],
            last_payment_date: now.toISOString()
          });
          
          renewedCount++;
          console.log(`[Subscription Renewal] Renewed: ${subscription.tenant_id}`);
          
        } else {
          // Check grace period (3 days)
          const invoiceDueDate = latestInvoice ? new Date(latestInvoice.due_date) : null;
          const daysOverdue = invoiceDueDate 
            ? Math.ceil((now - invoiceDueDate) / (1000 * 60 * 60 * 24))
            : 999;
          
          if (daysOverdue > 3) {
            // Suspend subscription
            await base44.asServiceRole.entities.Subscription.update(subscription.id, {
              status: 'suspended',
              suspended_date: now.toISOString(),
              suspension_reason: `Payment not received - ${daysOverdue} days overdue`
            });
            
            // Update tenant
            await base44.asServiceRole.entities.Tenant.update(subscription.tenant_id, {
              subscription_status: 'suspended',
              status: 'suspended'
            });
            
            // Mark invoice as overdue
            if (latestInvoice) {
              await base44.asServiceRole.entities.Invoice.update(latestInvoice.id, {
                status: 'overdue'
              });
            }
            
            suspendedCount++;
            console.log(`[Subscription Renewal] Suspended: ${subscription.tenant_id} (${daysOverdue} days overdue)`);
            
            // Send suspension email
            const tenants = await base44.asServiceRole.entities.Tenant.filter({ id: subscription.tenant_id });
            const tenant = tenants[0];
            
            if (tenant) {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: tenant.owner_email,
                subject: '⚠️ Tài khoản bị tạm ngưng - Thanh toán quá hạn',
                body: `
Xin chào ${tenant.owner_name},

Tài khoản của bạn đã bị tạm ngưng do chưa thanh toán hóa đơn.

📄 **Invoice**: ${latestInvoice?.invoice_number}
💰 **Số tiền**: ${latestInvoice?.total_amount?.toLocaleString('vi-VN')}đ
⏰ **Quá hạn**: ${daysOverdue} ngày

Vui lòng thanh toán ngay để kích hoạt lại dịch vụ.

Trân trọng,
Farmer Smart Team
                `
              });
            }
          }
        }
        
      } catch (subError) {
        console.error(`[Subscription Renewal] Error processing ${subscription.id}:`, subError);
      }
    }
    
    console.log(`[Subscription Renewal] Completed: ${renewedCount} renewed, ${suspendedCount} suspended`);
    
    return Response.json({
      success: true,
      renewed_count: renewedCount,
      suspended_count: suspendedCount,
      total_checked: expiringToday.length
    });
    
  } catch (error) {
    console.error('[Subscription Renewal] Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});
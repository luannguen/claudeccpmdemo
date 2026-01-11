/**
 * suspendExpiredTenants.js
 * Suspend tenants với subscription quá hạn
 * 
 * Phase 2 - Task 2.4 of SaaS Upgrade Plan
 * Created: 2025-01-19
 * 
 * Trigger: Scheduled daily at 02:00
 * Input: {} - No input needed
 * Output: { success: boolean, suspended_count: number }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('[Suspend Tenants] Starting expired tenant check...');
    
    const now = new Date();
    
    // Get all active tenants with subscriptions
    const allTenants = await base44.asServiceRole.entities.Tenant.list('-created_date', 1000);
    const activeTenants = allTenants.filter(t => 
      t.status === 'active' && 
      t.subscription_status === 'active'
    );
    
    console.log(`[Suspend Tenants] Checking ${activeTenants.length} active tenants`);
    
    let suspendedCount = 0;
    
    for (const tenant of activeTenants) {
      try {
        // Get subscription
        const subscriptions = await base44.asServiceRole.entities.Subscription.filter({ 
          tenant_id: tenant.id 
        });
        const subscription = subscriptions[0];
        
        if (!subscription) continue;
        
        // Check if subscription is past due
        const periodEnd = new Date(subscription.current_period_end);
        const daysOverdue = Math.ceil((now - periodEnd) / (1000 * 60 * 60 * 24));
        
        // Grace period: 7 days
        if (daysOverdue > 7) {
          // Get latest invoice
          const invoices = await base44.asServiceRole.entities.Invoice.filter({ 
            tenant_id: tenant.id 
          });
          const latestInvoice = invoices.sort((a, b) => 
            new Date(b.invoice_date) - new Date(a.invoice_date)
          )[0];
          
          // Check if unpaid
          if (latestInvoice?.status !== 'paid') {
            // Suspend tenant
            await base44.asServiceRole.entities.Tenant.update(tenant.id, {
              status: 'suspended',
              subscription_status: 'suspended'
            });
            
            // Suspend subscription
            await base44.asServiceRole.entities.Subscription.update(subscription.id, {
              status: 'suspended',
              suspended_date: now.toISOString(),
              suspension_reason: `Payment overdue by ${daysOverdue} days`
            });
            
            suspendedCount++;
            console.log(`[Suspend Tenants] Suspended: ${tenant.organization_name} (${daysOverdue} days overdue)`);
            
            // Send suspension notice
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: tenant.owner_email,
              subject: '🚨 Tài khoản bị đình chỉ - Thanh toán quá hạn',
              body: `
Xin chào ${tenant.owner_name},

Tài khoản "${tenant.organization_name}" đã bị đình chỉ do thanh toán quá hạn ${daysOverdue} ngày.

📄 **Invoice**: ${latestInvoice?.invoice_number}
💰 **Số tiền**: ${latestInvoice?.total_amount?.toLocaleString('vi-VN')}đ
⏰ **Quá hạn**: ${daysOverdue} ngày

⚠️ **Hệ quả**:
- Website của bạn sẽ bị tạm ngưng
- Không thể nhận đơn hàng mới
- Dữ liệu vẫn được giữ an toàn

✅ **Cách khôi phục**:
Thanh toán invoice ngay để kích hoạt lại dịch vụ.

Trân trọng,
Farmer Smart Team
              `
            });
          }
        }
        
      } catch (tenantError) {
        console.error(`[Suspend Tenants] Error processing ${tenant.id}:`, tenantError);
      }
    }
    
    console.log(`[Suspend Tenants] Completed: ${suspendedCount} tenants suspended`);
    
    return Response.json({
      success: true,
      suspended_count: suspendedCount,
      total_checked: activeTenants.length
    });
    
  } catch (error) {
    console.error('[Suspend Tenants] Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});
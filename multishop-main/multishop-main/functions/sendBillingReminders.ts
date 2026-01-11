/**
 * sendBillingReminders.js
 * Gửi email nhắc thanh toán cho invoices sắp đến hạn
 * 
 * Phase 2 - Task 2.2 of SaaS Upgrade Plan
 * Created: 2025-01-19
 * 
 * Trigger: Scheduled daily at 09:00
 * Input: {} - No input needed
 * Output: { success: boolean, reminders_sent: number }
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('[Billing Reminders] Starting reminder check...');
    
    const now = new Date();
    const allInvoices = await base44.asServiceRole.entities.Invoice.list('-due_date', 500);
    
    // Filter sent invoices only
    const sentInvoices = allInvoices.filter(inv => inv.status === 'sent');
    
    const remindersToSend = [];
    
    // Check each invoice
    for (const invoice of sentInvoices) {
      const dueDate = new Date(invoice.due_date);
      const daysDiff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      
      // Send reminders at 7, 3, 1 days before due date
      const shouldSendReminder = [7, 3, 1].includes(daysDiff);
      
      if (shouldSendReminder) {
        // Check if already sent reminder today
        const lastReminder = invoice.last_reminder_date 
          ? new Date(invoice.last_reminder_date) 
          : null;
        
        const alreadySentToday = lastReminder && 
          lastReminder.toDateString() === now.toDateString();
        
        if (!alreadySentToday) {
          remindersToSend.push({
            invoice,
            days_remaining: daysDiff
          });
        }
      }
    }
    
    console.log(`[Billing Reminders] Found ${remindersToSend.length} invoices needing reminders`);
    
    // Send reminders
    let sentCount = 0;
    
    for (const { invoice, days_remaining } of remindersToSend) {
      try {
        // Get tenant for email
        const tenants = await base44.asServiceRole.entities.Tenant.filter({ id: invoice.tenant_id });
        const tenant = tenants[0];
        
        if (!tenant) continue;
        
        // Send email
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: tenant.owner_email,
          subject: `Nhắc thanh toán: Invoice ${invoice.invoice_number} - Còn ${days_remaining} ngày`,
          body: `
Xin chào ${tenant.owner_name},

Đây là email nhắc nhở về hóa đơn subscription của bạn:

📄 **Invoice**: ${invoice.invoice_number}
💰 **Số tiền**: ${invoice.total_amount?.toLocaleString('vi-VN')}đ
📅 **Hạn thanh toán**: ${new Date(invoice.due_date).toLocaleDateString('vi-VN')}
⏰ **Còn lại**: ${days_remaining} ngày

📦 **Gói dịch vụ**: ${invoice.plan_name?.toUpperCase()}
📆 **Chu kỳ**: ${invoice.billing_period_start} đến ${invoice.billing_period_end}

Vui lòng thanh toán trước ngày ${new Date(invoice.due_date).toLocaleDateString('vi-VN')} để tránh gián đoạn dịch vụ.

Trân trọng,
Farmer Smart Team
          `
        });
        
        // Update invoice
        await base44.asServiceRole.entities.Invoice.update(invoice.id, {
          reminder_sent_count: (invoice.reminder_sent_count || 0) + 1,
          last_reminder_date: now.toISOString()
        });
        
        sentCount++;
        
        console.log(`[Billing Reminders] Sent reminder to ${tenant.owner_email} for invoice ${invoice.invoice_number}`);
        
      } catch (emailError) {
        console.error(`[Billing Reminders] Error sending to invoice ${invoice.id}:`, emailError);
      }
    }
    
    console.log(`[Billing Reminders] Completed: ${sentCount} reminders sent`);
    
    return Response.json({
      success: true,
      reminders_sent: sentCount,
      invoices_checked: sentInvoices.length
    });
    
  } catch (error) {
    console.error('[Billing Reminders] Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});
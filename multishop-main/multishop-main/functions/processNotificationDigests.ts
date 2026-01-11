/**
 * Scheduled Task: Process Notification Digests
 * NOTIF-F06: Smart Notification Batching & Digest
 * 
 * Runs every hour to send pending digests
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Notification type grouping
const NOTIFICATION_TYPE_GROUPS = {
  orders: { label: '🛍️ Đơn hàng', types: ['new_order', 'order_confirmed', 'order_processing', 'order_shipping', 'order_status_change'] },
  payments: { label: '💳 Thanh toán', types: ['payment_received', 'payment_success', 'deposit_received', 'deposit_paid'] },
  social: { label: '🤝 Kết nối & Tin nhắn', types: ['new_connection', 'new_message', 'connection_request', 'profile_view'] },
  gifts: { label: '🎁 Quà tặng', types: ['gift', 'gift_received', 'gift_sent', 'gift_redeemed'] },
  reviews: { label: '⭐ Đánh giá', types: ['new_review', 'review_response', 'review_helpful'] },
  referral: { label: '👥 Giới thiệu', types: ['new_referral', 'referral_commission', 'referral_member_approved'] },
  community: { label: '📝 Cộng đồng', types: ['new_comment', 'new_like', 'new_follow', 'post_featured'] },
  system: { label: '🔔 Hệ thống', types: ['system', 'reminder', 'announcement'] }
};

function getNotificationGroup(type) {
  for (const [groupKey, group] of Object.entries(NOTIFICATION_TYPE_GROUPS)) {
    if (group.types.includes(type)) {
      return { key: groupKey, ...group };
    }
  }
  return { key: 'other', label: '📌 Khác', types: [] };
}

function groupNotifications(notifications) {
  const grouped = {};
  
  for (const notif of notifications) {
    const group = getNotificationGroup(notif.type);
    
    if (!grouped[group.key]) {
      grouped[group.key] = {
        type: group.key,
        label: group.label,
        count: 0,
        sample_titles: []
      };
    }
    
    grouped[group.key].count++;
    if (grouped[group.key].sample_titles.length < 3) {
      grouped[group.key].sample_titles.push(notif.title);
    }
  }
  
  return Object.values(grouped).sort((a, b) => b.count - a.count);
}

function buildEmailBody(groupedSummary, totalCount) {
  let html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; margin: 0;">📬 Tổng hợp thông báo</h1>
        <p style="color: #666; margin: 10px 0 0;">Bạn có ${totalCount} thông báo mới</p>
      </div>
  `;
  
  for (const group of groupedSummary) {
    html += `
      <div style="margin: 16px 0; padding: 16px; background: #f8fafc; border-radius: 12px; border-left: 4px solid #6366f1;">
        <h3 style="margin: 0 0 12px; color: #1f2937; font-size: 16px;">${group.label} <span style="color: #6366f1;">(${group.count})</span></h3>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
    `;
    
    for (const title of group.sample_titles) {
      html += `<li style="margin: 6px 0; line-height: 1.5;">${title}</li>`;
    }
    
    if (group.count > 3) {
      html += `<li style="color: #9ca3af; font-style: italic;">... và ${group.count - 3} thông báo khác</li>`;
    }
    
    html += `
        </ul>
      </div>
    `;
  }
  
  html += `
      <div style="margin-top: 30px; text-align: center;">
        <a href="#" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">
          Xem tất cả thông báo
        </a>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
          Bạn nhận được email này vì đã bật tính năng gộp thông báo.<br>
          <a href="#" style="color: #6366f1;">Thay đổi cài đặt</a>
        </p>
      </div>
    </div>
  `;
  
  return html;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access for scheduled task
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    console.log('🔄 [processNotificationDigests] Starting...');
    
    const now = new Date().toISOString();
    
    // Get pending digests that are ready to send
    const pendingDigests = await base44.asServiceRole.entities.NotificationDigest.filter({
      status: 'pending'
    }, '-scheduled_for', 100);
    
    // Filter to only those scheduled for now or earlier
    const readyDigests = pendingDigests.filter(d => 
      d.scheduled_for && new Date(d.scheduled_for) <= new Date(now)
    );
    
    console.log(`📬 [processNotificationDigests] Found ${readyDigests.length} ready digests`);
    
    if (readyDigests.length === 0) {
      return Response.json({ 
        success: true, 
        message: 'No pending digests to process',
        processed: 0 
      });
    }
    
    let processed = 0;
    let failed = 0;
    const results = [];
    
    for (const digest of readyDigests) {
      try {
        console.log(`📨 Processing digest ${digest.id} for ${digest.user_email}`);
        
        // Fetch notifications for this digest
        let notifications = [];
        if (digest.notification_ids?.length > 0) {
          // Try to fetch from Notification entity
          try {
            const allNotifications = await base44.asServiceRole.entities.Notification.filter({
              recipient_email: digest.user_email,
              is_read: false
            }, '-created_date', 50);
            
            notifications = allNotifications.filter(n => 
              digest.notification_ids.includes(n.id)
            );
          } catch (e) {
            console.log('Note: Could not fetch notifications:', e.message);
          }
        }
        
        // If no notifications found, check for unread ones
        if (notifications.length === 0) {
          try {
            notifications = await base44.asServiceRole.entities.Notification.filter({
              recipient_email: digest.user_email,
              is_read: false
            }, '-created_date', 20);
          } catch (e) {
            console.log('Note: Could not fetch unread notifications:', e.message);
          }
        }
        
        if (notifications.length === 0) {
          // No notifications - mark as sent anyway
          await base44.asServiceRole.entities.NotificationDigest.update(digest.id, {
            status: 'sent',
            sent_at: now,
            notification_count: 0
          });
          
          results.push({ id: digest.id, status: 'skipped', reason: 'no_notifications' });
          continue;
        }
        
        // Group notifications
        const groupedSummary = groupNotifications(notifications);
        
        // Build summary text
        const totalCount = notifications.length;
        const topGroups = groupedSummary.slice(0, 3).map(g => `${g.count} ${g.label.replace(/^[^\s]+\s/, '')}`);
        const summaryText = topGroups.join(', ');
        
        // Send email
        await base44.integrations.Core.SendEmail({
          to: digest.user_email,
          subject: `📬 Tổng hợp thông báo: ${summaryText}`,
          body: buildEmailBody(groupedSummary, totalCount)
        });
        
        // Mark as sent
        await base44.asServiceRole.entities.NotificationDigest.update(digest.id, {
          status: 'sent',
          sent_at: now,
          email_sent: true,
          notification_count: totalCount,
          grouped_summary: groupedSummary
        });
        
        processed++;
        results.push({ id: digest.id, status: 'sent', count: totalCount });
        
        console.log(`✅ Digest sent to ${digest.user_email}`);
        
      } catch (error) {
        console.error(`❌ Failed to process digest ${digest.id}:`, error.message);
        
        // Mark as failed
        await base44.asServiceRole.entities.NotificationDigest.update(digest.id, {
          status: 'failed',
          error_message: error.message
        });
        
        failed++;
        results.push({ id: digest.id, status: 'failed', error: error.message });
      }
    }
    
    console.log(`✅ [processNotificationDigests] Completed: ${processed} sent, ${failed} failed`);
    
    return Response.json({
      success: true,
      processed,
      failed,
      total: readyDigests.length,
      results
    });
    
  } catch (error) {
    console.error('❌ [processNotificationDigests] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
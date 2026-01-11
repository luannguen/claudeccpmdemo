/**
 * Digest Service - Business logic for notification digest
 * NOTIF-F06: Smart Notification Batching & Digest
 */

import { base44 } from '@/api/base44Client';
import { digestRepository, preferenceRepository } from '../data/digestRepository';
import { 
  shouldBypassDigest, 
  groupNotificationsForDigest, 
  calculateNextDigestTime,
  shouldReceiveDigest,
  getDigestSummaryText
} from '../domain/digestRules';

export class DigestService {
  
  /**
   * Process incoming notification - determine if should go to digest or send immediately
   */
  static async processNotification(notification) {
    const { type, priority, recipient_email } = notification;
    
    // Check if should bypass digest
    if (shouldBypassDigest(type, priority)) {
      console.log('⚡ [DigestService] Notification bypasses digest:', type);
      return { action: 'send_immediately', notification };
    }
    
    // Get user preference
    const prefResult = await preferenceRepository.get(recipient_email);
    const preference = prefResult.success ? prefResult.data : null;
    
    // Check if user wants digest for this type
    if (!shouldReceiveDigest(preference, type)) {
      console.log('📤 [DigestService] User prefers realtime for:', type);
      return { action: 'send_immediately', notification };
    }
    
    // Add to digest
    console.log('📬 [DigestService] Adding to digest:', type);
    await this.addToDigest(recipient_email, notification, preference);
    
    return { action: 'added_to_digest', notification };
  }
  
  /**
   * Add notification to user's pending digest
   */
  static async addToDigest(userEmail, notification, preference) {
    const digestType = preference?.digest_frequency || 'daily';
    
    // Get or create pending digest
    const existingResult = await digestRepository.getPendingDigestForUser(userEmail, digestType);
    
    if (existingResult.success && existingResult.data) {
      // Add to existing digest
      await digestRepository.addNotificationToDigest(existingResult.data.id, notification.id);
      console.log('✅ [DigestService] Added to existing digest:', existingResult.data.id);
    } else {
      // Create new digest
      const scheduledFor = calculateNextDigestTime(preference);
      
      const newDigest = {
        user_email: userEmail,
        digest_type: digestType,
        status: 'pending',
        scheduled_for: scheduledFor?.toISOString(),
        notification_ids: [notification.id],
        notification_count: 1,
        grouped_summary: []
      };
      
      const createResult = await digestRepository.create(newDigest);
      console.log('✅ [DigestService] Created new digest:', createResult.data?.id);
    }
  }
  
  /**
   * Generate and send digest for a user
   */
  static async sendDigest(digest) {
    try {
      console.log('📨 [DigestService] Sending digest:', digest.id);
      
      // Fetch all notifications in digest
      const notifications = await this.fetchNotificationsForDigest(digest.notification_ids);
      
      if (!notifications.length) {
        console.log('⏭️ [DigestService] No notifications to send, marking as sent');
        await digestRepository.markAsSent(digest.id);
        return { success: true, sent: false, reason: 'no_notifications' };
      }
      
      // Group notifications for summary
      const groupedSummary = groupNotificationsForDigest(notifications);
      
      // Update digest with summary
      await digestRepository.update(digest.id, {
        grouped_summary: groupedSummary
      });
      
      // Get user preference for email/push
      const prefResult = await preferenceRepository.get(digest.user_email);
      const preference = prefResult.data;
      
      // Send email digest
      if (preference?.email_digest !== false) {
        await this.sendDigestEmail(digest.user_email, groupedSummary, notifications);
      }
      
      // Mark as sent
      await digestRepository.markAsSent(digest.id);
      
      console.log('✅ [DigestService] Digest sent successfully:', digest.id);
      return { success: true, sent: true, count: notifications.length };
      
    } catch (error) {
      console.error('❌ [DigestService] Failed to send digest:', error);
      await digestRepository.markAsFailed(digest.id, error.message);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Fetch notifications by IDs
   */
  static async fetchNotificationsForDigest(notificationIds) {
    if (!notificationIds?.length) return [];
    
    try {
      // Fetch from Notification entity
      const notifications = await base44.entities.Notification.filter({
        id: { $in: notificationIds }
      }, '-created_date', notificationIds.length);
      
      return notifications;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return [];
    }
  }
  
  /**
   * Send digest email
   */
  static async sendDigestEmail(userEmail, groupedSummary, notifications) {
    const summaryText = getDigestSummaryText(groupedSummary);
    
    // Build email content
    const emailBody = this.buildDigestEmailBody(groupedSummary, notifications);
    
    try {
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: `📬 Tổng hợp thông báo: ${summaryText}`,
        body: emailBody
      });
      
      console.log('✅ [DigestService] Digest email sent to:', userEmail);
      return { success: true };
    } catch (error) {
      console.error('❌ [DigestService] Failed to send email:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Build email body for digest
   */
  static buildDigestEmailBody(groupedSummary, notifications) {
    let html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">📬 Tổng hợp thông báo của bạn</h2>
        <p style="color: #666;">Dưới đây là tóm tắt các thông báo bạn nhận được:</p>
    `;
    
    for (const group of groupedSummary) {
      html += `
        <div style="margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px;">
          <h3 style="margin: 0 0 10px; color: #333;">${group.label} (${group.count})</h3>
          <ul style="margin: 0; padding-left: 20px; color: #555;">
      `;
      
      for (const title of group.sample_titles) {
        html += `<li style="margin: 5px 0;">${title}</li>`;
      }
      
      if (group.count > 3) {
        html += `<li style="color: #888;">... và ${group.count - 3} thông báo khác</li>`;
      }
      
      html += `
          </ul>
        </div>
      `;
    }
    
    html += `
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">
            Bạn nhận được email này vì đã bật tính năng gộp thông báo.<br>
            <a href="#" style="color: #6366f1;">Thay đổi cài đặt thông báo</a>
          </p>
        </div>
      </div>
    `;
    
    return html;
  }
  
  /**
   * Process all pending digests (called by scheduled task)
   */
  static async processAllPendingDigests() {
    console.log('🔄 [DigestService] Processing pending digests...');
    
    const pendingResult = await digestRepository.getPendingDigests();
    
    if (!pendingResult.success || !pendingResult.data?.length) {
      console.log('✅ [DigestService] No pending digests to process');
      return { processed: 0 };
    }
    
    const digests = pendingResult.data;
    console.log(`📬 [DigestService] Found ${digests.length} pending digests`);
    
    let processed = 0;
    let failed = 0;
    
    for (const digest of digests) {
      const result = await this.sendDigest(digest);
      if (result.success) {
        processed++;
      } else {
        failed++;
      }
    }
    
    console.log(`✅ [DigestService] Processed: ${processed}, Failed: ${failed}`);
    return { processed, failed, total: digests.length };
  }
}

export default DigestService;
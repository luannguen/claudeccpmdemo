/**
 * Notification Digest Repository
 * NOTIF-F06: Smart Notification Batching & Digest
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

export const digestRepository = {
  /**
   * Create a new digest
   */
  async create(data) {
    try {
      const digest = await base44.entities.NotificationDigest.create(data);
      return success(digest);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Get pending digests ready to send
   */
  async getPendingDigests() {
    try {
      const now = new Date().toISOString();
      const digests = await base44.entities.NotificationDigest.filter({
        status: 'pending',
        scheduled_for: { $lte: now }
      }, '-scheduled_for', 100);
      return success(digests);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Get pending digest for user
   */
  async getPendingDigestForUser(userEmail, digestType = 'daily') {
    try {
      const digests = await base44.entities.NotificationDigest.filter({
        user_email: userEmail,
        digest_type: digestType,
        status: 'pending'
      }, '-created_date', 1);
      return success(digests[0] || null);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Update digest
   */
  async update(id, data) {
    try {
      const digest = await base44.entities.NotificationDigest.update(id, data);
      return success(digest);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Add notification to digest
   */
  async addNotificationToDigest(digestId, notificationId) {
    try {
      const digests = await base44.entities.NotificationDigest.filter({ id: digestId });
      const digest = digests[0];
      
      if (!digest) {
        return failure('Digest not found', ErrorCodes.NOT_FOUND);
      }
      
      const notification_ids = [...(digest.notification_ids || []), notificationId];
      
      await base44.entities.NotificationDigest.update(digestId, {
        notification_ids,
        notification_count: notification_ids.length
      });
      
      return success({ added: true });
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Mark digest as sent
   */
  async markAsSent(id) {
    try {
      const digest = await base44.entities.NotificationDigest.update(id, {
        status: 'sent',
        sent_at: new Date().toISOString(),
        email_sent: true
      });
      return success(digest);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Mark digest as failed
   */
  async markAsFailed(id, errorMessage) {
    try {
      const digest = await base44.entities.NotificationDigest.update(id, {
        status: 'failed',
        error_message: errorMessage
      });
      return success(digest);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Get digest history for user
   */
  async getDigestHistory(userEmail, limit = 10) {
    try {
      const digests = await base44.entities.NotificationDigest.filter({
        user_email: userEmail,
        status: 'sent'
      }, '-sent_at', limit);
      return success(digests);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

export const preferenceRepository = {
  /**
   * Get user notification preference
   */
  async get(userEmail) {
    try {
      const prefs = await base44.entities.NotificationPreference.filter({
        user_email: userEmail
      }, '-created_date', 1);
      return success(prefs[0] || null);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Create or update user preference
   */
  async upsert(userEmail, data) {
    try {
      const existing = await base44.entities.NotificationPreference.filter({
        user_email: userEmail
      }, '-created_date', 1);
      
      if (existing[0]) {
        const updated = await base44.entities.NotificationPreference.update(existing[0].id, data);
        return success(updated);
      } else {
        const created = await base44.entities.NotificationPreference.create({
          user_email: userEmail,
          ...data
        });
        return success(created);
      }
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Get users with digest enabled at specific time
   */
  async getUsersForDigest(frequency, hour) {
    try {
      const timePattern = `${String(hour).padStart(2, '0')}:`;
      
      const prefs = await base44.entities.NotificationPreference.filter({
        digest_enabled: true,
        digest_frequency: frequency
      }, '-created_date', 500);
      
      // Filter by time (client-side since we can't do string contains in filter)
      const filtered = prefs.filter(p => 
        p.digest_time?.startsWith(timePattern)
      );
      
      return success(filtered);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

export default { digestRepository, preferenceRepository };
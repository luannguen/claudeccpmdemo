/**
 * Notification Repository
 * Handles all notification-related data operations
 */

import { createRepository } from './baseRepository';
import { success, failure, ErrorCodes } from '../types';

export const notificationRepository = createRepository('Notification', (base) => ({
  /**
   * List notifications for a user
   * @param {string} email
   * @param {number} [limit]
   */
  async listForUser(email, limit = 50) {
    return base.filter({ recipient_email: email }, '-created_date', limit);
  },

  /**
   * List unread notifications
   * @param {string} email
   * @param {number} [limit]
   */
  async listUnread(email, limit = 20) {
    return base.filter({ recipient_email: email, is_read: false }, '-created_date', limit);
  },

  /**
   * Get unread count
   * @param {string} email
   */
  async getUnreadCount(email) {
    const result = await this.listUnread(email, 100);
    if (!result.success) return result;
    return success(result.data.length);
  },

  /**
   * Mark as read
   * @param {string} id
   */
  async markAsRead(id) {
    return base.update(id, {
      is_read: true,
      read_date: new Date().toISOString()
    });
  },

  /**
   * Mark all as read for user
   * @param {string} email
   */
  async markAllAsRead(email) {
    const result = await this.listUnread(email, 100);
    if (!result.success) return result;
    
    const updatePromises = result.data.map(n => 
      base.update(n.id, { is_read: true, read_date: new Date().toISOString() })
    );
    
    await Promise.all(updatePromises);
    return success({ updated: result.data.length });
  },

  /**
   * Create notification
   * @param {Object} data
   */
  async createNotification(data) {
    if (!data.recipient_email) {
      return failure('Email người nhận là bắt buộc', ErrorCodes.VALIDATION_ERROR);
    }
    if (!data.type) {
      return failure('Loại thông báo là bắt buộc', ErrorCodes.VALIDATION_ERROR);
    }
    if (!data.message) {
      return failure('Nội dung thông báo là bắt buộc', ErrorCodes.VALIDATION_ERROR);
    }
    
    return base.create({
      ...data,
      is_read: false,
      priority: data.priority || 'normal'
    });
  },

  /**
   * Delete old notifications (cleanup)
   * @param {string} email
   * @param {number} [daysOld=30]
   */
  async deleteOld(email, daysOld = 30) {
    const result = await this.listForUser(email, 500);
    if (!result.success) return result;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const oldNotifications = result.data.filter(n => 
      new Date(n.created_date) < cutoffDate && n.is_read
    );
    
    const deletePromises = oldNotifications.map(n => base.delete(n.id));
    await Promise.all(deletePromises);
    
    return success({ deleted: oldNotifications.length });
  }
}));

export const adminNotificationRepository = createRepository('AdminNotification', (base) => ({
  /**
   * List all admin notifications
   * @param {number} [limit]
   */
  async listAll(limit = 100) {
    return base.list('-created_date', limit);
  },

  /**
   * List by type
   * @param {string} type
   * @param {number} [limit]
   */
  async listByType(type, limit = 50) {
    return base.filter({ type }, '-created_date', limit);
  },

  /**
   * List requiring action
   * @param {number} [limit]
   */
  async listRequiringAction(limit = 50) {
    return base.filter({ requires_action: true, is_read: false }, '-created_date', limit);
  },

  /**
   * List unread
   * @param {number} [limit]
   */
  async listUnread(limit = 50) {
    return base.filter({ is_read: false }, '-created_date', limit);
  },

  /**
   * Get unread count
   */
  async getUnreadCount() {
    const result = await this.listUnread(100);
    if (!result.success) return result;
    return success(result.data.length);
  },

  /**
   * Mark as read
   * @param {string} id
   */
  async markAsRead(id) {
    return base.update(id, {
      is_read: true,
      read_date: new Date().toISOString()
    });
  },

  /**
   * Create admin notification
   * @param {Object} data
   */
  async createNotification(data) {
    if (!data.type) {
      return failure('Loại thông báo là bắt buộc', ErrorCodes.VALIDATION_ERROR);
    }
    if (!data.title || !data.message) {
      return failure('Tiêu đề và nội dung là bắt buộc', ErrorCodes.VALIDATION_ERROR);
    }
    
    return base.create({
      ...data,
      is_read: false,
      priority: data.priority || 'normal',
      requires_action: data.requires_action || false
    });
  }
}));

export default {
  user: notificationRepository,
  admin: adminNotificationRepository
};
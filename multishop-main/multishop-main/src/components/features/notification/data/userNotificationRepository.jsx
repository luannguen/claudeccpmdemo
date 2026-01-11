/**
 * User Notification Repository
 * Client/user-specific notification queries
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';
import { createNotificationRepository } from './baseNotificationRepository';

const baseRepo = createNotificationRepository('Notification');

/**
 * List notifications for user
 */
export const listForUser = async (email, limit = 50) => {
  try {
    const data = await base44.entities.Notification.filter(
      { recipient_email: email },
      '-created_date',
      limit
    );
    return success(data);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
};

/**
 * List unread notifications
 */
export const listUnread = async (email, limit = 20) => {
  try {
    const data = await base44.entities.Notification.filter(
      { recipient_email: email, is_read: false },
      '-created_date',
      limit
    );
    return success(data);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
};

/**
 * Get unread count
 */
export const getUnreadCount = async (email) => {
  const result = await listUnread(email, 100);
  if (!result.success) return result;
  return success(result.data.length);
};

/**
 * Mark as read
 */
export const markAsRead = async (id) => {
  return baseRepo.update(id, {
    is_read: true,
    read_date: new Date().toISOString()
  });
};

/**
 * Mark all as read
 */
export const markAllAsRead = async (email) => {
  const result = await listUnread(email, 100);
  if (!result.success) return result;
  
  try {
    await Promise.all(
      result.data.map(n => 
        base44.entities.Notification.update(n.id, {
          is_read: true,
          read_date: new Date().toISOString()
        })
      )
    );
    return success({ updated: result.data.length });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
};

/**
 * Create user notification
 * NOTE: Using regular base44.entities instead of asServiceRole 
 * because asServiceRole only works in backend functions
 */
export const create = async (data) => {
  if (!data.recipient_email) {
    return failure('Recipient email is required', ErrorCodes.VALIDATION_ERROR);
  }
  
  try {
    // Use regular entities API (asServiceRole doesn't work in frontend)
    const notification = await base44.entities.Notification.create({
      ...data,
      is_read: false,
      priority: data.priority || 'normal'
    });
    return success(notification);
  } catch (error) {
    console.error('❌ Failed to create notification:', error);
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
};

/**
 * Delete old notifications
 */
export const deleteOld = async (email, daysOld = 30) => {
  const result = await listForUser(email, 500);
  if (!result.success) return result;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const oldNotifications = result.data.filter(n => 
    new Date(n.created_date) < cutoffDate && n.is_read
  );
  
  const ids = oldNotifications.map(n => n.id);
  return baseRepo.bulkDelete(ids);
};

export const userNotificationRepository = {
  ...baseRepo,
  listForUser,
  listUnread,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  create,
  deleteOld
};

export default userNotificationRepository;
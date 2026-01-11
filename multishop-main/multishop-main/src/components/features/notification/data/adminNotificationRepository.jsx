/**
 * Admin Notification Repository
 * Admin-specific notification queries
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';
import { createNotificationRepository } from './baseNotificationRepository';

const baseRepo = createNotificationRepository('AdminNotification');

/**
 * List all admin notifications
 * Includes broadcast (null recipient) and user-specific
 */
export const listForAdmin = async (adminEmail, limit = 100) => {
  try {
    // Use regular entities (asServiceRole only works in backend functions)
    const all = await base44.entities.AdminNotification.list('-created_date', limit);
    
    // Filter: null recipient (broadcast) OR matching email
    const filtered = all.filter(n => !n.recipient_email || n.recipient_email === adminEmail);
    
    return success(filtered);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
};

/**
 * List unread
 */
export const listUnread = async (adminEmail, limit = 50) => {
  const result = await listForAdmin(adminEmail, limit);
  if (!result.success) return result;
  
  const unread = result.data.filter(n => !n.is_read);
  return success(unread);
};

/**
 * List requiring action
 */
export const listRequiringAction = async (adminEmail, limit = 50) => {
  const result = await listForAdmin(adminEmail, limit);
  if (!result.success) return result;
  
  const requiring = result.data.filter(n => n.requires_action && !n.is_read);
  return success(requiring);
};

/**
 * List by type
 */
export const listByType = async (adminEmail, type, limit = 50) => {
  const result = await listForAdmin(adminEmail, limit);
  if (!result.success) return result;
  
  const filtered = result.data.filter(n => n.type === type);
  return success(filtered);
};

/**
 * Get unread count
 */
export const getUnreadCount = async (adminEmail) => {
  const result = await listUnread(adminEmail, 100);
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
export const markAllAsRead = async (adminEmail) => {
  const result = await listUnread(adminEmail, 100);
  if (!result.success) return result;
  
  try {
    await Promise.all(
      result.data.map(n => 
        base44.entities.AdminNotification.update(n.id, {
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
 * Create admin notification
 */
export const create = async (data) => {
  console.log('📤 [adminNotificationRepository] create called', {
    type: data?.type,
    title: data?.title,
    recipient_email: data?.recipient_email,
    priority: data?.priority
  });

  if (!data.type) {
    console.error('❌ [adminNotificationRepository] Type is required');
    return failure('Type is required', ErrorCodes.VALIDATION_ERROR);
  }
  
  try {
    // Use regular entities (asServiceRole only works in backend functions)
    const notificationData = {
      ...data,
      is_read: false,
      priority: data.priority || 'high',
      requires_action: data.requires_action || false
    };
    console.log('📤 [adminNotificationRepository] Creating notification with data:', notificationData);
    
    const notification = await base44.entities.AdminNotification.create(notificationData);
    console.log('✅ [adminNotificationRepository] Notification created:', notification?.id);
    return success(notification);
  } catch (error) {
    console.error('❌ [adminNotificationRepository] Create failed:', error.message);
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
};

export const adminNotificationRepository = {
  ...baseRepo,
  listForAdmin,
  listUnread,
  listRequiringAction,
  listByType,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  create
};

export default adminNotificationRepository;
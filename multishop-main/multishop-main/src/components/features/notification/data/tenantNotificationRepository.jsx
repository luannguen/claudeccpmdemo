/**
 * Tenant Notification Repository (NEW)
 * Tenant-specific notification queries with tenant isolation
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';
import { createNotificationRepository } from './baseNotificationRepository';

const baseRepo = createNotificationRepository('TenantNotification');

/**
 * List notifications for tenant user
 * Includes broadcast (null recipient) and user-specific, filtered by tenant_id
 */
export const listForTenantUser = async (tenantId, userEmail, limit = 100) => {
  try {
    // Get all notifications for this tenant
    const all = await base44.asServiceRole.entities.TenantNotification.filter(
      { tenant_id: tenantId },
      '-created_date',
      limit
    );
    
    // Filter: null recipient (broadcast to tenant) OR matching email
    const filtered = all.filter(n => !n.recipient_email || n.recipient_email === userEmail);
    
    return success(filtered);
  } catch (error) {
    console.warn('Service role failed, trying regular:', error.message);
    try {
      const all = await base44.entities.TenantNotification.filter(
        { tenant_id: tenantId },
        '-created_date',
        limit
      );
      const filtered = all.filter(n => !n.recipient_email || n.recipient_email === userEmail);
      return success(filtered);
    } catch (fallbackError) {
      return failure(fallbackError.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

/**
 * List unread
 */
export const listUnread = async (tenantId, userEmail, limit = 50) => {
  const result = await listForTenantUser(tenantId, userEmail, limit);
  if (!result.success) return result;
  
  const unread = result.data.filter(n => !n.is_read);
  return success(unread);
};

/**
 * List requiring action
 */
export const listRequiringAction = async (tenantId, userEmail, limit = 50) => {
  const result = await listForTenantUser(tenantId, userEmail, limit);
  if (!result.success) return result;
  
  const requiring = result.data.filter(n => n.requires_action && !n.is_read);
  return success(requiring);
};

/**
 * Get unread count
 */
export const getUnreadCount = async (tenantId, userEmail) => {
  const result = await listUnread(tenantId, userEmail, 100);
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
export const markAllAsRead = async (tenantId, userEmail) => {
  const result = await listUnread(tenantId, userEmail, 100);
  if (!result.success) return result;
  
  try {
    await Promise.all(
      result.data.map(n => 
        base44.entities.TenantNotification.update(n.id, {
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
 * Create tenant notification
 */
export const create = async (data) => {
  if (!data.tenant_id) {
    return failure('Tenant ID is required', ErrorCodes.VALIDATION_ERROR);
  }
  if (!data.type) {
    return failure('Type is required', ErrorCodes.VALIDATION_ERROR);
  }
  
  try {
    const notification = await base44.asServiceRole.entities.TenantNotification.create({
      ...data,
      is_read: false,
      priority: data.priority || 'normal',
      requires_action: data.requires_action || false
    });
    return success(notification);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
};

/**
 * List all notifications for tenant (admin view)
 */
export const listAllForTenant = async (tenantId, limit = 200) => {
  try {
    const data = await base44.asServiceRole.entities.TenantNotification.filter(
      { tenant_id: tenantId },
      '-created_date',
      limit
    );
    return success(data);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
};

export const tenantNotificationRepository = {
  ...baseRepo,
  listForTenantUser,
  listUnread,
  listRequiringAction,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  create,
  listAllForTenant
};

export default tenantNotificationRepository;
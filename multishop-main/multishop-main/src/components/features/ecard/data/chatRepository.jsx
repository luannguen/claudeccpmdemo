/**
 * Chat Repository (Enhanced)
 * Data Layer - API calls only
 * 
 * @module features/ecard/data
 */

import { base44 } from '@/api/base44Client';

/**
 * Get messages for a connection
 */
export const getMessages = async (connectionId, limit = 50) => {
  return base44.entities.ConnectionMessage.filter(
    { connection_id: connectionId },
    'created_date',
    limit
  );
};

/**
 * Get pinned messages for a connection
 */
export const getPinnedMessages = async (connectionId) => {
  return base44.entities.ConnectionMessage.filter(
    { connection_id: connectionId, is_pinned: true },
    '-pinned_at',
    20
  );
};

/**
 * Send message with optional attachments
 */
export const sendMessage = async (data) => {
  return base44.entities.ConnectionMessage.create({
    ...data,
    sent_at: new Date().toISOString()
  });
};

/**
 * Send scheduled message
 */
export const scheduleMessage = async (data, scheduledAt) => {
  return base44.entities.ConnectionMessage.create({
    ...data,
    is_scheduled: true,
    scheduled_at: scheduledAt
  });
};

/**
 * Mark message as read
 */
export const markAsRead = async (messageId) => {
  return base44.entities.ConnectionMessage.update(messageId, {
    is_read: true,
    read_at: new Date().toISOString()
  });
};

/**
 * Mark all messages in connection as read
 */
export const markAllAsRead = async (connectionId, receiverUserId) => {
  const unreadMessages = await base44.entities.ConnectionMessage.filter({
    connection_id: connectionId,
    receiver_user_id: receiverUserId,
    is_read: false
  });
  
  const updates = unreadMessages.map(msg => 
    base44.entities.ConnectionMessage.update(msg.id, {
      is_read: true,
      read_at: new Date().toISOString()
    })
  );
  
  await Promise.all(updates);
  return { updated: unreadMessages.length };
};

/**
 * Pin message
 */
export const pinMessage = async (messageId) => {
  return base44.entities.ConnectionMessage.update(messageId, {
    is_pinned: true,
    pinned_at: new Date().toISOString()
  });
};

/**
 * Unpin message
 */
export const unpinMessage = async (messageId) => {
  return base44.entities.ConnectionMessage.update(messageId, {
    is_pinned: false,
    pinned_at: null
  });
};

/**
 * Search messages in connection
 */
export const searchMessages = async (connectionId, query, limit = 50) => {
  const messages = await base44.entities.ConnectionMessage.filter(
    { connection_id: connectionId },
    '-created_date',
    200
  );
  
  const lowerQuery = query.toLowerCase();
  return messages.filter(msg => 
    msg.content?.toLowerCase().includes(lowerQuery)
  ).slice(0, limit);
};

/**
 * Get scheduled messages (for processing)
 */
export const getScheduledMessages = async () => {
  const now = new Date().toISOString();
  const scheduled = await base44.entities.ConnectionMessage.filter(
    { is_scheduled: true },
    'scheduled_at',
    100
  );
  
  return scheduled.filter(msg => 
    msg.scheduled_at && msg.scheduled_at <= now && !msg.sent_at
  );
};

/**
 * Process scheduled message (mark as sent)
 */
export const processScheduledMessage = async (messageId) => {
  return base44.entities.ConnectionMessage.update(messageId, {
    is_scheduled: false,
    sent_at: new Date().toISOString()
  });
};

/**
 * Delete message
 */
export const deleteMessage = async (messageId) => {
  return base44.entities.ConnectionMessage.delete(messageId);
};

/**
 * Get unread count for user
 */
export const getUnreadCount = async (receiverUserId) => {
  const unread = await base44.entities.ConnectionMessage.filter({
    receiver_user_id: receiverUserId,
    is_read: false
  });
  return unread.length;
};

export const chatRepository = {
  getMessages,
  getPinnedMessages,
  sendMessage,
  scheduleMessage,
  markAsRead,
  markAllAsRead,
  pinMessage,
  unpinMessage,
  searchMessages,
  getScheduledMessages,
  processScheduledMessage,
  deleteMessage,
  getUnreadCount
};

export default chatRepository;
/**
 * Notification Engine v2.1 - Core creation + event emission
 * 
 * Features:
 * - create() - Direct notification creation (legacy)
 * - emit() - Event-based creation (NEW)
 * - on() - Register event handlers
 * - Middleware pipeline integration
 * - Analytics tracking
 */

import { base44 } from '@/api/base44Client';
import { notificationRouter } from './notificationRouter';
import { recipientResolver } from '../domain/recipientResolver';
import { NotificationPriority } from '../types';

/**
 * Create notification(s) - Direct method (legacy compatible)
 * @param {Object} config
 * @param {string} config.actor - 'client' | 'admin' | 'tenant'
 * @param {string} config.type
 * @param {string|string[]|null} config.recipients - Email(s) or null for broadcast
 * @param {Object} config.payload
 * @param {Object} [config.routing] - { tenant_id, related_entity_type, related_entity_id }
 */
export const create = async ({ actor, type, recipients, payload, routing = {} }) => {
  try {
    // 1. Validate actor
    if (!notificationRouter.isValidActor(actor)) {
      throw new Error(`Invalid actor: ${actor}`);
    }

    // 2. Get entity name
    const entityName = notificationRouter.getEntityName(actor);
    
    // 3. Resolve recipients if needed
    let recipientEmails = [];
    
    if (recipients === null) {
      // Broadcast mode
      recipientEmails = await recipientResolver.resolve({
        actor,
        tenantId: routing.tenant_id
      });
    } else if (Array.isArray(recipients)) {
      recipientEmails = recipients;
    } else {
      recipientEmails = [recipients];
    }

    // 4. Build notification data
    const notificationData = {
      type,
      title: payload.title,
      message: payload.message,
      link: payload.link || null,
      priority: payload.priority || notificationRouter.getDefaultPriority(actor),
      metadata: payload.metadata || {},
      is_read: false,
      ...(payload.actorEmail && { actor_email: payload.actorEmail }),
      ...(payload.actorName && { actor_name: payload.actorName }),
      ...(routing.related_entity_type && { related_entity_type: routing.related_entity_type }),
      ...(routing.related_entity_id && { related_entity_id: routing.related_entity_id }),
      ...(payload.requiresAction !== undefined && { requires_action: payload.requiresAction }),
      ...(routing.tenant_id && { tenant_id: routing.tenant_id })
    };

    // 5. Create notification(s)
    // NOTE: Using regular entities API because asServiceRole doesn't work in frontend
    const notifications = [];

    if (recipientEmails.length === 0) {
      // Broadcast with null recipient
      const notification = await base44.entities[entityName].create({
        ...notificationData,
        recipient_email: null
      });
      notifications.push(notification);
      console.log(`✅ Broadcast ${actor} notification created:`, notification.id);
    } else {
      // Create per recipient
      for (const email of recipientEmails) {
        try {
          const notification = await base44.entities[entityName].create({
            ...notificationData,
            recipient_email: email
          });
          notifications.push(notification);
          console.log(`✅ ${actor} notification created for ${email}:`, notification.id);
        } catch (error) {
          console.error(`❌ Failed to create notification for ${email}:`, error.message);
        }
      }
    }

    // 6. Invalidate queries for real-time sync
    if (typeof window !== 'undefined' && window.queryClient) {
      const queryKey = actor === 'admin' ? 'admin-notifications-realtime' : 
                       actor === 'tenant' ? 'tenant-notifications-realtime' :
                       'user-notifications-realtime';
      
      await window.queryClient.invalidateQueries({ queryKey: [queryKey] });
      console.log(`⚡ Invalidated ${queryKey}`);
    }

    return notifications;
  } catch (error) {
    console.error('❌ Notification engine error:', error);
    return [];
  }
};

/**
 * Batch create notifications (for performance)
 */
export const bulkCreate = async (configs) => {
  const results = await Promise.all(
    configs.map(config => create(config))
  );
  return results.flat();
};

/**
 * Emit event through notification system (NEW v2.1)
 * 
 * @param {string} eventName - Event name (from EventTypes)
 * @param {Object} payload - Event payload
 * @param {Object} options - { priority, async }
 * @returns {Promise<Object>} { success, queued?, error? }
 */
export const emit = async (eventName, payload, options = {}) => {
  const { priority = 'normal', async: isAsync = false } = options;
  const startTime = Date.now();
  
  try {
    // Import dynamically to avoid circular deps
    const { eventRegistry } = await import('./eventRegistry.jsx');
    const { eventMiddleware } = await import('./eventMiddleware.jsx');
    const { eventQueue } = await import('./eventQueue.jsx');
    
    // Check if handlers exist
    if (!eventRegistry.hasHandlers(eventName)) {
      console.warn(`⚠️ No handlers registered for event: ${eventName}`);
      return { success: false, reason: 'no_handlers' };
    }
    
    // Build context
    const context = {
      eventName,
      payload,
      priority,
      emittedAt: new Date().toISOString(),
      recipientEmail: payload.recipientEmail || payload.order?.customer_email,
      isAdminNotification: payload.isAdminNotification || false
    };
    
    // If async (non-urgent), use queue
    if (isAsync && priority !== 'urgent') {
      await eventQueue.enqueue(eventName, payload, { priority });
      
      // Track queued event
      const { eventTracker } = await import('../services/analytics/EventTracker.jsx');
      eventTracker.recordEmit(eventName, { 
        success: true, 
        latency: Date.now() - startTime,
        queued: true 
      });
      
      return { success: true, queued: true };
    }
    
    // Sync processing through middleware pipeline
    const handlers = eventRegistry.getHandlers(eventName);
    
    await eventMiddleware.execute(context, async (ctx) => {
      // Run all handlers in priority order
      for (const { handler, once } of handlers) {
        await handler(ctx.payload);
        
        // Remove one-time handler
        if (once) {
          eventRegistry.unregister(eventName, handler);
        }
      }
    });
    
    // Track success
    const { eventTracker } = await import('../services/analytics/EventTracker.jsx');
    eventTracker.recordEmit(eventName, { 
      success: true, 
      latency: Date.now() - startTime 
    });
    
    return { success: true };
    
  } catch (error) {
    console.error(`❌ Event ${eventName} failed:`, error);
    
    // Track failure
    try {
      const { eventTracker } = await import('../services/analytics/EventTracker.jsx');
      eventTracker.recordEmit(eventName, { 
        success: false, 
        latency: Date.now() - startTime,
        error 
      });
    } catch {}
    
    return { success: false, error: error.message };
  }
};

/**
 * Register event handler (shorthand)
 */
export const on = (eventName, handler, options = {}) => {
  const { eventRegistry } = require('./eventRegistry.jsx');
  return eventRegistry.register(eventName, handler, options);
};

/**
 * Register one-time handler
 */
export const once = (eventName, handler) => {
  const { eventRegistry } = require('./eventRegistry.jsx');
  return eventRegistry.register(eventName, handler, { once: true });
};

/**
 * Get engine stats
 */
export const getStats = async () => {
  try {
    const { eventRegistry } = await import('./eventRegistry.jsx');
    const { eventQueue } = await import('./eventQueue.jsx');
    const { eventTracker } = await import('../services/analytics/EventTracker.jsx');
    
    return {
      events: eventTracker.getSummary(),
      queue: eventQueue.getStats(),
      registry: eventRegistry.getStats()
    };
  } catch (error) {
    console.error('Failed to get stats:', error);
    return null;
  }
};

export const notificationEngine = {
  create,
  bulkCreate,
  emit,
  on,
  once,
  getStats
};

export default notificationEngine;
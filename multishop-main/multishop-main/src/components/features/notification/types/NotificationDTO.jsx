/**
 * Notification DTOs - Unified data transfer objects
 * 
 * @typedef {Object} NotificationDTO
 * @property {string} id
 * @property {string} recipient_email
 * @property {string} type
 * @property {string} title
 * @property {string} message
 * @property {string} [actor_email]
 * @property {string} [actor_name]
 * @property {string} [link]
 * @property {string} priority - 'urgent' | 'high' | 'normal' | 'low'
 * @property {boolean} is_read
 * @property {string} [read_date]
 * @property {Object} [metadata]
 * @property {string} created_date
 * @property {string} created_by
 */

/**
 * @typedef {Object} AdminNotificationDTO
 * @property {string} id
 * @property {string|null} recipient_email - null = broadcast to all admins
 * @property {string} type
 * @property {string} title
 * @property {string} message
 * @property {string} [link]
 * @property {string} priority
 * @property {string} [related_entity_type]
 * @property {string} [related_entity_id]
 * @property {boolean} requires_action
 * @property {boolean} is_read
 * @property {string} [read_date]
 * @property {Object} [metadata]
 * @property {string} created_date
 */

/**
 * @typedef {Object} TenantNotificationDTO
 * @property {string} id
 * @property {string} tenant_id
 * @property {string|null} recipient_email - null = broadcast to all tenant users
 * @property {string} type
 * @property {string} title
 * @property {string} message
 * @property {string} [link]
 * @property {string} priority
 * @property {string} [related_entity_type]
 * @property {string} [related_entity_id]
 * @property {boolean} requires_action
 * @property {boolean} is_read
 * @property {Object} [metadata]
 * @property {string} created_date
 */

/**
 * @typedef {Object} CreateNotificationInput
 * @property {string} actor - 'client' | 'admin' | 'tenant'
 * @property {string} type
 * @property {string|string[]|null} recipients
 * @property {string} title
 * @property {string} message
 * @property {string} [link]
 * @property {string} [priority]
 * @property {boolean} [requiresAction]
 * @property {Object} [metadata]
 * @property {Object} [routing] - { tenant_id, related_entity_type, related_entity_id }
 */

export const NotificationDTOTypes = {
  USER: 'NotificationDTO',
  ADMIN: 'AdminNotificationDTO',
  TENANT: 'TenantNotificationDTO'
};
/**
 * Notification Module - Public API
 * 
 * @module features/notification
 * @description Centralized notification system for client, admin, and tenant actors
 * 
 * USAGE:
 * import { 
 *   useClientNotifications, 
 *   useAdminNotifications,
 *   NotificationServiceFacade,
 *   ClientNotificationBell
 * } from '@/components/features/notification';
 */

// ========== TYPES ==========
export * from './types';

// ========== CORE ==========
export { 
  notificationEngine, 
  notificationRouter, 
  priorityManager, 
  realtimePoller,
  // v2.1 additions
  eventRegistry,
  eventQueue,
  eventMiddleware
} from './core';

// ========== DOMAIN ==========
export { 
  notificationRules, 
  recipientResolver, 
  actionWorkflow, 
  soundPolicy 
} from './domain';

// ========== DATA ==========
export { 
  userNotificationRepository, 
  adminNotificationRepository, 
  tenantNotificationRepository 
} from './data';

// ========== HOOKS ==========
export { 
  useNotificationCore,
  useClientNotifications, 
  useAdminNotifications, 
  useTenantNotifications,
  useNotificationActions,
  useNotificationPreference
} from './hooks';

// ========== UI ==========
export { 
  NotificationBellBase, 
  NotificationItem, 
  NotificationList,
  ClientNotificationBell,
  ClientNotificationModal,
  AdminNotificationBell,
  AdminNotificationModal,
  TenantNotificationBell,
  NotificationPreferencePanel
} from './ui';

// ========== SERVICES ==========
export { 
  NotificationServiceFacade, 
  NotificationService,
  DigestService,
  // v2.1 additions
  initializeHandlers,
  initializeMiddleware,
  eventTracker,
  getMiddlewareStats
} from './services';

// ========== ADAPTERS (Backward Compatibility) ==========
export { 
  NotificationServiceAdapter, 
  useRealTimeNotificationsAdapter,
  // Legacy aliases
  NotificationServiceAdapter as LegacyNotificationService,
  useRealTimeNotificationsAdapter as useRealTimeNotifications
} from './adapters';

// ========== EVENT TYPES (v2.1) ==========
export {
  OrderEvents,
  PaymentEvents,
  PreOrderEvents,
  HarvestEvents,
  PriceEvents,
  InventoryEvents,
  CustomerEvents,
  SocialEvents,
  ReviewEvents,
  ReferralEvents,
  TenantEvents,
  SubscriptionEvents,
  BillingEvents,
  UsageEvents,
  CommunityEvents,
  SystemEvents,
  SecurityEvents,
  AllEvents,
  EventCategories,
  getEventCategory
} from './types/EventTypes';
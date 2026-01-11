
/**
 * Notification Services - Public API
 */

export { NotificationServiceFacade } from './NotificationServiceFacade';
export { default as NotificationService } from './NotificationServiceFacade';
export { DigestService } from './DigestService';

// v2.1 event-driven additions
export { initializeHandlers } from './registerHandlers';
export { initializeMiddleware } from './middleware';
export { eventTracker, getMiddlewareStats } from './analytics/EventTracker';

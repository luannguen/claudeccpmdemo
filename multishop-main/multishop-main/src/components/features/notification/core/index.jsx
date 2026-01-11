/**
 * Notification Core - Public API
 */

export { notificationEngine } from './notificationEngine';
export { notificationRouter } from './notificationRouter';
export { priorityManager } from './priorityManager';
export { realtimePoller } from './realtimePoller';

// v2.1 additions
export { eventRegistry } from './eventRegistry';
export { eventQueue } from './eventQueue';
export { eventMiddleware } from './eventMiddleware';
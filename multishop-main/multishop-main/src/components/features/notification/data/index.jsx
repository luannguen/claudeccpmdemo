
/**
 * Notification Data Layer - Public API
 */

export { createNotificationRepository } from './baseNotificationRepository.jsx';
export { userNotificationRepository } from './userNotificationRepository.jsx';
export { adminNotificationRepository } from './adminNotificationRepository.jsx';
export { tenantNotificationRepository } from './tenantNotificationRepository.jsx';

// Default export for convenience
import { userNotificationRepository } from './userNotificationRepository.jsx';
import { adminNotificationRepository } from './adminNotificationRepository.jsx';
import { tenantNotificationRepository } from './tenantNotificationRepository.jsx';

export default {
  user: userNotificationRepository,
  admin: adminNotificationRepository,
  tenant: tenantNotificationRepository
};

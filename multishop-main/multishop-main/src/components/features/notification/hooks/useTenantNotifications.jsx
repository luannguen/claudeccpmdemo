/**
 * Tenant Notifications Hook (NEW)
 * For shop owners/tenant admins
 */

import { useNotificationCore } from './useNotificationCore';
import { tenantNotificationRepository } from '../data';

export function useTenantNotifications(userEmail, tenantId, options = {}) {
  const {
    pollingInterval = 5000, // 5s for tenant users
    enabled = true
  } = options;

  return useNotificationCore({
    actor: 'tenant',
    userEmail,
    tenantId,
    pollingInterval,
    enabled: enabled && !!userEmail && !!tenantId,
    repository: tenantNotificationRepository
  });
}

export default useTenantNotifications;
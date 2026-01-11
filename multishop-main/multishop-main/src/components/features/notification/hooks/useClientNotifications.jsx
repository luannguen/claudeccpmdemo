/**
 * Client Notifications Hook
 * For regular users/customers
 */

import { useNotificationCore } from './useNotificationCore';
import { userNotificationRepository } from '../data';

export function useClientNotifications(userEmail, options = {}) {
  const {
    pollingInterval = 30000, // 30s default for clients (reduced from 10s to save API calls)
    enabled = true
  } = options;

  return useNotificationCore({
    actor: 'client',
    userEmail,
    pollingInterval,
    enabled: enabled && !!userEmail,
    repository: userNotificationRepository
  });
}

export default useClientNotifications;
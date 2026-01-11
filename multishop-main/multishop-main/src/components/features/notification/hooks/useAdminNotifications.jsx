/**
 * Admin Notifications Hook
 * For admin/staff users
 */

import { useNotificationCore } from './useNotificationCore';
import { adminNotificationRepository } from '../data';

export function useAdminNotifications(adminEmail, options = {}) {
  const {
    pollingInterval = 3000, // 3s for admins
    enabled = true
  } = options;

  return useNotificationCore({
    actor: 'admin',
    userEmail: adminEmail,
    pollingInterval,
    enabled: enabled && !!adminEmail,
    repository: adminNotificationRepository
  });
}

export default useAdminNotifications;

/**
 * 📧 Security Event Handler - Listen to security events
 * 
 * Handles:
 * - PASSWORD_CHANGED
 * - PASSWORD_RESET_REQUESTED
 * - NEW_DEVICE_LOGIN
 */

import { eventBus } from '@/components/shared/events';
import { EmailServiceFacade } from '../../application/EmailServiceFacade';
import { EMAIL_EVENT_TYPES } from '../../types/EventPayloads';

/**
 * Handle PASSWORD_CHANGED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.PASSWORD_CHANGED, async (event) => {
  try {
    await EmailServiceFacade.sendPasswordChangedEmail({
      email: event.userEmail,
      full_name: event.userName,
      changed_date: event.changedDate || new Date().toISOString(),
      device_info: event.deviceInfo || 'Unknown device'
    });
  } catch (error) {
    console.error('❌ [SecurityEventHandler] PASSWORD_CHANGED failed:', error);
  }
});

/**
 * Handle PASSWORD_RESET_REQUESTED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.PASSWORD_RESET_REQUESTED, async (event) => {
  try {
    await EmailServiceFacade.sendPasswordResetEmail({
      email: event.userEmail,
      full_name: event.userName,
      reset_link: event.resetLink,
      expiry_time: event.expiryTime || '24 giờ'
    });
  } catch (error) {
    console.error('❌ [SecurityEventHandler] PASSWORD_RESET_REQUESTED failed:', error);
  }
});

/**
 * Handle NEW_DEVICE_LOGIN event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.NEW_DEVICE_LOGIN, async (event) => {
  try {
    await EmailServiceFacade.sendNewDeviceLoginEmail({
      email: event.userEmail,
      full_name: event.userName,
      device_info: event.deviceInfo || 'Unknown device',
      login_time: event.loginTime || new Date().toISOString(),
      location: event.location || 'Unknown location'
    });
  } catch (error) {
    console.error('❌ [SecurityEventHandler] NEW_DEVICE_LOGIN failed:', error);
  }
});

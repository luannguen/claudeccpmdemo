
/**
 * 📧 Loyalty Event Handler - Listen to loyalty events
 * 
 * Handles:
 * - POINTS_EXPIRING_SOON
 * - TIER_UPGRADED
 */

import { eventBus } from '@/components/shared/events';
import { EmailServiceFacade } from '../../application/EmailServiceFacade';
import { EMAIL_EVENT_TYPES } from '../../types/EventPayloads';

/**
 * Handle POINTS_EXPIRING_SOON event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.POINTS_EXPIRING_SOON, async (event) => {
  try {
    await EmailServiceFacade.sendPointsExpiringEmail({
      email: event.userEmail,
      full_name: event.userName,
      points: event.points,
      expiry_date: event.expiryDate
    });
  } catch (error) {
    console.error('❌ [LoyaltyEventHandler] POINTS_EXPIRING_SOON failed:', error);
  }
});

/**
 * Handle TIER_UPGRADED event
 */
eventBus.subscribe(EMAIL_EVENT_TYPES.TIER_UPGRADED, async (event) => {
  try {
    await EmailServiceFacade.sendTierUpgradedEmail({
      email: event.userEmail,
      full_name: event.userName,
      new_tier: event.newTier,
      benefits: event.benefits || []
    });
  } catch (error) {
    console.error('❌ [LoyaltyEventHandler] TIER_UPGRADED failed:', error);
  }
});

// Handler registered

/**
 * Event Repository
 * Data Layer - ReferralEvent data access
 * 
 * @module features/referral/data/eventRepository
 */

import { base44 } from '@/api/base44Client';
import { EVENT_STATUS } from '../types';

export const eventRepository = {
  /**
   * Get event by ID
   */
  async getById(eventId) {
    const events = await base44.entities.ReferralEvent.filter({ id: eventId });
    return events[0] || null;
  },

  /**
   * Create new event
   */
  async create(eventData) {
    return await base44.entities.ReferralEvent.create(eventData);
  },

  /**
   * Update event
   */
  async update(eventId, data) {
    return await base44.entities.ReferralEvent.update(eventId, data);
  },

  /**
   * List events by referrer
   */
  async listByReferrer(referrerId, limit = 100) {
    return await base44.entities.ReferralEvent.filter(
      { referrer_id: referrerId },
      '-created_date',
      limit
    );
  },

  /**
   * List events by status
   */
  async listByStatus(status, limit = 500) {
    return await base44.entities.ReferralEvent.filter(
      { status },
      '-created_date',
      limit
    );
  },

  /**
   * List events for current month by referrer
   */
  async listCurrentMonthByReferrer(referrerId) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return await base44.entities.ReferralEvent.filter({
      referrer_id: referrerId,
      period_month: currentMonth
    });
  },

  /**
   * List calculated events for referrer (for payout)
   */
  async listCalculatedByReferrer(referrerId) {
    return await base44.entities.ReferralEvent.filter({
      referrer_id: referrerId,
      status: EVENT_STATUS.CALCULATED
    });
  },

  /**
   * Mark event as paid
   */
  async markAsPaid(eventId, batchId) {
    return await this.update(eventId, {
      status: EVENT_STATUS.PAID,
      payout_date: new Date().toISOString(),
      payout_batch_id: batchId
    });
  },

  /**
   * Mark event as fraudulent
   */
  async markAsFraudulent(eventId, reason, adminNotes) {
    return await this.update(eventId, {
      status: EVENT_STATUS.FRAUDULENT,
      fraud_suspect: true,
      fraud_reason: reason,
      admin_notes: adminNotes
    });
  },

  /**
   * Check if order already has commission calculated
   */
  async hasOrderCommission(orderId) {
    const events = await base44.entities.ReferralEvent.filter({ order_id: orderId });
    return events.length > 0;
  },

  /**
   * Get events by period
   */
  async listByPeriod(periodMonth, limit = 500) {
    return await base44.entities.ReferralEvent.filter(
      { period_month: periodMonth },
      '-created_date',
      limit
    );
  },

  /**
   * List all events
   */
  async list(limit = 500) {
    return await base44.entities.ReferralEvent.list('-created_date', limit);
  }
};

export default eventRepository;
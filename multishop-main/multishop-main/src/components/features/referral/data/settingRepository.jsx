/**
 * Setting Repository
 * Data Layer - ReferralSetting data access
 * 
 * @module features/referral/data/settingRepository
 */

import { base44 } from '@/api/base44Client';
import { DEFAULT_COMMISSION_TIERS, DEFAULT_RANK_CONFIG } from '../types';

const DEFAULT_SETTINGS = {
  setting_key: 'main',
  is_program_enabled: true,
  commission_tiers: DEFAULT_COMMISSION_TIERS,
  seeder_rank_config: DEFAULT_RANK_CONFIG,
  min_orders_for_referrer: 1,
  enable_referrer_order_check: true,
  require_admin_approval: true,
  enable_fraud_detection: true,
  fraud_threshold_score: 50,
  min_payout_amount: 100000,
  block_self_referral: true,
  referral_validity_days: 0 // 0 = no expiry
};

export const settingRepository = {
  /**
   * Get main settings
   */
  async getMainSettings() {
    try {
      const settings = await base44.entities.ReferralSetting.filter({ setting_key: 'main' });
      
      if (settings.length > 0) {
        return settings[0];
      }
      
      // Return defaults if no settings exist
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error getting referral settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  /**
   * Create settings if not exist
   */
  async ensureSettingsExist() {
    const existing = await base44.entities.ReferralSetting.filter({ setting_key: 'main' });
    
    if (existing.length === 0) {
      return await base44.entities.ReferralSetting.create(DEFAULT_SETTINGS);
    }
    
    return existing[0];
  },

  /**
   * Update settings
   */
  async update(settingId, updates) {
    return await base44.entities.ReferralSetting.update(settingId, updates);
  },

  /**
   * Get commission tiers
   */
  async getCommissionTiers() {
    const settings = await this.getMainSettings();
    return settings.commission_tiers || DEFAULT_COMMISSION_TIERS;
  },

  /**
   * Get rank config
   */
  async getRankConfig() {
    const settings = await this.getMainSettings();
    return settings.seeder_rank_config || DEFAULT_RANK_CONFIG;
  },

  /**
   * Get fraud rules
   */
  async getFraudRules() {
    const settings = await this.getMainSettings();
    return settings.fraud_rules || {};
  },

  /**
   * Check if program is enabled
   */
  async isProgramEnabled() {
    const settings = await this.getMainSettings();
    return settings.is_program_enabled !== false;
  }
};

export default settingRepository;
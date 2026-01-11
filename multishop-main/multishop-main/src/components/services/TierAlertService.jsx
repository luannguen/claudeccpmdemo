/**
 * TierAlertService - Thông báo CTV sắp lên tier
 * Data/Service Layer - KHÔNG import ReferralService
 */

import { base44 } from '@/api/base44Client';
import { success } from '@/components/data/types';
import { createPageUrl } from '@/utils';

const DEFAULT_TIERS = [
  { min_revenue: 0, max_revenue: 10000000, rate: 1, label: '0 - 10 triệu' },
  { min_revenue: 10000000, max_revenue: 50000000, rate: 2, label: '10 - 50 triệu' },
  { min_revenue: 50000000, max_revenue: null, rate: 3, label: '> 50 triệu' }
];

/**
 * Check và gửi alert nếu CTV gần lên tier
 * @param {string} referrerId
 * @param {number} newRevenue - Revenue sau đơn mới
 */
export async function checkTierProgress(referrerId, newRevenue) {
  try {
    // Get settings
    const settingsResult = await base44.entities.ReferralSetting.filter({ setting_key: 'main' });
    const tiers = settingsResult.length > 0 ? settingsResult[0].commission_tiers : DEFAULT_TIERS;
    
    // Find current tier và next tier
    let currentTier = null;
    let nextTier = null;
    
    for (let i = 0; i < tiers.length; i++) {
      const tier = tiers[i];
      const maxRevenue = tier.max_revenue || Infinity;
      
      if (newRevenue >= tier.min_revenue && newRevenue < maxRevenue) {
        currentTier = tier;
        nextTier = tiers[i + 1] || null;
        break;
      }
    }
    
    if (!currentTier || !nextTier) {
      return success({ shouldAlert: false, message: 'Đã đạt tier cao nhất' });
    }

    // Calculate progress to next tier
    const remaining = nextTier.min_revenue - newRevenue;
    const progress = (newRevenue - currentTier.min_revenue) / (nextTier.min_revenue - currentTier.min_revenue) * 100;

    // Alert nếu >= 80% progress (còn 20% nữa lên tier)
    if (progress >= 80) {
      const referrers = await base44.entities.ReferralMember.filter({ id: referrerId });
      if (referrers.length === 0) return success({ shouldAlert: false });
      
      const referrer = referrers[0];

      // Check đã gửi alert trong tháng này chưa
      const thisMonth = new Date().toISOString().slice(0, 7);
      const recentAlerts = await base44.entities.Notification.filter({
        recipient_email: referrer.user_email,
        type: 'referral_status_update',
        created_date: { $gte: `${thisMonth}-01` }
      });
      
      const alreadySent = recentAlerts.some(n => n.message.includes('sắp lên tier'));
      if (alreadySent) {
        return success({ shouldAlert: false, message: 'Alert đã gửi trong tháng này' });
      }

      // Send alert
      await base44.entities.Notification.create({
        recipient_email: referrer.user_email,
        type: 'referral_status_update',
        title: `🎯 Bạn sắp lên Tier ${nextTier.rate}%!`,
        message: `Bạn chỉ cần thêm ${remaining.toLocaleString('vi-VN')}đ nữa để lên tier ${nextTier.rate}% (hiện tại ${currentTier.rate}%). Cố lên!`,
        link: createPageUrl('MyReferrals'),
        priority: 'high',
        metadata: {
          current_tier: currentTier.rate,
          next_tier: nextTier.rate,
          remaining: remaining,
          progress: Math.round(progress)
        }
      });

      return success({ 
        shouldAlert: true, 
        progress, 
        remaining,
        currentTierRate: currentTier.rate,
        nextTierRate: nextTier.rate
      });
    }

    return success({ shouldAlert: false, progress, remaining });
  } catch (error) {
    console.error('Error checking tier progress:', error);
    return success({ shouldAlert: false, error: error.message });
  }
}

export default {
  checkTierProgress
};
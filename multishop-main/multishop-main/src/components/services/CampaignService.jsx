/**
 * CampaignService - Service quản lý campaigns cho preorder
 * Data/Service Layer
 */

import { base44 } from '@/api/base44Client';

// Campaign status
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ENDED: 'ended',
  CANCELLED: 'cancelled'
};

// Campaign types
export const CAMPAIGN_TYPE = {
  GROUP_BUY: 'group_buy',
  EARLY_BIRD: 'early_bird',
  REFERRAL_BONUS: 'referral_bonus',
  FLASH_SALE: 'flash_sale',
  LOYALTY_EXCLUSIVE: 'loyalty_exclusive'
};

// ========== GROUP BUY ==========

/**
 * Check và update progress của group buy
 */
export async function checkGroupBuyProgress(campaignId) {
  const campaigns = await base44.entities.PreOrderCampaign.filter({ id: campaignId });
  const campaign = campaigns[0];
  
  if (!campaign || campaign.campaign_type !== CAMPAIGN_TYPE.GROUP_BUY) {
    return { success: false, message: 'Invalid campaign' };
  }

  const config = campaign.group_buy_config;
  if (!config) return { success: false, message: 'No group buy config' };

  // Check if threshold reached
  if (config.current_orders >= config.threshold_orders && !config.is_unlocked) {
    // Unlock!
    await base44.entities.PreOrderCampaign.update(campaignId, {
      group_buy_config: {
        ...config,
        is_unlocked: true,
        unlocked_at: new Date().toISOString()
      }
    });

    return { 
      success: true, 
      unlocked: true,
      message: 'Group buy unlocked!',
      bonus: {
        type: config.bonus_type,
        value: config.bonus_value
      }
    };
  }

  return {
    success: true,
    unlocked: config.is_unlocked,
    current_orders: config.current_orders,
    threshold: config.threshold_orders,
    remaining: Math.max(0, config.threshold_orders - config.current_orders)
  };
}

/**
 * Increment group buy order count
 */
export async function incrementGroupBuyOrder(campaignId) {
  const campaigns = await base44.entities.PreOrderCampaign.filter({ id: campaignId });
  const campaign = campaigns[0];
  
  if (!campaign?.group_buy_config) {
    return { success: false, message: 'Invalid campaign' };
  }

  const newCount = (campaign.group_buy_config.current_orders || 0) + 1;

  await base44.entities.PreOrderCampaign.update(campaignId, {
    group_buy_config: {
      ...campaign.group_buy_config,
      current_orders: newCount
    },
    stats: {
      ...campaign.stats,
      total_orders: (campaign.stats?.total_orders || 0) + 1
    }
  });

  // Check if unlocked
  return await checkGroupBuyProgress(campaignId);
}

// ========== EARLY BIRD ==========

/**
 * Get current early bird tier và discount
 */
export function getCurrentEarlyBirdTier(campaign) {
  if (!campaign?.early_bird_config) return null;

  const config = campaign.early_bird_config;
  const currentTier = config.current_tier || 1;

  let discount = 0;
  let remaining = 0;

  if (currentTier === 1) {
    discount = config.tier_1_discount;
    remaining = config.tier_1_quantity - (config.orders_in_current_tier || 0);
  } else if (currentTier === 2) {
    discount = config.tier_2_discount;
    remaining = config.tier_2_quantity - (config.orders_in_current_tier || 0);
  } else if (currentTier === 3) {
    discount = config.tier_3_discount;
    remaining = config.tier_3_quantity - (config.orders_in_current_tier || 0);
  }

  return {
    tier: currentTier,
    discount,
    remaining: Math.max(0, remaining),
    isLastTier: currentTier >= 3
  };
}

/**
 * Increment early bird order và check tier advancement
 */
export async function incrementEarlyBirdOrder(campaignId) {
  const campaigns = await base44.entities.PreOrderCampaign.filter({ id: campaignId });
  const campaign = campaigns[0];
  
  if (!campaign?.early_bird_config) {
    return { success: false, message: 'Invalid campaign' };
  }

  const config = campaign.early_bird_config;
  let currentTier = config.current_tier || 1;
  let ordersInTier = (config.orders_in_current_tier || 0) + 1;

  // Check if need to advance tier
  let tierQuantity = currentTier === 1 ? config.tier_1_quantity 
    : currentTier === 2 ? config.tier_2_quantity 
    : config.tier_3_quantity;

  if (ordersInTier >= tierQuantity && currentTier < 3) {
    currentTier++;
    ordersInTier = 0;
  }

  await base44.entities.PreOrderCampaign.update(campaignId, {
    early_bird_config: {
      ...config,
      current_tier: currentTier,
      orders_in_current_tier: ordersInTier
    },
    stats: {
      ...campaign.stats,
      total_orders: (campaign.stats?.total_orders || 0) + 1
    }
  });

  return {
    success: true,
    tier: currentTier,
    orders_in_tier: ordersInTier,
    discount: getCurrentEarlyBirdTier({ ...campaign, early_bird_config: { ...config, current_tier: currentTier } })?.discount
  };
}

// ========== REFERRAL BONUS ==========

/**
 * Track referral order cho preorder campaign
 */
export async function trackPreOrderReferral(campaignId, referrerEmail, refereeEmail, orderAmount) {
  const campaigns = await base44.entities.PreOrderCampaign.filter({ id: campaignId });
  const campaign = campaigns[0];
  
  if (!campaign?.referral_config) {
    return { success: false, message: 'No referral config' };
  }

  const config = campaign.referral_config;

  // Create referral event (pending until trigger condition met)
  // This will be processed when trigger condition is met (e.g., on_harvest_complete)

  await base44.entities.PreOrderCampaign.update(campaignId, {
    stats: {
      ...campaign.stats,
      total_orders: (campaign.stats?.total_orders || 0) + 1
    }
  });

  return {
    success: true,
    trigger: config.reward_trigger,
    referrer_bonus: {
      type: config.referrer_bonus_type,
      value: config.referrer_bonus_value
    },
    referee_bonus: {
      type: config.referee_bonus_type,
      value: config.referee_bonus_value
    }
  };
}

// ========== FLASH SALE ==========

/**
 * Check flash sale availability
 */
export function checkFlashSaleAvailability(campaign, customerEmail) {
  if (!campaign?.flash_sale_config) return { available: true };

  const config = campaign.flash_sale_config;

  // Check sold out
  if (config.sold_quantity >= config.max_quantity) {
    return {
      available: false,
      reason: 'sold_out',
      message: 'Flash sale đã hết!'
    };
  }

  // Check per customer limit
  // This should be checked against order history
  // For now return available
  return {
    available: true,
    remaining: config.max_quantity - config.sold_quantity,
    discount: config.discount_percent,
    per_customer_limit: config.per_customer_limit
  };
}

/**
 * Increment flash sale sold quantity
 */
export async function incrementFlashSaleSold(campaignId) {
  const campaigns = await base44.entities.PreOrderCampaign.filter({ id: campaignId });
  const campaign = campaigns[0];
  
  if (!campaign?.flash_sale_config) {
    return { success: false, message: 'Invalid campaign' };
  }

  const config = campaign.flash_sale_config;
  const newSold = (config.sold_quantity || 0) + 1;

  await base44.entities.PreOrderCampaign.update(campaignId, {
    flash_sale_config: {
      ...config,
      sold_quantity: newSold
    },
    stats: {
      ...campaign.stats,
      total_orders: (campaign.stats?.total_orders || 0) + 1
    }
  });

  return {
    success: true,
    sold: newSold,
    remaining: config.max_quantity - newSold
  };
}

// ========== GENERAL HELPERS ==========

/**
 * Get active campaigns for a lot
 */
export async function getActiveCampaignsForLot(lotId) {
  const campaigns = await base44.entities.PreOrderCampaign.filter({
    status: CAMPAIGN_STATUS.ACTIVE,
    lot_ids: { $contains: lotId }
  });

  return campaigns.map(c => ({
    ...c,
    currentBenefit: getCampaignBenefit(c)
  }));
}

/**
 * Calculate current benefit from campaign
 */
export function getCampaignBenefit(campaign) {
  switch (campaign.campaign_type) {
    case CAMPAIGN_TYPE.GROUP_BUY:
      if (campaign.group_buy_config?.is_unlocked) {
        return {
          type: campaign.group_buy_config.bonus_type,
          value: campaign.group_buy_config.bonus_value,
          label: 'Group Buy'
        };
      }
      return null;

    case CAMPAIGN_TYPE.EARLY_BIRD:
      const tier = getCurrentEarlyBirdTier(campaign);
      if (tier) {
        return {
          type: 'discount_percent',
          value: tier.discount,
          label: `Early Bird Tier ${tier.tier}`
        };
      }
      return null;

    case CAMPAIGN_TYPE.FLASH_SALE:
      return {
        type: 'discount_percent',
        value: campaign.flash_sale_config?.discount_percent,
        label: 'Flash Sale'
      };

    default:
      return null;
  }
}

/**
 * Apply campaign discount to order
 */
export function applyCampaignDiscount(orderAmount, campaign) {
  const benefit = getCampaignBenefit(campaign);
  if (!benefit) return { discountAmount: 0, finalAmount: orderAmount };

  let discountAmount = 0;

  if (benefit.type === 'discount_percent') {
    discountAmount = Math.round(orderAmount * (benefit.value / 100));
  } else if (benefit.type === 'discount_fixed') {
    discountAmount = benefit.value;
  }

  return {
    discountAmount,
    finalAmount: orderAmount - discountAmount,
    appliedBenefit: benefit
  };
}

// ========== EXPORTS ==========

export const CampaignService = {
  // Group Buy
  checkGroupBuyProgress,
  incrementGroupBuyOrder,
  
  // Early Bird
  getCurrentEarlyBirdTier,
  incrementEarlyBirdOrder,
  
  // Referral
  trackPreOrderReferral,
  
  // Flash Sale
  checkFlashSaleAvailability,
  incrementFlashSaleSold,
  
  // General
  getActiveCampaignsForLot,
  getCampaignBenefit,
  applyCampaignDiscount
};
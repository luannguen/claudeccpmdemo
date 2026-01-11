/**
 * useCampaigns - Campaign hooks for PreOrder
 * 
 * Part of PreOrder Module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Campaign constants
export const CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  PAUSED: 'paused',
  ENDED: 'ended',
  CANCELLED: 'cancelled'
};

export const CAMPAIGN_TYPE = {
  GROUP_BUY: 'group_buy',
  EARLY_BIRD: 'early_bird',
  REFERRAL_BONUS: 'referral_bonus',
  FLASH_SALE: 'flash_sale',
  LOYALTY_EXCLUSIVE: 'loyalty_exclusive'
};

// ========== Campaign Queries ==========

/**
 * Get active campaigns for a lot
 */
export function useLotCampaigns(lotId) {
  return useQuery({
    queryKey: ['lot-campaigns', lotId],
    queryFn: async () => {
      const campaigns = await base44.entities.PreOrderCampaign.filter({ status: 'active' });
      return campaigns.filter(c => 
        c.lot_ids?.includes(lotId) || 
        c.preorder_product_ids?.some(pid => pid)
      );
    },
    enabled: !!lotId,
    staleTime: 30 * 1000
  });
}

/**
 * Get single campaign detail
 */
export function useCampaignDetail(campaignId) {
  return useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const campaigns = await base44.entities.PreOrderCampaign.filter({ id: campaignId });
      return campaigns[0];
    },
    enabled: !!campaignId
  });
}

// ========== Group Buy ==========

/**
 * Hook for group buy progress
 */
export function useGroupBuyProgress(campaignId) {
  const queryClient = useQueryClient();
  const { data: campaign, isLoading } = useCampaignDetail(campaignId);

  const incrementMutation = useMutation({
    mutationFn: async () => {
      const current = await base44.entities.PreOrderCampaign.filter({ id: campaignId });
      const camp = current[0];
      if (!camp) throw new Error('Campaign not found');

      const config = camp.group_buy_config || {};
      const newCount = (config.current_orders || 0) + 1;
      const isNowUnlocked = newCount >= (config.threshold_orders || 0);

      return await base44.entities.PreOrderCampaign.update(campaignId, {
        group_buy_config: {
          ...config,
          current_orders: newCount,
          is_unlocked: isNowUnlocked,
          ...(isNowUnlocked && !config.unlocked_at ? { unlocked_at: new Date().toISOString() } : {})
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['lot-campaigns'] });
    }
  });

  const config = campaign?.group_buy_config;

  return {
    campaign,
    isLoading,
    progress: config?.threshold_orders > 0 
      ? (config.current_orders / config.threshold_orders) * 100 
      : 0,
    currentOrders: config?.current_orders || 0,
    threshold: config?.threshold_orders || 0,
    isUnlocked: config?.is_unlocked || false,
    remaining: Math.max(0, (config?.threshold_orders || 0) - (config?.current_orders || 0)),
    bonus: config?.bonus_type ? {
      type: config.bonus_type,
      value: config.bonus_value
    } : null,
    incrementOrder: incrementMutation.mutateAsync,
    isIncrementing: incrementMutation.isPending
  };
}

// ========== Early Bird ==========

function getCurrentEarlyBirdTier(campaign) {
  if (!campaign?.early_bird_config) return null;
  
  const config = campaign.early_bird_config;
  const { current_tier = 1, orders_in_current_tier = 0 } = config;
  
  const tierQuantity = config[`tier_${current_tier}_quantity`];
  const tierDiscount = config[`tier_${current_tier}_discount`];
  
  const remaining = tierQuantity ? tierQuantity - orders_in_current_tier : 0;
  const nextTier = current_tier + 1;
  const hasNextTier = !!config[`tier_${nextTier}_quantity`];
  
  return {
    tier: current_tier,
    discount: tierDiscount || 0,
    remaining: Math.max(0, remaining),
    isLastTier: !hasNextTier
  };
}

/**
 * Hook for early bird tier
 */
export function useEarlyBirdTier(campaignId) {
  const queryClient = useQueryClient();
  const { data: campaign, isLoading } = useCampaignDetail(campaignId);

  const incrementMutation = useMutation({
    mutationFn: async () => {
      const current = await base44.entities.PreOrderCampaign.filter({ id: campaignId });
      const camp = current[0];
      if (!camp) throw new Error('Campaign not found');

      const config = camp.early_bird_config || {};
      let { current_tier = 1, orders_in_current_tier = 0 } = config;
      orders_in_current_tier++;

      const tierQuantity = config[`tier_${current_tier}_quantity`] || 0;
      if (orders_in_current_tier >= tierQuantity) {
        current_tier++;
        orders_in_current_tier = 0;
      }

      return await base44.entities.PreOrderCampaign.update(campaignId, {
        early_bird_config: { ...config, current_tier, orders_in_current_tier }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['lot-campaigns'] });
    }
  });

  const tierInfo = campaign ? getCurrentEarlyBirdTier(campaign) : null;

  return {
    campaign,
    isLoading,
    currentTier: tierInfo?.tier || 1,
    discount: tierInfo?.discount || 0,
    remaining: tierInfo?.remaining || 0,
    isLastTier: tierInfo?.isLastTier || false,
    incrementOrder: incrementMutation.mutateAsync,
    isIncrementing: incrementMutation.isPending
  };
}

// ========== Flash Sale ==========

function checkFlashSaleAvailability(campaign, customerEmail) {
  if (!campaign?.flash_sale_config) return { available: true };
  
  const config = campaign.flash_sale_config;
  const remaining = (config.max_quantity || 0) - (config.sold_quantity || 0);
  
  if (remaining <= 0) {
    return { available: false, reason: 'Hết hàng flash sale', remaining: 0 };
  }
  
  return { 
    available: true, 
    remaining, 
    discount: config.discount_percent || 0,
    per_customer_limit: config.per_customer_limit || 1
  };
}

/**
 * Hook for flash sale
 */
export function useFlashSale(campaignId, customerEmail) {
  const queryClient = useQueryClient();
  const { data: campaign, isLoading } = useCampaignDetail(campaignId);

  const incrementMutation = useMutation({
    mutationFn: async () => {
      const current = await base44.entities.PreOrderCampaign.filter({ id: campaignId });
      const camp = current[0];
      if (!camp) throw new Error('Campaign not found');

      const config = camp.flash_sale_config || {};
      const newSold = (config.sold_quantity || 0) + 1;

      return await base44.entities.PreOrderCampaign.update(campaignId, {
        flash_sale_config: { ...config, sold_quantity: newSold }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['lot-campaigns'] });
    }
  });

  const availability = campaign 
    ? checkFlashSaleAvailability(campaign, customerEmail)
    : { available: true };

  return {
    campaign,
    isLoading,
    available: availability.available,
    reason: availability.reason,
    remaining: availability.remaining,
    discount: availability.discount,
    perCustomerLimit: availability.per_customer_limit,
    incrementSold: incrementMutation.mutateAsync,
    isIncrementing: incrementMutation.isPending
  };
}

// ========== Discount Calculator ==========

function applyCampaignDiscount(orderAmount, campaign) {
  if (!campaign) return { discountAmount: 0, finalAmount: orderAmount };
  
  let discountAmount = 0;
  let appliedBenefit = null;
  
  switch (campaign.campaign_type) {
    case CAMPAIGN_TYPE.GROUP_BUY:
      if (campaign.group_buy_config?.is_unlocked) {
        const { bonus_type, bonus_value } = campaign.group_buy_config;
        if (bonus_type === 'discount_percent') {
          discountAmount = orderAmount * (bonus_value / 100);
          appliedBenefit = `Giảm ${bonus_value}% (Group Buy)`;
        } else if (bonus_type === 'discount_fixed') {
          discountAmount = Math.min(bonus_value, orderAmount);
          appliedBenefit = `Giảm ${bonus_value.toLocaleString('vi-VN')}đ (Group Buy)`;
        }
      }
      break;
      
    case CAMPAIGN_TYPE.EARLY_BIRD:
      const tierInfo = getCurrentEarlyBirdTier(campaign);
      if (tierInfo?.discount) {
        discountAmount = orderAmount * (tierInfo.discount / 100);
        appliedBenefit = `Giảm ${tierInfo.discount}% (Early Bird Tier ${tierInfo.tier})`;
      }
      break;
      
    case CAMPAIGN_TYPE.FLASH_SALE:
      if (campaign.flash_sale_config?.discount_percent) {
        const remaining = (campaign.flash_sale_config.max_quantity || 0) - 
                         (campaign.flash_sale_config.sold_quantity || 0);
        if (remaining > 0) {
          discountAmount = orderAmount * (campaign.flash_sale_config.discount_percent / 100);
          appliedBenefit = `Giảm ${campaign.flash_sale_config.discount_percent}% (Flash Sale)`;
        }
      }
      break;
  }
  
  return { discountAmount, finalAmount: orderAmount - discountAmount, appliedBenefit };
}

/**
 * Calculate best campaign discount for order
 */
export function useBestCampaignDiscount(lotId, orderAmount) {
  const { data: campaigns = [] } = useLotCampaigns(lotId);

  let bestDiscount = 0;
  let bestCampaign = null;
  let appliedBenefit = null;

  for (const campaign of campaigns) {
    const result = applyCampaignDiscount(orderAmount, campaign);
    if (result.discountAmount > bestDiscount) {
      bestDiscount = result.discountAmount;
      bestCampaign = campaign;
      appliedBenefit = result.appliedBenefit;
    }
  }

  return {
    campaigns,
    bestCampaign,
    discountAmount: bestDiscount,
    finalAmount: orderAmount - bestDiscount,
    appliedBenefit
  };
}

// ========== Admin Hooks ==========

/**
 * Admin: List all campaigns
 */
export function useAdminCampaigns(filters = {}) {
  return useQuery({
    queryKey: ['admin-campaigns', filters],
    queryFn: async () => {
      let query = {};
      if (filters.status) query.status = filters.status;
      if (filters.type) query.campaign_type = filters.type;
      
      return await base44.entities.PreOrderCampaign.filter(query, '-created_date');
    }
  });
}

/**
 * Admin: Campaign mutations
 */
export function useCampaignMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.PreOrderCampaign.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PreOrderCampaign.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PreOrderCampaign.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    }
  });

  return {
    createCampaign: createMutation.mutateAsync,
    updateCampaign: updateMutation.mutateAsync,
    deleteCampaign: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}
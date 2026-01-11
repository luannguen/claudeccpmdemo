/**
 * useCampaign - Hook quản lý campaigns
 * Feature Logic Layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  CampaignService, 
  CAMPAIGN_STATUS, 
  CAMPAIGN_TYPE 
} from '@/components/services/CampaignService';

/**
 * Get active campaigns for a lot
 */
export function useLotCampaigns(lotId) {
  return useQuery({
    queryKey: ['lot-campaigns', lotId],
    queryFn: () => CampaignService.getActiveCampaignsForLot(lotId),
    enabled: !!lotId,
    staleTime: 30 * 1000, // 30s cache
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
    enabled: !!campaignId,
  });
}

/**
 * Group buy hooks
 */
export function useGroupBuyProgress(campaignId) {
  const queryClient = useQueryClient();

  const { data: campaign, isLoading } = useCampaignDetail(campaignId);

  const incrementMutation = useMutation({
    mutationFn: () => CampaignService.incrementGroupBuyOrder(campaignId),
    onSuccess: (result) => {
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

/**
 * Early bird hooks
 */
export function useEarlyBirdTier(campaignId) {
  const queryClient = useQueryClient();

  const { data: campaign, isLoading } = useCampaignDetail(campaignId);

  const incrementMutation = useMutation({
    mutationFn: () => CampaignService.incrementEarlyBirdOrder(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['lot-campaigns'] });
    }
  });

  const tierInfo = campaign ? CampaignService.getCurrentEarlyBirdTier(campaign) : null;

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

/**
 * Flash sale hooks
 */
export function useFlashSale(campaignId, customerEmail) {
  const queryClient = useQueryClient();

  const { data: campaign, isLoading } = useCampaignDetail(campaignId);

  const incrementMutation = useMutation({
    mutationFn: () => CampaignService.incrementFlashSaleSold(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['lot-campaigns'] });
    }
  });

  const availability = campaign 
    ? CampaignService.checkFlashSaleAvailability(campaign, customerEmail)
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

/**
 * Calculate best campaign discount for order
 */
export function useBestCampaignDiscount(lotId, orderAmount) {
  const { data: campaigns = [] } = useLotCampaigns(lotId);

  // Find best discount
  let bestDiscount = 0;
  let bestCampaign = null;
  let appliedBenefit = null;

  for (const campaign of campaigns) {
    const result = CampaignService.applyCampaignDiscount(orderAmount, campaign);
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

export { CAMPAIGN_STATUS, CAMPAIGN_TYPE };
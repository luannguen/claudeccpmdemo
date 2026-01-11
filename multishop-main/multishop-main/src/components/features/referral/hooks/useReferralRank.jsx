/**
 * useReferralRank Hook
 * Hooks Layer - Rank progression and tracking
 * 
 * @module features/referral/hooks/useReferralRank
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { memberRepository, customerRepository, settingRepository, auditRepository } from '../data';
import { 
  calculateAchievableRank, 
  calculateRankProgress, 
  buildF1Stats, 
  getRankDisplay,
  isHigherRank
} from '../domain';
import { RANK_CONFIG, DEFAULT_RANK_CONFIG } from '../types';

/**
 * Get rank info for a member
 */
export function useReferralRank(member) {
  const { data: settings } = useQuery({
    queryKey: ['referral-settings'],
    queryFn: () => settingRepository.getMainSettings(),
    staleTime: 5 * 60 * 1000
  });
  
  const { data: f1Data } = useQuery({
    queryKey: ['referral-f1-stats', member?.id],
    queryFn: async () => {
      if (!member?.id) return null;
      
      // Get F1 customers
      const f1Customers = await customerRepository.listByReferrer(member.id);
      
      // Get F1 members (customers who are also referral members)
      const f1Emails = f1Customers.map(c => c.email).filter(Boolean);
      let f1Members = [];
      if (f1Emails.length > 0) {
        const allMembers = await memberRepository.list(1000);
        f1Members = allMembers.filter(m => f1Emails.includes(m.user_email));
      }
      
      const minOrdersForRank = settings?.min_f1_orders_for_rank || 1;
      return buildF1Stats(f1Customers, f1Members, minOrdersForRank);
    },
    enabled: !!member?.id,
    staleTime: 2 * 60 * 1000
  });
  
  if (!member || !f1Data) {
    return {
      currentRank: 'nguoi_gieo_hat',
      rankDisplay: RANK_CONFIG.nguoi_gieo_hat,
      progress: { nextRank: null, required: 0, current: 0, progress: 0 },
      canUpgrade: false,
      f1Stats: null
    };
  }
  
  const rankConfig = settings?.seeder_rank_config || DEFAULT_RANK_CONFIG;
  const currentRank = member.seeder_rank || 'nguoi_gieo_hat';
  
  return {
    currentRank,
    rankDisplay: getRankDisplay(currentRank),
    rankBonus: member.seeder_rank_bonus || 0,
    progress: calculateRankProgress(currentRank, f1Data, rankConfig),
    canUpgrade: calculateAchievableRank(currentRank, f1Data, rankConfig).canUpgrade,
    f1Stats: f1Data
  };
}

/**
 * Update member rank (check and apply upgrade)
 */
export function useUpdateRank() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (memberId) => {
      const member = await memberRepository.getById(memberId);
      if (!member) throw new Error('Không tìm thấy thành viên');
      
      const settings = await settingRepository.getMainSettings();
      const rankConfig = settings?.seeder_rank_config || DEFAULT_RANK_CONFIG;
      
      // Get F1 data
      const f1Customers = await customerRepository.listByReferrer(memberId);
      const f1Emails = f1Customers.map(c => c.email).filter(Boolean);
      
      let f1Members = [];
      if (f1Emails.length > 0) {
        const allMembers = await memberRepository.list(1000);
        f1Members = allMembers.filter(m => f1Emails.includes(m.user_email));
      }
      
      const f1Stats = buildF1Stats(f1Customers, f1Members, settings?.min_f1_orders_for_rank || 1);
      
      // Update F1 counters on member
      await memberRepository.update(memberId, f1Stats);
      
      // Check for rank upgrade
      const currentRank = member.seeder_rank || 'nguoi_gieo_hat';
      const achievable = calculateAchievableRank(currentRank, f1Stats, rankConfig);
      
      if (!achievable.canUpgrade) {
        return { upgraded: false, currentRank };
      }
      
      const newRank = achievable.newRank;
      const newConfig = achievable.config;
      
      // Apply upgrade
      await memberRepository.updateRank(memberId, newRank, newConfig.bonus || 0);
      
      // Additional upgrades
      await memberRepository.update(memberId, {
        has_certificate: member.has_certificate || newConfig.certificate,
        is_region_representative: member.is_region_representative || newConfig.region_rep
      });
      
      // Notify user if upgraded
      if (isHigherRank(newRank, currentRank)) {
        await base44.entities.Notification.create({
          recipient_email: member.user_email,
          type: 'referral_rank_up',
          title: `🏆 Chúc mừng bạn đã đạt cấp bậc ${newConfig.label}!`,
          message: `Hành trình Người Gieo Hạt của bạn đã đạt một cột mốc mới. Cố lên!`,
          priority: 'high'
        });
        
        // Log
        await auditRepository.logRankUpgrade(
          memberId,
          member.user_email,
          member.full_name,
          currentRank,
          newRank,
          newConfig.label
        );
      }
      
      return { upgraded: true, oldRank: currentRank, newRank, newConfig };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-member-current'] });
      queryClient.invalidateQueries({ queryKey: ['referral-f1-stats'] });
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
    }
  });
}

export default {
  useReferralRank,
  useUpdateRank
};
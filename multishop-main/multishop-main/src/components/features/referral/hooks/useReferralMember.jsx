/**
 * useReferralMember Hook
 * Hooks Layer - Member management operations
 * 
 * @module features/referral/hooks/useReferralMember
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { memberRepository, settingRepository, auditRepository } from '../data';
import { generateCode, checkEligibility, buildReferralLink, getInitialMemberStatus } from '../domain';

/**
 * Get current user's referral member profile
 */
export function useMyReferralMember() {
  return useQuery({
    queryKey: ['referral-member-current'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user?.email) return null;
      return await memberRepository.getByEmail(user.email);
    },
    staleTime: 2 * 60 * 1000,
    retry: false
  });
}

/**
 * Register current user as referral member
 */
export function useRegisterMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, fullName, phone }) => {
      // Check if already registered
      const existing = await memberRepository.getByEmail(email);
      if (existing) {
        throw new Error('Bạn đã đăng ký chương trình giới thiệu');
      }
      
      // Check eligibility
      const settings = await settingRepository.getMainSettings();
      if (settings.enable_referrer_order_check) {
        const orders = await base44.entities.Order.filter({
          customer_email: email,
          order_status: 'delivered'
        });
        
        const eligibility = checkEligibility(
          orders.length,
          settings.min_orders_for_referrer,
          true
        );
        
        if (!eligibility.eligible) {
          throw new Error(eligibility.message);
        }
      }
      
      // Generate unique code
      let referralCode = generateCode(fullName);
      let attempts = 0;
      while (attempts < 5) {
        const codeExists = await memberRepository.codeExists(referralCode);
        if (!codeExists) break;
        referralCode = generateCode(fullName);
        attempts++;
      }
      
      // Create member
      const status = getInitialMemberStatus(settings.require_admin_approval);
      const member = await memberRepository.create({
        user_email: email,
        full_name: fullName,
        phone,
        referral_code: referralCode,
        referral_link: buildReferralLink(referralCode),
        status,
        is_eligible: true,
        qualifying_order_count: 1,
        activation_date: status === 'active' ? new Date().toISOString() : null,
        seeder_rank: 'nguoi_gieo_hat',
        seeder_rank_bonus: 0
      });
      
      // Log
      await auditRepository.logMemberRegistration(member.id, email, fullName);
      
      // Admin notification if pending
      if (settings.require_admin_approval) {
        await base44.entities.AdminNotification.create({
          type: 'referral_member_pending',
          title: '👤 Thành viên giới thiệu mới cần duyệt',
          message: `${fullName} (${email}) đã đăng ký tham gia chương trình giới thiệu`,
          priority: 'normal',
          related_entity_type: 'ReferralMember',
          related_entity_id: member.id,
          requires_action: true
        });
      }
      
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-member-current'] });
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
    }
  });
}

/**
 * Check eligibility to become referral member
 */
export function useCheckEligibility() {
  return useMutation({
    mutationFn: async (email) => {
      const settings = await settingRepository.getMainSettings();
      
      if (!settings.enable_referrer_order_check) {
        return { eligible: true, orderCount: 0, message: 'Bạn đủ điều kiện!' };
      }
      
      const orders = await base44.entities.Order.filter({
        customer_email: email,
        order_status: 'delivered'
      });
      
      return checkEligibility(
        orders.length,
        settings.min_orders_for_referrer,
        true
      );
    }
  });
}

/**
 * Get referred customers for current member
 */
export function useMyReferredCustomers() {
  const { data: member } = useMyReferralMember();
  
  return useQuery({
    queryKey: ['my-referred-customers', member?.id],
    queryFn: async () => {
      if (!member?.id) return [];
      return await base44.entities.Customer.filter({ referrer_id: member.id });
    },
    enabled: !!member?.id,
    initialData: [],
    staleTime: 2 * 60 * 1000
  });
}

export default {
  useMyReferralMember,
  useRegisterMember,
  useCheckEligibility,
  useMyReferredCustomers
};
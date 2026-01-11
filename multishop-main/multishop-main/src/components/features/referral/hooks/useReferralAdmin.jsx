/**
 * useReferralAdmin Hook
 * Hooks Layer - Admin operations for referral management
 * 
 * @module features/referral/hooks/useReferralAdmin
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { memberRepository, eventRepository, settingRepository, auditRepository } from '../data';
import { REFERRAL_STATUS } from '../types';

/**
 * List all referral members with filtering
 */
export function useReferralMembers(filters = {}) {
  return useQuery({
    queryKey: ['referral-members', filters],
    queryFn: async () => {
      let members = await memberRepository.list(500);
      
      // Apply filters
      if (filters.status && filters.status !== 'all') {
        members = members.filter(m => m.status === filters.status);
      }
      if (filters.rank && filters.rank !== 'all') {
        members = members.filter(m => m.seeder_rank === filters.rank);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        members = members.filter(m => 
          m.full_name?.toLowerCase().includes(searchLower) ||
          m.user_email?.toLowerCase().includes(searchLower) ||
          m.referral_code?.toLowerCase().includes(searchLower)
        );
      }
      
      return members;
    },
    staleTime: 30 * 1000
  });
}

/**
 * List all referral events with filtering
 */
export function useReferralAdminEvents(filters = {}) {
  return useQuery({
    queryKey: ['referral-events-admin', filters],
    queryFn: async () => {
      let events = await eventRepository.list(500);
      
      if (filters.referrerId) {
        events = events.filter(e => e.referrer_id === filters.referrerId);
      }
      if (filters.status && filters.status !== 'all') {
        events = events.filter(e => e.status === filters.status);
      }
      if (filters.month) {
        events = events.filter(e => e.period_month === filters.month);
      }
      
      return events;
    },
    initialData: [],
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Get referral statistics
 */
export function useReferralStats() {
  const { data: members, isLoading: membersLoading } = useReferralMembers({});
  const { data: events, isLoading: eventsLoading } = useReferralAdminEvents({});
  
  const data = useMemo(() => {
    if (!members) return null;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentMonthEvents = events?.filter(e => e.period_month === currentMonth) || [];
    
    return {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.status === REFERRAL_STATUS.ACTIVE).length,
      pendingMembers: members.filter(m => m.status === REFERRAL_STATUS.PENDING).length,
      suspendedMembers: members.filter(m => m.status === REFERRAL_STATUS.SUSPENDED).length,
      totalRevenue: members.reduce((sum, m) => sum + (m.total_referral_revenue || 0), 0),
      totalCommission: members.reduce((sum, m) => sum + (m.total_paid_commission || 0) + (m.unpaid_commission || 0), 0),
      unpaidCommission: members.reduce((sum, m) => sum + (m.unpaid_commission || 0), 0),
      currentMonthRevenue: currentMonthEvents.reduce((sum, e) => sum + (e.order_amount || 0), 0),
      currentMonth
    };
  }, [members, events]);

  return {
    data,
    isLoading: membersLoading || eventsLoading
  };
}

/**
 * Approve member mutation
 */
export function useApproveMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ memberId, adminEmail }) => {
      const member = await memberRepository.approve(memberId);
      
      // Log
      await auditRepository.logMemberApproval(memberId, member.user_email, member.full_name, adminEmail);
      
      // Notify user
      await base44.entities.Notification.create({
        recipient_email: member.user_email,
        type: 'referral_welcome',
        title: '🎉 Chào mừng bạn đến với chương trình giới thiệu!',
        message: `Tài khoản giới thiệu của bạn đã được kích hoạt. Mã của bạn: ${member.referral_code}`,
        priority: 'high'
      });
      
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
    }
  });
}

/**
 * Suspend member mutation
 */
export function useSuspendMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ memberId, reason, adminEmail }) => {
      const member = await memberRepository.getById(memberId);
      await memberRepository.suspend(memberId, reason);
      
      // Log
      await auditRepository.logMemberSuspension(memberId, member.user_email, member.full_name, adminEmail, reason);
      
      // Notify user
      await base44.entities.Notification.create({
        recipient_email: member.user_email,
        type: 'referral_status_update',
        title: '⚠️ Tài khoản giới thiệu bị đình chỉ',
        message: `Tài khoản giới thiệu của bạn đã bị đình chỉ. Lý do: ${reason}`,
        priority: 'high'
      });
      
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
    }
  });
}

/**
 * Reactivate member mutation
 */
export function useReactivateMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ memberId, adminEmail }) => {
      const member = await memberRepository.reactivate(memberId);
      
      await auditRepository.createAuditLog({
        action_type: 'member_reactivated',
        actor_email: adminEmail,
        actor_role: 'admin',
        target_type: 'referral_member',
        target_id: memberId,
        description: `Admin kích hoạt lại thành viên`
      });
      
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
    }
  });
}

/**
 * Mark event as fraudulent
 */
export function useMarkFraudulent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ eventId, reason, adminEmail }) => {
      const event = await eventRepository.getById(eventId);
      await eventRepository.markAsFraudulent(eventId, reason, `Đánh dấu bởi ${adminEmail}: ${reason}`);
      
      // Deduct commission from member
      if (event?.referrer_id) {
        const member = await memberRepository.getById(event.referrer_id);
        if (member) {
          await memberRepository.update(event.referrer_id, {
            unpaid_commission: Math.max(0, (member.unpaid_commission || 0) - event.commission_amount),
            fraud_score: Math.min(100, (member.fraud_score || 0) + 25)
          });
        }
      }
      
      // Log
      await auditRepository.logFraudDetection(eventId, adminEmail, reason);
      
      return event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-events-admin'] });
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
    }
  });
}

/**
 * Process payout batch
 */
export function useProcessPayout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ memberIds, adminEmail }) => {
      const settings = await settingRepository.getMainSettings();
      const batchId = `PAY-${Date.now()}`;
      const results = [];
      
      for (const memberId of memberIds) {
        const member = await memberRepository.getById(memberId);
        if (!member) continue;
        
        const minPayout = settings.min_payout_amount || 100000;
        if ((member.unpaid_commission || 0) < minPayout) {
          results.push({ memberId, success: false, error: 'Chưa đạt mức tối thiểu' });
          continue;
        }
        
        const payoutAmount = member.unpaid_commission;
        
        // Process payout
        await memberRepository.processPayout(memberId, payoutAmount);
        
        // Mark events as paid
        const unpaidEvents = await eventRepository.listCalculatedByReferrer(memberId);
        for (const event of unpaidEvents) {
          await eventRepository.markAsPaid(event.id, batchId);
        }
        
        // Notify member
        await base44.entities.Notification.create({
          recipient_email: member.user_email,
          type: 'referral_commission_paid',
          title: '💵 Hoa hồng đã được thanh toán!',
          message: `Bạn đã nhận được ${payoutAmount.toLocaleString('vi-VN')}đ hoa hồng giới thiệu`,
          priority: 'high'
        });
        
        results.push({ memberId, success: true, amount: payoutAmount });
      }
      
      // Log
      await auditRepository.logPayout(batchId, adminEmail, results.filter(r => r.success).length);
      
      return { batchId, results };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
      queryClient.invalidateQueries({ queryKey: ['referral-events-admin'] });
    }
  });
}

/**
 * Update referral settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ settingId, updates }) => {
      return await settingRepository.update(settingId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-settings'] });
    }
  });
}

/**
 * Set custom commission rate
 */
export function useSetCustomRate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ memberId, rate, adminEmail, note }) => {
      if (rate < 0 || rate > 100) {
        throw new Error('Tỉ lệ phải từ 0-100%');
      }
      
      await memberRepository.setCustomRate(memberId, rate, adminEmail, note);
      
      await auditRepository.createAuditLog({
        action_type: 'custom_rate_set',
        actor_email: adminEmail,
        actor_role: 'admin',
        target_type: 'referral_member',
        target_id: memberId,
        new_value: { rate, note },
        description: `Admin set custom rate ${rate}%`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-members'] });
    }
  });
}

/**
 * Filters state hook
 */
export function useReferralFilters() {
  const [filters, setFilters] = useState({
    status: 'all',
    rank: 'all',
    search: ''
  });
  
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({ status: 'all', rank: 'all', search: '' });
  }, []);
  
  return { filters, updateFilter, clearFilters };
}

export default {
  useReferralMembers,
  useReferralAdminEvents,
  useReferralStats,
  useApproveMember,
  useSuspendMember,
  useReactivateMember,
  useMarkFraudulent,
  useProcessPayout,
  useUpdateSettings,
  useSetCustomRate,
  useReferralFilters
};
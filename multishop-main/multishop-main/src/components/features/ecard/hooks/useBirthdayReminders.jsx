/**
 * useBirthdayReminders - Hook for birthday reminder features
 * Feature logic layer
 * 
 * @module features/ecard/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { birthdayRepository } from '../data/birthdayRepository';
import { useToast } from '@/components/NotificationToast';

/**
 * Hook to manage birthday reminders
 * @param {number} days - Days ahead to fetch (default 7)
 */
export function useBirthdayReminders(days = 7) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Upcoming birthdays
  const { data: upcomingBirthdays, isLoading } = useQuery({
    queryKey: ['upcoming-birthdays', user?.email, days],
    queryFn: () => birthdayRepository.getUpcomingBirthdays(user.email, days),
    enabled: !!user?.email,
    staleTime: 60 * 60 * 1000 // 1 hour
  });

  // Today's birthdays
  const { data: todayBirthdays } = useQuery({
    queryKey: ['today-birthdays', user?.email],
    queryFn: () => birthdayRepository.getTodayBirthdays(user.email),
    enabled: !!user?.email,
    staleTime: 60 * 60 * 1000
  });

  // Update birthday mutation
  const updateBirthdayMutation = useMutation({
    mutationFn: ({ connectionId, birthday }) =>
      birthdayRepository.updateBirthday(connectionId, birthday),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-birthdays'] });
      queryClient.invalidateQueries({ queryKey: ['today-birthdays'] });
      addToast('Đã cập nhật ngày sinh', 'success');
    },
    onError: () => {
      addToast('Không thể cập nhật ngày sinh', 'error');
    }
  });

  // Toggle reminder mutation
  const toggleReminderMutation = useMutation({
    mutationFn: ({ connectionId, enabled }) =>
      birthdayRepository.toggleReminder(connectionId, enabled),
    onSuccess: (_, { enabled }) => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-birthdays'] });
      addToast(enabled ? 'Đã bật nhắc sinh nhật' : 'Đã tắt nhắc sinh nhật', 'success');
    }
  });

  // Mark wish sent mutation
  const markWishSentMutation = useMutation({
    mutationFn: (connectionId) => birthdayRepository.markWishSent(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcoming-birthdays'] });
      queryClient.invalidateQueries({ queryKey: ['today-birthdays'] });
    }
  });

  return {
    upcomingBirthdays: upcomingBirthdays || [],
    todayBirthdays: todayBirthdays || [],
    isLoading,
    hasTodayBirthdays: (todayBirthdays?.length || 0) > 0,
    updateBirthday: (connectionId, birthday) =>
      updateBirthdayMutation.mutate({ connectionId, birthday }),
    toggleReminder: (connectionId, enabled) =>
      toggleReminderMutation.mutate({ connectionId, enabled }),
    markWishSent: markWishSentMutation.mutate,
    isUpdating: updateBirthdayMutation.isPending || toggleReminderMutation.isPending
  };
}
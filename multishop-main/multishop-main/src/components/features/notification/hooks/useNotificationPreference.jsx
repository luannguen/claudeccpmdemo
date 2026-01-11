/**
 * useNotificationPreference - Hook for managing user notification preferences
 * NOTIF-F06: Smart Notification Batching & Digest
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';

const DEFAULT_PREFERENCE = {
  digest_enabled: true,
  digest_frequency: 'daily',
  digest_time: '09:00',
  digest_day: 1,
  email_digest: true,
  push_digest: true,
  critical_bypass: true,
  muted_types: [],
  channel_preferences: {
    orders: 'realtime',
    payments: 'realtime',
    social: 'digest',
    gifts: 'digest',
    reviews: 'digest',
    referral: 'digest',
    community: 'digest',
    system: 'digest'
  }
};

export function useNotificationPreference() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch current user's preference
  const { data: preference, isLoading, error } = useQuery({
    queryKey: ['notificationPreference'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user?.email) return DEFAULT_PREFERENCE;

      const prefs = await base44.entities.NotificationPreference.filter({
        user_email: user.email
      }, '-created_date', 1);

      return prefs[0] || { ...DEFAULT_PREFERENCE, user_email: user.email };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Save preference mutation
  const saveMutation = useMutation({
    mutationFn: async (newPreference) => {
      const user = await base44.auth.me();
      if (!user?.email) throw new Error('User not authenticated');

      const existing = await base44.entities.NotificationPreference.filter({
        user_email: user.email
      }, '-created_date', 1);

      if (existing[0]) {
        return base44.entities.NotificationPreference.update(existing[0].id, newPreference);
      } else {
        return base44.entities.NotificationPreference.create({
          user_email: user.email,
          ...newPreference
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreference'] });
      addToast('Đã lưu cài đặt thông báo', 'success');
    },
    onError: (error) => {
      addToast('Không thể lưu cài đặt: ' + error.message, 'error');
    }
  });

  // Update specific field
  const updateField = (field, value) => {
    const updated = { ...preference, [field]: value };
    saveMutation.mutate(updated);
  };

  // Update channel preference
  const updateChannelPreference = (channel, value) => {
    const updated = {
      ...preference,
      channel_preferences: {
        ...preference?.channel_preferences,
        [channel]: value
      }
    };
    saveMutation.mutate(updated);
  };

  // Toggle muted type
  const toggleMutedType = (type) => {
    const muted = preference?.muted_types || [];
    const updated = muted.includes(type)
      ? muted.filter(t => t !== type)
      : [...muted, type];
    
    saveMutation.mutate({ ...preference, muted_types: updated });
  };

  return {
    preference: preference || DEFAULT_PREFERENCE,
    isLoading,
    error,
    isSaving: saveMutation.isPending,
    
    // Actions
    savePreference: saveMutation.mutate,
    updateField,
    updateChannelPreference,
    toggleMutedType,
    
    // Helpers
    isDigestEnabled: preference?.digest_enabled ?? true,
    digestFrequency: preference?.digest_frequency || 'daily'
  };
}

export default useNotificationPreference;
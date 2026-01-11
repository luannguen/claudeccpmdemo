import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';

// Fetch my feedback with real-time support
export function useMyFeedbackEnhanced() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  return useQuery({
    queryKey: ['my-feedback-enhanced', user?.email],
    queryFn: async () => {
      const feedback = await base44.entities.Feedback.list('-updated_date', 500);
      return feedback.filter(f => f.user_email === user.email);
    },
    enabled: !!user?.email,
    staleTime: 30 * 1000, // 30s
    refetchInterval: 60 * 1000 // Auto refetch every 1min for real-time feel
  });
}

// Create feedback with enhanced data
export function useCreateFeedbackEnhanced() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  return useMutation({
    mutationFn: async (data) => {
      // Get current user info
      const user = await base44.auth.me();
      
      // Auto-capture browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`
      };

      const feedback = await base44.entities.Feedback.create({
        ...data,
        user_email: user?.email || null,
        user_name: user?.full_name || null,
        page_url: window.location.href,
        browser_info: browserInfo,
        ip_address: '',
        user_agent: navigator.userAgent
      });
      
      // Create admin notification for new feedback
      try {
        await base44.entities.AdminNotification.create({
          type: 'feedback_new',
          title: `Feedback mới: ${data.category || 'other'}`,
          message: `${user?.full_name || 'Người dùng'} đã gửi feedback: "${data.title}"`,
          link: '/Admin/Feedback',
          priority: data.priority === 'critical' ? 'high' : 'normal',
          is_read: false
        });
      } catch (e) {
        console.log('Could not create admin notification:', e);
      }
      
      return feedback;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-feedback-enhanced'] });
      queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['my-feedback-count'] });
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
      addToast('🎉 Đã gửi feedback thành công! Chúng tôi sẽ phản hồi sớm nhất.', 'success');
    },
    onError: () => {
      addToast('Lỗi khi gửi feedback', 'error');
    }
  });
}

// Feedback analytics for user
export function useFeedbackAnalytics() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  return useQuery({
    queryKey: ['feedback-analytics', user?.email],
    queryFn: async () => {
      const feedback = await base44.entities.Feedback.list('-created_date', 500);
      const myFeedback = feedback.filter(f => f.user_email === user.email);

      const stats = {
        total: myFeedback.length,
        pending: myFeedback.filter(f => f.status === 'new' || f.status === 'reviewing').length,
        resolved: myFeedback.filter(f => f.status === 'resolved').length,
        avgResponseTime: 0, // TODO: Calculate
        byCategory: {},
        byPriority: {},
        timeline: []
      };

      // Group by category
      myFeedback.forEach(f => {
        stats.byCategory[f.category] = (stats.byCategory[f.category] || 0) + 1;
        stats.byPriority[f.priority] = (stats.byPriority[f.priority] || 0) + 1;
      });

      return stats;
    },
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000
  });
}

// Real-time feedback notifications
export function useFeedbackNotifications() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  return useQuery({
    queryKey: ['feedback-notifications', user?.email],
    queryFn: async () => {
      const feedback = await base44.entities.Feedback.list('-updated_date', 100);
      // Filter by user_email hoặc created_by (fallback)
      const myFeedback = feedback.filter(f => f.user_email === user.email || f.created_by === user.email);

      // Check for new responses (admin_response hoặc có comment mới từ admin)
      const unreadResponses = myFeedback.filter(f => 
        (f.admin_response && !f.user_read_response) ||
        (f.status === 'reviewing' || f.status === 'in_progress')
      );

      return {
        count: unreadResponses.length,
        items: unreadResponses
      };
    },
    enabled: !!user?.email,
    staleTime: 15 * 1000,
    refetchInterval: 15 * 1000 // Check every 15s for faster realtime
  });
}
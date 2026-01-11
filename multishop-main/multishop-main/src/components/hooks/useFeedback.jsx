/**
 * useFeedback - Hooks for feedback functionality
 * Hook Layer - Connects UI with Service
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FeedbackService from '@/components/services/FeedbackService';
import { useToast } from '@/components/NotificationToast';
import { base44 } from '@/api/base44Client';

// ========== LIST FEEDBACKS (ADMIN) ==========

export function useFeedbacks(filters = {}) {
  // Remove empty filter values for stable queryKey
  const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value && value !== '' && value !== 'all') {
      acc[key] = value;
    }
    return acc;
  }, {});

  return useQuery({
    queryKey: ['feedbacks', cleanFilters],
    queryFn: async () => {
      const result = await FeedbackService.listFeedbacks(cleanFilters);
      if (!result.success) {
        console.error('Feedback list error:', result);
        return [];
      }
      return result.data || [];
    },
    staleTime: 30000, // 30s
    retry: 1
  });
}

// ========== FEEDBACK STATS ==========

export function useFeedbackStats() {
  return useQuery({
    queryKey: ['feedback-stats'],
    queryFn: async () => {
      const result = await FeedbackService.getFeedbackStats();
      if (!result.success) {
        console.error('Feedback stats error:', result);
        return { total: 0, byStatus: {}, byCategory: {} };
      }
      return result.data || { total: 0, byStatus: {}, byCategory: {} };
    },
    staleTime: 60000, // 1 phút
    retry: 1
  });
}

// ========== CREATE FEEDBACK ==========

export function useCreateFeedback() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedbackData) => {
      const result = await FeedbackService.createFeedback(feedbackData);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
      addToast('Cảm ơn bạn đã gửi feedback! Chúng tôi sẽ xem xét sớm nhất.', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Không thể gửi feedback', 'error');
    }
  });
}

// ========== UPDATE STATUS (ADMIN) ==========

export function useUpdateFeedbackStatus() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ feedbackId, status, adminNote, adminResponse }) => {
      const result = await FeedbackService.updateFeedbackStatus(
        feedbackId,
        status,
        adminNote,
        adminResponse
      );
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] });
      addToast('Đã cập nhật trạng thái', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Không thể cập nhật', 'error');
    }
  });
}

// ========== VOTE FEEDBACK ==========

export function useVoteFeedback() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ feedbackId, userEmail }) => {
      const result = await FeedbackService.voteFeedback(feedbackId, userEmail);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      addToast(
        data.voted ? 'Đã vote cho feedback này' : 'Đã bỏ vote',
        'success'
      );
    },
    onError: (error) => {
      addToast(error.message || 'Không thể vote', 'error');
    }
  });
}

// ========== MARK SPAM (ADMIN) ==========

export function useMarkAsSpam() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedbackId) => {
      const result = await FeedbackService.markAsSpam(feedbackId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      addToast('Đã đánh dấu spam', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Không thể đánh dấu spam', 'error');
    }
  });
}

// ========== FEEDBACK DETAIL (SINGLE) ==========

export function useFeedbackDetail(feedbackId) {
  return useQuery({
    queryKey: ['feedback-detail', feedbackId],
    queryFn: async () => {
      if (!feedbackId) return null;
      // Filter by id instead of listing all
      const feedbacks = await base44.entities.Feedback.filter({ id: feedbackId }, '-created_date', 1);
      return feedbacks[0] || null;
    },
    enabled: !!feedbackId,
    staleTime: 60000 // 1 minute
  });
}

// ========== FEEDBACK COMMENTS ==========

export function useFeedbackComments(feedbackId) {
  return useQuery({
    queryKey: ['feedback-comments', feedbackId],
    queryFn: async () => {
      if (!feedbackId) return [];
      // Filter by feedback_id
      const comments = await base44.entities.FeedbackComment.filter(
        { feedback_id: feedbackId },
        '-created_date',
        100
      );
      return comments;
    },
    enabled: !!feedbackId,
    staleTime: 60000 // 1 minute
  });
}

// ========== ADD COMMENT ==========

export function useAddFeedbackComment() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      feedbackId, 
      content, 
      images = [],
      isInternal = false,
      quotedCommentId,
      quotedContent,
      quotedAuthorName
    }) => {
      const user = await base44.auth.me();
      
      // Get user's avatar from UserProfile (optimized)
      let authorAvatar = null;
      try {
        const profiles = await base44.entities.UserProfile.filter(
          { user_email: user.email },
          '-created_date',
          1
        );
        authorAvatar = profiles[0]?.avatar_url;
      } catch (e) {
        // Silent fail
      }
      
      // Create comment
      const comment = await base44.entities.FeedbackComment.create({
        feedback_id: feedbackId,
        author_email: user.email,
        author_name: user.full_name,
        author_avatar: authorAvatar,
        content,
        images: images || [],
        quoted_comment_id: quotedCommentId,
        quoted_content: quotedContent,
        quoted_author_name: quotedAuthorName,
        is_admin: true,
        is_internal: isInternal
      });
      
      // If not internal, mark feedback as having new response
      if (!isInternal) {
        // Get feedback to notify user (optimized)
        const feedbacks = await base44.entities.Feedback.filter({ id: feedbackId }, '-created_date', 1);
        const feedback = feedbacks[0];
        
        if (feedback) {
          // Update feedback with admin response info
          await base44.entities.Feedback.update(feedbackId, {
            admin_response: content,
            user_read_response: false,
            reviewed_by: user.email,
            reviewed_date: new Date().toISOString()
          });
          
          // Create notification for user (if they have email)
          if (feedback.user_email || feedback.created_by) {
            const userEmail = feedback.user_email || feedback.created_by;
            try {
              await base44.entities.Notification.create({
                user_email: userEmail,
                type: 'system',
                title: 'Phản hồi feedback',
                message: `Admin đã phản hồi feedback "${feedback.title}"`,
                link: '/MyFeedback',
                is_read: false
              });
            } catch (e) {
              console.log('Could not create notification:', e);
            }
          }
        }
      }
      
      return comment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feedback-comments', variables.feedbackId] });
      queryClient.invalidateQueries({ queryKey: ['feedback-detail'] });
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      addToast(variables.isInternal ? 'Đã thêm ghi chú nội bộ' : 'Đã gửi phản hồi cho người dùng', 'success');
    },
    onError: (error) => {
      addToast(error.message || 'Không thể thêm phản hồi', 'error');
    }
  });
}
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Icon } from '@/components/ui/AnimatedIcon.jsx';
import { Badge } from '@/components/ui/badge';
import { useFeedbackDetail, useFeedbackComments, useAddFeedbackComment } from '@/components/hooks/useFeedback';
import FeedbackCommentItem from './FeedbackCommentItem';
import FeedbackReplyForm from './FeedbackReplyForm';
import ImageLightbox from './ImageLightbox';

export default function FeedbackThreadView({ feedbackId }) {
  const [quotedComment, setQuotedComment] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const { data: feedback, isLoading: feedbackLoading } = useFeedbackDetail(feedbackId);
  const { data: comments = [] } = useFeedbackComments(feedbackId);
  const addCommentMutation = useAddFeedbackComment();

  // Get current admin user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-admin'],
    queryFn: () => base44.auth.me()
  });

  // Get user avatar from UserProfile
  const { data: feedbackUserProfile } = useQuery({
    queryKey: ['feedback-user-profile', feedback?.user_email || feedback?.created_by],
    queryFn: async () => {
      const email = feedback?.user_email || feedback?.created_by;
      if (!email) return null;
      const profiles = await base44.entities.UserProfile.list('-created_date', 500);
      return profiles.find(p => p.user_email === email);
    },
    enabled: !!feedback
  });

  const handleAddComment = async ({ content, images, isInternal, quotedComment: quoted }) => {
    await addCommentMutation.mutateAsync({
      feedbackId,
      content,
      images,
      isInternal,
      quotedCommentId: quoted?.id,
      quotedContent: quoted?.content,
      quotedAuthorName: quoted?.author_name
    });
    setQuotedComment(null);
  };

  // Get avatar URL for feedback author
  const feedbackAuthorAvatar = feedbackUserProfile?.avatar_url;

  if (feedbackLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon.Spinner size={32} className="text-[#7CB342]" />
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Icon.AlertCircle size={48} className="mx-auto mb-3 text-gray-400" />
        <p>Không tìm thấy feedback</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Image Lightbox */}
      <ImageLightbox
        imageUrl={lightboxImage}
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
      />

      {/* Original Feedback */}
      <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold overflow-hidden bg-gradient-to-br from-[#7CB342] to-[#FF9800]">
            {feedbackAuthorAvatar ? (
              <img src={feedbackAuthorAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              (feedback.user_name || feedback.created_by || 'U')?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-gray-900">
                {feedback.user_name || feedback.created_by?.split('@')[0] || 'Người dùng ẩn danh'}
              </h3>
              {(feedback.user_email || feedback.created_by) && (
                <Badge variant="outline" className="text-xs">
                  {feedback.user_email || feedback.created_by}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {new Date(feedback.created_date).toLocaleString('vi-VN')}
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-3">{feedback.title}</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{feedback.description}</p>

        {feedback.screenshot_url && (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setLightboxImage(feedback.screenshot_url)}
              className="block"
            >
              <img
                src={feedback.screenshot_url}
                alt="Screenshot"
                className="max-w-full max-h-[300px] object-contain rounded-xl border-2 border-gray-200 hover:border-[#7CB342] transition-colors cursor-zoom-in"
              />
            </button>
          </div>
        )}

        <div className="flex gap-2 mt-4 flex-wrap">
          <Badge>{feedback.category}</Badge>
          <Badge>{feedback.priority}</Badge>
          {feedback.ai_sentiment && (
            <Badge variant="outline">
              {feedback.ai_sentiment === 'positive' ? '😊 Tích cực' :
               feedback.ai_sentiment === 'negative' ? '😠 Tiêu cực' : '😐 Trung lập'}
            </Badge>
          )}
        </div>
      </div>

      {/* Comments Thread */}
      <div className="space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Icon.MessageCircle size={20} />
          Phản Hồi ({comments.length})
        </h3>

        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-6">Chưa có phản hồi nào</p>
        ) : (
          comments.map((comment) => (
            <FeedbackCommentItem
              key={comment.id}
              comment={comment}
              currentUserEmail={currentUser?.email}
              onQuote={setQuotedComment}
              onImageClick={setLightboxImage}
            />
          ))
        )}

        {/* Add Reply */}
        <FeedbackReplyForm
          onSubmit={handleAddComment}
          isSubmitting={addCommentMutation.isPending}
          quotedComment={quotedComment}
          onCancelQuote={() => setQuotedComment(null)}
          isAdmin={true}
          placeholder="Viết phản hồi cho người dùng..."
        />
      </div>
    </div>
  );
}
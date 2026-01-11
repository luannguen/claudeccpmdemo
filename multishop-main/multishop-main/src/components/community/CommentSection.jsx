import React, { useState } from 'react';
import { Send, Heart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAuth } from '@/components/AuthProvider';
import { useActivityTracker } from '@/components/hooks/useAIPersonalization';
import CommentReplyPreview from './CommentReplyPreview';

export default function CommentSection({ postId, postTitle, comments, currentUser: propUser, onLoginRequired }) {
  // ✅ Ưu tiên lấy user từ AuthContext, fallback về prop
  const { user: authUser, isAuthenticated } = useAuth();
  const currentUser = authUser || propUser;
  
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const queryClient = useQueryClient();
  
  // ✅ AI Activity Tracking
  const { track, EventTypes, TargetTypes } = useActivityTracker();

  const createCommentMutation = useMutation({
    mutationFn: (commentData) => base44.entities.PostComment.create(commentData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['post-comments', postId]);
      queryClient.invalidateQueries(['user-posts']);
      
      // ✅ Track comment activity
      track(EventTypes.POST_COMMENT, TargetTypes.POST, {
        target_id: postId,
        target_name: postTitle || 'Bài viết',
        metadata: { comment_length: variables.content?.length }
      });
      
      setCommentText('');
    }
  });

  const likeCommentMutation = useMutation({
    mutationFn: async ({ commentId, currentLikedBy, userEmail }) => {
      const newLikedBy = currentLikedBy.includes(userEmail)
        ? currentLikedBy.filter(email => email !== userEmail)
        : [...currentLikedBy, userEmail];
      
      return base44.entities.PostComment.update(commentId, {
        liked_by: newLikedBy,
        likes_count: newLikedBy.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['post-comments', postId]);
    }
  });

  const handleSubmitComment = () => {
    if (!currentUser || !isAuthenticated) {
      onLoginRequired?.('Bình Luận');
      return;
    }
    
    if (!commentText.trim()) return;

    const commentData = {
      post_id: postId,
      content: commentText.trim(),
      author_name: currentUser?.full_name || 'Khách',
      author_avatar: currentUser?.avatar || '',
      likes_count: 0,
      status: 'active'
    };

    createCommentMutation.mutate(commentData);
  };

  const handleLikeComment = (comment) => {
    if (!currentUser || !isAuthenticated) {
      onLoginRequired?.('Thích Bình Luận');
      return;
    }
    
    const commentData = comment.data || comment;
    const userEmail = currentUser?.email || '';
    likeCommentMutation.mutate({
      commentId: comment.id,
      currentLikedBy: commentData.liked_by || [],
      userEmail
    });
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50">
      {/* Comments List */}
      <div className="px-6 py-4 max-h-96 overflow-y-auto space-y-4">
        {comments.map((comment) => {
          const commentData = comment.data || comment;
          const userEmail = currentUser?.email || '';
          const isLiked = commentData.liked_by?.includes(userEmail);
          const timeAgo = formatDistanceToNow(new Date(comment.created_date), { 
            addSuffix: true, 
            locale: vi 
          });

          return (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-[#7CB342] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {commentData.author_name?.[0] || 'U'}
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-2xl px-4 py-3">
                  <p className="font-semibold text-sm text-gray-900 mb-1">
                    {commentData.author_name}
                  </p>
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {commentData.content}
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-2 px-2">
                  <button
                    onClick={() => handleLikeComment(comment)}
                    className={`text-xs font-medium transition-colors ${
                      isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    {isLiked ? 'Đã thích' : 'Thích'}
                  </button>
                  <button
                    onClick={() => setReplyingTo(comment)}
                    className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    Trả lời
                  </button>
                  <span className="text-xs text-gray-400">{timeAgo}</span>
                  {commentData.likes_count > 0 && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500 fill-current" />
                      {commentData.likes_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        )}
      </div>

      {/* Comment Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <CommentReplyPreview 
          replyingTo={replyingTo} 
          onCancel={() => setReplyingTo(null)} 
        />
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-[#7CB342] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {currentUser?.full_name?.[0] || 'K'}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
              placeholder={replyingTo ? `Trả lời ${(replyingTo.data || replyingTo).author_name}...` : "Viết bình luận..."}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-[#7CB342]"
            />
            <button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || createCommentMutation.isPending}
              className="w-10 h-10 bg-[#7CB342] text-white rounded-full flex items-center justify-center hover:bg-[#FF9800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
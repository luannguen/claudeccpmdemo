import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Icon } from '@/components/ui/AnimatedIcon';
import CommentSection from './CommentSection';
import ImageLightbox from './ImageLightbox';
import ProductCarousel from './ProductCarousel';
import ProductCarousel3D from './ProductCarousel3D';
import LazyImage from './LazyImage';
import LazyVideo from './LazyVideo';
import LikeAnimationEnhanced from './LikeAnimationEnhanced';
import PostQuickPreview from './PostQuickPreview';
import { BookReaderView } from './bookreader';
import { useWebShare } from './hooks/useWebShare';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { createPageUrl } from '@/utils';
import { useActivityTracker } from '@/components/hooks/useAIPersonalization';
import { useToast } from '@/components/NotificationToast';
import { useConfirmDialog } from '@/components/hooks/useConfirmDialog';
import PostContentRenderer from './PostContentRenderer';

const REACTIONS = [
  { type: 'like', iconName: 'ThumbsUp', label: 'Thích', color: 'text-blue-600' },
  { type: 'love', iconName: 'Heart', label: 'Yêu thích', color: 'text-red-600' },
  { type: 'wow', iconName: 'Award', label: 'Tuyệt vời', color: 'text-yellow-600' },
  { type: 'sad', iconName: 'AlertCircle', label: 'Buồn', color: 'text-gray-600' }
];

const CATEGORY_LABELS = {
  general: '💬 Chia sẻ chung',
  recipe: '🍳 Công thức',
  experience: '✨ Trải nghiệm',
  tips: '💡 Mẹo hay',
  qa: '❓ Hỏi đáp',
  event: '📅 Sự kiện'
};

const getVideoEmbedUrl = (url) => {
  if (!url) return null;
  
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  
  // Vimeo
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  
  // Direct video URL
  return url;
};

// ✅ Memoize để tránh re-render không cần thiết
const PostCard = React.memo(function PostCard({ post, currentUser, onLoginRequired, onEdit, priority = false }) {
  const [showComments, setShowComments] = React.useState(false);
  const [showReactions, setShowReactions] = React.useState(false);
  const [showMenu, setShowMenu] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showPollResults, setShowPollResults] = React.useState(false);
  const [lightboxOpen, setLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const [showQuickPreview, setShowQuickPreview] = React.useState(false);
  const [showBookReader, setShowBookReader] = React.useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { showConfirm } = useConfirmDialog();
  const { canShare, share } = useWebShare();
  
  // ✅ AI Activity Tracking
  const { track, EventTypes, TargetTypes } = useActivityTracker();
  
  const postData = post.data || post;
  
  // ✅ Fetch author profile to get avatar
  const { data: authorProfile } = useQuery({
    queryKey: ['author-profile', post.created_by],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('-created_date', 500);
      return profiles.find(p => p.user_email === post.created_by);
    },
    enabled: !!post.created_by,
    staleTime: 10 * 60 * 1000
  });
  
  // Use avatar from profile if available
  React.useEffect(() => {
    if (authorProfile?.avatar_url && !postData.author_avatar) {
      // Update post with author avatar for future renders
      base44.entities.UserPost.update(post.id, {
        author_avatar: authorProfile.avatar_url
      }).catch(() => {});
    }
  }, [authorProfile, post.id, postData.author_avatar]);
  const userEmail = currentUser?.email || '';
  const userReaction = postData.reacted_by?.[userEmail];
  const isOwner = post.created_by === currentUser?.email;
  const isSaved = postData.saved_by?.includes(userEmail);
  const hasVoted = postData.poll?.options?.some(opt => opt.voters?.includes(userEmail));
  const isPinned = postData.is_pinned;

  // ✅ AUTO VIEW COUNTER - Track unique views + AI Activity
  useEffect(() => {
    if (!currentUser?.email || !post.id) return;
    
    const viewedBy = postData.viewed_by || [];
    if (!viewedBy.includes(currentUser.email)) {
      // Track view
      base44.entities.UserPost.update(post.id, {
        viewed_by: [...viewedBy, currentUser.email],
        views_count: (postData.views_count || 0) + 1
      }).catch(() => {});
      
      // ✅ Track AI Activity - Post View
      track(EventTypes.POST_VIEW, TargetTypes.POST, {
        target_id: post.id,
        target_name: postData.content?.substring(0, 50) || 'Bài viết',
        target_category: postData.category,
        metadata: { author: postData.author_name }
      });
    }
  }, [post.id, currentUser?.email]);

  const { data: comments = [] } = useQuery({
    queryKey: ['post-comments', post.id],
    queryFn: async () => {
      const allComments = await base44.entities.PostComment.list('-created_date', 100);
      return allComments.filter(c => {
        const data = c.data || c;
        return data.post_id === post.id && data.status === 'active' && !data.parent_comment_id;
      });
    },
    enabled: showComments
  });

  const reactionMutation = useMutation({
    mutationFn: async ({ reactionType }) => {
      const reactions = { ...postData.reactions };
      const reactedBy = { ...postData.reacted_by };
      
      if (userReaction) {
        reactions[userReaction] = Math.max(0, (reactions[userReaction] || 0) - 1);
      }
      
      if (userReaction === reactionType) {
        delete reactedBy[userEmail];
      } else {
        reactions[reactionType] = (reactions[reactionType] || 0) + 1;
        reactedBy[userEmail] = reactionType;
      }
      
      const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
      
      // Create notification if not own post
      if (post.created_by !== userEmail && reactionType !== userReaction) {
        await base44.entities.Notification.create({
          recipient_email: post.created_by,
          type: 'like',
          actor_email: userEmail,
          actor_name: currentUser?.full_name || 'Người dùng',
          post_id: post.id,
          message: 'đã thả reaction vào bài viết của bạn',
          link: `/community?post=${post.id}`
        });
      }
      
      return base44.entities.UserPost.update(post.id, {
        reactions,
        reacted_by: reactedBy,
        likes_count: totalReactions,
        engagement_score: totalReactions + (postData.comments_count || 0) * 2 + (postData.shares_count || 0) * 3
      });
    },
    onSuccess: (_, { reactionType }) => {
      queryClient.invalidateQueries(['user-posts']);
      setShowReactions(false);
      
      // ✅ Track AI Activity - Post Like
      if (reactionType !== userReaction) {
        track(EventTypes.POST_LIKE, TargetTypes.POST, {
          target_id: post.id,
          target_name: postData.content?.substring(0, 50) || 'Bài viết',
          metadata: { reaction_type: reactionType }
        });
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const savedBy = [...(postData.saved_by || [])];
      
      if (isSaved) {
        // Unsave
        const index = savedBy.indexOf(userEmail);
        if (index > -1) savedBy.splice(index, 1);
        
        // Delete from SavedPost
        const savedPosts = await base44.entities.SavedPost.list('-created_date', 100);
        const savedPost = savedPosts.find(s => s.user_email === userEmail && s.post_id === post.id);
        if (savedPost) {
          await base44.entities.SavedPost.delete(savedPost.id);
        }
      } else {
        // Save
        savedBy.push(userEmail);
        await base44.entities.SavedPost.create({
          user_email: userEmail,
          post_id: post.id,
          collection_name: 'saved'
        });
      }
      
      return base44.entities.UserPost.update(post.id, {
        saved_by: savedBy,
        saves_count: savedBy.length,
        engagement_score: (postData.engagement_score || 0) + (isSaved ? -1 : 1)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-posts']);
      queryClient.invalidateQueries(['saved-posts']);
    }
  });

  const votePollMutation = useMutation({
    mutationFn: async (optionIndex) => {
      const poll = { ...postData.poll };
      const options = [...poll.options];
      
      // Remove previous vote if any
      options.forEach(opt => {
        if (opt.voters?.includes(userEmail)) {
          opt.voters = opt.voters.filter(v => v !== userEmail);
          opt.votes = Math.max(0, opt.votes - 1);
        }
      });
      
      // Add new vote
      if (!options[optionIndex].voters) options[optionIndex].voters = [];
      options[optionIndex].voters.push(userEmail);
      options[optionIndex].votes = (options[optionIndex].votes || 0) + 1;
      
      poll.options = options;
      
      return base44.entities.UserPost.update(post.id, { poll });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-posts']);
      setShowPollResults(true);
    }
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      return base44.entities.UserPost.update(post.id, {
        shares_count: (postData.shares_count || 0) + 1,
        engagement_score: (postData.engagement_score || 0) + 3
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-posts']);
    }
  });

  const reportMutation = useMutation({
    mutationFn: async () => {
      const reportedBy = [...(postData.reported_by || []), userEmail];
      return base44.entities.UserPost.update(post.id, {
        reported_by: reportedBy,
        report_count: reportedBy.length,
        status: reportedBy.length >= 3 ? 'reported' : postData.status
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-posts']);
      alert('Đã báo cáo bài viết. Cảm ơn bạn!');
      setShowMenu(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // ✅ Validate post.id exists before deleting
      if (!post?.id) {
        throw new Error('Không tìm thấy ID bài viết. Vui lòng tải lại trang.');
      }
      return base44.entities.UserPost.delete(post.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-posts']);
      addToast('Đã xóa bài viết thành công', 'success');
    },
    onError: (error) => {
      console.error('Delete post error:', error);
      addToast(error.message || 'Không thể xóa bài viết. Vui lòng thử lại.', 'error');
    }
  });

  const timeAgo = formatDistanceToNow(new Date(post.created_date), { addSuffix: true, locale: vi });

  // ✅ PRODUCT HANDLERS - Quick View vs Add to Cart
  const handleProductQuickView = (productLink) => {
    console.log('🔍 Quick View triggered for:', productLink.product_name);
    console.log('📦 Product data:', productLink);
    
    // Trigger quick view modal
    window.dispatchEvent(new CustomEvent('quick-view-product', { 
      detail: { 
        product: {
          id: productLink.product_id,
          name: productLink.product_name,
          image_url: productLink.product_image,
          price: productLink.product_price,
          video_url: productLink.product_video,
          unit: 'kg',
          short_description: 'Sản phẩm từ bài viết cộng đồng',
          rating_average: 5,
          rating_count: 0,
          total_sold: 0
        }
      }
    }));
  };

  const handleProductAddToCart = (e, productLink) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log('🛒 Add to cart:', productLink.product_name);
    
    window.dispatchEvent(new CustomEvent('add-to-cart', { 
      detail: { 
        id: productLink.product_id,
        name: productLink.product_name,
        price: productLink.product_price,
        unit: 'kg',
        image_url: productLink.product_image,
        quantity: 1
      } 
    }));
    
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 right-6 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] animate-slide-up';
    toast.innerHTML = `
      <div class="flex items-center gap-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-medium">✅ Đã thêm vào giỏ!</span>
      </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  };

  const handleProductAddToWishlist = (productLink) => {
    if (!currentUser) {
      onLoginRequired?.('Thêm Yêu Thích');
      return;
    }

    console.log('❤️ Add to wishlist:', productLink.product_name);
    
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    
    if (!wishlist.includes(productLink.product_id)) {
      wishlist.push(productLink.product_id);
      localStorage.setItem('zerofarm-wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlist-updated'));
    }
  };

  const handleReaction = (reactionType) => {
    if (!currentUser) {
      onLoginRequired?.('Thả Reaction');
      return;
    }
    reactionMutation.mutate({ reactionType });
  };

  const handleSave = () => {
    if (!currentUser) {
      onLoginRequired?.('Lưu Bài');
      return;
    }
    saveMutation.mutate();
  };

  const handleCommentClick = () => {
    if (!currentUser) {
      onLoginRequired?.('Bình Luận');
      return;
    }
    setShowComments(!showComments);
  };

  const handleVote = (optionIndex) => {
    if (!currentUser) {
      onLoginRequired?.('Bình Chọn');
      return;
    }
    votePollMutation.mutate(optionIndex);
  };

  const handleShare = async (method) => {
    const communityUrl = createPageUrl('community');
    const url = `${window.location.origin}${communityUrl}?post=${post.id}`;
    
    if (method === 'native' && canShare) {
      const result = await share({
        title: 'Bài viết từ ZeroFarm',
        text: postData.content?.substring(0, 100) || '',
        url
      });
      if (result.success) {
        shareMutation.mutate();
        addToast('Đã chia sẻ', 'success');
      }
      setShowShareMenu(false);
      return;
    }
    
    if (method === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      addToast('Đã copy link', 'success');
      setTimeout(() => setCopied(false), 2000);
    } else if (method === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (method === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(postData.content.substring(0, 100))}`, '_blank');
    }
    
    shareMutation.mutate();
    setShowShareMenu(false);
  };

  const handleDelete = async () => {
    // ✅ Validate post.id exists before showing confirm dialog
    if (!post?.id) {
      addToast('Không thể xóa: Bài viết chưa được lưu hoặc ID không hợp lệ', 'error');
      setShowMenu(false);
      return;
    }
    
    const confirmed = await showConfirm({
      title: 'Xóa bài viết',
      message: 'Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.',
      type: 'danger',
      confirmText: 'Xóa'
    });
    if (confirmed) {
      deleteMutation.mutate();
    }
    setShowMenu(false);
  };

  const handleReport = async () => {
    const confirmed = await showConfirm({
      title: 'Báo cáo bài viết',
      message: 'Bạn muốn báo cáo bài viết này vì nội dung không phù hợp?',
      type: 'warning',
      confirmText: 'Báo cáo'
    });
    if (confirmed) {
      reportMutation.mutate();
      addToast('Đã gửi báo cáo. Cảm ơn bạn!', 'success');
    }
    setShowMenu(false);
  };

  const renderContent = () => {
    return <PostContentRenderer content={postData.content} />;
  };

  const totalReactions = Object.values(postData.reactions || {}).reduce((sum, count) => sum + count, 0);
  const topReaction = Object.entries(postData.reactions || {}).sort((a, b) => b[1] - a[1])[0];

  // Calculate poll total votes
  const totalVotes = postData.poll?.options?.reduce((sum, opt) => sum + (opt.votes || 0), 0) || 0;

  return (
    <div className={`bg-white rounded-3xl shadow-lg overflow-hidden transition-all ${
      isPinned 
        ? 'border-4 border-yellow-400 ring-4 ring-yellow-100' 
        : 'border-2 border-gray-100 hover:border-[#7CB342]/30'
    }`}>
      {/* ✅ Pinned Badge */}
      {isPinned && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 flex items-center justify-center gap-2 font-bold text-sm">
          <Icon.Pin size={16} />
          📌 BÀI VIẾT ĐƯỢC GHIM
        </div>
      )}
      
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button 
            onClick={() => navigate(createPageUrl('UserProfile') + `?user=${encodeURIComponent(post.created_by)}`)}
            className="w-12 h-12 bg-gradient-to-br from-[#7CB342] to-[#FF9800] rounded-full flex items-center justify-center text-white font-bold text-lg hover:scale-110 transition-transform overflow-hidden flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[#7CB342] focus:ring-offset-2"
          >
            {postData.author_avatar ? (
              <img src={postData.author_avatar} alt={postData.author_name} className="w-full h-full object-cover" />
            ) : (
              <span>{postData.author_name?.[0]?.toUpperCase() || 'U'}</span>
            )}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(createPageUrl('UserProfile') + `?user=${encodeURIComponent(post.created_by)}`)}
                className="font-semibold text-gray-900 hover:text-[#7CB342] transition-colors focus:outline-none focus:underline"
              >
                {postData.author_name}
              </button>
              {postData.is_edited && (
                <span className="text-xs text-gray-400">(đã chỉnh sửa)</span>
              )}
              {postData.is_featured && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-medium">
                  ⭐ Nổi bật
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <p className="text-gray-500">{timeAgo}</p>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-600">{CATEGORY_LABELS[postData.category] || postData.category}</span>
            </div>
          </div>
          <button
            onClick={() => setShowQuickPreview(true)}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all"
            title="Xem nhanh"
          >
            <Icon.Eye size={20} />
          </button>
          
          {/* Book Reader Button - show for long posts */}
          {postData.content?.length > 300 && (
            <button
              onClick={() => setShowBookReader(true)}
              className="w-8 h-8 rounded-full hover:bg-[#7CB342]/10 flex items-center justify-center transition-all text-[#7CB342]"
              title="Chế độ đọc sách"
            >
              <Icon.FileText size={20} />
            </button>
          )}
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <Icon.MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[160px] z-10">
                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        onEdit?.(post);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                      <Icon.Edit size={16} />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
                    >
                      <Icon.Trash size={16} />
                      Xóa bài
                    </button>
                  </>
                )}
                {!isOwner && (
                  <button
                    onClick={handleReport}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
                  >
                    <Icon.Flag size={16} />
                    Báo cáo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          {renderContent()}
        </div>

        {/* ✅ Post Images - Lazy Loading with Blur-up */}
        {postData.images && postData.images.length > 0 && (
          <div className={`grid gap-2 mb-4 ${
            postData.images.length === 1 ? 'grid-cols-1' : 
            postData.images.length === 2 ? 'grid-cols-2' : 
            postData.images.length === 3 ? 'grid-cols-3' : 
            'grid-cols-2'
          }`}>
            {postData.images.slice(0, 4).map((image, index) => (
              <div 
                key={index}
                onClick={() => {
                  setLightboxIndex(index);
                  setLightboxOpen(true);
                }}
                className={`relative rounded-xl overflow-hidden group cursor-pointer ${
                  postData.images.length === 1 ? 'col-span-1' :
                  index === 0 && postData.images.length >= 3 ? 'col-span-2' : 'col-span-1'
                }`}
                style={{ aspectRatio: postData.images.length === 1 ? '16/9' : '1/1' }}
              >
                <LazyImage
                  src={image}
                  alt={`Post image ${index + 1}`}
                  className="w-full h-full"
                  onClick={() => {}}
                  priority={priority && index === 0} // ✅ Load first image of first 2 posts immediately
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <Icon.Eye size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {index === 3 && postData.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">+{postData.images.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ✅ Post Video - Lazy Load */}
        {postData.video_url && (
          <LazyVideo 
            videoUrl={postData.video_url}
            getEmbedUrl={getVideoEmbedUrl}
          />
        )}

        {/* Poll */}
        {postData.poll && (
          <div className="mb-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <Icon.BarChart size={20} className="text-blue-600" />
              <h4 className="font-bold text-gray-900">{postData.poll.question}</h4>
            </div>
            
            <div className="space-y-2">
              {postData.poll.options.map((option, index) => {
                const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes * 100).toFixed(0) : 0;
                const userVoted = option.voters?.includes(userEmail);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleVote(index)}
                    disabled={hasVoted && !userVoted}
                    className={`w-full text-left p-3 rounded-xl transition-all relative overflow-hidden ${
                      userVoted 
                        ? 'bg-blue-500 text-white border-2 border-blue-600' 
                        : hasVoted
                        ? 'bg-white border-2 border-gray-200 cursor-not-allowed'
                        : 'bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <div 
                      className="absolute inset-0 bg-blue-100 transition-all"
                      style={{ width: `${percentage}%`, opacity: 0.3 }}
                    />
                    <div className="relative flex items-center justify-between">
                      <span className="font-medium">{option.text}</span>
                      {(hasVoted || showPollResults) && (
                        <span className="text-sm font-bold">{percentage}% ({option.votes || 0})</span>
                      )}
                      {userVoted && <Icon.CheckCircle size={20} />}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-3 text-xs text-gray-600 flex items-center justify-between">
              <span>{totalVotes} lượt bình chọn</span>
              {!hasVoted && totalVotes > 0 && (
                <button 
                  onClick={() => setShowPollResults(!showPollResults)}
                  className="text-blue-600 hover:underline"
                >
                  {showPollResults ? 'Ẩn kết quả' : 'Xem kết quả'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ✅ Product Carousel 3D - Coverflow Effect */}
        {postData.product_links && postData.product_links.length > 0 && (
          <ProductCarousel3D
            products={postData.product_links}
            onProductClick={handleProductQuickView}
            onAddToCart={handleProductAddToCart}
            onAddToWishlist={handleProductAddToWishlist}
            autoplay={false}
          />
        )}
      </div>

      {/* Post Stats */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          {topReaction && totalReactions > 0 && (
            <>
              <div className="flex -space-x-1">
                {REACTIONS.filter(r => (postData.reactions?.[r.type] || 0) > 0).slice(0, 3).map(reaction => {
                  const ReactionIcon = Icon[reaction.iconName];
                  return (
                    <div key={reaction.type} className="w-6 h-6 rounded-full bg-white border-2 border-white flex items-center justify-center">
                      {ReactionIcon && <ReactionIcon size={16} className={reaction.color} />}
                    </div>
                  );
                })}
              </div>
              <span>{totalReactions}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {postData.views_count > 0 && (
            <span className="flex items-center gap-1 text-gray-500">
              <Icon.Eye size={12} />
              {postData.views_count}
            </span>
          )}
          <span>{comments.length} bình luận</span>
          <span className="hidden sm:inline">{postData.shares_count || 0} chia sẻ</span>
          {postData.saves_count > 0 && (
            <span className="flex items-center gap-1">
              <Icon.Bookmark size={12} />
              {postData.saves_count}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-2 relative">
        <button
          onClick={() => setShowReactions(!showReactions)}
          className={`flex-1 py-2 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
            userReaction ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {userReaction ? (
            <>
              {(() => {
                const reaction = REACTIONS.find(r => r.type === userReaction);
                const ReactionIcon = reaction ? Icon[reaction.iconName] : null;
                return ReactionIcon ? <ReactionIcon size={16} className={reaction.color} /> : null;
              })()}
              {REACTIONS.find(r => r.type === userReaction)?.label}
            </>
          ) : (
            <>
              <Icon.ThumbsUp size={16} />
              Thích
            </>
          )}
        </button>

        {showReactions && (
          <div className="absolute bottom-16 left-6 bg-white rounded-full shadow-2xl border border-gray-200 px-4 py-3 flex gap-2 z-10">
            {REACTIONS.map(reaction => {
              const ReactionIcon = Icon[reaction.iconName];
              return (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  className="hover:scale-125 transition-transform"
                  title={reaction.label}
                >
                  {ReactionIcon && <ReactionIcon size={28} className={reaction.color} />}
                </button>
              );
            })}
          </div>
        )}
        
        <button
          onClick={handleCommentClick}
          className="flex-1 py-2 rounded-xl font-medium hover:bg-gray-50 text-gray-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
        >
          <Icon.MessageCircle size={16} />
          Bình luận
        </button>

        <button
          onClick={handleSave}
          className={`py-2 px-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
            isSaved ? 'text-[#7CB342] bg-[#7CB342]/10' : 'text-gray-600 hover:bg-gray-50'
          }`}
          title={isSaved ? 'Đã lưu' : 'Lưu bài'}
        >
          <Icon.Bookmark size={16} />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="py-2 px-3 rounded-xl font-medium hover:bg-gray-50 text-gray-600 transition-all duration-300 flex items-center justify-center gap-2 text-sm"
          >
            <Icon.Share size={16} />
          </button>
          {showShareMenu && (
            <div className="absolute bottom-16 right-0 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[180px] z-10">
              {canShare && (
                <button
                  onClick={() => handleShare('native')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Icon.Share size={16} />
                  Chia sẻ
                </button>
              )}
              <button
                onClick={() => handleShare('copy')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                {copied ? <Icon.CheckCircle size={16} className="text-green-600" /> : <Icon.Copy size={16} />}
                {copied ? 'Đã copy!' : 'Copy link'}
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
              >
                <Icon.Share size={16} />
                Facebook
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection 
          postId={post.id}
          postTitle={postData.content?.substring(0, 50)}
          comments={comments}
          currentUser={currentUser}
          onLoginRequired={onLoginRequired}
        />
      )}

      {/* ✅ Image Lightbox */}
      {lightboxOpen && postData.images && (
        <ImageLightbox
          images={postData.images}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* ✅ Quick Preview Modal */}
      <AnimatePresence>
        {showQuickPreview && (
          <PostQuickPreview
            post={post}
            onClose={() => setShowQuickPreview(false)}
            onViewFull={() => {
              setShowQuickPreview(false);
              setShowBookReader(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* ✅ Book Reader Modal */}
      <AnimatePresence>
        {showBookReader && (
          <BookReaderView
            post={post}
            currentUser={currentUser}
            onClose={() => setShowBookReader(false)}
            onVote={(optionIndex) => votePollMutation.mutate(optionIndex)}
            onProductClick={handleProductQuickView}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
});

export default PostCard;
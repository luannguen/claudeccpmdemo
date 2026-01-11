/**
 * Social Event Handler - Social domain
 * 
 * Handles: social.post_liked, social.post_commented, social.user_mentioned, social.user_followed
 */

import { notificationEngine } from '../../../core/notificationEngine';
import { SocialEvents } from '../../../types/EventTypes';
import { createPageUrl } from '@/utils';

/**
 * Handle post liked
 */
export const handlePostLiked = async (payload) => {
  const { post, liker, postAuthor } = payload;

  // Don't notify if liking own post
  if (liker.email === postAuthor.email) return;

  console.log('❤️ [SocialEventHandler] social.post_liked');

  await notificationEngine.create({
    actor: 'client',
    type: 'like',
    recipients: postAuthor.email,
    payload: {
      title: '❤️ Bài Viết Được Thích',
      message: `${liker.name || 'Ai đó'} đã thích bài viết của bạn`,
      link: createPageUrl('Community') + `?post=${post.id}`,
      actorEmail: liker.email,
      actorName: liker.name,
      priority: 'normal',
      metadata: {
        post_id: post.id,
        liker_email: liker.email,
        liker_name: liker.name
      }
    }
  });
};

/**
 * Handle post commented
 */
export const handlePostCommented = async (payload) => {
  const { post, commenter, comment, postAuthor } = payload;

  // Don't notify if commenting on own post
  if (commenter.email === postAuthor.email) return;

  console.log('💬 [SocialEventHandler] social.post_commented');

  await notificationEngine.create({
    actor: 'client',
    type: 'comment',
    recipients: postAuthor.email,
    payload: {
      title: '💬 Bình Luận Mới',
      message: `${commenter.name || 'Ai đó'} đã bình luận bài viết của bạn`,
      link: createPageUrl('Community') + `?post=${post.id}&comment=${comment.id}`,
      actorEmail: commenter.email,
      actorName: commenter.name,
      priority: 'normal',
      metadata: {
        post_id: post.id,
        comment_id: comment.id,
        commenter_email: commenter.email,
        comment_preview: comment.content?.slice(0, 100)
      }
    }
  });
};

/**
 * Handle user mentioned
 */
export const handleUserMentioned = async (payload) => {
  const { post, mentionedUser, mentioner } = payload;

  // Don't notify self-mention
  if (mentioner.email === mentionedUser.email) return;

  console.log('📢 [SocialEventHandler] social.user_mentioned');

  await notificationEngine.create({
    actor: 'client',
    type: 'mention',
    recipients: mentionedUser.email,
    payload: {
      title: '📢 Bạn Được Nhắc Đến',
      message: `${mentioner.name || 'Ai đó'} đã nhắc đến bạn trong một bài viết`,
      link: createPageUrl('Community') + `?post=${post.id}`,
      actorEmail: mentioner.email,
      actorName: mentioner.name,
      priority: 'high', // Mentions are important
      metadata: {
        post_id: post.id,
        mentioner_email: mentioner.email,
        mentioner_name: mentioner.name
      }
    }
  });
};

/**
 * Handle user followed
 */
export const handleUserFollowed = async (payload) => {
  const { follower, following } = payload;

  console.log('👤 [SocialEventHandler] social.user_followed');

  await notificationEngine.create({
    actor: 'client',
    type: 'follow',
    recipients: following.email,
    payload: {
      title: '👤 Người Theo Dõi Mới',
      message: `${follower.name || 'Ai đó'} đã bắt đầu theo dõi bạn`,
      link: createPageUrl('UserProfile') + `?user=${follower.email}`,
      actorEmail: follower.email,
      actorName: follower.name,
      priority: 'normal',
      metadata: {
        follower_email: follower.email,
        follower_name: follower.name
      }
    }
  });
};

/**
 * Handle comment replied
 */
export const handleCommentReplied = async (payload) => {
  const { post, comment, reply, replier, originalCommenter } = payload;

  // Don't notify self-reply
  if (replier.email === originalCommenter.email) return;

  console.log('↩️ [SocialEventHandler] social.comment_replied');

  await notificationEngine.create({
    actor: 'client',
    type: 'reply',
    recipients: originalCommenter.email,
    payload: {
      title: '↩️ Phản Hồi Mới',
      message: `${replier.name || 'Ai đó'} đã trả lời bình luận của bạn`,
      link: createPageUrl('Community') + `?post=${post.id}&comment=${comment.id}`,
      actorEmail: replier.email,
      actorName: replier.name,
      priority: 'normal',
      metadata: {
        post_id: post.id,
        comment_id: comment.id,
        reply_id: reply.id,
        replier_email: replier.email,
        reply_preview: reply.content?.slice(0, 100)
      }
    }
  });
};

/**
 * Register all social event handlers
 */
export const registerSocialHandlers = (registry) => {
  registry.register(SocialEvents.POST_LIKED, handlePostLiked, { priority: 5 });
  registry.register(SocialEvents.POST_COMMENTED, handlePostCommented, { priority: 6 });
  registry.register(SocialEvents.USER_MENTIONED, handleUserMentioned, { priority: 8 });
  registry.register(SocialEvents.USER_FOLLOWED, handleUserFollowed, { priority: 5 });
  registry.register(SocialEvents.COMMENT_REPLIED, handleCommentReplied, { priority: 6 });
  
  console.log('✅ Social event handlers registered');
};

export default {
  handlePostLiked,
  handlePostCommented,
  handleUserMentioned,
  handleUserFollowed,
  handleCommentReplied,
  registerSocialHandlers
};
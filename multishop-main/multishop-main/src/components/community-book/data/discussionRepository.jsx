/**
 * Discussion Repository
 * Data layer for BookDiscussion and DiscussionReply entities
 */

import { base44 } from '@/api/base44Client';

export const discussionRepository = {
  // ========== DISCUSSIONS ==========

  /**
   * List discussions for a book
   */
  listByBook: async (bookId, limit = 50) => {
    return await base44.entities.BookDiscussion.filter(
      { book_id: bookId, status: 'active' },
      '-is_pinned,-last_reply_at',
      limit
    );
  },

  /**
   * Get discussion by ID
   */
  getById: async (discussionId) => {
    const discussion = await base44.entities.BookDiscussion.get(discussionId);
    // Increment views
    if (discussion) {
      await base44.entities.BookDiscussion.update(discussionId, {
        views_count: (discussion.views_count || 0) + 1
      });
    }
    return discussion;
  },

  /**
   * Create discussion
   */
  create: async (data, user) => {
    return await base44.entities.BookDiscussion.create({
      book_id: data.book_id,
      title: data.title,
      content: data.content,
      author_email: user.email,
      author_name: user.full_name || user.name,
      author_avatar: user.avatar,
      topic_type: data.topic_type || 'general',
      is_pinned: false,
      is_closed: false,
      replies_count: 0,
      views_count: 0,
      likes_count: 0,
      liked_by: [],
      status: 'active'
    });
  },

  /**
   * Update discussion
   */
  update: async (discussionId, data) => {
    return await base44.entities.BookDiscussion.update(discussionId, data);
  },

  /**
   * Delete (hide) discussion
   */
  delete: async (discussionId) => {
    return await base44.entities.BookDiscussion.update(discussionId, { status: 'hidden' });
  },

  /**
   * Toggle like discussion
   */
  toggleLike: async (discussionId, userEmail) => {
    const discussion = await base44.entities.BookDiscussion.get(discussionId);
    if (!discussion) return null;

    const likedBy = discussion.liked_by || [];
    const isLiked = likedBy.includes(userEmail);

    if (isLiked) {
      const filtered = likedBy.filter(e => e !== userEmail);
      return await base44.entities.BookDiscussion.update(discussionId, {
        liked_by: filtered,
        likes_count: Math.max(0, (discussion.likes_count || 0) - 1)
      });
    } else {
      likedBy.push(userEmail);
      return await base44.entities.BookDiscussion.update(discussionId, {
        liked_by: likedBy,
        likes_count: (discussion.likes_count || 0) + 1
      });
    }
  },

  /**
   * Toggle pin discussion
   */
  togglePin: async (discussionId) => {
    const discussion = await base44.entities.BookDiscussion.get(discussionId);
    if (!discussion) return null;
    return await base44.entities.BookDiscussion.update(discussionId, {
      is_pinned: !discussion.is_pinned
    });
  },

  /**
   * Close/Open discussion
   */
  toggleClose: async (discussionId) => {
    const discussion = await base44.entities.BookDiscussion.get(discussionId);
    if (!discussion) return null;
    return await base44.entities.BookDiscussion.update(discussionId, {
      is_closed: !discussion.is_closed
    });
  },

  // ========== REPLIES ==========

  /**
   * List replies for a discussion
   */
  listReplies: async (discussionId, limit = 100) => {
    return await base44.entities.DiscussionReply.filter(
      { discussion_id: discussionId, status: 'active' },
      'created_date',
      limit
    );
  },

  /**
   * Create reply
   */
  createReply: async (data, user, isBookAuthor = false) => {
    const reply = await base44.entities.DiscussionReply.create({
      discussion_id: data.discussion_id,
      book_id: data.book_id,
      content: data.content,
      author_email: user.email,
      author_name: user.full_name || user.name,
      author_avatar: user.avatar,
      parent_reply_id: data.parent_reply_id || null,
      is_author_reply: isBookAuthor,
      likes_count: 0,
      liked_by: [],
      status: 'active'
    });

    // Update discussion
    const discussion = await base44.entities.BookDiscussion.get(data.discussion_id);
    if (discussion) {
      await base44.entities.BookDiscussion.update(data.discussion_id, {
        replies_count: (discussion.replies_count || 0) + 1,
        last_reply_at: new Date().toISOString(),
        last_reply_by: user.full_name || user.name
      });
    }

    return reply;
  },

  /**
   * Delete (hide) reply
   */
  deleteReply: async (replyId, discussionId) => {
    await base44.entities.DiscussionReply.update(replyId, { status: 'hidden' });
    
    // Update discussion count
    const discussion = await base44.entities.BookDiscussion.get(discussionId);
    if (discussion && discussion.replies_count > 0) {
      await base44.entities.BookDiscussion.update(discussionId, {
        replies_count: discussion.replies_count - 1
      });
    }
  },

  /**
   * Toggle like reply
   */
  toggleLikeReply: async (replyId, userEmail) => {
    const reply = await base44.entities.DiscussionReply.get(replyId);
    if (!reply) return null;

    const likedBy = reply.liked_by || [];
    const isLiked = likedBy.includes(userEmail);

    if (isLiked) {
      const filtered = likedBy.filter(e => e !== userEmail);
      return await base44.entities.DiscussionReply.update(replyId, {
        liked_by: filtered,
        likes_count: Math.max(0, (reply.likes_count || 0) - 1)
      });
    } else {
      likedBy.push(userEmail);
      return await base44.entities.DiscussionReply.update(replyId, {
        liked_by: likedBy,
        likes_count: (reply.likes_count || 0) + 1
      });
    }
  }
};

export default discussionRepository;
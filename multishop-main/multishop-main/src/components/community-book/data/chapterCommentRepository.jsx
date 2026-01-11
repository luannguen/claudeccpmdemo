/**
 * Chapter Comment Repository
 * Data layer for BookChapterComment entity
 */

import { base44 } from '@/api/base44Client';

export const chapterCommentRepository = {
  /**
   * List comments for a chapter
   */
  listByChapter: async (chapterId, limit = 50) => {
    return await base44.entities.BookChapterComment.filter(
      { chapter_id: chapterId, status: 'active', parent_comment_id: null },
      '-created_date',
      limit
    );
  },

  /**
   * List replies for a comment
   */
  listReplies: async (parentCommentId, limit = 20) => {
    return await base44.entities.BookChapterComment.filter(
      { parent_comment_id: parentCommentId, status: 'active' },
      'created_date',
      limit
    );
  },

  /**
   * Get comment count for a chapter
   */
  getCountByChapter: async (chapterId) => {
    const comments = await base44.entities.BookChapterComment.filter(
      { chapter_id: chapterId, status: 'active' },
      '-created_date',
      1000
    );
    return comments.length;
  },

  /**
   * Create a comment
   */
  create: async (data, user) => {
    const comment = await base44.entities.BookChapterComment.create({
      chapter_id: data.chapter_id,
      book_id: data.book_id,
      content: data.content,
      author_email: user.email,
      author_name: user.full_name || user.name,
      author_avatar: user.avatar,
      parent_comment_id: data.parent_comment_id || null,
      likes_count: 0,
      liked_by: [],
      replies_count: 0,
      is_author_reply: data.is_author_reply || false,
      status: 'active'
    });

    // Update parent's replies count
    if (data.parent_comment_id) {
      const parent = await base44.entities.BookChapterComment.get(data.parent_comment_id);
      if (parent) {
        await base44.entities.BookChapterComment.update(data.parent_comment_id, {
          replies_count: (parent.replies_count || 0) + 1
        });
      }
    }

    // Update chapter's comments count
    await chapterCommentRepository.updateChapterCommentsCount(data.chapter_id);

    return comment;
  },

  /**
   * Update a comment
   */
  update: async (commentId, content) => {
    return await base44.entities.BookChapterComment.update(commentId, { content });
  },

  /**
   * Delete a comment (soft delete)
   */
  delete: async (commentId) => {
    const comment = await base44.entities.BookChapterComment.get(commentId);
    if (!comment) return null;

    await base44.entities.BookChapterComment.update(commentId, { status: 'hidden' });

    // Update parent's replies count
    if (comment.parent_comment_id) {
      const parent = await base44.entities.BookChapterComment.get(comment.parent_comment_id);
      if (parent && parent.replies_count > 0) {
        await base44.entities.BookChapterComment.update(comment.parent_comment_id, {
          replies_count: parent.replies_count - 1
        });
      }
    }

    // Update chapter's comments count
    await chapterCommentRepository.updateChapterCommentsCount(comment.chapter_id);

    return comment;
  },

  /**
   * Toggle like on a comment
   */
  toggleLike: async (commentId, userEmail) => {
    const comment = await base44.entities.BookChapterComment.get(commentId);
    if (!comment) return null;

    const likedBy = comment.liked_by || [];
    const isLiked = likedBy.includes(userEmail);

    if (isLiked) {
      // Unlike
      const filtered = likedBy.filter(e => e !== userEmail);
      return await base44.entities.BookChapterComment.update(commentId, {
        liked_by: filtered,
        likes_count: Math.max(0, (comment.likes_count || 0) - 1)
      });
    } else {
      // Like
      likedBy.push(userEmail);
      return await base44.entities.BookChapterComment.update(commentId, {
        liked_by: likedBy,
        likes_count: (comment.likes_count || 0) + 1
      });
    }
  },

  /**
   * Pin/Unpin a comment
   */
  togglePin: async (commentId) => {
    const comment = await base44.entities.BookChapterComment.get(commentId);
    if (!comment) return null;

    return await base44.entities.BookChapterComment.update(commentId, {
      is_pinned: !comment.is_pinned
    });
  },

  /**
   * Update chapter's comments count
   */
  updateChapterCommentsCount: async (chapterId) => {
    const count = await chapterCommentRepository.getCountByChapter(chapterId);
    await base44.entities.BookChapter.update(chapterId, {
      comments_count: count
    });
  }
};

export default chapterCommentRepository;
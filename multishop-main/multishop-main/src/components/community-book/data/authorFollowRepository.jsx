/**
 * Author Follow Repository
 * Data layer for AuthorFollow entity
 */

import { base44 } from '@/api/base44Client';

export const authorFollowRepository = {
  /**
   * Check if user is following an author
   */
  isFollowing: async (followerEmail, authorEmail) => {
    const follows = await base44.entities.AuthorFollow.filter(
      { follower_email: followerEmail, author_email: authorEmail },
      '-created_date',
      1
    );
    return follows.length > 0 ? follows[0] : null;
  },

  /**
   * Get all authors a user is following
   */
  getFollowedAuthors: async (followerEmail, limit = 50) => {
    return await base44.entities.AuthorFollow.filter(
      { follower_email: followerEmail },
      '-followed_at',
      limit
    );
  },

  /**
   * Get all followers of an author
   */
  getAuthorFollowers: async (authorEmail, limit = 100) => {
    return await base44.entities.AuthorFollow.filter(
      { author_email: authorEmail },
      '-followed_at',
      limit
    );
  },

  /**
   * Get follower count for an author
   */
  getFollowerCount: async (authorEmail) => {
    const followers = await base44.entities.AuthorFollow.filter(
      { author_email: authorEmail },
      '-followed_at',
      1000
    );
    return followers.length;
  },

  /**
   * Follow an author
   */
  follow: async (followerEmail, author) => {
    // Check if already following
    const existing = await authorFollowRepository.isFollowing(followerEmail, author.email);
    if (existing) return existing;

    return await base44.entities.AuthorFollow.create({
      follower_email: followerEmail,
      author_email: author.email,
      author_name: author.name || author.full_name,
      author_avatar: author.avatar,
      followed_at: new Date().toISOString(),
      notifications_enabled: true
    });
  },

  /**
   * Unfollow an author
   */
  unfollow: async (followerEmail, authorEmail) => {
    const follow = await authorFollowRepository.isFollowing(followerEmail, authorEmail);
    if (follow) {
      await base44.entities.AuthorFollow.delete(follow.id);
    }
    return true;
  },

  /**
   * Toggle notifications for a followed author
   */
  toggleNotifications: async (followId, enabled) => {
    return await base44.entities.AuthorFollow.update(followId, {
      notifications_enabled: enabled
    });
  }
};

export default authorFollowRepository;
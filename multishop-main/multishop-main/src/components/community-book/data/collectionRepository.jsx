/**
 * Collection Repository
 * Data layer for BookCollection entity
 */

import { base44 } from '@/api/base44Client';
import { generateSlug } from '../types';

export const collectionRepository = {
  /**
   * List public collections
   */
  listPublic: async (limit = 20) => {
    return await base44.entities.BookCollection.filter(
      { visibility: 'public' },
      '-followers_count',
      limit
    );
  },

  /**
   * List featured collections
   */
  listFeatured: async (limit = 10) => {
    return await base44.entities.BookCollection.filter(
      { visibility: 'public', is_featured: true },
      '-followers_count',
      limit
    );
  },

  /**
   * List user's collections
   */
  listByUser: async (userEmail, limit = 50) => {
    return await base44.entities.BookCollection.filter(
      { owner_email: userEmail },
      '-updated_date',
      limit
    );
  },

  /**
   * Get collection by ID
   */
  getById: async (collectionId) => {
    return await base44.entities.BookCollection.get(collectionId);
  },

  /**
   * Create collection
   */
  create: async (data, user) => {
    return await base44.entities.BookCollection.create({
      title: data.title,
      slug: generateSlug(data.title),
      description: data.description || '',
      cover_image: data.cover_image || '',
      owner_email: user.email,
      owner_name: user.full_name || user.name,
      owner_avatar: user.avatar,
      book_ids: data.book_ids || [],
      books_count: data.book_ids?.length || 0,
      visibility: data.visibility || 'public',
      tags: data.tags || [],
      followers_count: 0,
      followed_by: []
    });
  },

  /**
   * Update collection
   */
  update: async (collectionId, data) => {
    const updates = { ...data };
    if (data.book_ids) {
      updates.books_count = data.book_ids.length;
    }
    return await base44.entities.BookCollection.update(collectionId, updates);
  },

  /**
   * Delete collection
   */
  delete: async (collectionId) => {
    return await base44.entities.BookCollection.delete(collectionId);
  },

  /**
   * Add book to collection
   */
  addBook: async (collectionId, bookId) => {
    const collection = await base44.entities.BookCollection.get(collectionId);
    if (!collection) return null;

    const bookIds = collection.book_ids || [];
    if (bookIds.includes(bookId)) return collection;

    bookIds.push(bookId);
    return await base44.entities.BookCollection.update(collectionId, {
      book_ids: bookIds,
      books_count: bookIds.length
    });
  },

  /**
   * Remove book from collection
   */
  removeBook: async (collectionId, bookId) => {
    const collection = await base44.entities.BookCollection.get(collectionId);
    if (!collection) return null;

    const bookIds = (collection.book_ids || []).filter(id => id !== bookId);
    return await base44.entities.BookCollection.update(collectionId, {
      book_ids: bookIds,
      books_count: bookIds.length
    });
  },

  /**
   * Toggle follow collection
   */
  toggleFollow: async (collectionId, userEmail) => {
    const collection = await base44.entities.BookCollection.get(collectionId);
    if (!collection) return null;

    const followedBy = collection.followed_by || [];
    const isFollowing = followedBy.includes(userEmail);

    if (isFollowing) {
      const filtered = followedBy.filter(e => e !== userEmail);
      return await base44.entities.BookCollection.update(collectionId, {
        followed_by: filtered,
        followers_count: Math.max(0, (collection.followers_count || 0) - 1)
      });
    } else {
      followedBy.push(userEmail);
      return await base44.entities.BookCollection.update(collectionId, {
        followed_by: followedBy,
        followers_count: (collection.followers_count || 0) + 1
      });
    }
  }
};

export default collectionRepository;
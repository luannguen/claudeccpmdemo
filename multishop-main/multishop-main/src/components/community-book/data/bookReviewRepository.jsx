/**
 * Book Review Repository
 * Data layer for BookReview entity
 */

import { base44 } from '@/api/base44Client';

export const bookReviewRepository = {
  /**
   * List reviews for a book
   */
  listByBook: async (bookId, limit = 50) => {
    return await base44.entities.BookReview.filter(
      { book_id: bookId, status: 'active' },
      '-created_date',
      limit
    );
  },

  /**
   * Get featured reviews for a book
   */
  listFeaturedByBook: async (bookId, limit = 3) => {
    return await base44.entities.BookReview.filter(
      { book_id: bookId, status: 'active', is_featured: true },
      '-likes_count',
      limit
    );
  },

  /**
   * List reviews by user
   */
  listByUser: async (userEmail, limit = 50) => {
    return await base44.entities.BookReview.filter(
      { reviewer_email: userEmail, status: 'active' },
      '-created_date',
      limit
    );
  },

  /**
   * Get user's review for a specific book
   */
  getUserReview: async (bookId, userEmail) => {
    const reviews = await base44.entities.BookReview.filter(
      { book_id: bookId, reviewer_email: userEmail },
      '-created_date',
      1
    );
    return reviews[0] || null;
  },

  /**
   * Get book rating stats
   */
  getBookStats: async (bookId) => {
    const reviews = await base44.entities.BookReview.filter(
      { book_id: bookId, status: 'active' },
      '-created_date',
      1000
    );

    if (reviews.length === 0) {
      return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let total = 0;

    reviews.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
      total += r.rating;
    });

    return {
      average: Math.round((total / reviews.length) * 10) / 10,
      count: reviews.length,
      distribution
    };
  },

  /**
   * Create review
   */
  create: async (data, user, isVerifiedReader = false) => {
    // Check if user already reviewed
    const existing = await bookReviewRepository.getUserReview(data.book_id, user.email);
    if (existing) {
      // Update existing
      return await bookReviewRepository.update(existing.id, data);
    }

    return await base44.entities.BookReview.create({
      book_id: data.book_id,
      reviewer_email: user.email,
      reviewer_name: user.full_name || user.name,
      reviewer_avatar: user.avatar,
      rating: data.rating,
      title: data.title || '',
      content: data.content,
      pros: data.pros || [],
      cons: data.cons || [],
      reading_status: data.reading_status || 'completed',
      would_recommend: data.would_recommend !== false,
      likes_count: 0,
      liked_by: [],
      is_verified_reader: isVerifiedReader,
      status: 'active'
    });
  },

  /**
   * Update review
   */
  update: async (reviewId, data) => {
    return await base44.entities.BookReview.update(reviewId, data);
  },

  /**
   * Delete review
   */
  delete: async (reviewId) => {
    return await base44.entities.BookReview.update(reviewId, { status: 'hidden' });
  },

  /**
   * Toggle like review
   */
  toggleLike: async (reviewId, userEmail) => {
    const review = await base44.entities.BookReview.get(reviewId);
    if (!review) return null;

    const likedBy = review.liked_by || [];
    const isLiked = likedBy.includes(userEmail);

    if (isLiked) {
      const filtered = likedBy.filter(e => e !== userEmail);
      return await base44.entities.BookReview.update(reviewId, {
        liked_by: filtered,
        likes_count: Math.max(0, (review.likes_count || 0) - 1)
      });
    } else {
      likedBy.push(userEmail);
      return await base44.entities.BookReview.update(reviewId, {
        liked_by: likedBy,
        likes_count: (review.likes_count || 0) + 1
      });
    }
  },

  /**
   * Update book's average rating
   */
  updateBookRating: async (bookId) => {
    const stats = await bookReviewRepository.getBookStats(bookId);
    await base44.entities.CommunityBook.update(bookId, {
      rating_average: stats.average,
      reviews_count: stats.count
    });
    return stats;
  }
};

export default bookReviewRepository;
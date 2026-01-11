/**
 * Portfolio Repository - Data access layer for E-Card portfolios
 * Data Layer - API calls only
 * 
 * @module features/ecard/data
 */

import { base44 } from '@/api/base44Client';

/**
 * Portfolio Repository
 */
export const portfolioRepository = {
  /**
   * List portfolios by profile
   */
  listByProfile: async (profileId, options = {}) => {
    const { status = 'published', limit = 50 } = options;
    
    const query = {
      profile_id: profileId,
      ...(status !== 'all' && { status })
    };
    
    const items = await base44.entities.EcardPortfolio.filter(query, '-display_order', limit);
    return items;
  },

  /**
   * List portfolios by user email
   */
  listByUser: async (userEmail, options = {}) => {
    const { status, limit = 50 } = options;
    
    const query = {
      user_email: userEmail,
      ...(status && { status })
    };
    
    const items = await base44.entities.EcardPortfolio.filter(query, '-display_order', limit);
    return items;
  },

  /**
   * Get featured portfolios
   */
  listFeatured: async (profileId, limit = 3) => {
    const items = await base44.entities.EcardPortfolio.filter({
      profile_id: profileId,
      status: 'published',
      is_featured: true
    }, '-display_order', limit);
    
    return items;
  },

  /**
   * Get single portfolio by ID
   */
  getById: async (id) => {
    const items = await base44.entities.EcardPortfolio.filter({ id });
    return items[0] || null;
  },

  /**
   * Create new portfolio
   */
  create: async (data) => {
    // Get max order
    const existing = await base44.entities.EcardPortfolio.filter(
      { profile_id: data.profile_id },
      '-display_order',
      1
    );
    const maxOrder = existing[0]?.display_order || 0;
    
    return base44.entities.EcardPortfolio.create({
      ...data,
      display_order: maxOrder + 1
    });
  },

  /**
   * Update portfolio
   */
  update: async (id, data) => {
    return base44.entities.EcardPortfolio.update(id, data);
  },

  /**
   * Delete portfolio
   */
  delete: async (id) => {
    return base44.entities.EcardPortfolio.delete(id);
  },

  /**
   * Reorder portfolios
   */
  reorder: async (portfolioIds) => {
    const updates = portfolioIds.map((id, idx) => ({
      id,
      display_order: idx + 1
    }));
    
    await Promise.all(
      updates.map(({ id, display_order }) => 
        base44.entities.EcardPortfolio.update(id, { display_order })
      )
    );
  },

  /**
   * Toggle featured status
   */
  toggleFeatured: async (id) => {
    const item = await portfolioRepository.getById(id);
    if (!item) return null;
    
    return base44.entities.EcardPortfolio.update(id, {
      is_featured: !item.is_featured
    });
  },

  /**
   * Increment view count
   */
  incrementView: async (id) => {
    const item = await portfolioRepository.getById(id);
    if (!item) return;
    
    return base44.entities.EcardPortfolio.update(id, {
      view_count: (item.view_count || 0) + 1
    });
  },

  /**
   * Toggle like
   */
  toggleLike: async (id, increment = true) => {
    const item = await portfolioRepository.getById(id);
    if (!item) return null;
    
    return base44.entities.EcardPortfolio.update(id, {
      like_count: Math.max(0, (item.like_count || 0) + (increment ? 1 : -1))
    });
  },

  /**
   * Get statistics
   */
  getStats: async (profileId) => {
    const all = await base44.entities.EcardPortfolio.filter({ profile_id: profileId });
    
    const published = all.filter(p => p.status === 'published');
    const featured = all.filter(p => p.is_featured);
    const totalViews = all.reduce((sum, p) => sum + (p.view_count || 0), 0);
    const totalLikes = all.reduce((sum, p) => sum + (p.like_count || 0), 0);
    
    return {
      total: all.length,
      published: published.length,
      drafts: all.filter(p => p.status === 'draft').length,
      featured: featured.length,
      totalViews,
      totalLikes
    };
  }
};
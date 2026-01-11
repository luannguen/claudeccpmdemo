/**
 * AI Personalization Service - Enhanced for Deep Tracking
 * 
 * Architecture: Log-First + Batch Processing + Token-Optimized Context
 * 
 * 1. Frontend logs DETAILED activities (không gọi AI)
 * 2. Backend Cron Job xử lý batch định kỳ
 * 3. AI-readable context được tối ưu cho các AI khác sử dụng
 * 
 * @module aiPersonalizationService
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== ACTIVITY EVENT TYPES ==========
export const ActivityEventTypes = {
  // Product
  PRODUCT_VIEW: 'product_view',
  PRODUCT_ADD_TO_CART: 'product_add_to_cart',
  PRODUCT_ADD_TO_WISHLIST: 'product_add_to_wishlist',
  PRODUCT_REMOVE_FROM_WISHLIST: 'product_remove_from_wishlist',
  PRODUCT_PURCHASE: 'product_purchase',
  PRODUCT_REVIEW: 'product_review',
  
  // Post/Community
  POST_VIEW: 'post_view',
  POST_CREATE: 'post_create',
  POST_LIKE: 'post_like',
  POST_UNLIKE: 'post_unlike',
  POST_COMMENT: 'post_comment',
  POST_SHARE: 'post_share',
  POST_SAVE: 'post_save',
  POST_UNSAVE: 'post_unsave',
  
  // Social
  USER_FOLLOW: 'user_follow',
  USER_UNFOLLOW: 'user_unfollow',
  
  // Browsing
  CATEGORY_BROWSE: 'category_browse',
  SEARCH_QUERY: 'search_query',
  PAGE_VIEW: 'page_view',
  SCROLL_DEPTH: 'scroll_depth',
  TIME_ON_PAGE: 'time_on_page',
  
  // Cart & Checkout
  CART_ABANDON: 'cart_abandon',
  CHECKOUT_START: 'checkout_start',
  
  // Engagement
  CHATBOT_INTERACTION: 'chatbot_interaction',
  REFERRAL_SHARE: 'referral_share',
  PREORDER_INTEREST: 'preorder_interest',
  LOT_VIEW: 'lot_view',
  
  // Filter/Sort
  FILTER_USE: 'filter_use',
  SORT_USE: 'sort_use',
  COMPARE_PRODUCTS: 'compare_products',
  COUPON_APPLY: 'coupon_apply'
};

export const TargetTypes = {
  PRODUCT: 'Product',
  POST: 'Post',
  USER: 'User',
  CATEGORY: 'Category',
  ORDER: 'Order',
  PRODUCT_LOT: 'ProductLot',
  PAGE: 'Page',
  SEARCH: 'Search',
  CHATBOT: 'Chatbot',
  FILTER: 'Filter',
  COUPON: 'Coupon'
};

// ========== SESSION MANAGEMENT ==========
let currentSessionId = null;
let sessionStartTime = null;
let sequencePosition = 0;
let lastAction = null;

function getSessionId() {
  if (!currentSessionId) {
    currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStartTime = Date.now();
    sequencePosition = 0;
    lastAction = null;
  }
  return currentSessionId;
}

function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// ========== CORE SERVICE API ==========
export const aiPersonalizationAPI = {
  
  /**
   * Log activity - ENHANCED with rich context
   */
  logActivity: async (activityData) => {
    try {
      const now = new Date();
      sequencePosition++;
      
      const activity = await base44.entities.UserActivity.create({
        event_type: activityData.event_type,
        target_type: activityData.target_type,
        target_id: activityData.target_id || null,
        target_name: activityData.target_name || null,
        target_category: activityData.target_category || null,
        content_excerpt: activityData.content_excerpt ? activityData.content_excerpt.substring(0, 100) : null,
        value: activityData.value || null,
        duration_seconds: activityData.duration_seconds || null,
        scroll_depth_percent: activityData.scroll_depth_percent || null,
        hour_of_day: now.getHours(),
        day_of_week: now.getDay(),
        device_type: getDeviceType(),
        previous_action: lastAction,
        sequence_position: sequencePosition,
        referrer_source: activityData.referrer_source || null,
        metadata: activityData.metadata || {},
        session_id: getSessionId(),
        is_processed: false
      });
      
      lastAction = activityData.event_type;
      
      return success(activity);
    } catch (error) {
      console.error('Failed to log activity:', error);
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Bulk log activities - Enhanced for batching
   */
  bulkLogActivities: async (activities) => {
    try {
      const sessionId = getSessionId();
      const now = new Date();
      const deviceType = getDeviceType();
      
      const toCreate = activities.map((a, idx) => {
        sequencePosition++;
        const result = {
          event_type: a.event_type,
          target_type: a.target_type,
          target_id: a.target_id || null,
          target_name: a.target_name || null,
          target_category: a.target_category || null,
          content_excerpt: a.content_excerpt ? a.content_excerpt.substring(0, 100) : null,
          value: a.value || null,
          duration_seconds: a.duration_seconds || null,
          scroll_depth_percent: a.scroll_depth_percent || null,
          hour_of_day: now.getHours(),
          day_of_week: now.getDay(),
          device_type: deviceType,
          previous_action: idx > 0 ? activities[idx - 1].event_type : lastAction,
          sequence_position: sequencePosition,
          referrer_source: a.referrer_source || null,
          metadata: a.metadata || {},
          session_id: sessionId,
          is_processed: false
        };
        lastAction = a.event_type;
        return result;
      });
      
      await base44.entities.UserActivity.bulkCreate(toCreate);
      return success({ logged: toCreate.length });
    } catch (error) {
      console.error('Failed to bulk log activities:', error);
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Get user's AI profile
   */
  getProfile: async (email) => {
    try {
      const profiles = await base44.entities.UserProfileAI.filter({ user_email: email });
      if (profiles.length === 0) {
        return success(null);
      }
      return success(profiles[0]);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Get AI-optimized context for chatbot (TOKEN-EFFICIENT)
   * Returns a concise, structured context for other AIs to consume
   */
  getAIReadableContext: async (email) => {
    try {
      const profiles = await base44.entities.UserProfileAI.filter({ user_email: email });
      
      if (profiles.length === 0) {
        return success({
          hasProfile: false,
          contextString: 'NEW_USER | No history | Recommend: popular products, welcome offers',
          recommendations: ['welcome_offer', 'popular_products', 'category_intro']
        });
      }

      const profile = profiles[0];
      
      // Build token-efficient context string
      const contextParts = [];
      
      // Segment & Intent
      contextParts.push(`SEGMENT:${profile.user_segment || 'new_user'}`);
      contextParts.push(`INTENT:${profile.predicted_intent || 'unknown'}`);
      if (profile.persona_type && profile.persona_type !== 'unknown') {
        contextParts.push(`PERSONA:${profile.persona_type}`);
      }
      
      // Buying behavior
      contextParts.push(`BUY:${profile.buying_tendency || 'unknown'}`);
      contextParts.push(`ENGAGE:${profile.engagement_level || 'new'}`);
      
      // Categories (max 3)
      if (profile.preferred_categories?.length > 0) {
        contextParts.push(`CATS:[${profile.preferred_categories.slice(0, 3).join(',')}]`);
      }
      
      // Price range
      if (profile.preferred_price_range?.avg) {
        contextParts.push(`PRICE:${Math.round(profile.preferred_price_range.avg / 1000)}k`);
      }
      
      // Conversion metrics
      if (profile.conversion_metrics?.view_to_cart_rate) {
        contextParts.push(`V2C:${(profile.conversion_metrics.view_to_cart_rate * 100).toFixed(0)}%`);
      }
      
      // Recent searches (max 3)
      if (profile.recent_searches?.length > 0) {
        contextParts.push(`SEARCH:[${profile.recent_searches.slice(0, 3).join(',')}]`);
      }
      
      // Favorite products (max 3 names)
      if (profile.favorite_products?.length > 0) {
        const favNames = profile.favorite_products.slice(0, 3).map(f => f.name?.substring(0, 20)).filter(Boolean);
        if (favNames.length > 0) {
          contextParts.push(`FAVS:[${favNames.join(',')}]`);
        }
      }
      
      // Time patterns
      if (profile.time_patterns?.preferred_hours?.length > 0) {
        contextParts.push(`HOURS:[${profile.time_patterns.preferred_hours.slice(0, 3).join(',')}]`);
      }
      
      // Behavioral patterns
      if (profile.behavioral_patterns?.length > 0) {
        contextParts.push(`PATTERNS:[${profile.behavioral_patterns.slice(0, 3).join(',')}]`);
      }
      
      return success({
        hasProfile: true,
        contextString: contextParts.join(' | '),
        fullContext: profile.ai_readable_context || profile.personalized_summary,
        segment: profile.user_segment,
        intent: profile.predicted_intent,
        persona: profile.persona_type,
        categories: profile.preferred_categories || [],
        recommendations: profile.recommended_actions || [],
        sentiment: profile.sentiment,
        buyingTendency: profile.buying_tendency,
        engagement: profile.engagement_level,
        priceRange: profile.preferred_price_range,
        favoriteProducts: profile.favorite_products?.slice(0, 5) || [],
        recentSearches: profile.recent_searches || [],
        conversionMetrics: profile.conversion_metrics || {},
        timePatterns: profile.time_patterns || {},
        behavioralPatterns: profile.behavioral_patterns || [],
        contentPrefs: profile.content_preferences || {},
        activityStats: profile.activity_stats || {},
        lastUpdated: profile.last_ai_processed
      });
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Get personalization context for chatbot (backward compatible)
   */
  getPersonalizationContext: async (email) => {
    return aiPersonalizationAPI.getAIReadableContext(email);
  },

  /**
   * Get unprocessed activity count for a user
   */
  getUnprocessedCount: async (email) => {
    try {
      const activities = await base44.entities.UserActivity.filter({
        created_by: email,
        is_processed: false
      });
      return success({ count: activities.length });
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Manual trigger AI processing for current user
   */
  triggerProcessing: async () => {
    try {
      const result = await base44.functions.invoke('processUserPersonalization', {});
      return success(result.data);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

// ========== ENHANCED QUICK LOG HELPERS ==========
export const quickLog = {
  productView: (product, durationSeconds = null) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.PRODUCT_VIEW,
    target_type: TargetTypes.PRODUCT,
    target_id: product.id,
    target_name: product.name,
    target_category: product.category,
    value: product.price,
    duration_seconds: durationSeconds
  }),

  addToCart: (product, quantity = 1) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.PRODUCT_ADD_TO_CART,
    target_type: TargetTypes.PRODUCT,
    target_id: product.id,
    target_name: product.name,
    target_category: product.category,
    value: quantity,
    metadata: { price: product.price }
  }),

  cartAbandon: (items) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.CART_ABANDON,
    target_type: TargetTypes.ORDER,
    value: items.reduce((sum, i) => sum + (i.price * i.quantity), 0),
    metadata: { items_count: items.length, items: items.map(i => i.name).slice(0, 5) }
  }),

  checkoutStart: (totalValue, itemsCount) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.CHECKOUT_START,
    target_type: TargetTypes.ORDER,
    value: totalValue,
    metadata: { items_count: itemsCount }
  }),

  purchase: (order) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.PRODUCT_PURCHASE,
    target_type: TargetTypes.ORDER,
    target_id: order.id,
    value: order.total_amount,
    metadata: { items_count: order.items?.length, payment_method: order.payment_method }
  }),

  postView: (post, durationSeconds = null, scrollDepth = null) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.POST_VIEW,
    target_type: TargetTypes.POST,
    target_id: post.id,
    target_name: post.title,
    target_category: post.category,
    content_excerpt: post.content?.substring(0, 100),
    duration_seconds: durationSeconds,
    scroll_depth_percent: scrollDepth
  }),

  postCreate: (post) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.POST_CREATE,
    target_type: TargetTypes.POST,
    target_id: post.id,
    target_name: post.title,
    target_category: post.category,
    content_excerpt: post.content?.substring(0, 100)
  }),

  postLike: (post) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.POST_LIKE,
    target_type: TargetTypes.POST,
    target_id: post.id,
    target_name: post.title,
    target_category: post.category
  }),

  postComment: (post, commentText) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.POST_COMMENT,
    target_type: TargetTypes.POST,
    target_id: post.id,
    target_name: post.title,
    content_excerpt: commentText?.substring(0, 100)
  }),

  search: (query, resultsCount, selectedFilters = null) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.SEARCH_QUERY,
    target_type: TargetTypes.SEARCH,
    target_name: query,
    value: resultsCount,
    metadata: { filters: selectedFilters }
  }),

  categoryBrowse: (category, categoryName, productsCount = null) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.CATEGORY_BROWSE,
    target_type: TargetTypes.CATEGORY,
    target_id: category,
    target_name: categoryName,
    value: productsCount
  }),

  filterUse: (filterType, filterValue) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.FILTER_USE,
    target_type: TargetTypes.FILTER,
    target_name: filterType,
    metadata: { value: filterValue }
  }),

  sortUse: (sortType) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.SORT_USE,
    target_type: TargetTypes.FILTER,
    target_name: sortType
  }),

  couponApply: (couponCode, success, discountAmount = null) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.COUPON_APPLY,
    target_type: TargetTypes.COUPON,
    target_name: couponCode,
    value: discountAmount,
    metadata: { success }
  }),

  chatbotInteraction: (intent, query) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.CHATBOT_INTERACTION,
    target_type: TargetTypes.CHATBOT,
    target_name: intent,
    content_excerpt: query?.substring(0, 100)
  }),

  scrollDepth: (pageType, pageName, depthPercent, timeSpent) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.SCROLL_DEPTH,
    target_type: TargetTypes.PAGE,
    target_name: pageName,
    target_category: pageType,
    scroll_depth_percent: depthPercent,
    duration_seconds: timeSpent
  }),

  timeOnPage: (pageType, pageName, timeSeconds) => aiPersonalizationAPI.logActivity({
    event_type: ActivityEventTypes.TIME_ON_PAGE,
    target_type: TargetTypes.PAGE,
    target_name: pageName,
    target_category: pageType,
    duration_seconds: timeSeconds
  })
};

export default aiPersonalizationAPI;
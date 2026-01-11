/**
 * AIPersonalizationEngine - Enhanced Background Module
 * 
 * ARCHITECTURE: Log-First, Rich Context, No Real-time AI
 * 
 * 10 ENHANCEMENTS:
 * 1. Content excerpt logging (post content, comments, search queries)
 * 2. Time tracking (duration on page, scroll depth)
 * 3. Session sequence tracking
 * 4. Device & time context
 * 5. Cart abandonment detection
 * 6. Filter/sort usage tracking
 * 7. Checkout funnel tracking
 * 8. Post engagement depth
 * 9. Referrer source tracking
 * 10. Periodic engagement snapshots
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { aiPersonalizationAPI, ActivityEventTypes, TargetTypes, quickLog } from '@/components/services/aiPersonalizationService';

// ========== CONFIG ==========
const CONFIG = {
  BATCH_SIZE: 15,
  FLUSH_INTERVAL: 10000,
  DEBOUNCE_TIME: 2000,
  MAX_PENDING: 50,
  // Engagement tracking
  SCROLL_TRACK_INTERVAL: 5000, // Track scroll every 5s
  TIME_TRACK_INTERVAL: 30000, // Track time on page every 30s
  CART_ABANDON_DELAY: 60000 // Detect cart abandon after 60s of inactivity with cart
};

export default function AIPersonalizationEngine() {
  const { user, isAuthenticated } = useAuth();
  const pendingActivitiesRef = useRef([]);
  const lastEventRef = useRef({});
  const intervalRef = useRef(null);
  const pageViewStartRef = useRef(null);
  const maxScrollRef = useRef(0);
  const cartAbandonTimerRef = useRef(null);
  const currentPageRef = useRef(null);

  // ========== ADD ACTIVITY TO BATCH ==========
  const addActivity = useCallback((eventType, targetType, data = {}) => {
    if (!isAuthenticated || !user?.email) return;

    const eventKey = `${eventType}_${data.target_id || data.target_name || ''}`;
    const now = Date.now();
    
    if (lastEventRef.current[eventKey] && now - lastEventRef.current[eventKey] < CONFIG.DEBOUNCE_TIME) {
      return;
    }
    lastEventRef.current[eventKey] = now;

    const activity = {
      event_type: eventType,
      target_type: targetType,
      target_id: data.target_id || null,
      target_name: data.target_name || null,
      target_category: data.target_category || null,
      content_excerpt: data.content_excerpt || null,
      value: data.value || null,
      duration_seconds: data.duration_seconds || null,
      scroll_depth_percent: data.scroll_depth_percent || null,
      referrer_source: data.referrer_source || null,
      metadata: data.metadata || {}
    };

    pendingActivitiesRef.current.push(activity);

    if (pendingActivitiesRef.current.length > CONFIG.MAX_PENDING) {
      pendingActivitiesRef.current = pendingActivitiesRef.current.slice(-CONFIG.MAX_PENDING);
    }

    if (pendingActivitiesRef.current.length >= CONFIG.BATCH_SIZE) {
      flushActivities();
    }
  }, [isAuthenticated, user?.email]);

  // ========== FLUSH TO DATABASE ==========
  const flushActivities = useCallback(async () => {
    if (pendingActivitiesRef.current.length === 0) return;
    
    const toFlush = [...pendingActivitiesRef.current];
    pendingActivitiesRef.current = [];

    try {
      await aiPersonalizationAPI.bulkLogActivities(toFlush);
    } catch (error) {
      console.error('AI: Failed to log activities', error);
      pendingActivitiesRef.current = [...toFlush.slice(0, 10), ...pendingActivitiesRef.current].slice(0, CONFIG.MAX_PENDING);
    }
  }, []);

  // ========== PERIODIC FLUSH ==========
  useEffect(() => {
    if (!isAuthenticated) return;

    intervalRef.current = setInterval(() => {
      if (pendingActivitiesRef.current.length > 0) {
        flushActivities();
      }
    }, CONFIG.FLUSH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, flushActivities]);

  // ========== SCROLL DEPTH TRACKING ==========
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollPercent);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthenticated]);

  // ========== PAGE TIME TRACKING ==========
  useEffect(() => {
    if (!isAuthenticated) return;

    // Track time on current page
    pageViewStartRef.current = Date.now();
    maxScrollRef.current = 0;
    currentPageRef.current = window.location.pathname;

    // Periodic time tracking
    const timeInterval = setInterval(() => {
      if (pageViewStartRef.current && currentPageRef.current === window.location.pathname) {
        const timeSpent = Math.round((Date.now() - pageViewStartRef.current) / 1000);
        if (timeSpent > 30 && timeSpent % 30 === 0) { // Every 30s after first 30s
          addActivity(ActivityEventTypes.TIME_ON_PAGE, TargetTypes.PAGE, {
            target_name: currentPageRef.current,
            duration_seconds: timeSpent,
            scroll_depth_percent: maxScrollRef.current
          });
        }
      }
    }, CONFIG.TIME_TRACK_INTERVAL);

    return () => {
      clearInterval(timeInterval);
      // Log final time on page leave
      if (pageViewStartRef.current) {
        const timeSpent = Math.round((Date.now() - pageViewStartRef.current) / 1000);
        if (timeSpent > 5) {
          addActivity(ActivityEventTypes.TIME_ON_PAGE, TargetTypes.PAGE, {
            target_name: currentPageRef.current,
            duration_seconds: timeSpent,
            scroll_depth_percent: maxScrollRef.current
          });
        }
      }
    };
  }, [isAuthenticated, addActivity]);

  // ========== CART ABANDONMENT DETECTION ==========
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleCartUpdate = (e) => {
      const { items, action } = e.detail || {};
      
      // Clear existing timer
      if (cartAbandonTimerRef.current) {
        clearTimeout(cartAbandonTimerRef.current);
      }
      
      // Set new abandon timer if cart has items and user didn't checkout
      if (items?.length > 0 && action !== 'checkout') {
        cartAbandonTimerRef.current = setTimeout(() => {
          addActivity(ActivityEventTypes.CART_ABANDON, TargetTypes.ORDER, {
            value: items.reduce((sum, i) => sum + ((i.price || 0) * (i.quantity || 1)), 0),
            metadata: { 
              items_count: items.length,
              items: items.slice(0, 5).map(i => ({ name: i.name, price: i.price }))
            }
          });
        }, CONFIG.CART_ABANDON_DELAY);
      }
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      if (cartAbandonTimerRef.current) clearTimeout(cartAbandonTimerRef.current);
    };
  }, [isAuthenticated, addActivity]);

  // ========== EVENT LISTENERS ==========
  useEffect(() => {
    if (!isAuthenticated) return;

    // 🛒 Add to Cart
    const handleAddToCart = (e) => {
      const { id, name, price, quantity, category } = e.detail || {};
      addActivity(ActivityEventTypes.PRODUCT_ADD_TO_CART, TargetTypes.PRODUCT, {
        target_id: id,
        target_name: name,
        target_category: category,
        value: quantity || 1,
        metadata: { price }
      });
      // Clear cart abandon timer
      if (cartAbandonTimerRef.current) clearTimeout(cartAbandonTimerRef.current);
    };

    // ❤️ Wishlist Add
    const handleWishlistAdd = (e) => {
      const { productId, productName, category, price } = e.detail || {};
      addActivity(ActivityEventTypes.PRODUCT_ADD_TO_WISHLIST, TargetTypes.PRODUCT, {
        target_id: productId,
        target_name: productName,
        target_category: category,
        value: price
      });
    };

    // 👁️ Quick View Product
    const handleQuickView = (e) => {
      const product = e.detail?.product;
      if (product) {
        addActivity(ActivityEventTypes.PRODUCT_VIEW, TargetTypes.PRODUCT, {
          target_id: product.id,
          target_name: product.name,
          target_category: product.category,
          value: product.price
        });
      }
    };

    // 💳 Checkout Start
    const handleCheckoutStart = (e) => {
      const { totalValue, itemsCount } = e.detail || {};
      addActivity(ActivityEventTypes.CHECKOUT_START, TargetTypes.ORDER, {
        value: totalValue,
        metadata: { items_count: itemsCount }
      });
      // Clear cart abandon timer on checkout
      if (cartAbandonTimerRef.current) clearTimeout(cartAbandonTimerRef.current);
    };

    // 💳 Checkout Success
    const handleCheckoutSuccess = (e) => {
      const order = e.detail?.order;
      if (order) {
        addActivity(ActivityEventTypes.PRODUCT_PURCHASE, TargetTypes.ORDER, {
          target_id: order.id || order.order_number,
          value: order.total_amount,
          metadata: {
            items_count: order.items?.length,
            payment_method: order.payment_method,
            items: order.items?.slice(0, 5).map(i => ({ name: i.product_name, qty: i.quantity }))
          }
        });
      }
      // Clear cart abandon timer
      if (cartAbandonTimerRef.current) clearTimeout(cartAbandonTimerRef.current);
    };

    // 🔍 Search
    const handleSearch = (e) => {
      const { query, resultsCount, filters } = e.detail || {};
      if (query && query.length > 2) {
        addActivity(ActivityEventTypes.SEARCH_QUERY, TargetTypes.SEARCH, {
          target_name: query,
          content_excerpt: query,
          value: resultsCount || 0,
          metadata: { filters }
        });
      }
    };

    // 📂 Category Browse
    const handleCategoryBrowse = (e) => {
      const { category, categoryName, productsCount } = e.detail || {};
      if (category && category !== 'all') {
        addActivity(ActivityEventTypes.CATEGORY_BROWSE, TargetTypes.CATEGORY, {
          target_id: category,
          target_name: categoryName || category,
          value: productsCount
        });
      }
    };

    // 🎛️ Filter Use
    const handleFilterUse = (e) => {
      const { filterType, filterValue } = e.detail || {};
      addActivity(ActivityEventTypes.FILTER_USE, TargetTypes.FILTER, {
        target_name: filterType,
        metadata: { value: filterValue }
      });
    };

    // 📊 Sort Use
    const handleSortUse = (e) => {
      const { sortType } = e.detail || {};
      addActivity(ActivityEventTypes.SORT_USE, TargetTypes.FILTER, {
        target_name: sortType
      });
    };

    // 👤 Follow User
    const handleFollow = (e) => {
      const { userId, userName } = e.detail || {};
      addActivity(ActivityEventTypes.USER_FOLLOW, TargetTypes.USER, {
        target_id: userId,
        target_name: userName
      });
    };

    // ❤️ Post Like
    const handlePostLike = (e) => {
      const { postId, postTitle, category } = e.detail || {};
      addActivity(ActivityEventTypes.POST_LIKE, TargetTypes.POST, {
        target_id: postId,
        target_name: postTitle,
        target_category: category
      });
    };

    // 💬 Post Comment
    const handlePostComment = (e) => {
      const { postId, postTitle, commentText } = e.detail || {};
      addActivity(ActivityEventTypes.POST_COMMENT, TargetTypes.POST, {
        target_id: postId,
        target_name: postTitle,
        content_excerpt: commentText?.substring(0, 100)
      });
    };

    // 📝 Post Create
    const handlePostCreate = (e) => {
      const { postId, postTitle, postContent, category } = e.detail || {};
      addActivity(ActivityEventTypes.POST_CREATE, TargetTypes.POST, {
        target_id: postId,
        target_name: postTitle,
        target_category: category,
        content_excerpt: postContent?.substring(0, 100)
      });
    };

    // 🔖 Save Post
    const handlePostSave = (e) => {
      const { postId, postTitle } = e.detail || {};
      addActivity(ActivityEventTypes.POST_SAVE, TargetTypes.POST, {
        target_id: postId,
        target_name: postTitle
      });
    };

    // 📤 Share Post
    const handlePostShare = (e) => {
      const { postId, postTitle, platform } = e.detail || {};
      addActivity(ActivityEventTypes.POST_SHARE, TargetTypes.POST, {
        target_id: postId,
        target_name: postTitle,
        metadata: { platform }
      });
    };

    // 📦 Lot/Preorder View
    const handleLotView = (e) => {
      const { lot } = e.detail || {};
      if (lot) {
        addActivity(ActivityEventTypes.LOT_VIEW, TargetTypes.PRODUCT_LOT, {
          target_id: lot.id,
          target_name: lot.lot_name || lot.product_name,
          target_category: lot.product_category,
          value: lot.current_price,
          metadata: { estimated_harvest: lot.estimated_harvest_date }
        });
      }
    };

    // ⭐ Product Review
    const handleProductReview = (e) => {
      const { productId, productName, rating, reviewText } = e.detail || {};
      addActivity(ActivityEventTypes.PRODUCT_REVIEW, TargetTypes.PRODUCT, {
        target_id: productId,
        target_name: productName,
        value: rating,
        content_excerpt: reviewText?.substring(0, 100)
      });
    };

    // 💬 Chatbot
    const handleChatbot = (e) => {
      const { intent, query } = e.detail || {};
      addActivity(ActivityEventTypes.CHATBOT_INTERACTION, TargetTypes.CHATBOT, {
        target_name: intent,
        content_excerpt: query?.substring(0, 100)
      });
    };

    // 🎟️ Coupon Apply
    const handleCouponApply = (e) => {
      const { code, success, discount } = e.detail || {};
      addActivity(ActivityEventTypes.COUPON_APPLY, TargetTypes.COUPON, {
        target_name: code,
        value: discount,
        metadata: { success }
      });
    };

    // Register all listeners
    const events = [
      ['add-to-cart', handleAddToCart],
      ['wishlist-add', handleWishlistAdd],
      ['quick-view-product', handleQuickView],
      ['checkout-start', handleCheckoutStart],
      ['checkout-success', handleCheckoutSuccess],
      ['ai-track-search', handleSearch],
      ['ai-track-category', handleCategoryBrowse],
      ['ai-track-filter', handleFilterUse],
      ['ai-track-sort', handleSortUse],
      ['ai-track-follow', handleFollow],
      ['ai-track-post-like', handlePostLike],
      ['ai-track-post-comment', handlePostComment],
      ['ai-track-post-create', handlePostCreate],
      ['ai-track-post-save', handlePostSave],
      ['ai-track-post-share', handlePostShare],
      ['ai-track-lot-view', handleLotView],
      ['ai-track-review', handleProductReview],
      ['ai-track-chatbot', handleChatbot],
      ['ai-track-coupon', handleCouponApply]
    ];

    events.forEach(([event, handler]) => {
      window.addEventListener(event, handler);
    });

    return () => {
      events.forEach(([event, handler]) => {
        window.removeEventListener(event, handler);
      });
      flushActivities();
    };
  }, [isAuthenticated, addActivity, flushActivities]);

  // ========== FLUSH ON PAGE UNLOAD ==========
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Log final page time
      if (pageViewStartRef.current && user?.email) {
        const timeSpent = Math.round((Date.now() - pageViewStartRef.current) / 1000);
        if (timeSpent > 5) {
          pendingActivitiesRef.current.push({
            event_type: ActivityEventTypes.TIME_ON_PAGE,
            target_type: TargetTypes.PAGE,
            target_name: currentPageRef.current,
            duration_seconds: timeSpent,
            scroll_depth_percent: maxScrollRef.current
          });
        }
      }

      if (pendingActivitiesRef.current.length > 0 && user?.email) {
        try {
          const data = JSON.stringify({
            activities: pendingActivitiesRef.current,
            user_email: user.email
          });
          navigator.sendBeacon?.('/api/track-activities', data);
        } catch (e) {
          // Ignore
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user?.email]);

  return null;
}

// ========== HELPER: Manual trigger for specific events ==========
export function triggerAIEvent(eventName, data = {}) {
  window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
}

// Export event names for easy reference
export const AIEvents = {
  SEARCH: 'ai-track-search',
  CATEGORY: 'ai-track-category',
  FILTER: 'ai-track-filter',
  SORT: 'ai-track-sort',
  FOLLOW: 'ai-track-follow',
  POST_LIKE: 'ai-track-post-like',
  POST_COMMENT: 'ai-track-post-comment',
  POST_CREATE: 'ai-track-post-create',
  POST_SAVE: 'ai-track-post-save',
  POST_SHARE: 'ai-track-post-share',
  LOT_VIEW: 'ai-track-lot-view',
  REVIEW: 'ai-track-review',
  CHATBOT: 'ai-track-chatbot',
  COUPON: 'ai-track-coupon',
  WISHLIST_ADD: 'wishlist-add',
  CHECKOUT_START: 'checkout-start'
};
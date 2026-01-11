/**
 * User Context Service
 * 
 * Tổng hợp real-time context của user từ nhiều nguồn:
 * - Cart (localStorage)
 * - Wishlist (localStorage + entity)
 * - Orders (entity)
 * - User Profile (entity)
 * - Community Profile (posts, followers)
 * - AI Profile (UserProfileAI)
 * 
 * Architecture: Service Layer (AI-CODING-RULES compliant)
 * Sử dụng: Chatbot, AI Personalization, Recommendations
 * 
 * @module userContextService
 */

import { base44 } from '@/api/base44Client';
import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== CART DATA (localStorage) ==========

/**
 * Get cart items from localStorage
 */
export function getCartItems() {
  try {
    const cartKey = 'shopping_cart';
    const stored = localStorage.getItem(cartKey);
    if (!stored) return { items: [], total: 0, count: 0 };
    
    const items = JSON.parse(stored);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    
    return {
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
        image_url: item.image_url
      })),
      total,
      count,
      isEmpty: items.length === 0
    };
  } catch {
    return { items: [], total: 0, count: 0, isEmpty: true };
  }
}

/**
 * Get cart summary for AI (token-efficient)
 */
export function getCartSummaryForAI() {
  const cart = getCartItems();
  if (cart.isEmpty) return 'CART:empty';
  
  const topItems = cart.items.slice(0, 3).map(i => i.name.substring(0, 20)).join(', ');
  return `CART:${cart.count}items|${cart.total}đ|[${topItems}]`;
}

// ========== WISHLIST DATA ==========

/**
 * Get wishlist from localStorage
 */
export function getWishlistItems() {
  try {
    const stored = localStorage.getItem('wishlist');
    if (!stored) return { items: [], count: 0 };
    
    const items = JSON.parse(stored);
    return {
      items: items.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image_url: p.image_url
      })),
      count: items.length,
      isEmpty: items.length === 0
    };
  } catch {
    return { items: [], count: 0, isEmpty: true };
  }
}

/**
 * Get wishlist summary for AI
 */
export function getWishlistSummaryForAI() {
  const wishlist = getWishlistItems();
  if (wishlist.isEmpty) return 'WISHLIST:empty';
  
  const names = wishlist.items.slice(0, 3).map(i => i.name.substring(0, 15)).join(', ');
  return `WISHLIST:${wishlist.count}|[${names}]`;
}

// ========== ORDERS DATA (Entity) ==========

/**
 * Get recent orders for user
 */
export async function getRecentOrders(userEmail, limit = 5) {
  if (!userEmail) return success({ orders: [], count: 0 });
  
  try {
    const orders = await base44.entities.Order.filter({ customer_email: userEmail });
    const sorted = orders.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    const recent = sorted.slice(0, limit);
    
    return success({
      orders: recent.map(o => ({
        id: o.id,
        order_number: o.order_number,
        status: o.order_status,
        total: o.total_amount,
        items_count: o.items?.length || 0,
        date: o.created_date,
        first_item: o.items?.[0]?.product_name
      })),
      count: orders.length,
      pending_count: orders.filter(o => o.order_status === 'pending').length,
      shipping_count: orders.filter(o => o.order_status === 'shipping').length
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Get orders summary for AI
 */
export async function getOrdersSummaryForAI(userEmail) {
  const result = await getRecentOrders(userEmail, 3);
  if (!result.success || result.data.count === 0) return 'ORDERS:none';
  
  const { count, pending_count, shipping_count } = result.data;
  return `ORDERS:${count}|pending:${pending_count}|shipping:${shipping_count}`;
}

// ========== COMMUNITY PROFILE (Posts, Followers) ==========

/**
 * Get community engagement stats
 */
export async function getCommunityProfile(userEmail) {
  if (!userEmail) return success({ posts: 0, followers: 0, following: 0, likes: 0 });
  
  try {
    // Get user's posts
    const posts = await base44.entities.UserPost.filter({ created_by: userEmail });
    
    // Get followers/following counts
    const followers = await base44.entities.Follow.filter({ following_email: userEmail });
    const following = await base44.entities.Follow.filter({ follower_email: userEmail });
    
    // Get saved posts
    const saved = await base44.entities.SavedPost.filter({ created_by: userEmail });
    
    // Calculate total likes on user's posts
    const totalLikes = posts.reduce((sum, p) => sum + (p.like_count || 0), 0);
    
    return success({
      posts_count: posts.length,
      followers_count: followers.length,
      following_count: following.length,
      saved_posts_count: saved.length,
      total_likes_received: totalLikes,
      is_active: posts.length > 0 || saved.length > 0,
      recent_post_categories: [...new Set(posts.slice(0, 5).map(p => p.category).filter(Boolean))]
    });
  } catch (error) {
    return success({ posts_count: 0, followers_count: 0, following_count: 0 });
  }
}

/**
 * Get community summary for AI
 */
export async function getCommunitySummaryForAI(userEmail) {
  const result = await getCommunityProfile(userEmail);
  if (!result.success) return 'COMMUNITY:inactive';
  
  const { posts_count, followers_count, total_likes_received } = result.data;
  if (posts_count === 0) return 'COMMUNITY:viewer';
  
  return `COMMUNITY:posts:${posts_count}|followers:${followers_count}|likes:${total_likes_received}`;
}

// ========== USER PROFILE ==========

/**
 * Get user's extended profile
 */
export async function getUserProfile(userEmail) {
  if (!userEmail) return success(null);
  
  try {
    // Get user entity
    const me = await base44.auth.me();
    const user = me || null;
    
    // Get customer record if exists
    const customers = await base44.entities.Customer.filter({ email: userEmail });
    const customer = customers[0] || null;
    
    // Get referral member if exists
    const referrals = await base44.entities.ReferralMember.filter({ user_email: userEmail });
    const referral = referrals[0] || null;
    
    return success({
      user: user ? {
        full_name: user.full_name,
        email: user.email,
        role: user.role
      } : null,
      customer: customer ? {
        total_orders: customer.total_orders,
        total_spent: customer.total_spent,
        is_referred: customer.is_referred_customer,
        preferred_payment: customer.preferred_payment
      } : null,
      referral: referral ? {
        code: referral.referral_code,
        status: referral.status,
        rank: referral.seeder_rank,
        total_referred: referral.total_referred_customers
      } : null
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== AI PROFILE (from UserProfileAI) ==========

/**
 * Get AI-generated profile
 */
export async function getAIProfile(userEmail) {
  if (!userEmail) return success(null);
  
  try {
    const profiles = await base44.entities.UserProfileAI.filter({ user_email: userEmail });
    if (profiles.length === 0) return success(null);
    
    const profile = profiles[0];
    return success({
      segment: profile.user_segment,
      persona: profile.persona_type,
      intent: profile.predicted_intent,
      buying_tendency: profile.buying_tendency,
      engagement_level: profile.engagement_level,
      preferred_categories: profile.preferred_categories || [],
      favorite_products: profile.favorite_products?.slice(0, 5) || [],
      recent_searches: profile.recent_searches || [],
      sentiment: profile.sentiment,
      ai_context: profile.ai_readable_context,
      last_processed: profile.last_ai_processed
    });
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

// ========== FULL USER CONTEXT ==========

/**
 * Get complete user context (for chatbot/AI)
 * Combines all data sources into unified context
 */
export async function getFullUserContext(userEmail) {
  // Local data (instant)
  const cart = getCartItems();
  const wishlist = getWishlistItems();
  
  // Remote data (async)
  const [ordersResult, communityResult, profileResult, aiProfileResult] = await Promise.all([
    getRecentOrders(userEmail, 3),
    getCommunityProfile(userEmail),
    getUserProfile(userEmail),
    getAIProfile(userEmail)
  ]);
  
  const orders = ordersResult.success ? ordersResult.data : { orders: [], count: 0 };
  const community = communityResult.success ? communityResult.data : null;
  const profile = profileResult.success ? profileResult.data : null;
  const aiProfile = aiProfileResult.success ? aiProfileResult.data : null;
  
  return success({
    // Real-time local data
    cart: {
      items: cart.items,
      total: cart.total,
      count: cart.count,
      isEmpty: cart.isEmpty
    },
    wishlist: {
      items: wishlist.items,
      count: wishlist.count,
      isEmpty: wishlist.isEmpty
    },
    
    // Entity data
    orders: {
      recent: orders.orders,
      total_count: orders.count,
      pending: orders.pending_count,
      shipping: orders.shipping_count
    },
    
    // Community
    community: community,
    
    // User profile
    profile: profile,
    
    // AI-generated insights
    aiProfile: aiProfile,
    
    // Quick flags
    flags: {
      hasCart: !cart.isEmpty,
      hasWishlist: !wishlist.isEmpty,
      hasOrders: orders.count > 0,
      hasPendingOrders: orders.pending_count > 0,
      isCommunitylActive: community?.is_active || false,
      isReferralMember: !!profile?.referral,
      hasAIProfile: !!aiProfile
    },
    
    // Token-efficient summary for LLM
    summary: buildContextSummary({ cart, wishlist, orders, community, aiProfile })
  });
}

/**
 * Build token-efficient summary string
 */
function buildContextSummary({ cart, wishlist, orders, community, aiProfile }) {
  const parts = [];
  
  // Cart
  if (!cart.isEmpty) {
    parts.push(`CART:${cart.count}items,${Math.round(cart.total/1000)}k`);
  }
  
  // Wishlist
  if (!wishlist.isEmpty) {
    parts.push(`WISH:${wishlist.count}`);
  }
  
  // Orders
  if (orders.count > 0) {
    parts.push(`ORD:${orders.count}total,${orders.pending_count}pend,${orders.shipping_count}ship`);
  }
  
  // Community
  if (community?.is_active) {
    parts.push(`COMM:${community.posts_count}posts,${community.followers_count}fol`);
  }
  
  // AI Profile
  if (aiProfile) {
    parts.push(`AI:${aiProfile.segment}|${aiProfile.intent}|${aiProfile.persona}`);
  }
  
  return parts.join(' | ') || 'NEW_USER';
}

// ========== EXPORTS ==========

export const userContextAPI = {
  // Local data
  getCartItems,
  getCartSummaryForAI,
  getWishlistItems,
  getWishlistSummaryForAI,
  
  // Remote data
  getRecentOrders,
  getOrdersSummaryForAI,
  getCommunityProfile,
  getCommunitySummaryForAI,
  getUserProfile,
  getAIProfile,
  
  // Combined
  getFullUserContext
};

export default userContextAPI;
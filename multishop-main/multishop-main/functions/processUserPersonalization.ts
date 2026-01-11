/**
 * Process User Personalization - Enhanced Batch Processing
 * 
 * 10 ENHANCEMENTS FOR DEEP AI UNDERSTANDING:
 * 1. Content-aware analysis (post content, search terms, comments)
 * 2. Time pattern extraction (preferred hours, days)
 * 3. Session sequence analysis
 * 4. Behavioral pattern detection
 * 5. Persona classification
 * 6. Intent prediction
 * 7. Price sensitivity analysis
 * 8. Conversion funnel tracking
 * 9. AI-readable context generation (token-optimized)
 * 10. Cart abandonment patterns
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

const AI_PROCESSING_VERSION = 4;

// ========== CONFIG ==========
const CONFIG = {
  MIN_ACTIVITIES_THRESHOLD: 3,
  MAX_USERS_PER_BATCH: 20,
  CLEANUP_AFTER_DAYS: 7,
  PROCESSING_DELAY: 500,
  DECAY_HALF_LIFE_DAYS: 7,
  HIGH_VALUE_EVENTS: ['product_purchase', 'product_add_to_cart', 'product_add_to_wishlist', 'preorder_interest', 'checkout_start']
};

// ========== MAIN HANDLER ==========
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    let targetEmail = null;
    let cleanupMode = false;
    
    try {
      const body = await req.json();
      targetEmail = body?.user_email;
      cleanupMode = body?.cleanup === true;
    } catch {
      // Empty body - batch mode
    }
    
    if (cleanupMode) {
      const cleanupResult = await cleanupOldActivities(base44);
      return Response.json({ success: true, mode: 'cleanup', ...cleanupResult });
    }
    
    if (targetEmail) {
      const result = await processUserActivities(base44, targetEmail);
      return Response.json({ success: true, mode: 'single', ...result });
    }
    
    const usersToProcess = await findUsersWithPendingActivities(base44);
    
    if (usersToProcess.length === 0) {
      return Response.json({ 
        success: true, 
        mode: 'batch',
        message: 'No pending activities',
        processed: 0 
      });
    }
    
    console.log(`🧠 AI Processing: Found ${usersToProcess.length} users`);
    
    const results = [];
    
    for (const email of usersToProcess.slice(0, CONFIG.MAX_USERS_PER_BATCH)) {
      try {
        const result = await processUserActivities(base44, email);
        results.push({ email, ...result });
        await new Promise(r => setTimeout(r, CONFIG.PROCESSING_DELAY));
      } catch (error) {
        results.push({ email, success: false, error: error.message });
      }
    }
    
    return Response.json({
      success: true,
      mode: 'batch',
      totalPending: usersToProcess.length,
      processed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
    
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});

// ========== FIND USERS WITH PENDING ACTIVITIES ==========
async function findUsersWithPendingActivities(base44) {
  const activities = await base44.asServiceRole.entities.UserActivity.filter(
    { is_processed: false },
    '-created_date',
    1000
  );
  
  const userScores = {};
  activities.forEach(a => {
    const email = a.created_by;
    if (email) {
      if (!userScores[email]) {
        userScores[email] = { count: 0, priorityScore: 0, hasHighValue: false };
      }
      userScores[email].count += 1;
      
      if (CONFIG.HIGH_VALUE_EVENTS.includes(a.event_type)) {
        userScores[email].priorityScore += 10;
        userScores[email].hasHighValue = true;
      } else {
        userScores[email].priorityScore += 1;
      }
    }
  });
  
  return Object.entries(userScores)
    .filter(([_, data]) => data.count >= CONFIG.MIN_ACTIVITIES_THRESHOLD)
    .sort((a, b) => {
      if (a[1].hasHighValue !== b[1].hasHighValue) {
        return b[1].hasHighValue ? 1 : -1;
      }
      return b[1].priorityScore - a[1].priorityScore;
    })
    .map(([email]) => email);
}

// ========== PROCESS USER ACTIVITIES ==========
async function processUserActivities(base44, email) {
  const activities = await base44.asServiceRole.entities.UserActivity.filter(
    { created_by: email, is_processed: false },
    'created_date',
    100
  );
  
  if (activities.length < CONFIG.MIN_ACTIVITIES_THRESHOLD) {
    return { success: true, activitiesProcessed: 0, reason: 'below_threshold' };
  }
  
  let profiles = await base44.asServiceRole.entities.UserProfileAI.filter({ user_email: email });
  let profile;
  
  if (profiles.length === 0) {
    profile = await base44.asServiceRole.entities.UserProfileAI.create({
      user_email: email,
      preferred_categories: [],
      interests: [],
      buying_tendency: 'unknown',
      engagement_level: 'new',
      user_segment: 'new_user',
      predicted_intent: 'unknown',
      persona_type: 'unknown',
      sentiment: 'unknown',
      activity_stats: {},
      raw_activity_count: 0
    });
  } else {
    profile = profiles[0];
  }
  
  // Extract enhanced insights
  const timePatterns = extractTimePatterns(activities);
  const behavioralPatterns = detectBehavioralPatterns(activities);
  const recentSearches = extractRecentSearches(activities);
  const priceInsights = extractPriceInsights(activities);
  
  // Analyze with AI
  const analysisResult = await analyzeActivitiesWithAI(base44, activities, profile, {
    timePatterns,
    behavioralPatterns,
    recentSearches,
    priceInsights
  });
  
  // Build AI-readable context
  const aiReadableContext = buildAIReadableContext(analysisResult, profile);
  
  // Update profile
  await base44.asServiceRole.entities.UserProfileAI.update(profile.id, {
    ...analysisResult,
    time_patterns: timePatterns,
    behavioral_patterns: behavioralPatterns,
    recent_searches: recentSearches.slice(0, 10),
    ai_readable_context: aiReadableContext,
    last_ai_processed: new Date().toISOString(),
    processing_version: AI_PROCESSING_VERSION,
    raw_activity_count: (profile.raw_activity_count || 0) + activities.length
  });
  
  // Mark activities as processed
  const now = new Date().toISOString();
  await Promise.all(
    activities.map(a => 
      base44.asServiceRole.entities.UserActivity.update(a.id, {
        is_processed: true,
        processed_date: now
      })
    )
  );
  
  return { 
    success: true, 
    activitiesProcessed: activities.length,
    profileUpdated: true
  };
}

// ========== EXTRACT TIME PATTERNS ==========
function extractTimePatterns(activities) {
  const hourCounts = {};
  const dayCounts = {};
  let totalProductTime = 0;
  let productTimeCount = 0;
  let totalPostTime = 0;
  let postTimeCount = 0;
  
  activities.forEach(a => {
    // Hour patterns
    if (a.hour_of_day !== undefined) {
      hourCounts[a.hour_of_day] = (hourCounts[a.hour_of_day] || 0) + 1;
    }
    
    // Day patterns
    if (a.day_of_week !== undefined) {
      dayCounts[a.day_of_week] = (dayCounts[a.day_of_week] || 0) + 1;
    }
    
    // Time on content
    if (a.duration_seconds && a.event_type === 'product_view') {
      totalProductTime += a.duration_seconds;
      productTimeCount++;
    }
    if (a.duration_seconds && a.event_type === 'post_view') {
      totalPostTime += a.duration_seconds;
      postTimeCount++;
    }
  });
  
  // Find top hours and days
  const preferredHours = Object.entries(hourCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour]) => parseInt(hour));
    
  const preferredDays = Object.entries(dayCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => parseInt(day));
  
  return {
    preferred_hours: preferredHours,
    preferred_days: preferredDays,
    avg_time_on_product: productTimeCount > 0 ? Math.round(totalProductTime / productTimeCount) : null,
    avg_time_on_post: postTimeCount > 0 ? Math.round(totalPostTime / postTimeCount) : null
  };
}

// ========== DETECT BEHAVIORAL PATTERNS ==========
function detectBehavioralPatterns(activities) {
  const patterns = [];
  
  // Sequence analysis
  const sequences = [];
  let currentSequence = [];
  let lastSession = null;
  
  activities.forEach(a => {
    if (a.session_id !== lastSession && currentSequence.length > 0) {
      sequences.push(currentSequence);
      currentSequence = [];
    }
    currentSequence.push(a.event_type);
    lastSession = a.session_id;
  });
  if (currentSequence.length > 0) sequences.push(currentSequence);
  
  // Detect patterns
  let browseCartBuyCount = 0;
  let browseOnlyCount = 0;
  let directBuyCount = 0;
  
  sequences.forEach(seq => {
    const hasView = seq.includes('product_view');
    const hasCart = seq.includes('product_add_to_cart');
    const hasBuy = seq.includes('product_purchase');
    
    if (hasView && hasCart && hasBuy) browseCartBuyCount++;
    else if (hasView && !hasCart && !hasBuy) browseOnlyCount++;
    else if (hasBuy && seq.indexOf('product_purchase') < 3) directBuyCount++;
  });
  
  if (browseCartBuyCount > 0) patterns.push('browse_then_buy');
  if (browseOnlyCount > sequences.length * 0.7) patterns.push('window_shopper');
  if (directBuyCount > 0) patterns.push('decisive_buyer');
  
  // Time-based patterns
  const hourCounts = activities.reduce((acc, a) => {
    if (a.hour_of_day !== undefined) {
      acc[a.hour_of_day] = (acc[a.hour_of_day] || 0) + 1;
    }
    return acc;
  }, {});
  
  const morningCount = Object.entries(hourCounts)
    .filter(([h]) => parseInt(h) >= 6 && parseInt(h) < 12)
    .reduce((sum, [, c]) => sum + c, 0);
    
  const eveningCount = Object.entries(hourCounts)
    .filter(([h]) => parseInt(h) >= 18 && parseInt(h) < 23)
    .reduce((sum, [, c]) => sum + c, 0);
    
  const lateNightCount = Object.entries(hourCounts)
    .filter(([h]) => parseInt(h) >= 23 || parseInt(h) < 6)
    .reduce((sum, [, c]) => sum + c, 0);
  
  const totalTimeActivities = morningCount + eveningCount + lateNightCount;
  if (totalTimeActivities > 0) {
    if (morningCount / totalTimeActivities > 0.5) patterns.push('morning_shopper');
    if (eveningCount / totalTimeActivities > 0.5) patterns.push('evening_shopper');
    if (lateNightCount / totalTimeActivities > 0.3) patterns.push('night_owl');
  }
  
  // Day patterns
  const weekendActivities = activities.filter(a => a.day_of_week === 0 || a.day_of_week === 6).length;
  if (weekendActivities / activities.length > 0.5) patterns.push('weekend_shopper');
  
  // Engagement patterns
  const cartAbandons = activities.filter(a => a.event_type === 'cart_abandon').length;
  const checkoutStarts = activities.filter(a => a.event_type === 'checkout_start').length;
  if (cartAbandons > 0 && cartAbandons > checkoutStarts) patterns.push('cart_abandoner');
  
  const communityActions = activities.filter(a => 
    ['post_like', 'post_comment', 'post_share', 'post_save'].includes(a.event_type)
  ).length;
  if (communityActions > 5) patterns.push('community_engaged');
  
  const preorderViews = activities.filter(a => 
    ['lot_view', 'preorder_interest'].includes(a.event_type)
  ).length;
  if (preorderViews > 3) patterns.push('preorder_interested');
  
  return patterns;
}

// ========== EXTRACT RECENT SEARCHES ==========
function extractRecentSearches(activities) {
  return activities
    .filter(a => a.event_type === 'search_query' && a.target_name)
    .map(a => a.target_name)
    .slice(-10)
    .reverse();
}

// ========== EXTRACT PRICE INSIGHTS ==========
function extractPriceInsights(activities) {
  const prices = activities
    .filter(a => a.value && ['product_view', 'product_add_to_cart', 'product_purchase'].includes(a.event_type))
    .map(a => a.value);
  
  if (prices.length === 0) return { min: null, max: null, avg: null };
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
  };
}

// ========== AI ANALYSIS ==========
async function analyzeActivitiesWithAI(base44, activities, existingProfile, insights) {
  const summary = buildActivitySummary(activities);
  const behaviorInsights = extractBehaviorInsights(activities, insights);
  
  const prompt = `Phân tích hành vi user e-commerce nông sản organic VN.

PROFILE HIỆN TẠI:
- Segment: ${existingProfile.user_segment || 'new_user'}
- Categories: ${JSON.stringify(existingProfile.preferred_categories || [])}
- Buying: ${existingProfile.buying_tendency}, Engagement: ${existingProfile.engagement_level}
- Persona: ${existingProfile.persona_type || 'unknown'}
- History: ${existingProfile.raw_activity_count || 0} total activities

HOẠT ĐỘNG MỚI (${activities.length}):
${summary}

INSIGHTS TỰ ĐỘNG:
${behaviorInsights}

SEARCHES GẦN ĐÂY: ${insights.recentSearches.slice(0, 5).join(', ') || 'Không có'}
KHOẢNG GIÁ: ${insights.priceInsights.min ? `${insights.priceInsights.min.toLocaleString()}đ - ${insights.priceInsights.max.toLocaleString()}đ (avg: ${insights.priceInsights.avg.toLocaleString()}đ)` : 'Chưa xác định'}
PATTERNS: ${insights.behavioralPatterns.join(', ') || 'Chưa phát hiện'}
THỜI GIAN: Giờ ưa thích: ${insights.timePatterns.preferred_hours?.join(', ') || 'N/A'}, Ngày: ${insights.timePatterns.preferred_days?.map(d => ['CN','T2','T3','T4','T5','T6','T7'][d]).join(', ') || 'N/A'}

YÊU CẦU: Trả về JSON:
1. preferred_categories (array, max 5)
2. interests (array, max 8 - suy luận cụ thể: "yêu thích rau organic", "quan tâm preorder", etc.)
3. buying_tendency (high/medium/low/unknown)
4. engagement_level (highly_active/active/moderate/low/new)
5. user_segment (loyal_buyer/deal_hunter/organic_enthusiast/community_active/browser/new_user/premium_customer/price_sensitive)
6. predicted_intent (ready_to_buy/researching/comparing/browsing/returning/unknown)
7. persona_type (ba_noi_tro/gen_z_organic/professional_busy/health_conscious/family_provider/eco_warrior/value_seeker/quality_first/unknown)
8. sentiment (very_positive/positive/neutral/negative/unknown)
9. personalized_summary (2-3 câu mô tả user CHI TIẾT, giúp AI chatbot hiểu và tương tác phù hợp)
10. recommended_actions (array, 3-5 gợi ý CỤ THỂ cho chatbot: sản phẩm recommend, cách approach, ưu đãi phù hợp)
11. content_preferences ({likes_organic, likes_deals, likes_new_products, likes_community, likes_preorder, prefers_detailed_info, prefers_visual_content}: boolean)
12. preferred_price_range ({min, max, avg}: number)`;

  try {
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          preferred_categories: { type: "array", items: { type: "string" } },
          interests: { type: "array", items: { type: "string" } },
          buying_tendency: { type: "string" },
          engagement_level: { type: "string" },
          user_segment: { type: "string" },
          predicted_intent: { type: "string" },
          persona_type: { type: "string" },
          sentiment: { type: "string" },
          personalized_summary: { type: "string" },
          recommended_actions: { type: "array", items: { type: "string" } },
          content_preferences: { type: "object" },
          preferred_price_range: { type: "object" }
        }
      }
    });
    
    const stats = calculateActivityStats(activities, existingProfile.activity_stats || {});
    const favorites = calculateFavoriteProducts(activities, existingProfile.favorite_products || []);
    const conversionMetrics = calculateConversionMetrics(activities, existingProfile.conversion_metrics || {});
    
    return { ...result, activity_stats: stats, favorite_products: favorites, conversion_metrics: conversionMetrics };
  } catch (error) {
    console.error('LLM failed:', error);
    return fallbackAnalysis(activities, existingProfile, insights);
  }
}

// ========== BUILD AI-READABLE CONTEXT ==========
function buildAIReadableContext(analysis, profile) {
  const parts = [];
  
  // Segment & intent
  parts.push(`[${analysis.user_segment || 'new_user'}]`);
  if (analysis.predicted_intent && analysis.predicted_intent !== 'unknown') {
    parts.push(`Intent:${analysis.predicted_intent}`);
  }
  if (analysis.persona_type && analysis.persona_type !== 'unknown') {
    parts.push(`Persona:${analysis.persona_type}`);
  }
  
  // Behavior
  parts.push(`Buy:${analysis.buying_tendency || 'unknown'}`);
  parts.push(`Engage:${analysis.engagement_level || 'new'}`);
  
  // Preferences
  if (analysis.preferred_categories?.length > 0) {
    parts.push(`Cats:[${analysis.preferred_categories.slice(0, 3).join(',')}]`);
  }
  
  if (analysis.preferred_price_range?.avg) {
    parts.push(`Price:${Math.round(analysis.preferred_price_range.avg / 1000)}k`);
  }
  
  // Recent activity
  if (profile.recent_searches?.length > 0) {
    parts.push(`Search:[${profile.recent_searches.slice(0, 2).join(',')}]`);
  }
  
  // Recommendations
  if (analysis.recommended_actions?.length > 0) {
    parts.push(`Actions:[${analysis.recommended_actions.slice(0, 2).join(',')}]`);
  }
  
  return parts.join(' | ');
}

// ========== EXTRACT BEHAVIOR INSIGHTS FOR PROMPT ==========
function extractBehaviorInsights(activities, additionalInsights) {
  const insights = [];
  
  const typeCounts = {};
  const categories = {};
  
  activities.forEach(a => {
    typeCounts[a.event_type] = (typeCounts[a.event_type] || 0) + 1;
    if (a.target_category) categories[a.target_category] = (categories[a.target_category] || 0) + 1;
  });
  
  // Conversion funnel
  const views = typeCounts['product_view'] || 0;
  const carts = typeCounts['product_add_to_cart'] || 0;
  const purchases = typeCounts['product_purchase'] || 0;
  const cartAbandons = typeCounts['cart_abandon'] || 0;
  
  if (views > 0) {
    const cartRate = ((carts / views) * 100).toFixed(1);
    insights.push(`View→Cart: ${cartRate}%`);
    if (carts > 0 && purchases > 0) {
      insights.push(`Cart→Buy: ${((purchases/carts)*100).toFixed(1)}%`);
    }
  }
  
  if (cartAbandons > 0) {
    insights.push(`Cart abandons: ${cartAbandons}x`);
  }
  
  // Content engagement
  const contentExcerpts = activities
    .filter(a => a.content_excerpt)
    .map(a => `${a.event_type}:"${a.content_excerpt.substring(0, 30)}..."`)
    .slice(0, 3);
  
  if (contentExcerpts.length > 0) {
    insights.push(`Content: ${contentExcerpts.join(', ')}`);
  }
  
  // Community
  const communityActions = (typeCounts['post_like'] || 0) + (typeCounts['post_comment'] || 0) + (typeCounts['post_save'] || 0);
  if (communityActions > 0) {
    insights.push(`Community: ${communityActions}x (like/comment/save)`);
  }
  
  // Preorder
  const preorderInterest = (typeCounts['lot_view'] || 0) + (typeCounts['preorder_interest'] || 0);
  if (preorderInterest > 0) {
    insights.push(`Pre-order interest: ${preorderInterest}x`);
  }
  
  // Time engagement
  if (additionalInsights?.timePatterns?.avg_time_on_product) {
    insights.push(`Avg time on product: ${additionalInsights.timePatterns.avg_time_on_product}s`);
  }
  
  return insights.join('\n') || 'Chưa đủ dữ liệu';
}

// ========== BUILD ACTIVITY SUMMARY ==========
function buildActivitySummary(activities) {
  const grouped = {};
  const categories = {};
  
  activities.forEach(a => {
    grouped[a.event_type] = (grouped[a.event_type] || 0) + 1;
    if (a.target_category) {
      categories[a.target_category] = (categories[a.target_category] || 0) + 1;
    }
  });
  
  let summary = '';
  
  const eventLabels = {
    'product_view': 'Xem SP', 'product_add_to_cart': 'Cart', 
    'product_purchase': 'Mua', 'product_add_to_wishlist': 'Wishlist',
    'post_like': 'Like', 'post_comment': 'Comment', 'search_query': 'Search',
    'category_browse': 'Browse cat', 'cart_abandon': 'Cart abandon',
    'checkout_start': 'Checkout start', 'filter_use': 'Filter', 'lot_view': 'Lot view'
  };
  
  Object.entries(grouped).forEach(([type, count]) => {
    const label = eventLabels[type] || type;
    summary += `${label}:${count} | `;
  });
  
  const topCats = Object.entries(categories).sort((a,b) => b[1]-a[1]).slice(0, 5);
  if (topCats.length > 0) {
    summary += '\nCats: ' + topCats.map(([c, n]) => `${c}(${n})`).join(', ');
  }
  
  const products = activities
    .filter(a => a.target_name && a.target_type === 'Product')
    .slice(0, 5)
    .map(a => a.target_name);
  
  if (products.length > 0) {
    summary += '\nSP: ' + products.join(', ');
  }
  
  return summary;
}

// ========== HELPER FUNCTIONS ==========
function calculateActivityStats(activities, existing) {
  const stats = { ...existing };
  activities.forEach(a => {
    if (['product_view', 'post_view', 'lot_view'].includes(a.event_type)) {
      stats.total_views = (stats.total_views || 0) + 1;
    } else if (a.event_type === 'product_purchase') {
      stats.total_purchases = (stats.total_purchases || 0) + 1;
    } else if (a.event_type === 'post_create') {
      stats.total_posts = (stats.total_posts || 0) + 1;
    } else if (a.event_type === 'post_comment') {
      stats.total_comments = (stats.total_comments || 0) + 1;
    } else if (a.event_type === 'post_like') {
      stats.total_likes = (stats.total_likes || 0) + 1;
    } else if (a.event_type === 'search_query') {
      stats.total_searches = (stats.total_searches || 0) + 1;
    } else if (a.event_type === 'product_add_to_cart') {
      stats.total_cart_adds = (stats.total_cart_adds || 0) + 1;
    } else if (a.event_type === 'cart_abandon') {
      stats.total_cart_abandons = (stats.total_cart_abandons || 0) + 1;
    }
  });
  
  // Calculate scroll depth
  const scrollActivities = activities.filter(a => a.scroll_depth_percent);
  if (scrollActivities.length > 0) {
    const avgScroll = scrollActivities.reduce((sum, a) => sum + a.scroll_depth_percent, 0) / scrollActivities.length;
    stats.avg_scroll_depth = existing.avg_scroll_depth
      ? (existing.avg_scroll_depth * 0.7 + avgScroll * 0.3)
      : avgScroll;
  }
  
  // Calculate session duration
  const timeActivities = activities.filter(a => a.duration_seconds);
  if (timeActivities.length > 0) {
    const avgDuration = timeActivities.reduce((sum, a) => sum + a.duration_seconds, 0) / timeActivities.length;
    stats.avg_session_duration = existing.avg_session_duration
      ? (existing.avg_session_duration * 0.7 + avgDuration * 0.3)
      : avgDuration;
  }
  
  return stats;
}

function calculateConversionMetrics(activities, existing) {
  const views = activities.filter(a => a.event_type === 'product_view').length;
  const carts = activities.filter(a => a.event_type === 'product_add_to_cart').length;
  const purchases = activities.filter(a => a.event_type === 'product_purchase');
  const cartAbandons = activities.filter(a => a.event_type === 'cart_abandon').length;
  
  const metrics = { ...existing };
  
  if (views > 0) {
    const newViewToCart = (carts / views);
    metrics.view_to_cart_rate = existing.view_to_cart_rate 
      ? (existing.view_to_cart_rate * 0.7 + newViewToCart * 0.3)
      : newViewToCart;
  }
  
  if (carts > 0) {
    const newCartToPurchase = (purchases.length / carts);
    metrics.cart_to_purchase_rate = existing.cart_to_purchase_rate
      ? (existing.cart_to_purchase_rate * 0.7 + newCartToPurchase * 0.3)
      : newCartToPurchase;
      
    const newAbandonRate = cartAbandons / carts;
    metrics.cart_abandon_rate = existing.cart_abandon_rate
      ? (existing.cart_abandon_rate * 0.7 + newAbandonRate * 0.3)
      : newAbandonRate;
  }
  
  if (purchases.length > 0) {
    const totalValue = purchases.reduce((sum, p) => sum + (p.value || 0), 0);
    const avgValue = totalValue / purchases.length;
    metrics.avg_order_value = existing.avg_order_value
      ? (existing.avg_order_value * 0.6 + avgValue * 0.4)
      : avgValue;
    metrics.last_purchase_date = new Date().toISOString();
    
    // Calculate purchase frequency
    if (existing.last_purchase_date) {
      const daysSinceLastPurchase = Math.round(
        (Date.now() - new Date(existing.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24)
      );
      metrics.purchase_frequency_days = existing.purchase_frequency_days
        ? Math.round((existing.purchase_frequency_days + daysSinceLastPurchase) / 2)
        : daysSinceLastPurchase;
    }
  }
  
  return metrics;
}

function calculateFavoriteProducts(activities, existing) {
  const scores = {};
  const weights = { 
    'product_view': 1, 
    'product_add_to_cart': 5, 
    'product_add_to_wishlist': 8, 
    'product_purchase': 15, 
    'product_review': 10, 
    'lot_view': 2, 
    'preorder_interest': 12 
  };
  const now = Date.now();
  
  activities.forEach(a => {
    if (a.target_id && weights[a.event_type]) {
      if (!scores[a.target_id]) {
        scores[a.target_id] = { 
          id: a.target_id, 
          name: a.target_name || a.target_id, 
          score: 0, 
          category: a.target_category 
        };
      }
      
      const activityAge = (now - new Date(a.created_date).getTime()) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.pow(0.5, activityAge / CONFIG.DECAY_HALF_LIFE_DAYS);
      
      scores[a.target_id].score += weights[a.event_type] * decayFactor;
    }
  });
  
  existing.forEach(f => {
    if (scores[f.id]) {
      scores[f.id].score += f.score * 0.3;
    } else {
      scores[f.id] = { ...f, score: f.score * 0.3 };
    }
  });
  
  return Object.values(scores).sort((a,b) => b.score - a.score).slice(0, 15);
}

function fallbackAnalysis(activities, profile, insights) {
  const categories = {};
  activities.forEach(a => {
    if (a.target_category) categories[a.target_category] = (categories[a.target_category] || 0) + 1;
  });
  
  const topCats = Object.entries(categories).sort((a,b) => b[1]-a[1]).slice(0, 5).map(([c]) => c);
  const merged = [...new Set([...topCats, ...(profile.preferred_categories || [])])].slice(0, 5);
  
  let engagement = profile.engagement_level || 'new';
  if (activities.length > 20) engagement = 'highly_active';
  else if (activities.length > 10) engagement = 'active';
  else if (activities.length > 5) engagement = 'moderate';
  
  const purchases = activities.filter(a => a.event_type === 'product_purchase').length;
  const carts = activities.filter(a => a.event_type === 'product_add_to_cart').length;
  const communityActions = activities.filter(a => ['post_like', 'post_comment', 'post_save'].includes(a.event_type)).length;
  const preorderViews = activities.filter(a => ['lot_view', 'preorder_interest'].includes(a.event_type)).length;
  
  let buying = profile.buying_tendency || 'unknown';
  if (purchases > 0) buying = 'high';
  else if (carts > 2) buying = 'medium';
  else if (carts > 0) buying = 'low';
  
  // Segment
  let segment = profile.user_segment || 'new_user';
  if (purchases > 2) segment = 'loyal_buyer';
  else if (communityActions > 5) segment = 'community_active';
  else if (preorderViews > 3) segment = 'organic_enthusiast';
  else if (activities.length > 15 && purchases === 0) segment = 'browser';
  
  // Intent
  let intent = 'unknown';
  const recentCarts = activities.slice(-10).filter(a => a.event_type === 'product_add_to_cart').length;
  if (recentCarts > 0) intent = 'ready_to_buy';
  else if (activities.slice(-10).some(a => a.event_type === 'search_query')) intent = 'researching';
  
  // Persona
  let persona = profile.persona_type || 'unknown';
  if (insights.priceInsights.avg && insights.priceInsights.avg < 100000) persona = 'value_seeker';
  else if (preorderViews > 0) persona = 'eco_warrior';
  
  return {
    preferred_categories: merged,
    interests: profile.interests || [],
    buying_tendency: buying,
    engagement_level: engagement,
    user_segment: segment,
    predicted_intent: intent,
    persona_type: persona,
    sentiment: profile.sentiment || 'neutral',
    personalized_summary: `User ${segment} với ${activities.length} hoạt động. ${buying === 'high' ? 'Khách hàng có xu hướng mua cao.' : ''} ${communityActions > 0 ? 'Tích cực trong cộng đồng.' : ''}`,
    recommended_actions: profile.recommended_actions || [],
    content_preferences: {
      ...profile.content_preferences,
      likes_community: communityActions > 0,
      likes_preorder: preorderViews > 0
    },
    preferred_price_range: insights.priceInsights,
    activity_stats: calculateActivityStats(activities, profile.activity_stats || {}),
    favorite_products: calculateFavoriteProducts(activities, profile.favorite_products || []),
    conversion_metrics: calculateConversionMetrics(activities, profile.conversion_metrics || {})
  };
}

// ========== CLEANUP ==========
async function cleanupOldActivities(base44) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CONFIG.CLEANUP_AFTER_DAYS);
  
  const oldActivities = await base44.asServiceRole.entities.UserActivity.filter(
    { is_processed: true },
    'created_date',
    500
  );
  
  const toDelete = oldActivities.filter(a => new Date(a.created_date) < cutoffDate);
  
  if (toDelete.length === 0) {
    return { deleted: 0, message: 'No old activities to cleanup' };
  }
  
  await Promise.all(toDelete.map(a => base44.asServiceRole.entities.UserActivity.delete(a.id)));
  
  return { deleted: toDelete.length };
}
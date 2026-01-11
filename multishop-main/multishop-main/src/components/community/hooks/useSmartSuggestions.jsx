import { useMemo } from 'react';

/**
 * useSmartSuggestions Hook
 * Suggest related posts based on current post's tags/category
 */
export function useSmartSuggestions(allPosts, currentPost, limit = 5) {
  return useMemo(() => {
    if (!currentPost || !allPosts?.length) return [];

    const currentData = currentPost.data || currentPost;
    const currentTags = currentData.tags || [];
    const currentCategory = currentData.category;

    // Score posts based on similarity
    const scoredPosts = allPosts
      .filter(post => post.id !== currentPost.id)
      .map(post => {
        const postData = post.data || post;
        let score = 0;

        // Category match (highest weight)
        if (postData.category === currentCategory) {
          score += 10;
        }

        // Tag matches
        const postTags = postData.tags || [];
        const commonTags = postTags.filter(tag => currentTags.includes(tag));
        score += commonTags.length * 5;

        // Engagement score
        const engagement = (postData.engagement_score || 0) / 100;
        score += engagement;

        // Recency bonus (newer posts get slight boost)
        const daysSince = (Date.now() - new Date(post.created_date)) / (1000 * 60 * 60 * 24);
        if (daysSince < 7) score += 2;
        if (daysSince < 3) score += 1;

        return { post, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.post);

    return scoredPosts;
  }, [allPosts, currentPost, limit]);
}
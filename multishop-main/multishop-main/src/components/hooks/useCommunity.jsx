import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useCommunityPosts() {
  return useQuery({
    queryKey: ['user-posts'],
    queryFn: async () => {
      const result = await base44.entities.UserPost.list('-created_date', 100);
      return result || [];
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return null;
      return base44.auth.me();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    throwOnError: false
  });
}

export function useFilteredPosts(posts, filter, sortBy, currentUser) {
  return useMemo(() => {
    if (!posts || posts.length === 0) return [];

    let filtered = posts.filter(p => {
      const data = p.data || p;
      const statusCheck = !data.status || data.status === 'active' || data.status === 'published';
      return statusCheck;
    });

    if (filter === 'my-posts' && currentUser) {
      filtered = filtered.filter(p => p.created_by === currentUser.email);
    }

    filtered.sort((a, b) => {
      const aData = a.data || a;
      const bData = b.data || b;
      
      if (aData.is_pinned && !bData.is_pinned) return -1;
      if (!aData.is_pinned && bData.is_pinned) return 1;
      
      if (sortBy === 'trending') {
        return (bData.engagement_score || 0) - (aData.engagement_score || 0);
      } else if (sortBy === 'popular') {
        return (bData.likes_count || 0) - (aData.likes_count || 0);
      } else {
        return new Date(b.created_date) - new Date(a.created_date);
      }
    });

    return filtered;
  }, [posts, filter, sortBy, currentUser]);
}

export function useCommunityStats(filteredPosts) {
  return useMemo(() => ({
    total: filteredPosts.length,
    totalEngagement: filteredPosts.reduce((sum, p) => sum + ((p.data || p).engagement_score || 0), 0),
    totalViews: filteredPosts.reduce((sum, p) => sum + ((p.data || p).views_count || 0), 0)
  }), [filteredPosts]);
}

export function useInfiniteScroll(hasMore, isLoading, onLoadMore) {
  const loadMoreRef = useRef(null);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.5, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  return loadMoreRef;
}

export function usePaginatedPosts(filteredPosts, filter, sortBy) {
  const [displayCount, setDisplayCount] = useState(5);

  useEffect(() => {
    setDisplayCount(5);
  }, [filter, sortBy]);

  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, displayCount);
  }, [filteredPosts, displayCount]);

  const hasMore = displayCount < filteredPosts.length;

  const loadMore = () => {
    setDisplayCount(prev => Math.min(prev + 5, filteredPosts.length));
  };

  return { displayedPosts, hasMore, loadMore, displayCount };
}
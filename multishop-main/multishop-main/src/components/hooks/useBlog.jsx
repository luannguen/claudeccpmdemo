import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export const blogCategories = [
  { value: "all", label: "Tất Cả", color: "gray" },
  { value: "tin-tuc", label: "Tin Tức", color: "blue" },
  { value: "kien-thuc", label: "Kiến Thức", color: "green" },
  { value: "cong-thuc", label: "Công Thức", color: "purple" },
  { value: "meo-hay", label: "Mẹo Hay", color: "orange" }
];

export function useBlogPosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
    initialData: []
  });
}

export function useFilteredPosts(posts, activeCategory, searchTerm) {
  return useMemo(() => {
    const publishedPosts = (posts || []).filter(p => p.status === 'published');
    let filtered = publishedPosts;

    if (activeCategory !== "all") {
      filtered = filtered.filter(p => p.category === activeCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [posts, activeCategory, searchTerm]);
}

export function useFeaturedPosts(filteredPosts) {
  return useMemo(() => 
    filteredPosts.filter(p => p.featured).slice(0, 3),
    [filteredPosts]
  );
}

export function useRegularPosts(filteredPosts) {
  return useMemo(() => 
    filteredPosts.filter(p => !p.featured),
    [filteredPosts]
  );
}

export function getCategoryColor(category) {
  const cat = blogCategories.find(c => c.value === category);
  return cat?.color || 'gray';
}

export function getCategoryBgClass(color) {
  switch(color) {
    case 'blue': return 'bg-blue-600';
    case 'green': return 'bg-green-600';
    case 'purple': return 'bg-purple-600';
    case 'orange': return 'bg-orange-600';
    default: return 'bg-gray-600';
  }
}

export function getCategoryLabel(category) {
  const cat = blogCategories.find(c => c.value === category);
  return cat?.label || category;
}

export function useBlogPost(postId) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) return null;
      const posts = await base44.entities.Post.list();
      return posts.find(p => p.id === postId);
    },
    enabled: !!postId
  });
}

export function useRelatedPosts(allPosts, currentPost, postId) {
  return useMemo(() => {
    if (!currentPost) return [];
    return (allPosts || [])
      .filter(p => p.status === 'published' && p.id !== postId && p.category === currentPost?.category)
      .slice(0, 3);
  }, [allPosts, currentPost, postId]);
}

export function useUpdateViews(post, postId) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => {
      const currentViews = post?.views || 0;
      return base44.entities.Post.update(id, { views: currentViews + 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['post', postId]);
      queryClient.invalidateQueries(['posts']);
    }
  });
}
import { useMemo, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useAdminCommunityPosts() {
  return useQuery({
    queryKey: ['admin-community-posts'],
    queryFn: async () => {
      const result = await base44.entities.UserPost.list('-created_date', 500);
      return result || [];
    },
    staleTime: 2 * 60 * 1000
  });
}

export function useCommunityMutations() {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-community-posts'] });
    queryClient.invalidateQueries({ queryKey: ['user-posts'] });
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.UserPost.update(id, { status }),
    onSuccess: invalidateQueries
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.UserPost.delete(id),
    onSuccess: invalidateQueries
  });

  return { updateStatusMutation, deleteMutation };
}

export function useFilteredCommunityPosts(posts, { searchTerm, statusFilter, dateFilter, engagementFilter }) {
  return useMemo(() => {
    let filtered = posts;

    if (searchTerm) {
      filtered = filtered.filter(post => {
        const data = post.data || post;
        return (
          data.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.author_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.created_by?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.hashtags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(post => (post.data || post).status === statusFilter);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(post => {
        const postDate = new Date(post.created_date);
        const daysDiff = Math.floor((now - postDate) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === "today") return daysDiff === 0;
        if (dateFilter === "week") return daysDiff <= 7;
        if (dateFilter === "month") return daysDiff <= 30;
        return true;
      });
    }

    if (engagementFilter !== "all") {
      filtered = filtered.filter(post => {
        const engagement = (post.data || post).engagement_score || 0;
        if (engagementFilter === "high") return engagement >= 50;
        if (engagementFilter === "medium") return engagement >= 10 && engagement < 50;
        if (engagementFilter === "low") return engagement < 10;
        return true;
      });
    }

    return filtered;
  }, [posts, searchTerm, statusFilter, dateFilter, engagementFilter]);
}

export function useCommunityStats(posts) {
  return useMemo(() => {
    const total = posts.length;
    const active = posts.filter(p => (p.data || p).status === 'active').length;
    const reported = posts.filter(p => (p.data || p).status === 'reported').length;
    const pending = posts.filter(p => (p.data || p).status === 'pending').length;
    const hidden = posts.filter(p => (p.data || p).status === 'hidden').length;
    const totalEngagement = posts.reduce((sum, p) => sum + ((p.data || p).engagement_score || 0), 0);
    const totalReactions = posts.reduce((sum, p) => sum + ((p.data || p).likes_count || 0), 0);
    const avgEngagement = total > 0 ? (totalEngagement / total).toFixed(1) : 0;

    return { total, active, reported, pending, hidden, totalEngagement, totalReactions, avgEngagement };
  }, [posts]);
}

export function useCommunityFilters() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [engagementFilter, setEngagementFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setEngagementFilter('all');
  }, []);

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || dateFilter !== 'all' || engagementFilter !== 'all';

  return {
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    dateFilter, setDateFilter,
    engagementFilter, setEngagementFilter,
    showAdvancedFilters, setShowAdvancedFilters,
    clearFilters, hasActiveFilters
  };
}

export function useExportCommunityData(filteredPosts) {
  return useCallback(() => {
    const csv = [
      ['ID', 'Tác giả', 'Email', 'Nội dung', 'Trạng thái', 'Reactions', 'Comments', 'Shares', 'Engagement', 'Ngày tạo'].join(','),
      ...filteredPosts.map(p => {
        const data = p.data || p;
        return [
          p.id,
          data.author_name,
          p.created_by,
          `"${data.content?.substring(0, 100) || ''}"`,
          data.status,
          data.likes_count || 0,
          data.comments_count || 0,
          data.shares_count || 0,
          data.engagement_score || 0,
          new Date(p.created_date).toLocaleDateString('vi-VN')
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `community-posts-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filteredPosts]);
}
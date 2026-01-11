import React, { useState, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminGuard from "@/components/AdminGuard";

// Hooks
import {
  useAdminCommunityPosts,
  useCommunityMutations,
  useFilteredCommunityPosts,
  useCommunityStats,
  useCommunityFilters,
  useExportCommunityData
} from "@/components/hooks/useAdminCommunity";

// Components
import CommunityHeader from "@/components/admin/community/CommunityHeader";
import CommunityStats from "@/components/admin/community/CommunityStats";
import CommunityFilters from "@/components/admin/community/CommunityFilters";
import CommunityPostCard from "@/components/admin/community/CommunityPostCard";
import CommunityPostDetailModal from "@/components/admin/community/CommunityPostDetailModal";
import CommunityEmptyState from "@/components/admin/community/CommunityEmptyState";
import CommunityLoadingState from "@/components/admin/community/CommunityLoadingState";

function AdminCommunityContent() {
  const [viewingPost, setViewingPost] = useState(null);

  // Data hooks
  const { data: posts = [], isLoading } = useAdminCommunityPosts();
  const { updateStatusMutation, deleteMutation } = useCommunityMutations();
  const filters = useCommunityFilters();
  
  const filteredPosts = useFilteredCommunityPosts(posts, {
    searchTerm: filters.searchTerm,
    statusFilter: filters.statusFilter,
    dateFilter: filters.dateFilter,
    engagementFilter: filters.engagementFilter
  });
  
  const stats = useCommunityStats(posts);
  const exportData = useExportCommunityData(filteredPosts);

  // Handlers
  const handleUpdateStatus = useCallback((id, status) => {
    updateStatusMutation.mutate({ id, status });
  }, [updateStatusMutation]);

  const handleDelete = useCallback((id) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  return (
    <div>
      <CommunityHeader onExport={exportData} />
      
      <CommunityStats stats={stats} />

      <CommunityFilters
        {...filters}
        filteredCount={filteredPosts.length}
        totalCount={stats.total}
      />

      {isLoading ? (
        <CommunityLoadingState />
      ) : filteredPosts.length > 0 ? (
        <div className="space-y-3">
          {filteredPosts.map((post) => (
            <CommunityPostCard
              key={post.id}
              post={post}
              onView={setViewingPost}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <CommunityEmptyState />
      )}

      {viewingPost && (
        <CommunityPostDetailModal
          post={viewingPost}
          onClose={() => setViewingPost(null)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

export default function AdminCommunity() {
  return (
    <AdminGuard requiredRoles={['admin', 'super_admin', 'manager']}>
      <AdminLayout>
        <AdminCommunityContent />
      </AdminLayout>
    </AdminGuard>
  );
}
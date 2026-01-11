import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export const postCategories = [
  { value: "all", label: "Tất cả" },
  { value: "tin-tuc", label: "Tin Tức" },
  { value: "kien-thuc", label: "Kiến Thức" },
  { value: "cong-thuc", label: "Công Thức" },
  { value: "meo-hay", label: "Mẹo Hay" }
];

export const postStatuses = [
  { value: "all", label: "Tất cả" },
  { value: "draft", label: "Nháp" },
  { value: "published", label: "Đã xuất bản" },
  { value: "archived", label: "Lưu trữ" }
];

export function useAdminPosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 100),
    initialData: []
  });
}

export function useFilteredPosts(posts, searchTerm, categoryFilter, statusFilter) {
  return useMemo(() => {
    return (posts || []).filter(post => {
      const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || post.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || post.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [posts, searchTerm, categoryFilter, statusFilter]);
}

export function usePostMutations(onSuccess) {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      onSuccess?.();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Post.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      onSuccess?.();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Post.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['posts'])
  });

  return { createMutation, updateMutation, deleteMutation };
}
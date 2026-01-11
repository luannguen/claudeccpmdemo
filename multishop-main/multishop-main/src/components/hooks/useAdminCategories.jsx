import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const result = await base44.entities.Category.list('display_order', 500);
      return result || [];
    },
    staleTime: 5 * 60 * 1000
  });
}

export function useFilteredCategories(categories, searchTerm) {
  return useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories.filter(cat => 
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.key?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);
}

export function useCategoryMutations(onSuccess) {
  const queryClient = useQueryClient();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    queryClient.invalidateQueries({ queryKey: ['categories-services'] });
    queryClient.invalidateQueries({ queryKey: ['admin-panel-categories'] });
  };

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Category.create(data),
    onSuccess: () => {
      invalidateQueries();
      onSuccess?.();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Category.update(id, data),
    onSuccess: () => {
      invalidateQueries();
      onSuccess?.();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Category.delete(id),
    onSuccess: invalidateQueries
  });

  return { createMutation, updateMutation, deleteMutation };
}

export function useCategoryModalState() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const openCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const openEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return { isModalOpen, editingCategory, openCreate, openEdit, closeModal };
}
/**
 * useFeatureSpecs - Hook quản lý Feature Specs
 * Feature Logic Layer
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/NotificationToast';

const QUERY_KEY = 'feature-specs';

/**
 * Fetch all feature specs
 */
async function fetchSpecs() {
  return base44.entities.FeatureSpec.list('-created_date', 500);
}

/**
 * Main hook for feature specs
 */
export function useFeatureSpecs() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Query
  const { data: specs = [], isLoading, error } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: fetchSpecs,
    staleTime: 30 * 1000 // 30s
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FeatureSpec.create(data),
    onSuccess: (newSpec) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      addToast(`Đã tạo ${newSpec.fcode}`, 'success');
    },
    onError: (err) => {
      addToast('Không thể tạo Feature Spec', 'error');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FeatureSpec.update(id, data),
    onSuccess: (updatedSpec) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      addToast(`Đã cập nhật ${updatedSpec.fcode}`, 'success');
    },
    onError: (err) => {
      addToast('Không thể cập nhật Feature Spec', 'error');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FeatureSpec.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      addToast('Đã xóa Feature Spec', 'success');
    },
    onError: (err) => {
      addToast('Không thể xóa Feature Spec', 'error');
    }
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (spec) => {
      const { id, created_date, updated_date, ...rest } = spec;
      const newFCode = `${spec.fcode}-COPY`;
      return base44.entities.FeatureSpec.create({
        ...rest,
        fcode: newFCode,
        name: `${spec.name} (Copy)`,
        status: 'idea',
        progress: 0
      });
    },
    onSuccess: (newSpec) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      addToast(`Đã nhân bản thành ${newSpec.fcode}`, 'success');
    },
    onError: (err) => {
      addToast('Không thể nhân bản Feature Spec', 'error');
    }
  });

  // Calculate stats
  const stats = {
    total: specs.length,
    inProgress: specs.filter(s => s.status === 'in_progress' || s.status === 'code_review').length,
    testing: specs.filter(s => s.status === 'testing' || s.status === 'staged').length,
    released: specs.filter(s => s.status === 'released').length,
    byModule: specs.reduce((acc, s) => {
      acc[s.module] = (acc[s.module] || 0) + 1;
      return acc;
    }, {}),
    byPriority: specs.reduce((acc, s) => {
      acc[s.priority] = (acc[s.priority] || 0) + 1;
      return acc;
    }, {})
  };

  return {
    specs,
    isLoading,
    error,
    stats,
    createSpec: createMutation.mutateAsync,
    updateSpec: updateMutation.mutateAsync,
    deleteSpec: deleteMutation.mutateAsync,
    duplicateSpec: duplicateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending
  };
}

/**
 * Filter specs
 */
export function filterSpecs(specs, filters) {
  return specs.filter(spec => {
    // Search
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchSearch = 
        spec.fcode?.toLowerCase().includes(search) ||
        spec.name?.toLowerCase().includes(search) ||
        spec.short_description?.toLowerCase().includes(search) ||
        spec.tags?.some(t => t.toLowerCase().includes(search));
      if (!matchSearch) return false;
    }

    // Status
    if (filters.status && filters.status !== 'all') {
      if (spec.status !== filters.status) return false;
    }

    // Priority
    if (filters.priority && filters.priority !== 'all') {
      if (spec.priority !== filters.priority) return false;
    }

    // Module
    if (filters.module && filters.module !== 'all') {
      if (spec.module !== filters.module) return false;
    }

    // Type
    if (filters.type && filters.type !== 'all') {
      if (spec.type !== filters.type) return false;
    }

    return true;
  });
}

export default useFeatureSpecs;
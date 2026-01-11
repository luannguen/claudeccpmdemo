/**
 * useDesignDocs - Hook quản lý Design System Documents
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useDesignDocs() {
  const queryClient = useQueryClient();

  // List all docs
  const { data: docs = [], isLoading, error } = useQuery({
    queryKey: ['design-docs'],
    queryFn: () => base44.entities.DesignDoc.list('priority', 100),
    staleTime: 30 * 1000
  });

  // Create doc
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.DesignDoc.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['design-docs'] })
  });

  // Update doc
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.DesignDoc.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['design-docs'] })
  });

  // Delete doc
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.DesignDoc.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['design-docs'] })
  });

  // Stats
  const stats = {
    total: docs.length,
    published: docs.filter(d => d.status === 'published').length,
    draft: docs.filter(d => d.status === 'draft').length,
    review: docs.filter(d => d.status === 'review').length,
    byCategory: docs.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {})
  };

  return {
    docs,
    isLoading,
    error,
    stats,
    createDoc: createMutation.mutateAsync,
    updateDoc: updateMutation.mutateAsync,
    deleteDoc: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}

export const CATEGORY_CONFIG = {
  rules: { label: 'UI/UX Rules', icon: 'FileText', color: 'violet' },
  tokens: { label: 'Design Tokens', icon: 'Sliders', color: 'blue' },
  components: { label: 'Component Specs', icon: 'Package', color: 'green' },
  patterns: { label: 'UI Patterns', icon: 'Grid', color: 'amber' },
  flows: { label: 'UX Flows', icon: 'ArrowRight', color: 'pink' },
  architecture: { label: 'Info Architecture', icon: 'Layers', color: 'cyan' },
  states: { label: 'UI States', icon: 'Activity', color: 'orange' },
  mapping: { label: 'Data to UI', icon: 'Database', color: 'indigo' },
  naming: { label: 'Naming Convention', icon: 'Tag', color: 'teal' },
  changelog: { label: 'Design Changelog', icon: 'Clock', color: 'gray' }
};

export const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'gray' },
  review: { label: 'In Review', color: 'amber' },
  published: { label: 'Published', color: 'green' },
  deprecated: { label: 'Deprecated', color: 'red' }
};
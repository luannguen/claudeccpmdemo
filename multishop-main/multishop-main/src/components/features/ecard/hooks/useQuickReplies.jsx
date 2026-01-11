/**
 * useQuickReplies Hook
 * Feature Layer - Manages quick reply templates
 * 
 * @module features/ecard/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { quickReplyRepository } from '../data/quickReplyRepository';

const STALE_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Hook for quick reply templates
 */
export function useQuickReplies() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Get all templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['quick-replies', user?.email],
    queryFn: () => quickReplyRepository.getTemplates(user?.email),
    enabled: !!user?.email,
    staleTime: STALE_TIME
  });
  
  // Filter by category
  const getByCategory = (category) => {
    return templates.filter(t => t.category === category);
  };
  
  // Create template mutation
  const createMutation = useMutation({
    mutationFn: (data) => quickReplyRepository.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
    }
  });
  
  // Update template mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => quickReplyRepository.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
    }
  });
  
  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: (templateId) => quickReplyRepository.deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies'] });
    }
  });
  
  // Use template (increments count and returns content)
  const useTemplate = async (template) => {
    // Increment use count in background
    if (!template.id.startsWith('system_')) {
      quickReplyRepository.incrementUseCount(template.id);
    }
    return template.content;
  };
  
  // Categories with counts
  const categoryCounts = {
    all: templates.length,
    greeting: templates.filter(t => t.category === 'greeting').length,
    thanks: templates.filter(t => t.category === 'thanks').length,
    follow_up: templates.filter(t => t.category === 'follow_up').length,
    birthday: templates.filter(t => t.category === 'birthday').length,
    custom: templates.filter(t => t.category === 'custom').length
  };
  
  return {
    templates,
    isLoading,
    getByCategory,
    categoryCounts,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    useTemplate,
    isCreating: createMutation.isPending
  };
}

export default useQuickReplies;
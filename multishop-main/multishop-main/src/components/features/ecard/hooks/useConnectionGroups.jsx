/**
 * useConnectionGroups - Hook for managing connection groups
 * Feature logic layer
 * 
 * @module features/ecard/hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/AuthProvider';
import { connectionGroupRepository } from '../data/connectionGroupRepository';
import { useToast } from '@/components/NotificationToast';

/**
 * Hook to manage connection groups
 */
export function useConnectionGroups() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch all groups
  const { data: groups, isLoading } = useQuery({
    queryKey: ['connection-groups', user?.email],
    queryFn: () => connectionGroupRepository.getGroups(),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Create group mutation
  const createGroupMutation = useMutation({
    mutationFn: ({ name, color, icon, description }) =>
      connectionGroupRepository.createGroup(name, color, icon, description),
    onSuccess: (_, { name }) => {
      queryClient.invalidateQueries({ queryKey: ['connection-groups'] });
      addToast(`Đã tạo nhóm "${name}"`, 'success');
    },
    onError: () => {
      addToast('Không thể tạo nhóm', 'error');
    }
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: ({ groupId, updates }) =>
      connectionGroupRepository.updateGroup(groupId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-groups'] });
      addToast('Đã cập nhật nhóm', 'success');
    },
    onError: () => {
      addToast('Không thể cập nhật nhóm', 'error');
    }
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: (groupId) => connectionGroupRepository.deleteGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-groups'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      addToast('Đã xóa nhóm', 'success');
    },
    onError: () => {
      addToast('Không thể xóa nhóm', 'error');
    }
  });

  // Add connection to group mutation
  const addToGroupMutation = useMutation({
    mutationFn: ({ connectionId, groupId }) =>
      connectionGroupRepository.addConnectionToGroup(connectionId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-groups'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      addToast('Đã thêm vào nhóm', 'success');
    }
  });

  // Remove connection from group mutation
  const removeFromGroupMutation = useMutation({
    mutationFn: ({ connectionId, groupId }) =>
      connectionGroupRepository.removeConnectionFromGroup(connectionId, groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-groups'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      addToast('Đã xóa khỏi nhóm', 'success');
    }
  });

  // Bulk add to group
  const bulkAddToGroupMutation = useMutation({
    mutationFn: ({ connectionIds, groupId }) =>
      connectionGroupRepository.bulkAddToGroup(connectionIds, groupId),
    onSuccess: (_, { connectionIds }) => {
      queryClient.invalidateQueries({ queryKey: ['connection-groups'] });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      addToast(`Đã thêm ${connectionIds.length} liên hệ vào nhóm`, 'success');
    }
  });

  return {
    groups: groups || [],
    isLoading,
    createGroup: (name, color, icon, description) =>
      createGroupMutation.mutate({ name, color, icon, description }),
    updateGroup: (groupId, updates) =>
      updateGroupMutation.mutate({ groupId, updates }),
    deleteGroup: deleteGroupMutation.mutate,
    addToGroup: (connectionId, groupId) =>
      addToGroupMutation.mutate({ connectionId, groupId }),
    removeFromGroup: (connectionId, groupId) =>
      removeFromGroupMutation.mutate({ connectionId, groupId }),
    bulkAddToGroup: (connectionIds, groupId) =>
      bulkAddToGroupMutation.mutate({ connectionIds, groupId }),
    isMutating: createGroupMutation.isPending || 
                updateGroupMutation.isPending || 
                deleteGroupMutation.isPending ||
                addToGroupMutation.isPending
  };
}
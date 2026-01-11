/**
 * useFeatures Hook
 * 
 * Hook quản lý tính năng hệ thống.
 * Tuân thủ kiến trúc 3 lớp theo AI-CODING-RULES.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { featureService } from "@/components/services/featureService";
import { featureTestingService } from "@/components/services/testerService";
import { showAdminAlert } from "@/components/AdminAlert";

// ========== QUERY KEYS ==========
const QUERY_KEYS = {
  features: ['features'],
  featureStats: ['feature-stats'],
  feature: (id) => ['feature', id]
};

// ========== LIST HOOK ==========
export function useFeatureList() {
  return useQuery({
    queryKey: QUERY_KEYS.features,
    queryFn: async () => {
      const result = await featureService.list();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    staleTime: 30000
  });
}

// ========== STATS HOOK ==========
export function useFeatureStats() {
  return useQuery({
    queryKey: QUERY_KEYS.featureStats,
    queryFn: async () => {
      const result = await featureService.getStats();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    staleTime: 30000
  });
}

// ========== DETAIL HOOK ==========
export function useFeatureDetail(id) {
  return useQuery({
    queryKey: QUERY_KEYS.feature(id),
    queryFn: async () => {
      if (!id) return null;
      const result = await featureService.getById(id);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!id,
    staleTime: 30000
  });
}

// ========== MUTATIONS HOOK ==========
export function useFeatureMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const result = await featureService.create(data);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureStats });
      showAdminAlert('✅ Đã tạo tính năng mới', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const result = await featureService.update(id, data);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feature(data.id) });
      showAdminAlert('✅ Đã cập nhật tính năng', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const result = await featureService.delete(id);
      if (!result.success) throw new Error(result.message);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureStats });
      showAdminAlert('✅ Đã xóa tính năng', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const updateTestCaseMutation = useMutation({
    mutationFn: async ({ featureId, testCaseId, status }) => {
      const result = await featureService.updateTestCase(featureId, testCaseId, status);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureStats });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.feature(data.id) });
    }
  });

  const generatePublicLinkMutation = useMutation({
    mutationFn: async (featureId) => {
      const result = await featureService.generatePublicLink(featureId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      showAdminAlert('✅ Đã tạo public link', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const revokePublicLinkMutation = useMutation({
    mutationFn: async (featureId) => {
      const result = await featureService.revokePublicLink(featureId);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      showAdminAlert('✅ Đã hủy public link', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  // ========== BULK MUTATIONS ==========
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }) => {
      const promises = ids.map(id => featureService.update(id, { status }));
      await Promise.all(promises);
      return { count: ids.length, status };
    },
    onSuccess: ({ count, status }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureStats });
      showAdminAlert(`✅ Đã cập nhật trạng thái cho ${count} tính năng`, 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const bulkUpdatePriorityMutation = useMutation({
    mutationFn: async ({ ids, priority }) => {
      const promises = ids.map(id => featureService.update(id, { priority }));
      await Promise.all(promises);
      return { count: ids.length };
    },
    onSuccess: ({ count }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      showAdminAlert(`✅ Đã cập nhật độ ưu tiên cho ${count} tính năng`, 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const bulkUpdateCategoryMutation = useMutation({
    mutationFn: async ({ ids, category }) => {
      const promises = ids.map(id => featureService.update(id, { category }));
      await Promise.all(promises);
      return { count: ids.length };
    },
    onSuccess: ({ count }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureStats });
      showAdminAlert(`✅ Đã cập nhật danh mục cho ${count} tính năng`, 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      // Sequential delete để đảm bảo cascade cleanup cho mỗi feature
      const results = [];
      for (const id of ids) {
        const result = await featureService.delete(id);
        results.push({ id, success: result.success, message: result.message });
      }
      
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      
      if (failedCount > 0) {
        throw new Error(`Đã xóa ${successCount} tính năng, ${failedCount} thất bại`);
      }
      
      return { count: successCount };
    },
    onSuccess: ({ count }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureStats });
      showAdminAlert(`✅ Đã xóa ${count} tính năng và dữ liệu liên quan`, 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ ' + error.message, 'error');
    }
  });

  const bulkGenerateLinksMutation = useMutation({
    mutationFn: async (ids) => {
      const promises = ids.map(id => featureService.generatePublicLink(id));
      await Promise.all(promises);
      return { count: ids.length };
    },
    onSuccess: ({ count }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      showAdminAlert(`✅ Đã tạo public link cho ${count} tính năng`, 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  const bulkRevokeLinksMutation = useMutation({
    mutationFn: async (ids) => {
      const promises = ids.map(id => featureService.revokePublicLink(id));
      await Promise.all(promises);
      return { count: ids.length };
    },
    onSuccess: ({ count }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      showAdminAlert(`✅ Đã hủy public link của ${count} tính năng`, 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  return {
    createFeature: createMutation.mutateAsync,
    updateFeature: updateMutation.mutateAsync,
    deleteFeature: deleteMutation.mutateAsync,
    updateTestCase: updateTestCaseMutation.mutateAsync,
    generatePublicLink: generatePublicLinkMutation.mutateAsync,
    revokePublicLink: revokePublicLinkMutation.mutateAsync,
    // Bulk actions
    bulkUpdateStatus: (ids, status) => bulkUpdateStatusMutation.mutateAsync({ ids, status }),
    bulkUpdatePriority: (ids, priority) => bulkUpdatePriorityMutation.mutateAsync({ ids, priority }),
    bulkUpdateCategory: (ids, category) => bulkUpdateCategoryMutation.mutateAsync({ ids, category }),
    bulkDelete: bulkDeleteMutation.mutateAsync,
    bulkGenerateLinks: bulkGenerateLinksMutation.mutateAsync,
    bulkRevokeLinks: bulkRevokeLinksMutation.mutateAsync,
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isGeneratingLink: generatePublicLinkMutation.isPending,
    isBulkProcessing: bulkUpdateStatusMutation.isPending || 
                      bulkUpdatePriorityMutation.isPending || 
                      bulkUpdateCategoryMutation.isPending ||
                      bulkDeleteMutation.isPending ||
                      bulkGenerateLinksMutation.isPending ||
                      bulkRevokeLinksMutation.isPending
  };
}

// ========== MARK READY FOR RETEST HOOK ==========
export function useMarkReadyForRetest() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ featureId, testCaseId, devResponse }) => {
      const result = await featureTestingService.markReadyForRetest(featureId, testCaseId, devResponse);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureStats });
      showAdminAlert('✅ Đã đánh dấu sẵn sàng test lại và thông báo cho tester', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  return {
    markReadyForRetest: mutation.mutateAsync,
    isMarking: mutation.isPending
  };
}

// ========== ASSIGN TESTER HOOK ==========
export function useAssignTester() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ featureId, testCaseId, testerEmail }) => {
      const result = await featureTestingService.assignTesterToTestCase(featureId, testCaseId, testerEmail);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      showAdminAlert('✅ Đã gán tester thành công', 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  return {
    assignTester: mutation.mutateAsync,
    isAssigning: mutation.isPending
  };
}

// ========== BULK ASSIGN TESTER HOOK ==========
export function useBulkAssignTester() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (assignments) => {
      // assignments = [{ featureId, testCaseIds: [], testerEmail }]
      const result = await featureTestingService.bulkAssignTester(assignments);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.features });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureStats });
      const totalAssigned = results.reduce((sum, r) => sum + (r.assignedCount || 0), 0);
      showAdminAlert(`✅ Đã gán ${totalAssigned} test cases thành công`, 'success');
    },
    onError: (error) => {
      showAdminAlert('❌ Lỗi: ' + error.message, 'error');
    }
  });

  return {
    bulkAssignTester: mutation.mutateAsync,
    isBulkAssigning: mutation.isPending
  };
}

// ========== COMBINED HOOK ==========
export function useFeatures() {
  const { data: features = [], isLoading, error } = useFeatureList();
  const { data: stats } = useFeatureStats();
  const mutations = useFeatureMutations();

  return {
    features,
    stats,
    isLoading,
    error,
    ...mutations
  };
}

export default useFeatures;
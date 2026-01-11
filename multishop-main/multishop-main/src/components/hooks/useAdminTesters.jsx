/**
 * useAdminTesters Hook
 * 
 * Hook quản lý testers cho Admin.
 * Tuân thủ kiến trúc 3 lớp theo AI-CODING-RULES.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

// ========== QUERY KEYS ==========
export const ADMIN_TESTER_KEYS = {
  all: ['admin', 'testers'],
  list: () => [...ADMIN_TESTER_KEYS.all, 'list'],
  stats: () => [...ADMIN_TESTER_KEYS.all, 'stats'],
  testResults: () => [...ADMIN_TESTER_KEYS.all, 'testResults'],
};

// ========== TESTERS LIST HOOK ==========
export function useAdminTesterList() {
  return useQuery({
    queryKey: ADMIN_TESTER_KEYS.list(),
    queryFn: async () => {
      const profiles = await base44.entities.TesterProfile.list('-updated_date');
      return profiles;
    },
    staleTime: 30 * 1000
  });
}

// ========== TEST RESULTS OVERVIEW HOOK ==========
export function useAdminTestResults() {
  return useQuery({
    queryKey: ADMIN_TESTER_KEYS.testResults(),
    queryFn: async () => {
      const features = await base44.entities.Feature.list('-updated_date');
      
      // Aggregate test results
      const allTestCases = [];
      const testerStats = {};
      const statusCounts = {
        pending: 0,
        passed: 0,
        failed: 0,
        blocked: 0,
        skipped: 0,
        ready_for_retest: 0
      };
      
      features.forEach(feature => {
        (feature.test_cases || []).forEach(tc => {
          if (!tc?.id) return;
          
          // Add to all test cases
          allTestCases.push({
            ...tc,
            featureId: feature.id,
            featureName: feature.name,
            featureCategory: feature.category,
            featurePriority: feature.priority
          });
          
          // Count by status
          const status = tc.status || 'pending';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
          
          // Aggregate by tester
          const testerEmail = tc.tester_email || tc.assigned_tester;
          if (testerEmail) {
            if (!testerStats[testerEmail]) {
              testerStats[testerEmail] = {
                email: testerEmail,
                name: tc.tester_name || testerEmail,
                total: 0,
                passed: 0,
                failed: 0,
                pending: 0
              };
            }
            testerStats[testerEmail].total++;
            if (tc.status === 'passed') testerStats[testerEmail].passed++;
            else if (tc.status === 'failed') testerStats[testerEmail].failed++;
            else testerStats[testerEmail].pending++;
          }
        });
      });
      
      // Sort test cases by tested_at (most recent first)
      allTestCases.sort((a, b) => {
        const dateA = a.tested_at ? new Date(a.tested_at) : new Date(0);
        const dateB = b.tested_at ? new Date(b.tested_at) : new Date(0);
        return dateB - dateA;
      });
      
      return {
        testCases: allTestCases,
        statusCounts,
        testerStats: Object.values(testerStats),
        total: allTestCases.length,
        testedCount: allTestCases.filter(tc => tc.tested_at).length,
        passRate: allTestCases.length > 0 
          ? Math.round((statusCounts.passed / allTestCases.length) * 100) 
          : 0
      };
    },
    staleTime: 30 * 1000
  });
}

// ========== DELETE TESTER PROFILE ==========
export function useDeleteTesterProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileId) => {
      await base44.entities.TesterProfile.delete(profileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_TESTER_KEYS.all });
    }
  });
}

// ========== COMBINED ADMIN TESTERS HOOK ==========
export function useAdminTesters() {
  const { data: testers = [], isLoading: isLoadingTesters } = useAdminTesterList();
  const { data: testResults, isLoading: isLoadingResults } = useAdminTestResults();
  const { mutateAsync: deleteTester, isPending: isDeleting } = useDeleteTesterProfile();
  
  return {
    testers,
    testResults,
    isLoading: isLoadingTesters || isLoadingResults,
    isDeleting,
    deleteTester
  };
}

export default useAdminTesters;
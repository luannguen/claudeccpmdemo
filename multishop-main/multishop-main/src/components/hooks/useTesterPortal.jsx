/**
 * useTesterPortal Hook
 * 
 * Hook quản lý Tester Portal.
 * Tuân thủ kiến trúc 3 lớp theo AI-CODING-RULES.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { 
  testerProfileService, 
  testerNotificationService, 
  featureTestingService 
} from "@/components/services/testerService";

// ========== QUERY KEYS ==========
const QUERY_KEYS = {
  testerProfile: (email) => ['tester-profile', email],
  testerNotifications: (email) => ['tester-notifications', email],
  assignedFeatures: (email) => ['assigned-features', email],
  featureForTesting: (id) => ['feature-testing', id],
  testerStats: (email) => ['tester-stats', email]
};

// ========== TESTER AUTH HOOK ==========
export function useTesterAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        if (authenticated) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(() => {
    base44.auth.redirectToLogin(window.location.href);
  }, []);

  const logout = useCallback(() => {
    base44.auth.logout();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    testerEmail: user?.email,
    testerName: user?.full_name
  };
}

// ========== TESTER PROFILE HOOK ==========
export function useTesterProfile(email) {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: QUERY_KEYS.testerProfile(email),
    queryFn: async () => {
      if (!email) return null;
      const result = await testerProfileService.getByEmail(email);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!email,
    staleTime: 60000
  });

  const upsertMutation = useMutation({
    mutationFn: async (data) => {
      const result = await testerProfileService.upsert(data);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.testerProfile(email) });
    }
  });

  return {
    profile,
    isLoading,
    upsertProfile: upsertMutation.mutateAsync,
    isUpdating: upsertMutation.isPending
  };
}

// ========== TESTER NOTIFICATIONS HOOK ==========
export function useTesterNotifications(email) {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.testerNotifications(email),
    queryFn: async () => {
      if (!email) return [];
      const result = await testerNotificationService.listByEmail(email);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!email,
    staleTime: 30000,
    refetchInterval: 60000 // Auto refresh mỗi phút
  });

  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.is_read).length
  , [notifications]);

  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      const result = await testerNotificationService.markAsRead(id);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.testerNotifications(email) });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const result = await testerNotificationService.markAllAsRead(email);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.testerNotifications(email) });
    }
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync
  };
}

// ========== FEATURE TESTING HOOK ==========
export function useFeatureTesting(featureId) {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const { data: feature, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.featureForTesting(featureId || token),
    queryFn: async () => {
      let features;
      if (token) {
        features = await base44.entities.Feature.filter({ public_token: token, is_public: true });
      } else if (featureId) {
        features = await base44.entities.Feature.filter({ id: featureId });
      } else {
        throw new Error('Missing feature ID or token');
      }

      if (!features.length) {
        throw new Error('Feature not found or not public');
      }

      return features[0];
    },
    enabled: !!(featureId || token),
    staleTime: 30000
  });

  const submitResultMutation = useMutation({
    mutationFn: async ({ testCaseId, result, testerInfo }) => {
      const response = await featureTestingService.submitTestResult(
        feature.id,
        testCaseId,
        result,
        testerInfo
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureForTesting(featureId || token) });
    }
  });

  const quickBugReportMutation = useMutation({
    mutationFn: async ({ testCaseId, bugData, testerInfo }) => {
      const response = await featureTestingService.quickBugReport(
        feature.id,
        testCaseId,
        bugData,
        testerInfo
      );
      if (!response.success) throw new Error(response.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.featureForTesting(featureId || token) });
    }
  });

  // Test case stats
  const testStats = useMemo(() => {
    const tcs = feature?.test_cases || [];
    return {
      total: tcs.length,
      passed: tcs.filter(tc => tc.status === 'passed').length,
      failed: tcs.filter(tc => tc.status === 'failed').length,
      pending: tcs.filter(tc => tc.status === 'pending').length,
      blocked: tcs.filter(tc => tc.status === 'blocked').length,
      skipped: tcs.filter(tc => tc.status === 'skipped').length,
      ready_for_retest: tcs.filter(tc => tc.status === 'ready_for_retest').length
    };
  }, [feature?.test_cases]);

  return {
    feature,
    testStats,
    isLoading,
    error,
    submitResult: submitResultMutation.mutateAsync,
    quickBugReport: quickBugReportMutation.mutateAsync,
    isSubmitting: submitResultMutation.isPending || quickBugReportMutation.isPending
  };
}

// ========== TESTER DASHBOARD HOOK ==========
export function useTesterDashboard(testerEmail) {
  const { data: assignedFeatures = [], isLoading: isLoadingFeatures } = useQuery({
    queryKey: QUERY_KEYS.assignedFeatures(testerEmail),
    queryFn: async () => {
      if (!testerEmail) return [];
      const result = await featureTestingService.getAssignedFeatures(testerEmail);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!testerEmail,
    staleTime: 30000
  });

  const { data: stats } = useQuery({
    queryKey: QUERY_KEYS.testerStats(testerEmail),
    queryFn: async () => {
      if (!testerEmail) return null;
      const result = await featureTestingService.getTesterStats(testerEmail);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
    enabled: !!testerEmail,
    staleTime: 30000
  });

  // Dashboard metrics
  const dashboardStats = useMemo(() => {
    const myTestCases = [];
    const readyForRetest = [];
    const pendingTests = [];
    const recentlyTested = [];

    assignedFeatures.forEach(f => {
      // Guard: skip if feature has no valid id
      if (!f?.id) return;
      
      // Check if tester is assigned to the whole feature
      const isAssignedToFeature = f.assigned_testers?.includes(testerEmail);
      
      (f.test_cases || []).forEach(tc => {
        // Guard: skip if test case has no valid id
        if (!tc?.id) return;
        
        // Create enriched test case with feature context
        const enrichedTc = { 
          ...tc, 
          featureId: f.id, 
          featureName: f.name || 'Unknown Feature', 
          featureVersion: f.version || '1.0.0' 
        };
        
        // Check if test case is assigned to tester (directly or via feature)
        const isAssignedToTestCase = tc.tester_email === testerEmail || tc.assigned_tester === testerEmail;
        const isMyTestCase = isAssignedToTestCase || isAssignedToFeature;
        
        if (isMyTestCase) {
          myTestCases.push(enrichedTc);
        }
        if (tc.status === 'ready_for_retest' && isMyTestCase) {
          readyForRetest.push(enrichedTc);
        }
        if (tc.status === 'pending' && (isMyTestCase || !tc.assigned_tester)) {
          pendingTests.push(enrichedTc);
        }
        if (tc.tester_email === testerEmail && tc.tested_at) {
          recentlyTested.push(enrichedTc);
        }
      });
    });

    // Sort recently tested by date
    recentlyTested.sort((a, b) => new Date(b.tested_at) - new Date(a.tested_at));

    return {
      myTestCases,
      readyForRetest,
      pendingTests,
      recentlyTested: recentlyTested.slice(0, 20), // Increased to show more history
      totalAssignedFeatures: assignedFeatures.length
    };
  }, [assignedFeatures, testerEmail]);

  return {
    assignedFeatures,
    stats,
    dashboardStats,
    isLoading: isLoadingFeatures
  };
}

// ========== COMBINED HOOK FOR TESTER PORTAL ==========
export function useTesterPortal() {
  const auth = useTesterAuth();
  const profile = useTesterProfile(auth.testerEmail);
  const notifications = useTesterNotifications(auth.testerEmail);
  const dashboard = useTesterDashboard(auth.testerEmail);

  // Auto-create/update profile on login
  useEffect(() => {
    if (auth.isAuthenticated && auth.user && !profile.profile) {
      profile.upsertProfile({
        user_email: auth.user.email,
        display_name: auth.user.full_name
      });
    }
  }, [auth.isAuthenticated, auth.user, profile.profile]);

  return {
    // Auth
    ...auth,
    // Profile
    profile: profile.profile,
    isLoadingProfile: profile.isLoading,
    // Notifications
    notifications: notifications.notifications,
    unreadNotifications: notifications.unreadCount,
    markNotificationAsRead: notifications.markAsRead,
    markAllNotificationsAsRead: notifications.markAllAsRead,
    // Dashboard
    ...dashboard
  };
}

export default useTesterPortal;
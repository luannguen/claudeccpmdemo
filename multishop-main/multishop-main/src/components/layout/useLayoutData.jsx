import { useQuery } from '@tanstack/react-query';
import { base44 } from "@/api/base44Client";
import { hasAdminLevelRole } from "@/components/hooks/useRBACPermissions";

// ✅ Hook lấy thông tin user hiện tại (auth.me() đã bao gồm avatar_url từ User entity)
export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user-layout'],
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return null;
      return base44.auth.me();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    throwOnError: false
  });
}

// ✅ Hook lấy tenant của user (nếu là shop owner)
// Optimized: filter by email thay vì list 500 records
export function useMyTenant(userEmail) {
  return useQuery({
    queryKey: ['my-tenant-layout', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;
      const tenants = await base44.entities.Tenant.filter(
        { owner_email: userEmail },
        '-created_date',
        1
      );
      return tenants[0] || null;
    },
    enabled: !!userEmail,
    staleTime: 10 * 60 * 1000, // 10 phút cache
    gcTime: 15 * 60 * 1000
  });
}

// ✅ Check if user is admin (hỗ trợ Multi-Role RBAC)
export function useIsAdmin(user) {
  return hasAdminLevelRole(user);
}
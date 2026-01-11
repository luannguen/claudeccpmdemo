import React from "react";
import { Navigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/components/AuthProvider";
import { usePermissionCheck } from "@/components/hooks/useAdminNavigation";
import { NoPermissionMessage } from "@/components/admin/PermissionGate";
import { ALL_ADMIN_ROLES, normalizeRoles } from "@/components/hooks/useRBACPermissions";

// Use ALL_ADMIN_ROLES from RBAC permissions (includes all RBAC roles)
const ADMIN_ROLES = ALL_ADMIN_ROLES;

/**
 * AdminGuard - Protect admin routes with role + optional permission check
 * 
 * @param {string[]} requiredRoles - Roles allowed to access
 * @param {string} requiredModule - Module that user must have access to
 * @param {string} requiredPermission - Specific permission required
 */
export default function AdminGuard({ 
  children, 
  requiredRoles = ADMIN_ROLES,
  requiredModule,
  requiredPermission 
}) {
  const { user, isLoading, isAuthenticated, hasRole } = useAuth();
  const { hasPermission, hasModuleAccess } = usePermissionCheck();

  // Show loading ONLY on first app load
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={createPageUrl("AdminLogin")} replace />;
  }

  // Authenticated but no required role
  if (!hasRole(requiredRoles)) {
    return <Navigate to={createPageUrl("AdminLogin")} replace />;
  }

  // ✅ Check module access if specified
  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <NoPermissionMessage module={requiredModule} />
      </div>
    );
  }

  // ✅ Check specific permission if specified
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F3] to-white">
        <NoPermissionMessage module={requiredPermission} />
      </div>
    );
  }

  // All good - render children
  return <>{children}</>;
}

// Hook để sử dụng trong components (backward compatibility)
export function useAdminAuth() {
  const { user, isLoading, hasRole, hasPermission } = useAuth();
  const rbacPermissions = usePermissionCheck();
  
  return { 
    user, 
    isLoading, 
    hasRole, 
    hasPermission,
    // ✅ RBAC permissions from Role entity
    ...rbacPermissions
  };
}
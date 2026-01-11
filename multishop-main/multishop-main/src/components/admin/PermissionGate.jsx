/**
 * PermissionGate - Component to conditionally render based on permissions
 */

import React from "react";
import { usePermissionCheck } from "@/components/hooks/useAdminNavigation";

/**
 * Gate component - only render children if user has permission
 * 
 * @param {string} permission - Permission to check (e.g. 'products.create')
 * @param {string} module - Module to check access (alternative to permission)
 * @param {React.ReactNode} fallback - What to render if no permission
 * @param {React.ReactNode} children - Content to render if has permission
 */
export function PermissionGate({ 
  permission, 
  module, 
  fallback = null, 
  children 
}) {
  const { hasPermission, hasModuleAccess } = usePermissionCheck();

  const hasAccess = permission 
    ? hasPermission(permission)
    : module 
      ? hasModuleAccess(module)
      : true;

  if (!hasAccess) {
    return fallback;
  }

  return <>{children}</>;
}

/**
 * Hook version for conditional logic in components
 */
export function usePermissionGate(permission) {
  const { hasPermission } = usePermissionCheck();
  return hasPermission(permission);
}

/**
 * HOC to wrap components with permission check
 */
export function withPermission(permission, FallbackComponent = null) {
  return function PermissionHOC(WrappedComponent) {
    return function PermissionWrapper(props) {
      const { hasPermission } = usePermissionCheck();
      
      if (!hasPermission(permission)) {
        if (FallbackComponent) return <FallbackComponent />;
        return null;
      }

      return <WrappedComponent {...props} />;
    };
  };
}

/**
 * No Permission fallback component
 */
export function NoPermissionMessage({ module }) {
  return (
    <div className="p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Không có quyền truy cập
      </h3>
      <p className="text-gray-500">
        Bạn không có quyền truy cập {module ? `module ${module}` : 'tính năng này'}.
        <br />
        Vui lòng liên hệ quản trị viên nếu cần.
      </p>
    </div>
  );
}

export default PermissionGate;
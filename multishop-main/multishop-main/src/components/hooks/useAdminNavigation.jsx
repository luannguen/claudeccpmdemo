/**
 * useAdminNavigation - Hook to get filtered navigation based on RBAC
 */

import { useMemo } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useUserRolePermissions, checkPermission, getEffectiveRoles, ROLE_NAME_MAP } from "@/components/hooks/useRBACPermissions";
import { ADMIN_NAV_CONFIG, SUPER_ADMIN_NAV_CONFIG } from "@/components/admin/navigation/adminNavConfig";

/**
 * Filter navigation items based on user permissions
 */
function filterNavItems(items, permissions, isFullAccess) {
  if (isFullAccess) return items;

  return items.filter(item => {
    // Check permission for item
    const hasAccess = item.permission 
      ? checkPermission(permissions, item.permission)
      : true;
    
    if (!hasAccess) return false;

    // Filter subItems if exists
    if (item.subItems) {
      const filteredSubItems = item.subItems.filter(sub => 
        sub.permission ? checkPermission(permissions, sub.permission) : true
      );
      
      // Only show parent if has at least 1 visible subItem
      if (filteredSubItems.length === 0) return false;
      
      item.subItems = filteredSubItems;
    }

    return true;
  });
}

/**
 * Hook to get navigation filtered by RBAC permissions
 * Hỗ trợ Multi-Role Assignment
 */
export function useAdminNavigation() {
  const { user } = useAuth();
  
  // Get effective roles (hỗ trợ cả single role và multi-role)
  // getEffectiveRoles already normalizes, no need to double-normalize
  const effectiveRoles = useMemo(() => {
    return getEffectiveRoles(user);
  }, [user]);
  
  // ALSO pass raw roles to query (for display_name matching in DB)
  const rawRoles = useMemo(() => {
    if (!user) return [];
    if (user.custom_roles && Array.isArray(user.custom_roles) && user.custom_roles.length > 0) {
      return user.custom_roles;
    }
    if (user.custom_role) return [user.custom_role];
    if (user.role) return [user.role];
    return ['user'];
  }, [user]);
  
  // Pass BOTH normalized and raw roles to query (for fallback matching)
  const queryRoles = useMemo(() => {
    const combined = [...new Set([...effectiveRoles, ...rawRoles])];
    return combined;
  }, [effectiveRoles, rawRoles]);
  
  const { data: rbacData, isLoading } = useUserRolePermissions(queryRoles);

  const navigation = useMemo(() => {
    if (!user) return [];
    
    const permissions = rbacData?.permissions || [];
    const isFullAccess = effectiveRoles.includes('admin') || effectiveRoles.includes('super_admin') || permissions.includes('*');
    
    // Filter main navigation
    const filteredNav = ADMIN_NAV_CONFIG.map(section => ({
      ...section,
      items: filterNavItems([...section.items], permissions, isFullAccess)
    })).filter(section => section.items.length > 0);

    // Add Super Admin section if applicable
    if (isFullAccess) {
      filteredNav.push({
        ...SUPER_ADMIN_NAV_CONFIG,
        items: [...SUPER_ADMIN_NAV_CONFIG.items]
      });
    }

    return filteredNav;
  }, [user, effectiveRoles, rbacData]);

  return {
    navigation,
    isLoading,
    permissions: rbacData?.permissions || [],
    accessibleModules: rbacData?.modules || [],
    effectiveRoles,
    rawRoles
  };
}

/**
 * Hook to check if current user has permission
 * Hỗ trợ Multi-Role Assignment
 */
export function usePermissionCheck() {
  const { user } = useAuth();
  
  // Get effective roles (already normalized by getEffectiveRoles)
  const effectiveRoles = useMemo(() => {
    return getEffectiveRoles(user);
  }, [user]);
  
  // ALSO pass raw roles to query (for display_name matching in DB)
  const rawRoles = useMemo(() => {
    if (!user) return [];
    if (user.custom_roles && Array.isArray(user.custom_roles) && user.custom_roles.length > 0) {
      return user.custom_roles;
    }
    if (user.custom_role) return [user.custom_role];
    if (user.role) return [user.role];
    return ['user'];
  }, [user]);
  
  // Pass BOTH normalized and raw roles to query (for fallback matching)
  const queryRoles = useMemo(() => {
    const combined = [...new Set([...effectiveRoles, ...rawRoles])];
    return combined;
  }, [effectiveRoles, rawRoles]);
  
  const { data: rbacData } = useUserRolePermissions(queryRoles);
  
  const hasPermission = (permission) => {
    if (!user) return false;
    if (effectiveRoles.includes('admin') || effectiveRoles.includes('super_admin')) return true;
    return checkPermission(rbacData?.permissions || [], permission);
  };

  const hasModuleAccess = (module) => {
    return hasPermission(`${module}.view`);
  };

  const canCreate = (module) => hasPermission(`${module}.create`);
  const canUpdate = (module) => hasPermission(`${module}.update`);
  const canDelete = (module) => hasPermission(`${module}.delete`);
  const canManage = (module) => hasPermission(`${module}.manage`);

  return {
    hasPermission,
    hasModuleAccess,
    canCreate,
    canUpdate,
    canDelete,
    canManage,
    effectiveRoles,
    rawRoles
  };
}

export default {
  useAdminNavigation,
  usePermissionCheck
};
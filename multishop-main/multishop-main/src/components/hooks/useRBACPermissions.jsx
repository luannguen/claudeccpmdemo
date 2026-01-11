/**
 * useRBACPermissions - Hook for RBAC permission checking
 * Query permissions từ Role entity thay vì hardcode
 */

import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SYSTEM_MODULES } from "@/components/services/rbacService";

/**
 * Lấy permissions của user từ Role entity
 * Hỗ trợ Multi-Role Assignment - union permissions từ nhiều roles
 * 
 * @param {string|string[]} userRoles - Single role (backward compatible) hoặc array of roles
 */
export function useUserRolePermissions(userRoles) {
  // Normalize to array
  const rolesArray = Array.isArray(userRoles) 
    ? userRoles 
    : userRoles ? [userRoles] : [];

  const queryKeyStr = rolesArray.sort().join(',');
  
  return useQuery({
    queryKey: ['rbac-role-permissions', queryKeyStr],
    queryFn: async () => {
      if (rolesArray.length === 0) {
        return { permissions: [], modules: [], roles: [] };
      }
      
      // Admin luôn có full quyền
      if (rolesArray.includes('admin') || rolesArray.includes('super_admin')) {
        return { 
          permissions: ['*'],
          modules: SYSTEM_MODULES.map(m => m.code),
          roles: rolesArray
        };
      }

      // Query all Role entities
      const allRoles = await base44.entities.Role.list('-level', 50);
      
      // Build lookup maps for matching
      const nameMap = {};
      const displayNameMap = {};
      allRoles.forEach(r => {
        nameMap[r.name] = r;
        if (r.display_name) {
          displayNameMap[r.display_name] = r;
        }
      });
      
      // Match roles - try MULTIPLE strategies
      const matchedRoles = [];
      const seenIds = new Set();
      
      rolesArray.forEach(roleName => {
        if (!roleName) return;
        
        let matched = false;
        
        // Strategy 1: Direct name match
        if (nameMap[roleName] && !seenIds.has(nameMap[roleName].id)) {
          matchedRoles.push(nameMap[roleName]);
          seenIds.add(nameMap[roleName].id);
          matched = true;
        }
        
        // Strategy 2: Direct display_name match (Vietnamese)
        if (!matched && displayNameMap[roleName] && !seenIds.has(displayNameMap[roleName].id)) {
          matchedRoles.push(displayNameMap[roleName]);
          seenIds.add(displayNameMap[roleName].id);
          matched = true;
        }
        
        // Strategy 3: ROLE_NAME_MAP normalization (Vietnamese → English)
        if (!matched && ROLE_NAME_MAP[roleName]) {
          const normalizedName = ROLE_NAME_MAP[roleName];
          if (nameMap[normalizedName] && !seenIds.has(nameMap[normalizedName].id)) {
            matchedRoles.push(nameMap[normalizedName]);
            seenIds.add(nameMap[normalizedName].id);
            matched = true;
          }
        }
        
        // Strategy 4: Case-insensitive fuzzy match on name
        if (!matched) {
          const lowerRole = roleName.toLowerCase().trim();
          const fuzzyMatch = allRoles.find(r => 
            !seenIds.has(r.id) && (
              r.name?.toLowerCase() === lowerRole ||
              r.display_name?.toLowerCase() === lowerRole
            )
          );
          if (fuzzyMatch) {
            matchedRoles.push(fuzzyMatch);
            seenIds.add(fuzzyMatch.id);
          }
        }
      });
      
      if (matchedRoles.length === 0) {
        return { permissions: [], modules: [], roles: [] };
      }

      // UNION all permissions from all roles
      const permissionsSet = new Set();
      const modulesSet = new Set();
      
      matchedRoles.forEach(role => {
        if (role.permissions && Array.isArray(role.permissions)) {
          role.permissions.forEach(perm => {
            permissionsSet.add(perm);
            
            if (perm === '*') {
              SYSTEM_MODULES.forEach(m => modulesSet.add(m.code));
            } else {
              const [module] = perm.split('.');
              if (module && SYSTEM_MODULES.find(m => m.code === module)) {
                modulesSet.add(module);
              }
            }
          });
        }
      });

      return {
        permissions: Array.from(permissionsSet),
        modules: Array.from(modulesSet),
        roles: matchedRoles.map(r => r.name),
        rolesData: matchedRoles
      };
    },
    enabled: rolesArray.length > 0,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
    refetchOnMount: true, // Ensure fresh data on mount
    refetchOnWindowFocus: false
  });
}

/**
 * Helper: Get effective roles from user object
 * Hỗ trợ cả custom_role (string) và custom_roles (array)
 * ALWAYS returns NORMALIZED role names (not display_name)
 */
export function getEffectiveRoles(user) {
  if (!user) return [];
  
  let rawRoles = [];
  
  // Ưu tiên custom_roles (array) nếu có
  if (user.custom_roles && Array.isArray(user.custom_roles) && user.custom_roles.length > 0) {
    rawRoles = user.custom_roles;
  }
  // Fallback: custom_role (string)
  else if (user.custom_role) {
    rawRoles = [user.custom_role];
  }
  // Fallback: role (built-in)
  else if (user.role) {
    rawRoles = [user.role];
  }
  else {
    return ['user'];
  }
  
  // ALWAYS normalize roles (display_name → name)
  return rawRoles.map(r => ROLE_NAME_MAP[r] || r);
}

/**
 * ROLE_NAME_MAP - Map display_name sang name
 * Sử dụng khi cần normalize roles đã lưu sai format
 */
export const ROLE_NAME_MAP = {
  // System roles
  'Quản Trị Viên': 'admin',
  'Quản Lý': 'manager',
  'Nhân Viên': 'staff',
  'Kế Toán': 'accountant',
  'Người Dùng': 'user',
  'Chủ Shop': 'owner',
  // New RBAC roles
  'Quản Lý Hệ Thống': 'system_admin',
  'Quản Lý Nhân Sự': 'hr_manager',
  'Quản Lý Bán Hàng': 'sales_manager',
  'Quản Lý Nội Dung': 'content_manager',
  'Quản Lý Test': 'test_manager',
  'Quản Lý Cộng Đồng': 'community_manager',
  'Quản Lý Giao Diện': 'ui_manager',
  'Quản Lý Loyalty': 'loyalty_manager',
  'Quản Lý Lịch Hẹn': 'booking_manager',
  'Nhân Viên Test': 'tester',
  'Biên Tập Viên': 'content_editor',
};

/**
 * ALL_ADMIN_ROLES - Tất cả roles có quyền vào admin
 * Dùng để check xem user có phải admin-level không
 */
export const ALL_ADMIN_ROLES = [
  // Built-in
  'admin', 'super_admin', 'manager', 'staff', 'accountant', 'owner',
  // RBAC roles
  'system_admin', 'hr_manager', 'sales_manager', 'content_manager',
  'test_manager', 'community_manager', 'ui_manager', 'loyalty_manager',
  'booking_manager', 'tester', 'content_editor'
];

/**
 * Normalize một role từ display_name sang name (nếu cần)
 */
export function normalizeRole(role) {
  return ROLE_NAME_MAP[role] || role;
}

/**
 * Normalize array of roles
 */
export function normalizeRoles(roles) {
  if (!roles || !Array.isArray(roles)) return [];
  return roles.map(r => normalizeRole(r));
}

/**
 * Check if user có bất kỳ admin-level role nào
 * Dùng getEffectiveRoles để đảm bảo consistent
 */
export function hasAdminLevelRole(user) {
  if (!user) return false;
  
  // Get all effective roles (đã normalized)
  const effectiveRoles = getEffectiveRoles(user);
  
  // Check if ANY role is admin-level
  return effectiveRoles.some(r => ALL_ADMIN_ROLES.includes(r));
}

/**
 * Check if user has specific permission
 * @param {string[]} permissions - User's permissions array
 * @param {string} permission - Permission to check (e.g. 'products.create')
 */
export function checkPermission(permissions, permission) {
  if (!permissions || permissions.length === 0) return false;
  
  // Wildcard - full access
  if (permissions.includes('*')) return true;
  
  // Module wildcard (e.g. 'products.*')
  const [module] = permission.split('.');
  if (permissions.includes(`${module}.*`)) return true;
  
  // Exact match
  return permissions.includes(permission);
}

/**
 * Check if user has module access
 */
export function checkModuleAccess(permissions, module) {
  return checkPermission(permissions, `${module}.view`);
}

export default {
  useUserRolePermissions,
  checkPermission,
  checkModuleAccess,
  getEffectiveRoles
};
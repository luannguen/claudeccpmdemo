/**
 * User Service
 * 
 * Service layer cho User entity
 * QUAN TRỌNG: Base44 User entity chỉ cho phép role là 'user' hoặc 'admin'
 * Để hỗ trợ RBAC với nhiều role hơn, ta lưu custom_role riêng
 */

import { base44 } from "@/api/base44Client";
import { success, failure, ErrorCodes } from "@/components/data/types";
import { ALL_ADMIN_ROLES, ROLE_NAME_MAP } from "@/components/hooks/useRBACPermissions";

// Roles hợp lệ cho Base44 User entity built-in
const VALID_BASE44_ROLES = ['user', 'admin'];

// Helper: Normalize display_name -> name
const normalizeRoleName = (roleName) => {
  return ROLE_NAME_MAP[roleName] || roleName;
};

// Mapping từ RBAC role → Base44 role (bao gồm tất cả admin-level roles)
const RBAC_TO_BASE44_ROLE = {
  'admin': 'admin',
  'super_admin': 'admin',
  'manager': 'admin',
  'staff': 'admin',        // Staff cần quyền admin để truy cập admin panel
  'accountant': 'admin',
  'owner': 'admin',
  'system_admin': 'admin',
  'hr_manager': 'admin',
  'sales_manager': 'admin',
  'content_manager': 'admin',
  'test_manager': 'admin',
  'community_manager': 'admin',
  'ui_manager': 'admin',
  'loyalty_manager': 'admin',
  'booking_manager': 'admin',
  'tester': 'admin',        // Testers cũng cần vào admin panel
  'content_editor': 'admin',
  'user': 'user'
};

/**
 * Lấy danh sách users
 */
export async function listUsers() {
  try {
    const users = await base44.entities.User.list('-created_date', 100);
    return success(users);
  } catch (error) {
    return failure(error.message, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Cập nhật user với xử lý RBAC role
 * Hỗ trợ Multi-Role Assignment
 * 
 * @param {string} id - User ID
 * @param {Object} data - Dữ liệu cập nhật
 * @param {string} [data.role] - RBAC role chính (backward compatible)
 * @param {string[]} [data.custom_roles] - Array of RBAC roles (Multi-Role)
 * @param {string} [data.full_name] - Tên người dùng
 */
export async function updateUser(id, data) {
  try {
    const updateData = {};
    
    // Xử lý full_name
    if (data.full_name !== undefined) {
      updateData.full_name = data.full_name;
    }
    
    // Xử lý Multi-Role Assignment (ưu tiên custom_roles array)
    if (data.custom_roles !== undefined && Array.isArray(data.custom_roles) && data.custom_roles.length > 0) {
      // Normalize tất cả roles (display_name → name)
      const normalizedRoles = data.custom_roles.map(normalizeRoleName);
      
      // Lưu array roles (đã normalize)
      updateData.custom_roles = normalizedRoles;
      
      // Backward compatible: set custom_role = primary role (first one)
      updateData.custom_role = normalizedRoles[0];
      
      // Map: nếu có BẤT KỲ admin-level role nào → set Base44 role = 'admin'
      const hasAdminRole = normalizedRoles.some(r => ALL_ADMIN_ROLES.includes(r));
      updateData.role = hasAdminRole ? 'admin' : 'user';
    }
    // Fallback: xử lý single role (backward compatible)
    else if (data.role !== undefined) {
      const rbacRole = normalizeRoleName(data.role);
      
      // Lưu RBAC role vào custom fields
      updateData.custom_role = rbacRole;
      updateData.custom_roles = [rbacRole]; // Convert to array
      
      // Map sang Base44 role hợp lệ
      const base44Role = ALL_ADMIN_ROLES.includes(rbacRole) ? 'admin' : 'user';
      updateData.role = base44Role;
    }
    
    if (Object.keys(updateData).length === 0) {
      return failure('Không có dữ liệu để cập nhật', ErrorCodes.VALIDATION_ERROR);
    }
    
    const result = await base44.entities.User.update(id, updateData);
    
    return success(result);
  } catch (error) {
    
    // Parse lỗi từ Base44
    const errorMessage = error.message || 'Không thể cập nhật người dùng';
    
    // Kiểm tra lỗi role validation từ Base44
    if (errorMessage.includes('role') && errorMessage.includes('user') && errorMessage.includes('admin')) {
      return failure(
        'Chỉ Admin mới có quyền thay đổi vai trò người dùng',
        ErrorCodes.FORBIDDEN
      );
    }
    
    return failure(errorMessage, ErrorCodes.SERVER_ERROR);
  }
}

/**
 * Lấy effective role của user (RBAC role)
 * Ưu tiên custom_role, fallback về role
 * @deprecated Use getEffectiveRoles for multi-role support
 */
export function getEffectiveRole(user) {
  return user?.custom_role || user?.role || 'user';
}

/**
 * Lấy tất cả effective roles của user (Multi-Role Assignment)
 * Ưu tiên custom_roles (array), fallback về custom_role (string), fallback về role
 * ALWAYS returns normalized role names (not display_name)
 */
export function getEffectiveRoles(user) {
  if (!user) return ['user'];
  
  let rawRoles = [];
  
  // Ưu tiên custom_roles (array)
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
  
  // Normalize all roles (display_name → name)
  return rawRoles.map(normalizeRoleName);
}

/**
 * Kiểm tra user có role được yêu cầu không
 */
export function hasRole(user, requiredRoles) {
  const effectiveRole = getEffectiveRole(user);
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(effectiveRole);
  }
  
  return effectiveRole === requiredRoles;
}

export const userService = {
  list: listUsers,
  update: updateUser,
  getEffectiveRole,
  getEffectiveRoles,
  hasRole,
  VALID_BASE44_ROLES,
  RBAC_TO_BASE44_ROLE
};

export default userService;
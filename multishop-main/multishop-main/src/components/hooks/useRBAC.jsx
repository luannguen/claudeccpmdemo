/**
 * useRBAC Hook
 * 
 * Hook layer cho hệ thống Role-Based Access Control
 * Tuân thủ kiến trúc 3 lớp theo AI-CODING-RULES
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/NotificationToast";
import { 
  roleService, 
  permissionService, 
  rbacService,
  ensureRBACInitialized,
  SYSTEM_MODULES,
  PERMISSION_ACTIONS,
  DEFAULT_ROLES
} from "@/components/services/rbacService";

// ========== QUERY KEYS ==========
const QUERY_KEYS = {
  roles: ['rbac', 'roles'],
  permissions: ['rbac', 'permissions'],
  userPermissions: (userId) => ['rbac', 'user-permissions', userId],
  accessibleModules: (userId) => ['rbac', 'accessible-modules', userId]
};

// ========== ROLE HOOKS ==========

/**
 * Hook lấy danh sách roles
 * Tự động khởi tạo nếu chưa có data
 */
export function useRoleList() {
  return useQuery({
    queryKey: QUERY_KEYS.roles,
    queryFn: async () => {
      // Đảm bảo RBAC đã được init trước khi query
      await ensureRBACInitialized();
      const result = await roleService.list();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 5 * 60 * 1000 // 5 phút
  });
}

/**
 * Hook CRUD operations cho roles
 */
export function useRoleMutations() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const createRole = useMutation({
    mutationFn: (data) => roleService.create(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
        addToast('Đã tạo role thành công', 'success');
      } else {
        addToast(result.error, 'error');
      }
    },
    onError: (error) => {
      addToast(`Lỗi khi tạo role: ${error.message}`, 'error');
    }
  });

  const updateRole = useMutation({
    mutationFn: ({ id, data }) => roleService.update(id, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
        addToast('Đã cập nhật role thành công', 'success');
      } else {
        addToast(result.error, 'error');
      }
    },
    onError: (error) => {
      addToast(`Lỗi khi cập nhật role: ${error.message}`, 'error');
    }
  });

  const deleteRole = useMutation({
    mutationFn: (id) => roleService.delete(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
        addToast('Đã xóa role thành công', 'success');
      } else {
        addToast(result.error, 'error');
      }
    },
    onError: (error) => {
      addToast(`Lỗi khi xóa role: ${error.message}`, 'error');
    }
  });

  const updatePermissions = useMutation({
    mutationFn: ({ roleId, permissions }) => roleService.updatePermissions(roleId, permissions),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
        addToast('Đã cập nhật quyền thành công', 'success');
      } else {
        addToast(result.error, 'error');
      }
    },
    onError: (error) => {
      addToast(`Lỗi khi cập nhật quyền: ${error.message}`, 'error');
    }
  });

  const initializeDefaults = useMutation({
    mutationFn: async () => {
      const rolesResult = await roleService.initializeDefaults();
      const permsResult = await permissionService.initializeDefaults();
      return { roles: rolesResult, permissions: permsResult };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.roles });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.permissions });
      
      const rolesCreated = result.roles?.data?.created || 0;
      const permsCreated = result.permissions?.data?.created || 0;
      addToast(`Đã khởi tạo ${rolesCreated} roles và ${permsCreated} permissions`, 'success');
    },
    onError: (error) => {
      addToast(`Lỗi khởi tạo: ${error.message}`, 'error');
    }
  });

  return {
    createRole,
    updateRole,
    deleteRole,
    updatePermissions,
    initializeDefaults,
    isLoading: createRole.isPending || updateRole.isPending || deleteRole.isPending || updatePermissions.isPending || initializeDefaults.isPending
  };
}

// ========== PERMISSION HOOKS ==========

/**
 * Hook lấy danh sách permissions
 * Tự động khởi tạo nếu chưa có data
 */
export function usePermissionList() {
  return useQuery({
    queryKey: QUERY_KEYS.permissions,
    queryFn: async () => {
      // Đảm bảo RBAC đã được init trước khi query
      await ensureRBACInitialized();
      const result = await permissionService.list();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 5 * 60 * 1000
  });
}

/**
 * Hook CRUD operations cho permissions
 */
export function usePermissionMutations() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const createPermission = useMutation({
    mutationFn: (data) => permissionService.create(data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.permissions });
        addToast('Đã tạo permission thành công', 'success');
      } else {
        addToast(result.error, 'error');
      }
    },
    onError: (error) => {
      addToast(`Lỗi khi tạo permission: ${error.message}`, 'error');
    }
  });

  const updatePermission = useMutation({
    mutationFn: ({ id, data }) => permissionService.update(id, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.permissions });
        addToast('Đã cập nhật permission thành công', 'success');
      } else {
        addToast(result.error, 'error');
      }
    },
    onError: (error) => {
      addToast(`Lỗi khi cập nhật permission: ${error.message}`, 'error');
    }
  });

  const deletePermission = useMutation({
    mutationFn: (id) => permissionService.delete(id),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.permissions });
        addToast('Đã xóa permission thành công', 'success');
      } else {
        addToast(result.error, 'error');
      }
    },
    onError: (error) => {
      addToast(`Lỗi khi xóa permission: ${error.message}`, 'error');
    }
  });

  const initializeDefaults = useMutation({
    mutationFn: () => permissionService.initializeDefaults(),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.permissions });
        addToast(result.data.message, 'success');
      } else {
        addToast(result.error, 'error');
      }
    },
    onError: (error) => {
      addToast(`Lỗi khởi tạo permissions: ${error.message}`, 'error');
    }
  });

  return {
    createPermission,
    updatePermission,
    deletePermission,
    initializeDefaults,
    isLoading: createPermission.isPending || updatePermission.isPending || deletePermission.isPending
  };
}

// ========== RBAC CHECK HOOKS ==========

/**
 * Hook kiểm tra quyền của current user
 */
export function useUserPermissions() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.userPermissions(user?.id),
    queryFn: async () => {
      if (!user) return [];
      return await rbacService.getUserPermissions(user);
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    initialData: []
  });
}

/**
 * Hook lấy danh sách modules user được phép truy cập
 */
export function useAccessibleModules() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: QUERY_KEYS.accessibleModules(user?.id),
    queryFn: async () => {
      if (!user) return [];
      return await rbacService.getAccessibleModules(user);
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    initialData: []
  });
}

/**
 * Hook kiểm tra có quyền cụ thể không
 * @param {string} permission - Permission code (vd: 'products.create')
 */
export function useHasPermission(permission) {
  const { user } = useAuth();
  const { data: userPermissions = [] } = useUserPermissions();

  // Admin luôn có full quyền
  if (user?.role === 'admin') return true;

  // Check wildcard
  if (userPermissions.includes('*')) return true;

  // Check module wildcard
  const [module] = permission.split('.');
  if (userPermissions.includes(`${module}.*`)) return true;

  // Check exact permission
  return userPermissions.includes(permission);
}

/**
 * Hook kiểm tra có quyền truy cập module không
 */
export function useHasModuleAccess(module) {
  return useHasPermission(`${module}.view`);
}

// ========== COMBINED HOOK ==========

/**
 * Hook tổng hợp cho RBAC management
 */
export function useRBACManagement() {
  const { data: roles = [], isLoading: isLoadingRoles } = useRoleList();
  const { data: permissions = [], isLoading: isLoadingPermissions } = usePermissionList();
  const roleMutations = useRoleMutations();
  const permissionMutations = usePermissionMutations();

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {});

  return {
    // Data
    roles,
    permissions,
    permissionsByModule,
    modules: SYSTEM_MODULES,
    actions: PERMISSION_ACTIONS,
    
    // Loading states
    isLoading: isLoadingRoles || isLoadingPermissions,
    isLoadingRoles,
    isLoadingPermissions,
    
    // Role mutations
    createRole: roleMutations.createRole.mutate,
    updateRole: roleMutations.updateRole.mutate,
    deleteRole: roleMutations.deleteRole.mutate,
    updateRolePermissions: roleMutations.updatePermissions.mutate,
    initializeRoles: roleMutations.initializeDefaults.mutate,
    
    // Permission mutations
    createPermission: permissionMutations.createPermission.mutate,
    updatePermission: permissionMutations.updatePermission.mutate,
    deletePermission: permissionMutations.deletePermission.mutate,
    initializePermissions: permissionMutations.initializeDefaults.mutate,
    
    // Combined loading
    isMutating: roleMutations.isLoading || permissionMutations.isLoading
  };
}

export default {
  useRoleList,
  useRoleMutations,
  usePermissionList,
  usePermissionMutations,
  useUserPermissions,
  useAccessibleModules,
  useHasPermission,
  useHasModuleAccess,
  useRBACManagement
};
/**
 * RBAC Use Cases
 * 
 * Các use cases cho hệ thống Role-Based Access Control
 */

export const rbacUseCases = [
  // ========== ROLE USE CASES ==========
  {
    id: 'rbac.role.list',
    domain: 'rbac',
    description: 'Lấy danh sách tất cả roles',
    input: 'void',
    output: 'Result<Role[]>',
    service: 'roleService.list',
    hook: 'useRoleList'
  },
  {
    id: 'rbac.role.create',
    domain: 'rbac',
    description: 'Tạo role mới',
    input: 'RoleCreateDTO',
    output: 'Result<Role>',
    service: 'roleService.create',
    hook: 'useRoleMutations.createRole'
  },
  {
    id: 'rbac.role.update',
    domain: 'rbac',
    description: 'Cập nhật role',
    input: '{ id: string, data: RoleUpdateDTO }',
    output: 'Result<Role>',
    service: 'roleService.update',
    hook: 'useRoleMutations.updateRole'
  },
  {
    id: 'rbac.role.delete',
    domain: 'rbac',
    description: 'Xóa role (không thể xóa role hệ thống)',
    input: 'string (id)',
    output: 'Result<void>',
    service: 'roleService.delete',
    hook: 'useRoleMutations.deleteRole'
  },
  {
    id: 'rbac.role.updatePermissions',
    domain: 'rbac',
    description: 'Cập nhật danh sách quyền cho role',
    input: '{ roleId: string, permissions: string[] }',
    output: 'Result<Role>',
    service: 'roleService.updatePermissions',
    hook: 'useRoleMutations.updatePermissions'
  },
  {
    id: 'rbac.role.initDefaults',
    domain: 'rbac',
    description: 'Khởi tạo roles mặc định (admin, manager, staff, accountant, user)',
    input: 'void',
    output: 'Result<{ created: number }>',
    service: 'roleService.initializeDefaults',
    hook: 'useRoleMutations.initializeDefaults'
  },

  // ========== PERMISSION USE CASES ==========
  {
    id: 'rbac.permission.list',
    domain: 'rbac',
    description: 'Lấy danh sách tất cả permissions',
    input: 'void',
    output: 'Result<Permission[]>',
    service: 'permissionService.list',
    hook: 'usePermissionList'
  },
  {
    id: 'rbac.permission.create',
    domain: 'rbac',
    description: 'Tạo permission mới',
    input: 'PermissionCreateDTO',
    output: 'Result<Permission>',
    service: 'permissionService.create',
    hook: 'usePermissionMutations.createPermission'
  },
  {
    id: 'rbac.permission.update',
    domain: 'rbac',
    description: 'Cập nhật permission',
    input: '{ id: string, data: PermissionUpdateDTO }',
    output: 'Result<Permission>',
    service: 'permissionService.update',
    hook: 'usePermissionMutations.updatePermission'
  },
  {
    id: 'rbac.permission.delete',
    domain: 'rbac',
    description: 'Xóa permission (không thể xóa permission hệ thống)',
    input: 'string (id)',
    output: 'Result<void>',
    service: 'permissionService.delete',
    hook: 'usePermissionMutations.deletePermission'
  },
  {
    id: 'rbac.permission.initDefaults',
    domain: 'rbac',
    description: 'Khởi tạo permissions mặc định cho tất cả modules',
    input: 'void',
    output: 'Result<{ created: number }>',
    service: 'permissionService.initializeDefaults',
    hook: 'usePermissionMutations.initializeDefaults'
  },

  // ========== RBAC CHECKER USE CASES ==========
  {
    id: 'rbac.check.hasPermission',
    domain: 'rbac',
    description: 'Kiểm tra user có quyền cụ thể không',
    input: '{ user: User, permission: string }',
    output: 'boolean',
    service: 'rbacService.hasPermission',
    hook: 'useHasPermission'
  },
  {
    id: 'rbac.check.hasModuleAccess',
    domain: 'rbac',
    description: 'Kiểm tra user có quyền truy cập module không',
    input: '{ user: User, module: string }',
    output: 'boolean',
    service: 'rbacService.hasModuleAccess',
    hook: 'useHasModuleAccess'
  },
  {
    id: 'rbac.check.getAccessibleModules',
    domain: 'rbac',
    description: 'Lấy danh sách modules user được phép truy cập',
    input: 'User',
    output: 'string[]',
    service: 'rbacService.getAccessibleModules',
    hook: 'useAccessibleModules'
  },
  {
    id: 'rbac.check.getUserPermissions',
    domain: 'rbac',
    description: 'Lấy tất cả permissions của user',
    input: 'User',
    output: 'string[]',
    service: 'rbacService.getUserPermissions',
    hook: 'useUserPermissions'
  },

  // ========== COMBINED USE CASES ==========
  {
    id: 'rbac.management',
    domain: 'rbac',
    description: 'Hook tổng hợp quản lý RBAC (roles, permissions, mutations)',
    input: 'void',
    output: 'RBACManagementState',
    service: 'rbacService + roleService + permissionService',
    hook: 'useRBACManagement'
  }
];
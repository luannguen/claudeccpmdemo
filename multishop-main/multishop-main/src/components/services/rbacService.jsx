/**
 * RBAC Service
 * 
 * Service layer cho hệ thống Role-Based Access Control
 * Tuân thủ kiến trúc 3 lớp theo AI-CODING-RULES
 */

import { base44 } from "@/api/base44Client";
import { success, failure, ErrorCodes } from "@/components/data/types";

// ========== CONSTANTS ==========

export const SYSTEM_MODULES = [
  // Core
  { code: 'dashboard', name: 'Dashboard', icon: 'LayoutDashboard' },
  
  // Business Operations
  { code: 'products', name: 'Sản Phẩm', icon: 'Package' },
  { code: 'orders', name: 'Đơn Hàng', icon: 'ShoppingCart' },
  { code: 'customers', name: 'Khách Hàng', icon: 'Users' },
  { code: 'inventory', name: 'Kho Hàng', icon: 'Warehouse' },
  { code: 'bookings', name: 'Lịch Hẹn', icon: 'Calendar' },
  
  // Marketing & Engagement
  { code: 'referrals', name: 'Giới Thiệu', icon: 'Share2' },
  { code: 'loyalty', name: 'Loyalty', icon: 'Award' },
  { code: 'reviews', name: 'Đánh Giá', icon: 'Star' },
  { code: 'marketing', name: 'Marketing', icon: 'Megaphone' },
  
  // Content & Community
  { code: 'cms', name: 'Nội Dung', icon: 'FileText' },
  { code: 'community', name: 'Cộng Đồng', icon: 'MessageSquare' },
  { code: 'books', name: 'Sách Cộng Đồng', icon: 'Book' },
  
  // Testing & Development
  { code: 'features', name: 'Tính Năng', icon: 'Zap' },
  { code: 'testers', name: 'Testers', icon: 'TestTube' },
  
  // Analytics & Reports
  { code: 'reports', name: 'Báo Cáo', icon: 'BarChart3' },
  { code: 'analytics', name: 'Phân Tích', icon: 'TrendingUp' },
  
  // System & Administration
  { code: 'notifications', name: 'Thông Báo', icon: 'Bell' },
  { code: 'settings', name: 'Cài Đặt', icon: 'Settings' },
  { code: 'users', name: 'Người Dùng', icon: 'UserCog' },
  { code: 'system', name: 'Hệ Thống', icon: 'Server' }
];

export const PERMISSION_ACTIONS = [
  { code: 'view', name: 'Xem', description: 'Quyền xem dữ liệu' },
  { code: 'create', name: 'Tạo', description: 'Quyền tạo mới' },
  { code: 'update', name: 'Sửa', description: 'Quyền chỉnh sửa' },
  { code: 'delete', name: 'Xóa', description: 'Quyền xóa' },
  { code: 'export', name: 'Xuất', description: 'Quyền xuất dữ liệu' },
  { code: 'import', name: 'Nhập', description: 'Quyền nhập dữ liệu' },
  { code: 'manage', name: 'Quản lý', description: 'Toàn quyền module' },
  { code: 'approve', name: 'Duyệt', description: 'Quyền phê duyệt' }
];

// Default roles với permissions
export const DEFAULT_ROLES = [
  // ========== SUPER ADMIN ==========
  {
    name: 'admin',
    display_name: 'Super Admin',
    description: 'Toàn quyền quản lý hệ thống (Owner only)',
    level: 100,
    is_system: true,
    color: '#DC2626',
    permissions: ['*']
  },
  
  // ========== SYSTEM MANAGEMENT ==========
  {
    name: 'system_admin',
    display_name: 'Quản Lý Hệ Thống',
    description: 'Quản lý hệ thống, cài đặt, bảo mật',
    level: 95,
    is_system: true,
    color: '#7C3AED',
    permissions: [
      'dashboard.view',
      'system.*',
      'settings.*',
      'users.view', 'users.update',
      'notifications.manage',
      'analytics.view',
      'reports.view', 'reports.export'
    ]
  },
  {
    name: 'hr_manager',
    display_name: 'Quản Lý Nhân Sự',
    description: 'Quản lý users, roles, permissions',
    level: 90,
    is_system: true,
    color: '#EC4899',
    permissions: [
      'dashboard.view',
      'users.*',
      'settings.view',
      'reports.view',
      'analytics.view'
    ]
  },
  
  // ========== BUSINESS MANAGEMENT ==========
  {
    name: 'sales_manager',
    display_name: 'Quản Lý Bán Hàng',
    description: 'Quản lý đơn hàng, khách hàng, bán hàng',
    level: 85,
    is_system: true,
    color: '#F59E0B',
    permissions: [
      'dashboard.view',
      'orders.*',
      'customers.*',
      'products.view',
      'inventory.view',
      'referrals.view', 'referrals.approve',
      'reports.*',
      'analytics.view',
      'bookings.*',
      'loyalty.view'
    ]
  },
  {
    name: 'content_manager',
    display_name: 'Quản Lý Nội Dung',
    description: 'Quản lý toàn bộ nội dung (CMS, posts, community)',
    level: 80,
    is_system: true,
    color: '#06B6D4',
    permissions: [
      'dashboard.view',
      'cms.*',
      'community.manage',
      'books.manage',
      'reviews.view', 'reviews.approve',
      'marketing.view', 'marketing.create'
    ]
  },
  {
    name: 'test_manager',
    display_name: 'Quản Lý Test',
    description: 'Quản lý tính năng, testers, và testing',
    level: 75,
    is_system: true,
    color: '#8B5CF6',
    permissions: [
      'dashboard.view',
      'features.*',
      'testers.manage',
      'system.view',
      'reports.view'
    ]
  },
  {
    name: 'community_manager',
    display_name: 'Quản Lý Cộng Đồng',
    description: 'Quản lý cộng đồng, kiểm duyệt',
    level: 70,
    is_system: true,
    color: '#10B981',
    permissions: [
      'dashboard.view',
      'community.*',
      'books.view', 'books.approve',
      'reviews.view', 'reviews.approve',
      'cms.view'
    ]
  },
  {
    name: 'ui_manager',
    display_name: 'Quản Lý Giao Diện',
    description: 'Quản lý giao diện, CMS, pages',
    level: 65,
    is_system: true,
    color: '#3B82F6',
    permissions: [
      'dashboard.view',
      'cms.manage',
      'settings.view',
      'marketing.view'
    ]
  },
  {
    name: 'loyalty_manager',
    display_name: 'Quản Lý Loyalty',
    description: 'Quản lý chương trình loyalty',
    level: 60,
    is_system: true,
    color: '#F97316',
    permissions: [
      'dashboard.view',
      'loyalty.*',
      'customers.view',
      'orders.view',
      'reports.view'
    ]
  },
  {
    name: 'booking_manager',
    display_name: 'Quản Lý Lịch Hẹn',
    description: 'Quản lý booking, dịch vụ',
    level: 55,
    is_system: true,
    color: '#14B8A6',
    permissions: [
      'dashboard.view',
      'bookings.*',
      'customers.view',
      'notifications.view', 'notifications.create'
    ]
  },
  
  // ========== OPERATIONAL STAFF ==========
  {
    name: 'staff',
    display_name: 'Nhân Viên Bán Hàng',
    description: 'Xử lý đơn hàng và sản phẩm',
    level: 50,
    is_system: true,
    color: '#2563EB',
    permissions: [
      'dashboard.view',
      'products.view', 'products.update',
      'orders.view', 'orders.update',
      'customers.view',
      'inventory.view',
      'notifications.view'
    ]
  },
  {
    name: 'tester',
    display_name: 'Nhân Viên Test',
    description: 'Thực hiện test - READ ONLY (không được sửa/xóa)',
    level: 45,
    is_system: true,
    color: '#A855F7',
    permissions: [
      'dashboard.view',
      'features.view',
      'testers.view'
    ]
  },
  {
    name: 'accountant',
    display_name: 'Kế Toán',
    description: 'Xem báo cáo và đơn hàng',
    level: 40,
    is_system: true,
    color: '#059669',
    permissions: [
      'dashboard.view',
      'orders.view',
      'reports.*',
      'customers.view'
    ]
  },
  {
    name: 'content_editor',
    display_name: 'Biên Tập Viên',
    description: 'Tạo và chỉnh sửa nội dung',
    level: 30,
    is_system: true,
    color: '#0EA5E9',
    permissions: [
      'dashboard.view',
      'cms.view', 'cms.create', 'cms.update',
      'community.view'
    ]
  },
  {
    name: 'user',
    display_name: 'Người Dùng',
    description: 'Khách hàng thông thường',
    level: 10,
    is_system: true,
    color: '#6B7280',
    permissions: []
  }
];

// ========== PERMISSION SERVICE ==========

export const permissionService = {
  /**
   * Lấy danh sách tất cả permissions
   */
  list: async () => {
    try {
      const permissions = await base44.entities.Permission.list('-module', 500);
      return success(permissions);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Lấy permissions theo module
   */
  getByModule: async (module) => {
    try {
      const permissions = await base44.entities.Permission.filter({ module });
      return success(permissions);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Tạo permission mới
   */
  create: async (data) => {
    try {
      if (!data.code?.trim()) {
        return failure('Mã quyền không được trống', ErrorCodes.VALIDATION_ERROR);
      }
      if (!data.module) {
        return failure('Module không được trống', ErrorCodes.VALIDATION_ERROR);
      }
      
      const permission = await base44.entities.Permission.create({
        ...data,
        code: data.code.trim().toLowerCase(),
        is_active: true
      });
      return success(permission);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Cập nhật permission
   */
  update: async (id, data) => {
    try {
      const permission = await base44.entities.Permission.update(id, data);
      return success(permission);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Xóa permission
   */
  delete: async (id) => {
    try {
      // Kiểm tra permission system
      const permissions = await base44.entities.Permission.filter({ id });
      if (permissions[0]?.is_system) {
        return failure('Không thể xóa quyền hệ thống', ErrorCodes.FORBIDDEN);
      }
      
      await base44.entities.Permission.delete(id);
      return success(null);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Khởi tạo permissions mặc định cho hệ thống
   */
  initializeDefaults: async () => {
    try {
      // Luôn check và tạo nếu thiếu (không chỉ check length)
      const existing = await base44.entities.Permission.list('-created_date', 500);
      const existingCodes = new Set(existing.map(p => p.code));

      const permissionsToCreate = [];
      for (const module of SYSTEM_MODULES) {
        for (const action of PERMISSION_ACTIONS) {
          const code = `${module.code}.${action.code}`;
          if (!existingCodes.has(code)) {
            permissionsToCreate.push({
              code,
              name: `${action.name} ${module.name}`,
              description: `${action.description} trong ${module.name}`,
              module: module.code,
              action: action.code,
              is_system: true,
              is_active: true
            });
          }
        }
      }

      if (permissionsToCreate.length === 0) {
        return success({ created: 0, message: 'Permissions đã đầy đủ' });
      }

      await base44.entities.Permission.bulkCreate(permissionsToCreate);
      return success({ created: permissionsToCreate.length, message: 'Đã khởi tạo permissions' });
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

// ========== ROLE SERVICE ==========

export const roleService = {
  /**
   * Lấy danh sách tất cả roles
   */
  list: async () => {
    try {
      const roles = await base44.entities.Role.list('-level', 100);
      return success(roles);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Lấy role theo name
   */
  getByName: async (name) => {
    try {
      const roles = await base44.entities.Role.filter({ name });
      if (!roles.length) {
        return failure('Không tìm thấy role', ErrorCodes.NOT_FOUND);
      }
      return success(roles[0]);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Tạo role mới
   */
  create: async (data) => {
    try {
      if (!data.name?.trim()) {
        return failure('Tên role không được trống', ErrorCodes.VALIDATION_ERROR);
      }
      if (!data.display_name?.trim()) {
        return failure('Tên hiển thị không được trống', ErrorCodes.VALIDATION_ERROR);
      }

      // Check trùng tên
      const existing = await base44.entities.Role.filter({ name: data.name.trim().toLowerCase() });
      if (existing.length > 0) {
        return failure('Role đã tồn tại', ErrorCodes.VALIDATION_ERROR);
      }

      const role = await base44.entities.Role.create({
        ...data,
        name: data.name.trim().toLowerCase(),
        permissions: data.permissions || [],
        is_active: true
      });
      return success(role);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Cập nhật role
   */
  update: async (id, data) => {
    try {
      // Không cho sửa role system nếu thay đổi name
      const roles = await base44.entities.Role.filter({ id });
      if (roles[0]?.is_system && data.name && data.name !== roles[0].name) {
        return failure('Không thể thay đổi tên role hệ thống', ErrorCodes.FORBIDDEN);
      }

      const role = await base44.entities.Role.update(id, data);
      return success(role);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Xóa role
   */
  delete: async (id) => {
    try {
      const roles = await base44.entities.Role.filter({ id });
      if (roles[0]?.is_system) {
        return failure('Không thể xóa role hệ thống', ErrorCodes.FORBIDDEN);
      }

      await base44.entities.Role.delete(id);
      return success(null);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Cập nhật permissions cho role
   */
  updatePermissions: async (roleId, permissions) => {
    try {
      const role = await base44.entities.Role.update(roleId, { permissions });
      return success(role);
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  },

  /**
   * Khởi tạo roles mặc định
   */
  initializeDefaults: async () => {
    try {
      // Luôn check và tạo nếu thiếu
      const existing = await base44.entities.Role.list('-created_date', 100);
      const existingNames = new Set(existing.map(r => r.name));

      const rolesToCreate = DEFAULT_ROLES.filter(r => !existingNames.has(r.name));

      if (rolesToCreate.length === 0) {
        return success({ created: 0, message: 'Roles đã đầy đủ' });
      }

      await base44.entities.Role.bulkCreate(rolesToCreate);
      return success({ created: rolesToCreate.length, message: 'Đã khởi tạo roles' });
    } catch (error) {
      return failure(error.message, ErrorCodes.SERVER_ERROR);
    }
  }
};

// ========== LAZY INITIALIZATION ==========

// Cache để tránh khởi tạo nhiều lần
let _initPromise = null;
let _isInitialized = false;

/**
 * Tự động khởi tạo/sync RBAC data khi app load
 * - Check thiếu permissions (168 total từ 21 modules × 8 actions)
 * - Check thiếu roles (15 total)
 * - Chỉ tạo mới những cái chưa có (idempotent)
 */
export const ensureRBACInitialized = async () => {
  // Nếu đã init rồi thì skip
  if (_isInitialized) return;
  
  // Nếu đang init thì chờ
  if (_initPromise) return _initPromise;
  
  _initPromise = (async () => {
    try {
      console.log('[RBAC] Starting auto-initialization...');
      
      // ========== STEP 1: Sync Permissions (168 total) ==========
      const existingPerms = await base44.entities.Permission.list('-created_date', 200);
      const existingPermCodes = new Set(existingPerms.map(p => p.code));
      
      const permissionsToCreate = [];
      for (const module of SYSTEM_MODULES) {
        for (const action of PERMISSION_ACTIONS) {
          const code = `${module.code}.${action.code}`;
          if (!existingPermCodes.has(code)) {
            permissionsToCreate.push({
              code,
              name: `${action.name} ${module.name}`,
              description: `${action.description} trong ${module.name}`,
              module: module.code,
              action: action.code,
              is_system: true,
              is_active: true
            });
          }
        }
      }
      
      if (permissionsToCreate.length > 0) {
        await base44.entities.Permission.bulkCreate(permissionsToCreate);
        console.log(`[RBAC] ✅ Created ${permissionsToCreate.length} missing permissions`);
      } else {
        console.log('[RBAC] ✅ All 168 permissions exist');
      }
      
      // ========== STEP 2: Sync Roles (15 total) ==========
      const existingRoles = await base44.entities.Role.list('-created_date', 50);
      const existingRoleNames = new Set(existingRoles.map(r => r.name));
      
      const rolesToCreate = DEFAULT_ROLES.filter(r => !existingRoleNames.has(r.name));
      
      if (rolesToCreate.length > 0) {
        await base44.entities.Role.bulkCreate(rolesToCreate);
        console.log(`[RBAC] ✅ Created ${rolesToCreate.length} missing roles`);
      } else {
        console.log('[RBAC] ✅ All 15 roles exist');
      }
      
      // ========== STEP 3: Update OLD roles với NEW permissions ==========
      // OLD roles: admin, manager, staff, accountant, user
      // Cần update permissions cho phù hợp với NEW system
      
      const rolesToUpdate = [
        // manager OLD → Giữ nguyên nhưng cần thêm modules mới
        {
          name: 'manager',
          newPermissions: [
            'dashboard.view',
            'products.*',
            'orders.*',
            'customers.*',
            'inventory.view', 'inventory.update',
            'reports.*',
            'reviews.view', 'reviews.update',
            'notifications.view',
            'bookings.view', 'bookings.update', // NEW
            'loyalty.view', // NEW
            'referrals.view', 'referrals.approve' // NEW
          ]
        }
      ];
      
      for (const roleUpdate of rolesToUpdate) {
        const role = existingRoles.find(r => r.name === roleUpdate.name);
        if (role) {
          await base44.entities.Role.update(role.id, {
            permissions: roleUpdate.newPermissions
          });
          console.log(`[RBAC] ✅ Updated ${roleUpdate.name} permissions`);
        }
      }
      
      _isInitialized = true;
      console.log('[RBAC] ✅ Auto-initialization complete');
    } catch (error) {
      console.error('[RBAC] Init error:', error);
      _initPromise = null; // Reset để có thể retry
    }
  })();
  
  return _initPromise;
};

// ========== RBAC CHECKER SERVICE ==========

export const rbacService = {
  /**
   * Kiểm tra user có permission cụ thể không
   * @param {Object} user - User object với role
   * @param {string} permission - Permission code (vd: 'products.create')
   * @param {Array} roleData - Optional cached role data
   */
  hasPermission: async (user, permission, roleData = null) => {
    try {
      if (!user?.role) return false;
      
      // Admin luôn có full quyền
      if (user.role === 'admin') return true;
      
      // Đảm bảo RBAC đã được init
      await ensureRBACInitialized();

      // Lấy role data
      let role = roleData;
      if (!role) {
        const roles = await base44.entities.Role.filter({ name: user.role });
        role = roles[0];
      }

      if (!role?.permissions) return false;

      // Check wildcard (*)
      if (role.permissions.includes('*')) return true;

      // Check module wildcard (vd: 'products.*')
      const [module] = permission.split('.');
      if (role.permissions.includes(`${module}.*`)) return true;

      // Check exact permission
      return role.permissions.includes(permission);
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  },

  /**
   * Kiểm tra user có quyền với module không
   */
  hasModuleAccess: async (user, module, roleData = null) => {
    return rbacService.hasPermission(user, `${module}.view`, roleData);
  },

  /**
   * Lấy danh sách modules user được phép truy cập
   */
  getAccessibleModules: async (user) => {
    try {
      if (!user?.role) return [];
      
      if (user.role === 'admin') {
        return SYSTEM_MODULES.map(m => m.code);
      }
      
      // Đảm bảo RBAC đã được init
      await ensureRBACInitialized();

      const roles = await base44.entities.Role.filter({ name: user.role });
      const role = roles[0];
      
      if (!role?.permissions) return [];
      if (role.permissions.includes('*')) {
        return SYSTEM_MODULES.map(m => m.code);
      }

      const modules = new Set();
      role.permissions.forEach(perm => {
        const [module] = perm.split('.');
        if (SYSTEM_MODULES.find(m => m.code === module)) {
          modules.add(module);
        }
      });

      return Array.from(modules);
    } catch (error) {
      console.error('Get accessible modules error:', error);
      return [];
    }
  },

  /**
   * Lấy tất cả permissions của user
   */
  getUserPermissions: async (user) => {
    try {
      if (!user?.role) return [];
      
      // Đảm bảo RBAC đã được init
      await ensureRBACInitialized();
      
      if (user.role === 'admin') {
        // Trả về tất cả permissions
        const allPerms = await base44.entities.Permission.list('-module', 500);
        return allPerms.map(p => p.code);
      }

      const roles = await base44.entities.Role.filter({ name: user.role });
      const role = roles[0];
      
      return role?.permissions || [];
    } catch (error) {
      console.error('Get user permissions error:', error);
      return [];
    }
  }
};

export default {
  permissionService,
  roleService,
  rbacService,
  ensureRBACInitialized,
  SYSTEM_MODULES,
  PERMISSION_ACTIONS,
  DEFAULT_ROLES
};
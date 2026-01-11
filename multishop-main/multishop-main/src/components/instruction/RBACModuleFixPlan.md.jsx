# RBAC Module Fix Plan

## Executive Summary
Sửa hệ thống RBAC để enforce permissions đúng cách trên Admin Dashboard.

## Current Issues
1. `AuthProvider.hasPermission()` - Hardcoded permissions, KHÔNG query từ Role entity
2. `AdminLayout.jsx` - Navigation không filter theo permissions
3. `AdminGuard` - Chỉ check role, không check permissions
4. Role entity có `permissions[]` nhưng không được sử dụng

## Target Architecture
```
User.role (admin/manager/staff/accountant/user)
    ↓
Role entity (name=user.role, permissions=['products.view', 'orders.*'])
    ↓
AuthProvider.hasPermission() - Query từ Role entity
    ↓
AdminLayout - Filter navigation
```

## Tasks

| # | Task | File | Status |
|---|------|------|--------|
| 1 | Create useRBACPermissions hook | hooks/useRBACPermissions.js | ✅ |
| 2 | Fix AuthProvider.hasPermission | AuthProvider.jsx | ✅ |
| 3 | Create admin navigation config | admin/navigation/adminNavConfig.js | ✅ |
| 4 | Create useAdminNavigation hook | hooks/useAdminNavigation.js | ✅ |
| 5 | Update AdminLayout - use filtered nav | AdminLayout.jsx | ✅ |
| 6 | Update AdminGuard - support module check | AdminGuard.jsx | ✅ |
| 7 | Add PermissionGate component | admin/PermissionGate.jsx | ✅ |

## Success Criteria
- [x] User với role=staff chỉ thấy menu được phép
- [x] hasPermission('products.create') query từ Role entity
- [x] Navigation items bị ẩn nếu không có quyền
- [x] Pages bị block nếu không có quyền module

## How to Use

### 1. Khởi tạo Roles & Permissions
Vào AdminSettings > RBAC tab > Click "Khởi tạo mặc định"

### 2. Gán Role cho User
- admin: Toàn quyền
- manager: products.*, orders.*, customers.*, inventory.view, reports.view
- staff: dashboard.view, products.view, products.update, orders.view, orders.update
- accountant: dashboard.view, orders.view, reports.view, reports.export
- user: Không có quyền admin

### 3. Sử dụng trong Components
```jsx
import { usePermissionCheck } from '@/components/hooks/useAdminNavigation';
import { PermissionGate } from '@/components/admin/PermissionGate';

// Hook check
const { canCreate, canDelete } = usePermissionCheck();
if (canCreate('products')) { /* show create button */ }

// Component gate
<PermissionGate permission="products.delete">
  <DeleteButton />
</PermissionGate>
```

### 4. Bảo vệ Page
```jsx
<AdminGuard requiredModule="products" requiredPermission="products.manage">
  <ProductsPage />
</AdminGuard>
```

---
**Status**: ✅ Completed
**Created**: 2025-12-30
**Completed**: 2025-12-30
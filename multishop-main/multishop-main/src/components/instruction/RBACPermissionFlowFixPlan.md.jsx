# RBAC Permission Flow Fix Plan

## 📋 Executive Summary

**Vấn đề:** User đã được gán multi-role (custom_roles) nhưng khi login vào Admin Dashboard thì menu trống.

**Nguyên nhân đã xác định:**
1. ✅ **User entity** - Đã có `custom_roles` array field
2. ✅ **UserFormModal** - Đã lưu đúng `custom_roles` array 
3. ✅ **userService.updateUser** - Đã xử lý đúng multi-role
4. ⚠️ **useRBACPermissions** - Match role bằng `name` nhưng có thể user lưu `display_name`
5. ⚠️ **AuthProvider.hasRole** - Chỉ check `custom_role` (string), không check `custom_roles` (array)
6. ⚠️ **AdminGuard** - Phụ thuộc `hasRole` từ AuthProvider

## 🔍 Root Cause Analysis

### Problem Flow:
```
User login → AuthProvider.checkAuth() → user.custom_roles = ["Quản Lý Test", ...]
                                                          ↓
                                        useAdminNavigation → getEffectiveRoles(user)
                                                          ↓
                                        useUserRolePermissions(["Quản Lý Test"])
                                                          ↓
                                        Role.list() → filter by role.name === "Quản Lý Test" ← NO MATCH!
                                                          ↓
                                        permissions = [] → filteredNav = EMPTY
```

**Issue:** User được lưu với `display_name` (VD: "Quản Lý Test") thay vì `name` (VD: "test_manager")

### Fixes Applied:
1. ✅ `useRBACPermissions.useUserRolePermissions` - Match cả `name` và `display_name`
2. ✅ `UserFormModal.getInitialRoles` - Normalize display_name → name
3. 🔄 Need: Migrate existing users có `custom_roles` sai format

## 📊 Progress Tracking

| Task | Status | Notes |
|------|--------|-------|
| Fix useRBACPermissions match logic | ✅ Done | Added ROLE_NAME_MAP for normalization |
| Fix UserFormModal initial roles | ✅ Done | Normalize to role.name |
| Fix AuthProvider.hasRole for multi-role | ✅ Done | Support custom_roles array |
| Fix AuthProvider.hasPermission for multi-role | ✅ Done | Check all effective roles |
| Fix useAdminNavigation normalize roles | ✅ Done | Use ROLE_NAME_MAP |
| Fix usePermissionCheck normalize roles | ✅ Done | Use ROLE_NAME_MAP |
| Test end-to-end | ⬜ Pending | After fixes |

## 🔧 Changes Made

1. **useRBACPermissions.js**
   - Added `ROLE_NAME_MAP` constant to map display_name → name
   - Updated `useUserRolePermissions` to normalize roles before matching

2. **AuthProvider.jsx**
   - Updated `hasRole` to support `custom_roles` array (multi-role)
   - Updated `hasPermission` to check all effective roles

3. **useAdminNavigation.js**
   - Import `ROLE_NAME_MAP`
   - Normalize roles in both `useAdminNavigation` and `usePermissionCheck`

4. **UserFormModal.jsx**
   - Fix `getInitialRoles` to normalize display_name → name

## 🎯 Testing

User cần:
1. Reload trang để AuthProvider load lại user data
2. Kiểm tra Admin Dashboard có hiển thị menu không
3. Nếu vẫn không hoạt động, có thể cần edit user và lưu lại để normalize roles trong DB

---
**Last Updated:** 2025-12-30
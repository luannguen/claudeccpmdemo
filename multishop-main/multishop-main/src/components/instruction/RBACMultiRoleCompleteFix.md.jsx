# RBAC Multi-Role Complete Fix Plan

## Executive Summary

**Vấn đề**: User `luannguyen082091@gmail.com` có roles được assign (như hiển thị trong UI: "Quản Lý Nhân Sự", "Quản Lý Nội Dung", "Quản Lý Bán Hàng", "Quản Lý") nhưng khi vào Admin Dashboard chỉ thấy sidebar trống, không có menu navigation.

## Root Cause Analysis

### 1. Data Flow (Complete Chain)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. AuthProvider.checkAuth()                                     │
│    → base44.auth.me() → user object with custom_roles          │
├─────────────────────────────────────────────────────────────────┤
│ 2. AdminLayout receives user from useAuth()                     │
│    → useAdminNavigation(user)                                   │
├─────────────────────────────────────────────────────────────────┤
│ 3. useAdminNavigation()                                         │
│    → getEffectiveRoles(user) → normalized roles array           │
│    → useUserRolePermissions(queryRoles)                         │
├─────────────────────────────────────────────────────────────────┤
│ 4. useUserRolePermissions()                                     │
│    → Query Role entity from DB                                  │
│    → Match user's roles with Role records                       │
│    → Union all permissions from matched roles                   │
├─────────────────────────────────────────────────────────────────┤
│ 5. filterNavItems()                                             │
│    → Check each nav item's permission against user permissions  │
│    → Return filtered navigation                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Potential Failure Points

| Point | Issue | Status |
|-------|-------|--------|
| A | `user.custom_roles` may be empty or undefined | ⚠️ Check |
| B | Roles stored as display_name (Vietnamese) instead of name (English) | ✅ Fixed |
| C | Role matching only by `name`, not `display_name` | ✅ Fixed |
| D | ROLE_NAME_MAP missing some role mappings | ✅ Check |
| E | Role entity not returning permissions array | ⚠️ Check |
| F | Permission format mismatch (e.g., "orders.view" vs "orders.*") | ⚠️ Check |
| G | Query cache stale - returning old empty data | ⚠️ Check |

### 3. Database Check

**Role Entity Records** (from DB query):
- ✅ `hr_manager` (Quản Lý Nhân Sự) - level 90, permissions: `['dashboard.view', 'users.*', 'settings.view', 'reports.view', 'analytics.view']`
- ✅ `sales_manager` (Quản Lý Bán Hàng) - level 85, permissions: `['dashboard.view', 'orders.*', 'customers.*', 'products.view', ...]`
- ✅ `content_manager` (Quản Lý Nội Dung) - level 80, permissions: `['dashboard.view', 'cms.*', 'community.manage', 'books.manage', ...]`
- ✅ `manager` (Quản Lý) - level 80, permissions: `['dashboard.view', 'products.*', 'orders.*', 'customers.*', ...]`

**Expected User Data**:
- `custom_roles`: Should be `["hr_manager", "content_manager", "sales_manager", "manager"]` (English names)
- OR `custom_roles`: `["Quản Lý Nhân Sự", "Quản Lý Nội Dung", "Quản Lý Bán Hàng", "Quản Lý"]` (Vietnamese display names)

## Fixes Implemented

### Fix 1: Enhanced Role Matching (useRBACPermissions.js)

Added multiple matching strategies:
1. Direct name match
2. Direct display_name match (Vietnamese)
3. ROLE_NAME_MAP normalization
4. Case-insensitive fuzzy match

```javascript
// Strategy 1: Direct name match
if (nameMap[roleName]) { ... }

// Strategy 2: Direct display_name match
else if (displayNameMap[roleName]) { ... }

// Strategy 3: ROLE_NAME_MAP normalization
else if (ROLE_NAME_MAP[roleName]) { ... }

// Strategy 4: Case-insensitive fuzzy match
else { fuzzyMatch... }
```

### Fix 2: Pass Both Raw + Normalized Roles (useAdminNavigation.js)

```javascript
const queryRoles = [...new Set([...effectiveRoles, ...rawRoles])];
```

This ensures we try both:
- Normalized English names: `["hr_manager", "content_manager", "sales_manager", "manager"]`
- Raw stored values: `["Quản Lý Nhân Sự", "Quản Lý Nội Dung", "Quản Lý Bán Hàng", "Quản Lý"]`

### Fix 3: Debug Logging

Added console.log statements at critical points:
- AuthProvider: Log user data on load
- AdminLayout: Log user, roles, permissions
- useRBACPermissions: Log role matching process
- useAdminNavigation: Log navigation building

## Verification Checklist

After reload, check browser console for:

```
[AuthProvider] User loaded: {
  email: "luannguyen082091@gmail.com",
  role: "admin",
  custom_role: "...",
  custom_roles: ["...", "...", "...", "..."]
}

[AdminLayout] Current state: {
  effectiveRoles: ["hr_manager", "content_manager", "sales_manager", "manager"],
  rawRoles: ["Quản Lý Nhân Sự", "Quản Lý Nội Dung", "Quản Lý Bán Hàng", "Quản Lý"],
  permissionsCount: X,
  navigationSections: Y
}

[RBAC] All roles from DB: [{name: "hr_manager", ...}, ...]
[RBAC] Final matched roles: ["hr_manager", "content_manager", "sales_manager", "manager"]
[RBAC] Final permissions: X permissions, Y modules
```

## Expected Result

If fixes work correctly:
1. User sees full navigation based on union of all assigned role permissions
2. Dashboard + all permitted modules appear in sidebar
3. User badge still shows "admin" (Base44 role) but actual permissions come from RBAC

## Troubleshooting

If still not working after reload:

1. **Check console for errors** - Look for any JavaScript errors
2. **Check user.custom_roles value** - Should be array with 4 roles
3. **Check if Role entities exist** - Should have 12+ role records in DB
4. **Clear query cache** - Try hard refresh (Ctrl+Shift+R)
5. **Check Base44 role** - user.role should be "admin" to access admin panel at all

## Files Modified

| File | Change |
|------|--------|
| `components/hooks/useRBACPermissions.js` | Added multi-strategy role matching + debug logs |
| `components/hooks/useAdminNavigation.js` | Pass both raw + normalized roles + debug logs |
| `components/AdminLayout.jsx` | Added debug logging effect |
| `components/AuthProvider.jsx` | Added debug logging on auth check |

## Changelog

- **2025-12-30 22:00**: Initial diagnosis
- **2025-12-30 22:15**: Fixed role matching strategies
- **2025-12-30 22:30**: Added comprehensive debug logging
- **2025-12-30 22:45**: Created complete diagnosis plan

## Next Steps (If Still Failing)

1. Query actual user data from database to verify custom_roles value
2. Check if user.role = "admin" (required for admin panel access)
3. Create test backend function to debug auth data
4. Consider data migration to normalize all existing user role data
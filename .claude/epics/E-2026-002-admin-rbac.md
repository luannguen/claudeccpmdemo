---
name: Implement SaaS RBAC
status: in-progress
progress: 0%
created: 2026-01-11T03:12:00Z
updated: 2026-01-11T03:15:00Z
---

# Epic: SaaS Admin Kit - Multi-Tenancy & RBAC

## Architecture

### 1. Database Layer (MongoDB)
- **New Model**: `Tenant` (name, domain, plan, status).
- **Modified Models**:
    - `User`: Added `tenantId` (or array `tenants` if complex). Added `isSuperAdmin`.
    - `Role`: Added `tenantId` (if null -> System Role).
    - `Permission`: Added `scope` ('system' | 'tenant').
    - `Product`: Added `tenantId`.

### 2. Middleware Layer (Crucial for SaaS)
- **`authMiddleware`**: Decodes JWT, attaches `req.user`.
- **`tenantMiddleware`**:
    - Checks `x-tenant-id` header or `req.user.tenantId`.
    - Enforces isolation: If user tries to access data, auto-inject `{ tenantId }` into queries.

### 3. Service Layer (Backend API)
- **Admin**:
    - `POST /api/admin/tenants`: Create new tenant (Sign up).
- **RBAC**:
    - `GET /api/rbac/roles`: Fetch roles (System Roles + My Tenant Roles).
    - `POST /api/rbac/roles`: Create Tenant Role (force `tenantId = current`).

### 4. Frontend Logic
- **`useAuth`**:
    - Stores `currentUser` and `currentTenant`.
    - `hasPermission` checks against `currentTenant` context.

### 5. UI Layer
- **Super Admin Dashboard**: Tenant Management.
- **Tenant Dashboard**: Standard "Shop" Admin.

## Step-by-Step Plan
1.  **Backend Core**: Create `Tenant` model & update `User` schema.
2.  **Middleware**: Implement `restrictToTenant`.
3.  **RBAC Update**: Update `Role` schema to support Multi-tenancy.
4.  **Frontend**: Update Login to handle Tenant context (or assume single-tenant login for MVP).

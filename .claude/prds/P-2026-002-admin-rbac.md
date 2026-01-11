---
name: Admin Kit SaaS RBAC
status: in-progress
created: 2026-01-11T03:12:00Z
updated: 2026-01-11T03:15:00Z
---

# PRD: SaaS Admin Kit with Dynamic RBAC

## 1. Goal
Build a Multi-Tenant SaaS Platform foundation with a flexible Admin Kit. It supports strict data isolation between tenants and a hierarchical RBAC system (Super Admin vs. Tenant Admin).

## 2. Requirements

### 2.1 Multi-Tenancy (SaaS)
- **Tenant Isolation**: All business data (Products, Orders, localized Roles) MUST belong to a specific Tenant.
- **Super Admin**: Can manage Tenants (Create, Suspend, Upgrade Plan). Has visibility over system-wide stats.
- **Tenant Admin**: Can only manage their own Tenant's users and data.

### 2.2 Dynamic Permissions
- System MUST NOT hardcode permissions as TypeScript enums only.
- Permissions have levels: `System` (Global) vs `Tenant` (Local).
- Example: `tenant.create` (System level) vs `product.create` (Tenant level).

### 2.3 Dynamic Roles
- **System Roles**: Pre-defined or Super Admin created (e.g., "Platform Owner").
- **Tenant Roles**: Created by Tenant Admins (e.g., "Shop Manager", "Staff").
- **Role Scoping**: A Role belongs to a Tenant (unless it's a System Role).

### 2.4 User Multi-Role
- A User can belong to multiple Tenants? (Optional for now, let's assume 1 User = 1 Tenant for simplicity, OR User has a `currentTenantId`).
- A User has specific roles *within* a Tenant.

## 3. UI Requirements
- **Tenant Switcher**: (If multi-tenant user support is needed).
- **Admin Dashboard**:
    - **Super View**: List of Tenants, MRR (Monthly Recurring Revenue).
    - **Tenant View**: Sales, Products, Users of that tenant.

## 4. Technical Constraints
- **Database**:
    - `Tenant` Collection.
    - All other collections (except User/SystemConfigs) MUST have `tenantId`.
- **Middleware**: `requireTenant` middleware to auto-inject filter `{ tenantId: session.tenantId }`.

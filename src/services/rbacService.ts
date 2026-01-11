import { success, failure, ErrorCodes } from '../data/types';
import type { Result } from '../data/types';

// Types (should be shared or inferred, but defined here for speed)
export interface Permission {
    _id: string;
    resource: string;
    action: string;
    name: string;
    scope: 'system' | 'tenant';
    description?: string;
}

export interface Role {
    _id: string;
    name: string;
    description?: string;
    permissions: Permission[];
    isSystemRole?: boolean;
    tenantId?: string | null;
}

// Helper for headers
const getHeaders = () => {
    const tenantId = localStorage.getItem('tenant_id');
    const userEmail = localStorage.getItem('user_email');
    const headers: any = { 'Content-Type': 'application/json' };
    if (tenantId) headers['x-tenant-id'] = tenantId;
    if (userEmail) headers['x-user-email'] = userEmail;
    return headers;
};

export const rbacService = {
    getRoles: async (): Promise<Result<Role[]>> => {
        try {
            const response = await fetch('/api/rbac/roles', { headers: getHeaders() });
            if (!response.ok) {
                const err = await response.json();
                return failure(err.message, ErrorCodes.SERVER_ERROR);
            }
            const roles = await response.json();
            return success(roles);
        } catch (error: any) {
            return failure(String(error), ErrorCodes.UNKNOWN_ERROR);
        }
    },

    getPermissions: async (): Promise<Result<Permission[]>> => {
        try {
            const response = await fetch('/api/rbac/permissions', { headers: getHeaders() });
            if (!response.ok) {
                const err = await response.json();
                return failure(err.message, ErrorCodes.SERVER_ERROR);
            }
            const permissions = await response.json();
            return success(permissions);
        } catch (error: any) {
            return failure(String(error), ErrorCodes.UNKNOWN_ERROR);
        }
    },

    createRole: async (data: { name: string; description?: string; permissions: string[] }): Promise<Result<Role>> => {
        try {
            const response = await fetch('/api/rbac/roles', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const err = await response.json();
                return failure(err.message, ErrorCodes.SERVER_ERROR);
            }
            const role = await response.json();
            return success(role);
        } catch (error: any) {
            return failure(String(error), ErrorCodes.UNKNOWN_ERROR);
        }
    },

    updateRole: async (id: string, data: { name?: string; description?: string; permissions?: string[] }): Promise<Result<Role>> => {
        try {
            const response = await fetch(`/api/rbac/roles/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const err = await response.json();
                return failure(err.message, ErrorCodes.SERVER_ERROR);
            }
            const role = await response.json();
            return success(role);
        } catch (error: any) {
            return failure(String(error), ErrorCodes.UNKNOWN_ERROR);
        }
    },

    deleteRole: async (id: string): Promise<Result<boolean>> => {
        try {
            const response = await fetch(`/api/rbac/roles/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!response.ok) {
                const err = await response.json();
                return failure(err.message, ErrorCodes.SERVER_ERROR);
            }
            return success(true);
        } catch (error: any) {
            return failure(String(error), ErrorCodes.UNKNOWN_ERROR);
        }
    }
};

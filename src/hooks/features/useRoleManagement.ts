import { useState, useCallback } from 'react';
import { rbacService, type Role, type Permission } from '../../services/rbacService';
import { useToast } from '../../components/NotificationToast';

export function useRoleManagement() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const loadRoles = useCallback(async () => {
        setIsLoading(true);
        const result = await rbacService.getRoles();
        if (result.success) {
            setRoles(result.data);
        } else {
            console.error(result.error);
            addToast(`Failed to load roles: ${result.error}`, 'error');
        }
        setIsLoading(false);
    }, [addToast]);

    const loadPermissions = useCallback(async () => {
        const result = await rbacService.getPermissions();
        if (result.success) {
            setPermissions(result.data);
        }
    }, []);

    const createRole = async (data: { name: string; description?: string; permissions: string[] }) => {
        setIsLoading(true);
        const result = await rbacService.createRole(data);
        if (result.success) {
            await loadRoles(); // Reload list
            addToast('Role created successfully', 'success');
            return true;
        }
        addToast(`Failed to create role: ${result.error}`, 'error');
        setIsLoading(false);
        return false;
    };

    const updateRole = async (id: string, data: { name?: string; description?: string; permissions?: string[] }) => {
        setIsLoading(true);
        const result = await rbacService.updateRole(id, data);
        if (result.success) {
            await loadRoles();
            addToast('Role updated successfully', 'success');
            return true;
        }
        addToast(`Failed to update role: ${result.error}`, 'error');
        setIsLoading(false);
        return false;
    };

    const deleteRole = async (id: string) => {
        setIsLoading(true);
        const result = await rbacService.deleteRole(id);
        if (result.success) {
            await loadRoles();
            addToast('Role deleted successfully', 'success');
            return true;
        }
        addToast(`Failed to delete role: ${result.error}`, 'error');
        setIsLoading(false);
        return false;
    };

    return {
        roles,
        permissions,
        isLoading,
        loadRoles,
        loadPermissions,
        createRole,
        updateRole,
        deleteRole
    };
}

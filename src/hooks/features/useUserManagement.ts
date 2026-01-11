import { useState, useCallback } from 'react';
import { userService, type User } from '../../services/userService';
import { useToast } from '../../components/NotificationToast';

export function useUserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const loadUsers = useCallback(async () => {
        setIsLoading(true);
        const result = await userService.getUsers();
        if (result.success) {
            setUsers(result.data);
        } else {
            console.error(result.error);
            addToast(`Failed to load users: ${result.error.message}`, 'error');
        }
        setIsLoading(false);
    }, [addToast]);

    const inviteUser = async (email: string, name: string, roleIds: string[]) => {
        setIsLoading(true);
        const result = await userService.inviteUser(email, name, roleIds);
        if (result.success) {
            await loadUsers();
            addToast('User invited successfully', 'success');
            return true;
        }
        addToast(`Failed to invite user: ${result.error.message}`, 'error');
        setIsLoading(false);
        return false;
    };

    const assignRoles = async (userId: string, roleIds: string[]) => {
        setIsLoading(true);
        const result = await userService.assignRoles(userId, roleIds);
        if (result.success) {
            await loadUsers();
            addToast('Roles assigned successfully', 'success');
            return true;
        }
        addToast(`Failed to assign roles: ${result.error.message}`, 'error');
        setIsLoading(false);
        return false;
    };

    const deleteUser = async (id: string) => {
        setIsLoading(true);
        const result = await userService.deleteUser(id);
        if (result.success) {
            await loadUsers();
            addToast('User removed successfully', 'success');
            return true;
        }
        addToast(`Failed to remove user: ${result.error.message}`, 'error');
        setIsLoading(false);
        return false;
    };

    return {
        users,
        isLoading,
        loadUsers,
        inviteUser,
        assignRoles,
        deleteUser
    };
}

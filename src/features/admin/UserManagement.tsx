import { useState, useEffect } from 'react';
import { useUserManagement } from '../../hooks/features/useUserManagement';
import { useRoleManagement } from '../../hooks/features/useRoleManagement';
import { Icon } from '../../components/ui/AnimatedIcon';
import EnhancedModal from '../../components/EnhancedModal';
import { UserForm } from './UserForm';
import type { User } from '../../services/userService';

export function UserManagement() {
    const { users, isLoading, loadUsers, inviteUser, assignRoles, deleteUser } = useUserManagement();
    const { roles, loadRoles } = useRoleManagement();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, [loadUsers, loadRoles]);

    const handleInviteClick = () => {
        setEditingUser(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (user: User) => {
        if (user.isSuperAdmin) {
            alert('Cannot remove Super Admin'); // Should use toast
            return;
        }
        if (confirm(`Remove user "${user.name || user.email}"?`)) {
            await deleteUser(user._id);
        }
    };

    const handleFormSubmit = async (data: { email: string; name: string; roleIds: string[] }) => {
        setIsSubmitting(true);
        let success = false;

        if (editingUser) {
            // Edit mode: Only assigning roles usually for now
            success = await assignRoles(editingUser._id, data.roleIds);
        } else {
            // Invite mode
            success = await inviteUser(data.email, data.name, data.roleIds);
        }

        setIsSubmitting(false);

        if (success) {
            setIsModalOpen(false);
        }
        return success;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h2>
                    <p className="text-gray-500 mt-1">Manage users and their role assignments</p>
                </div>
                <button
                    onClick={handleInviteClick}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <Icon.Plus className="w-4 h-4" />
                    Invite User
                </button>
            </div>

            {isLoading && users.length === 0 ? (
                <div className="flex justify-center p-12"><Icon.Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>
            ) : (
                <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border dark:border-gray-700 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roles</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                {(user.name || user.email).charAt(0).toUpperCase()}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'Unknown Name'}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles && user.roles.length > 0 ? (
                                                user.roles.map(role => (
                                                    <span key={role._id} className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        {role.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">No roles</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditClick(user)}
                                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                                            title="Assign Roles"
                                        >
                                            <Icon.Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(user)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            disabled={user.isSuperAdmin}
                                            title="Remove User"
                                        >
                                            <Icon.Trash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <EnhancedModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Assign Roles' : 'Invite User'}
                maxWidth="lg"
            >
                <UserForm
                    initialData={editingUser}
                    roles={roles}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </EnhancedModal>
        </div>
    );
}

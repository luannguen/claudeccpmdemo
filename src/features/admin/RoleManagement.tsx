import { useState, useEffect } from 'react';
import { useRoleManagement } from '../../hooks/features/useRoleManagement';
import { Icon } from '../../components/ui/AnimatedIcon';
import EnhancedModal from '../../components/EnhancedModal';
import { RoleForm } from './RoleForm';
import type { Role } from '../../services/rbacService';

export function RoleManagement() {
    const { roles, permissions, isLoading, loadRoles, loadPermissions, createRole, updateRole, deleteRole } = useRoleManagement();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadRoles();
        loadPermissions();
    }, [loadRoles, loadPermissions]);

    const handleCreateClick = () => {
        setEditingRole(undefined);
        setIsModalOpen(true);
    };

    const handleEditClick = (role: Role) => {
        setEditingRole(role);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (role: Role) => {
        if (role.isSystemRole) {
            alert('Cannot delete system role'); // Should use toast, but hook handles logic error toast
            return;
        }
        if (confirm(`Delete role "${role.name}"?`)) {
            await deleteRole(role._id);
        }
    };

    const handleFormSubmit = async (data: { name: string; description: string; permissions: string[] }) => {
        setIsSubmitting(true);
        let success = false;
        if (editingRole) {
            success = await updateRole(editingRole._id, data);
        } else {
            success = await createRole(data);
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
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Role Management</h2>
                    <p className="text-gray-500 mt-1">Manage access control for your organization</p>
                </div>
                <button
                    onClick={handleCreateClick}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors"
                >
                    <Icon.Plus className="w-4 h-4" />
                    Create Role
                </button>
            </div>

            {isLoading && roles.length === 0 ? (
                <div className="flex justify-center p-12"><Icon.Loader2 className="animate-spin w-8 h-8 text-indigo-600" /></div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map(role => (
                        <div key={role._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                        <Icon.Shield className={`w-4 h-4 ${role.isSystemRole ? 'text-purple-500' : 'text-indigo-500'}`} />
                                        {role.name}
                                        {role.isSystemRole && <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">System</span>}
                                    </h3>
                                    <span className="text-xs text-gray-400 mt-1 block">ID: {role._id}</span>
                                    {role.description && <p className="text-sm text-gray-500 mt-2">{role.description}</p>}
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditClick(role)}
                                        disabled={!!role.isSystemRole && !role.tenantId} // Assuming logic: system roles cannot be edited by tenant
                                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 disabled:opacity-30"
                                        title="Edit Role"
                                    >
                                        <Icon.Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(role)}
                                        disabled={!!role.isSystemRole}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors text-red-500 disabled:opacity-30 disabled:text-gray-400"
                                        title="Delete Role"
                                    >
                                        <Icon.Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-800/50 flex-1">
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Permissions ({role.permissions.length})</div>
                                <div className="flex flex-wrap gap-2">
                                    {role.permissions.length > 0 ? (
                                        role.permissions.slice(0, 5).map(perm => (
                                            <span key={perm._id} className="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-700 border dark:border-gray-600 rounded text-gray-600 dark:text-gray-300 flex items-center gap-1">
                                                {perm.scope === 'system' ? <Icon.Globe className="w-3 h-3 text-blue-500" /> : <Icon.Building className="w-3 h-3 text-green-500" />}
                                                {perm.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                                    )}
                                    {role.permissions.length > 5 && (
                                        <span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-600 rounded text-gray-600 dark:text-gray-300">
                                            +{role.permissions.length - 5} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <EnhancedModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingRole ? 'Edit Role' : 'Create Role'}
                maxWidth="2xl"
            >
                <RoleForm
                    initialData={editingRole}
                    permissions={permissions}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={isSubmitting}
                />
            </EnhancedModal>
        </div>
    );
}

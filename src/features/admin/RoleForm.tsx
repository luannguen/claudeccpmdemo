import { useState, useEffect } from 'react';
import { Icon } from '../../components/ui/AnimatedIcon';
import type { Permission, Role } from '../../services/rbacService';

interface RoleFormProps {
    initialData?: Role;
    permissions: Permission[];
    onSubmit: (data: { name: string; description: string; permissions: string[] }) => Promise<boolean>;
    onCancel: () => void;
    isLoading: boolean;
}

export function RoleForm({ initialData, permissions, onSubmit, onCancel, isLoading }: RoleFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        initialData?.permissions.map(p => p._id) || []
    );

    const togglePermission = (permId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permId)
                ? prev.filter(id => id !== permId)
                : [...prev, permId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ name, description, permissions: selectedPermissions });
    };

    // Group permissions by resource
    const groupedPermissions = permissions.reduce((acc, perm) => {
        const resource = perm.resource || 'other';
        if (!acc[resource]) acc[resource] = [];
        acc[resource].push(perm);
        return acc;
    }, {} as Record<string, Permission[]>);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                    placeholder="e.g., Sales Manager"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                    rows={2}
                    placeholder="Describe what this role can do..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>
                <div className="space-y-4 max-h-[300px] overflow-y-auto border rounded-md p-4 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                    {Object.entries(groupedPermissions).map(([resource, perms]) => (
                        <div key={resource}>
                            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">{resource}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {perms.map(perm => (
                                    <label key={perm._id} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedPermissions.includes(perm._id)}
                                            onChange={() => togglePermission(perm._id)}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">
                                            {perm.name}
                                            {perm.description && <span className="text-xs text-gray-500 ml-1">({perm.description})</span>}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                    {isLoading && <Icon.Loader2 className="animate-spin -ml-1 mr-2 w-4 h-4" />}
                    Save Role
                </button>
            </div>
        </form>
    );
}

import { useState } from 'react';
import { Icon } from '../../components/ui/AnimatedIcon';
import type { User } from '../../services/userService';
import type { Role } from '../../services/rbacService';

interface UserFormProps {
    initialData?: User; // If present, it's edit mode (assign roles only usually)
    roles: Role[];
    onSubmit: (data: { email: string; name: string; roleIds: string[] }) => Promise<boolean>;
    onCancel: () => void;
    isLoading: boolean;
}

export function UserForm({ initialData, roles, onSubmit, onCancel, isLoading }: UserFormProps) {
    const [email, setEmail] = useState(initialData?.email || '');
    const [name, setName] = useState(initialData?.name || '');
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>(
        initialData?.roles.map(r => r._id) || []
    );

    const isEditMode = !!initialData;

    const toggleRole = (roleId: string) => {
        setSelectedRoleIds(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({ email, name, roleIds: selectedRoleIds });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isEditMode && (
                <>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                            placeholder="user@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm p-2 border"
                            placeholder="John Doe"
                        />
                    </div>
                </>
            )}

            {isEditMode && (
                <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{name || email}</h4>
                    <p className="text-sm text-gray-500">{email}</p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Roles</label>
                <div className="space-y-2 border rounded-md p-4 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 max-h-48 overflow-y-auto">
                    {roles.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No roles available.</p>
                    ) : (
                        roles.map(role => (
                            <label key={role._id} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedRoleIds.includes(role._id)}
                                    onChange={() => toggleRole(role._id)}
                                    disabled={role.isSystemRole && !role.tenantId} // Maybe prevent assigning system roles if restricted? Not strictly required.
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                            {role.name}
                                            {role.isSystemRole && <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded-full">System</span>}
                                        </span>
                                    </div>
                                    {role.description && <p className="text-xs text-gray-500">{role.description}</p>}
                                </div>
                            </label>
                        ))
                    )}
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
                    {isEditMode ? 'Update Roles' : 'Invite User'}
                </button>
            </div>
        </form>
    );
}

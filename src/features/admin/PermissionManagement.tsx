import React, { useState, useEffect } from 'react';
import { rbacService, type Permission } from '../../services/rbacService';
import { useToast } from '../../components/NotificationToast';
import { Icon } from '../../components/ui/AnimatedIcon';

export function PermissionManagement() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const { addToast } = useToast();

    // Form State
    const [resource, setResource] = useState('');
    const [action, setAction] = useState('');
    const [description, setDescription] = useState('');

    const fetchPermissions = async () => {
        setLoading(true);
        const result = await rbacService.getPermissions();
        if (result.success) {
            setPermissions(result.data);
        } else {
            addToast('Failed to load permissions', 'error');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resource || !action) return;

        setCreating(true);
        const result = await rbacService.createPermission({ resource, action, description });
        setCreating(false);

        if (result.success) {
            addToast('Permission created successfully', 'success');
            setResource('');
            setAction('');
            setDescription('');
            fetchPermissions();
        } else {
            addToast(result.error?.message || 'Failed', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Permission Management</h2>
            </div>

            {/* Creation Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Icon.Plus className="w-5 h-5 text-indigo-600" />
                    Create New Permission
                </h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                        <input
                            type="text"
                            placeholder="e.g. product"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            value={resource}
                            onChange={e => setResource(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                        <input
                            type="text"
                            placeholder="e.g. publish"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            value={action}
                            onChange={e => setAction(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                            type="text"
                            placeholder="Optional description"
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2 border"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={creating || !resource || !action}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 h-[38px]"
                    >
                        {creating ? <Icon.Spinner className="w-4 h-4" /> : <Icon.Plus className="w-4 h-4" />}
                        Create
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Permission Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Resource
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Action
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Scope
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                            </tr>
                        ) : permissions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No permissions found.</td>
                            </tr>
                        ) : (
                            permissions.map((p) => (
                                <tr key={p._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {p.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {p.resource}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {p.action}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.scope === 'system' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                            {p.scope}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {p.description || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

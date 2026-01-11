import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/features/useAuth';
import { Icon } from '../../components/ui/AnimatedIcon';

export function AdminLayout() {
    const { user, isAuthenticated, hasPermission } = useAuth();

    // Simple protection
    if (!isAuthenticated && !user) {
        return <div className="p-10 text-center">Loading or Unauthorized...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
                <div className="p-6 border-b dark:border-gray-700">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Icon.ShieldCheck className="w-6 h-6 text-indigo-600" />
                        Admin Kit
                    </h1>
                    {user?.tenantId && (
                        <div className="mt-2 text-xs font-mono px-2 py-1 bg-indigo-50 text-indigo-700 rounded">
                            Tenant: {user.tenantId}
                        </div>
                    )}
                </div>

                <nav className="p-4 space-y-1">
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Icon.LayoutGrid className="w-5 h-5" />
                        Dashboard
                    </Link>

                    <Link to="/admin/roles" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <Icon.Lock className="w-5 h-5" />
                        Role Manager
                    </Link>

                    {hasPermission('user.manage') && (
                        <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                            <Icon.Users className="w-5 h-5" />
                            Users
                        </Link>
                    )}

                    {hasPermission('tenant.manage') && (
                        <div className="mt-6 pt-6 border-t dark:border-gray-700">
                            <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Super Admin</div>
                            <Link to="/admin/tenants" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                <Icon.Building className="w-5 h-5" />
                                Tenants
                            </Link>
                        </div>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}

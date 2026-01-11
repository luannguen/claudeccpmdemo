import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/common/useAuth';
import { Icon } from '../../components/ui/AnimatedIcon';
import { saasService } from '../../services/saasService';
import { userService } from '../../services/userService';
import { productService } from '../../services/productService';

const ClientDashboard: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [tenant, setTenant] = useState<any>(null);
    const [stats, setStats] = useState({ users: 0, products: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user?.tenantId) {
            const fetchData = async () => {
                try {
                    const [tenantResult, usersResult, productsResult] = await Promise.all([
                        saasService.getTenant(user.tenantId!),
                        userService.getUsers(),
                        productService.list()
                    ]);

                    if (tenantResult.success) {
                        setTenant(tenantResult.data);
                    }
                    if (usersResult.success) {
                        setStats(prev => ({ ...prev, users: usersResult.data.length }));
                    }
                    if (productsResult.success) {
                        setStats(prev => ({ ...prev, products: productsResult.data.length }));
                    }
                } catch (error) {
                    console.error("Failed to fetch dashboard data", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        } else {
            setLoading(false);
        }
    }, [user, isAuthenticated, navigate]);


    if (!user) return null;
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center">
                <Icon.Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
                <p className="text-gray-500">Loading your dashboard...</p>
            </div>
        </div>
    );
    if (!tenant) return <div className="p-8 text-center text-red-500">Tenant not found. Please contact support.</div>;

    const isPro = tenant.plan === 'pro';
    const userLimit = isPro ? 'Unlimited' : 5;
    const productLimit = isPro ? 'Unlimited' : 20;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-600 p-2 rounded-lg">
                            <Icon.LayoutGrid className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 leading-none">{tenant.name}</h1>
                            <a href={`http://${tenant.domain}`} target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-indigo-600 transition-colors">
                                {tenant.domain}
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase border ${isPro ? 'bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border-yellow-400' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                            {tenant.plan} Plan
                        </div>
                        <div className="flex items-center gap-3 border-l pl-6 border-gray-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</p>
                            </div>
                            <div className="bg-indigo-100 p-2 rounded-full text-indigo-700">
                                <Icon.User className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Users Stat */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats.users}</h3>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                                <Icon.Users className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: isPro ? '20%' : `${Math.min((stats.users / 5) * 100, 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500">{stats.users} / {userLimit} active users</p>
                    </div>

                    {/* Products Stat */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Active Products</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stats.products}</h3>
                            </div>
                            <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                                <Icon.ShoppingBag className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: isPro ? '15%' : `${Math.min((stats.products / 20) * 100, 100)}%` }}></div>
                        </div>
                        <p className="text-xs text-gray-500">{stats.products} / {productLimit} products listed</p>
                    </div>

                    {/* Revenue (Mock) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Monthly Revenue</p>
                                <h3 className="text-3xl font-bold text-gray-900">$12,450</h3>
                            </div>
                            <div className="bg-violet-50 p-2 rounded-lg text-violet-600">
                                <Icon.TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                        <p className="text-xs text-green-600 flex items-center">
                            <Icon.ArrowRight className="w-3 h-3 mr-1 rotate-[-45deg]" />
                            +12% from last month
                        </p>
                    </div>

                    {/* Quick Access */}
                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-xl shadow-md text-white">
                        <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => navigate('/admin/users')} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-sm text-center transition-colors backdrop-blur-sm">
                                Manage Team
                            </button>
                            <button onClick={() => navigate('/products')} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-sm text-center transition-colors backdrop-blur-sm">
                                Products
                            </button>
                            <button className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-sm text-center transition-colors backdrop-blur-sm col-span-2">
                                Settings
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Account Overview</h3>
                    </div>
                    <div className="p-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                            <div className="sm:col-span-1 border-b border-gray-100 pb-4">
                                <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 inline-block px-2 py-1 rounded">{user.tenantId}</dd>
                            </div>
                            <div className="sm:col-span-1 border-b border-gray-100 pb-4">
                                <dt className="text-sm font-medium text-gray-500">Owner Email</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Your Roles</dt>
                                <dd className="mt-1 text-sm text-gray-900 flex flex-wrap gap-2">
                                    {user.roles?.map((r, index) => {
                                        const roleName = typeof r === 'string' ? r : (r as any).name;
                                        const roleId = typeof r === 'string' ? r : (r as any)._id || index;
                                        return (
                                            <span key={roleId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                {roleName}
                                            </span>
                                        );
                                    })}
                                </dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Account Type</dt>
                                <dd className="mt-1 text-sm text-gray-900">{user.isSuperAdmin ? 'Super Admin' : 'Standard User'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ClientDashboard;

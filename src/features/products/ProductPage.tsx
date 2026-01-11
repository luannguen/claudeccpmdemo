import { useAuth } from '@/hooks/features/useAuth';
import { useProductList } from '@/hooks/features/useProductList';
import { ProductGrid } from './ProductGrid';
import { productService } from '@/services/productService';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductPage() {
    const { products, isLoading, error, refresh } = useProductList();
    const { login, user, logout } = useAuth();
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
    const navigate = useNavigate();

    const handleAddToCart = (product: any) => {
        setToast({ msg: `Added ${product.name} to cart`, type: 'success' });
        setTimeout(() => setToast(null), 3000);
    };

    const handleLogin = async () => {
        const success = await login('manager@a.com');
        if (success) {
            setToast({ msg: 'Logged in as Manager (Real Data)', type: 'success' });
            setTimeout(() => navigate('/admin/roles'), 1000);
        } else {
            setToast({ msg: 'Login Failed', type: 'error' });
        }
    }

    const handleSeed = async () => {
        const res = await productService.seed();
        if (res.success) {
            setToast({ msg: 'Database seeded successfully!', type: 'success' });
            refresh();
        } else {
            setToast({ msg: 'Failed to seed: ' + res.error.message, type: 'error' });
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Our Products</h1>
                    <div className="flex gap-2">
                        {user ? (
                            <button onClick={logout} className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg">Logout ({user.email})</button>
                        ) : (
                            <button onClick={handleLogin} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                                Login as Manager
                            </button>
                        )}
                        <button
                            onClick={handleSeed}
                            className="px-4 py-2 text-sm bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg transition-colors text-zinc-900 dark:text-zinc-100"
                        >
                            Seed Database
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
                        Error: {error}
                    </div>
                )}

                <ProductGrid
                    products={products}
                    isLoading={isLoading}
                    onAddToCart={handleAddToCart}
                />

                {toast && (
                    <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-xl text-white transform transition-all animate-in slide-in-from-bottom-5 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                        {toast.msg}
                    </div>
                )}
            </div>
        </div>
    );
}

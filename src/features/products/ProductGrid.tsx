import type { ProductDTO } from '@/services/productService';
import { ProductCard } from './ProductCard';
import { Icon } from '@/components/ui/AnimatedIcon';

interface ProductGridProps {
    products: ProductDTO[];
    isLoading: boolean;
    onAddToCart: (product: ProductDTO) => void;
}

export function ProductGrid({ products, isLoading, onAddToCart }: ProductGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-xl h-80 animate-pulse" />
                ))}
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12 text-zinc-500">
                <Icon.Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No products found</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} onAddToCart={onAddToCart} />
            ))}
        </div>
    );
}

import { useState } from 'react';
import type { ProductDTO } from '@/services/productService';
import { Icon } from '@/components/ui/AnimatedIcon';

interface ProductCardProps {
    product: ProductDTO;
    onAddToCart: (product: ProductDTO) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800 transition-all hover:scale-[1.02]">
            <div className="h-48 overflow-hidden bg-zinc-100 flex items-center justify-center relative">
                {product.image && !imageError ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-400">
                        <Icon.Ban className="w-12 h-12 mb-2 opacity-50" />
                        <span className="text-xs">No Image</span>
                    </div>
                )}
                <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs backdrop-blur-sm">
                    {product.category}
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-lg mb-1 truncate text-zinc-900 dark:text-zinc-100">{product.name}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2 mb-3 h-10">{product.description}</p>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-xl font-bold text-indigo-600">${product.price}</span>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                        <Icon.Plus className="w-4 h-4" />
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

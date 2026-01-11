import { useState, useEffect } from 'react';
import { productService } from '@/services/productService';
import type { ProductDTO } from '@/services/productService';

export function useProductList() {
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await productService.list();
            if (result.success) {
                setProducts(result.data);
            } else {
                setError(result.error.message);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return { products, isLoading, error, refresh: fetchProducts };
}

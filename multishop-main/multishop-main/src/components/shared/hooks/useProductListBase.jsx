/**
 * useProductListBase - Base hook for product listing
 * 
 * Shared logic for both client and admin product lists.
 * Provides: data fetching, filtering, sorting, pagination
 */

import { useMemo, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productRepository, createBaseRepository } from '@/components/data';
import { useDebouncedValue } from '@/components/shared/utils';

// Category repository
const categoryRepository = createBaseRepository('Category');

// ========== DEFAULT VALUES ==========
const DEFAULT_CATEGORIES = [
  { key: "all", name: "Tất Cả", icon: "🌿", value: "all", label: "Tất cả" },
  { key: "vegetables", name: "Rau Củ", icon: "🥬", value: "vegetables", label: "Rau Củ" },
  { key: "fruits", name: "Trái Cây", icon: "🍓", value: "fruits", label: "Trái Cây" },
  { key: "rice", name: "Gạo & Ngũ Cốc", icon: "🌾", value: "rice", label: "Gạo & Ngũ Cốc" },
  { key: "processed", name: "Chế Biến", icon: "🥫", value: "processed", label: "Chế Biến" },
  { key: "combo", name: "Combo", icon: "🎁", value: "combo", label: "Combo" }
];

// ========== CATEGORIES HOOK ==========

/**
 * Fetch categories - shared between client and admin
 * @param {Object} options
 * @param {boolean} [options.includeAll=true] - Include "All" option
 * @param {string} [options.format='client'] - 'client' (key/name/icon) or 'admin' (value/label)
 */
export function useCategoriesBase(options = {}) {
  const { includeAll = true, format = 'client' } = options;

  const { data: result, isLoading } = useQuery({
    queryKey: ['categories-base'],
    queryFn: () => categoryRepository.filter({ status: 'active' }, 'display_order', 50),
    placeholderData: { success: true, data: [] },
    staleTime: 15 * 60 * 1000
  });

  const categories = useMemo(() => {
    const dbCategories = result?.success ? result.data : [];
    
    if (!dbCategories || dbCategories.length === 0) {
      return includeAll ? DEFAULT_CATEGORIES : DEFAULT_CATEGORIES.slice(1);
    }

    const allOption = format === 'admin' 
      ? { value: "all", label: "Tất cả" }
      : { key: "all", name: "Tất Cả", icon: "🌿" };

    const mappedCategories = dbCategories.map(c => 
      format === 'admin'
        ? { value: c.key, label: c.name }
        : { key: c.key, name: c.name, icon: c.icon || "📦" }
    );

    return includeAll ? [allOption, ...mappedCategories] : mappedCategories;
  }, [result, includeAll, format]);

  return { categories, isLoading };
}

// ========== PRODUCT LIST HOOK ==========

/**
 * Base product list hook - shared logic
 * @param {Object} options
 * @param {boolean} [options.activeOnly=true] - Only fetch active products
 * @param {number} [options.limit=100] - Max products to fetch
 * @param {string} [options.queryKey='products-base'] - React Query key
 * @param {number} [options.staleTime=5*60*1000] - Cache time
 */
export function useProductListBase(options = {}) {
  const {
    activeOnly = true,
    limit = 100,
    queryKey = 'products-base',
    staleTime = 5 * 60 * 1000
  } = options;

  return useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const result = activeOnly
        ? await productRepository.listActive('-created_date', limit)
        : await productRepository.list('-created_date', limit);
      return result.success ? result.data : [];
    },
    staleTime
  });
}

// ========== FILTER STATE HOOK ==========

/**
 * Manage filter state for product lists
 */
export function useProductFilters(initialValues = {}) {
  const [searchTerm, setSearchTerm] = useState(initialValues.searchTerm || '');
  const [category, setCategory] = useState(initialValues.category || 'all');
  const [sortBy, setSortBy] = useState(initialValues.sortBy || 'featured');
  const [status, setStatus] = useState(initialValues.status || 'all');

  const debouncedSearch = useDebouncedValue(searchTerm, 300);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setCategory('all');
    setSortBy('featured');
    setStatus('all');
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    category,
    setCategory,
    sortBy,
    setSortBy,
    status,
    setStatus,
    clearFilters
  };
}

// ========== FILTERED PRODUCTS HOOK ==========

/**
 * Apply filters and sorting to product list
 * @param {Array} products - Raw product list
 * @param {Object} filters - Filter state from useProductFilters
 */
export function useFilteredProducts(products, filters) {
  const { debouncedSearch, category, sortBy, status } = filters;

  return useMemo(() => {
    if (!products || products.length === 0) return [];

    let filtered = [...products];

    // Filter by status (admin only)
    if (status && status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.category === category);
    }

    // Filter by search term
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.sku?.toLowerCase().includes(search)
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => ((a.sale_price || a.price) || 0) - ((b.sale_price || b.price) || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => ((b.sale_price || b.price) || 0) - ((a.sale_price || a.price) || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
        break;
      case 'stock':
        filtered.sort((a, b) => (a.stock_quantity || 0) - (b.stock_quantity || 0));
        break;
      case 'featured':
      default:
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (b.total_sold || 0) - (a.total_sold || 0);
        });
    }

    return filtered;
  }, [products, debouncedSearch, category, sortBy, status]);
}

// ========== PAGINATION HOOK ==========

/**
 * Paginate product list
 * @param {Array} products - Filtered products
 * @param {number} [pageSize=12] - Items per page
 */
export function useProductPagination(products, pageSize = 12) {
  const [page, setPage] = useState(1);

  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, page, pageSize]);

  const totalPages = Math.ceil(products.length / pageSize);

  const goToPage = useCallback((newPage) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => goToPage(page + 1), [page, goToPage]);
  const prevPage = useCallback(() => goToPage(page - 1), [page, goToPage]);

  // Reset to page 1 when products change
  useMemo(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [products.length, page, totalPages]);

  return {
    paginatedProducts,
    page,
    totalPages,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

// ========== COMBINED HOOK FOR CLIENT ==========

/**
 * Full product list hook for client pages
 * Combines: fetch + categories + filters + sorting
 */
export function useProductListClient() {
  const { data: products = [], isLoading, error } = useProductListBase({
    activeOnly: true,
    limit: 100,
    queryKey: 'products-client'
  });

  const { categories } = useCategoriesBase({ format: 'client' });
  const filters = useProductFilters();
  const filteredProducts = useFilteredProducts(products, filters);

  return {
    products: filteredProducts,
    allProducts: products,
    categories,
    isLoading,
    error,
    ...filters
  };
}

// ========== COMBINED HOOK FOR ADMIN ==========

/**
 * Full product list hook for admin pages
 * Includes: all statuses + more filters
 */
export function useProductListAdmin() {
  const { data: products = [], isLoading, error, refetch } = useProductListBase({
    activeOnly: false,
    limit: 500,
    queryKey: 'products-admin',
    staleTime: 2 * 60 * 1000
  });

  const { categories } = useCategoriesBase({ format: 'admin' });
  const filters = useProductFilters({ status: 'all' });
  const filteredProducts = useFilteredProducts(products, filters);

  return {
    products: filteredProducts,
    allProducts: products,
    categories,
    isLoading,
    error,
    refetch,
    ...filters
  };
}

export default {
  useCategoriesBase,
  useProductListBase,
  useProductFilters,
  useFilteredProducts,
  useProductPagination,
  useProductListClient,
  useProductListAdmin
};
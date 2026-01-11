import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { productRepository, createBaseRepository } from "@/components/data";
import { useDebouncedValue } from "@/components/shared/utils";
import { base44 } from "@/api/base44Client";

// Category repository (not in main data layer yet)
const categoryRepository = createBaseRepository('Category');

const defaultCategories = [
  { key: "all", name: "Tất Cả", icon: "🌿" },
  { key: "vegetables", name: "Rau Củ", icon: "🥬" },
  { key: "fruits", name: "Trái Cây", icon: "🍓" },
  { key: "rice", name: "Gạo & Ngũ Cốc", icon: "🌾" },
  { key: "processed", name: "Chế Biến", icon: "🥫" },
  { key: "combo", name: "Combo", icon: "🎁" }
];

export function useCategories() {
  const { data: result, isLoading } = useQuery({
    queryKey: ['categories-services'],
    queryFn: async () => {
      // Filter by status = active
      const filtered = await base44.entities.Category.filter(
        { status: 'active' },
        'display_order',
        50
      );
      return { success: true, data: filtered };
    },
    placeholderData: { success: true, data: [] },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 15 * 60 * 1000
  });

  const categories = useMemo(() => {
    const dbCategories = result?.success ? result.data : [];
    if (!dbCategories || dbCategories.length === 0) {
      return defaultCategories;
    }
    
    return [
      { key: "all", name: "Tất Cả", icon: "🌿" },
      ...dbCategories.map(c => ({
        key: c.key,
        name: c.name,
        icon: c.icon || "📦"
      }))
    ];
  }, [result]);

  return { categories, isLoading };
}

export function useProducts() {
  return useQuery({
    queryKey: ['products-list'],
    queryFn: async () => {
      // Query products active và không bị deleted
      const result = await productRepository.filter(
        { is_deleted: false, status: 'active' },
        '-created_date',
        500
      );
      return result.success ? result.data : [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 15 * 60 * 1000
  });
}

// Price range presets for filtering
export const PRICE_RANGES = [
  { key: 'all', label: 'Tất cả giá', min: 0, max: Infinity, icon: '💰' },
  { key: 'under50', label: 'Dưới 50k', min: 0, max: 50000, icon: '🪙' },
  { key: '50-100', label: '50k - 100k', min: 50000, max: 100000, icon: '💵' },
  { key: '100-200', label: '100k - 200k', min: 100000, max: 200000, icon: '💴' },
  { key: '200-500', label: '200k - 500k', min: 200000, max: 500000, icon: '💎' },
  { key: 'over500', label: 'Trên 500k', min: 500000, max: Infinity, icon: '👑' }
];

export function useFilteredProducts(products, activeFilter, searchTerm, sortBy, priceRange = 'all') {
  return useMemo(() => {
    if (!products || products.length === 0) return [];

    // Products đã được filter is_deleted=false ở query
    let activeProducts = products.filter(p => p.status === 'active' && !p.is_deleted);
    
    // Category filter
    if (activeFilter !== "all") {
      activeProducts = activeProducts.filter(product => product.category === activeFilter);
    }
    
    // Price range filter
    if (priceRange && priceRange !== 'all') {
      const range = PRICE_RANGES.find(r => r.key === priceRange);
      if (range) {
        activeProducts = activeProducts.filter(product => {
          const price = product.sale_price || product.price || 0;
          return price >= range.min && price < range.max;
        });
      }
    }
    
    // Search filter
    if (searchTerm) {
      activeProducts = activeProducts.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sorting
    switch(sortBy) {
      case 'price-low':
        activeProducts.sort((a, b) => ((a.sale_price || a.price) || 0) - ((b.sale_price || b.price) || 0));
        break;
      case 'price-high':
        activeProducts.sort((a, b) => ((b.sale_price || b.price) || 0) - ((a.sale_price || a.price) || 0));
        break;
      case 'name':
        activeProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'newest':
        activeProducts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        break;
      case 'popular':
        activeProducts.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
        break;
      case 'featured':
      default:
        activeProducts.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return (b.total_sold || 0) - (a.total_sold || 0);
        });
    }
    
    return activeProducts;
  }, [activeFilter, products, searchTerm, sortBy, priceRange]);
}

export function useFlipCategories(products, categories) {
  return useMemo(() => {
    if (!products || products.length === 0 || !categories) return [];
    
    return categories
      .filter(cat => cat.key !== 'all')
      .map(cat => ({
        id: cat.key,
        name: cat.name,
        icon: cat.icon,
        products: products
          .filter(p => p.category === cat.key && p.status === 'active')
          .map(p => ({
            product_id: p.id,
            product_name: p.name,
            product_image: p.image_url,
            product_video: p.video_url,
            product_price: p.sale_price || p.price
          }))
      }))
      .filter(cat => cat.products.length > 0);
  }, [products, categories]);
}
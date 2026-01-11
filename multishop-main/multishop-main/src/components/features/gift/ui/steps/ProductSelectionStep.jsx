/**
 * ProductSelectionStep - Step 1 of gift wizard
 * Product picker with search and filter
 */

import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function ProductSelectionStep({ selectedProduct, onSelect, onNext }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  // Fetch products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['gift-products'],
    queryFn: async () => {
      const allProducts = await base44.entities.Product.list('-created_date', 100);
      return allProducts.filter(p => p.status === 'active');
    },
    staleTime: 5 * 60 * 1000
  });

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term)
      );
    }
    
    if (category !== 'all') {
      result = result.filter(p => p.category === category);
    }
    
    return result;
  }, [products, search, category]);

  // Get categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return [
      { key: 'all', label: 'Tất cả' },
      ...Array.from(cats).map(c => ({ key: c, label: getCategoryLabel(c) }))
    ];
  }, [products]);

  return (
    <div className="p-6 space-y-4">
      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Icon.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm quà..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
        >
          {categories.map(c => (
            <option key={c.key} value={c.key}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Icon.Spinner size={32} className="text-[#7CB342]" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Icon.Package size={48} className="mx-auto mb-3 opacity-50" />
          <p>Không tìm thấy sản phẩm</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-1">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProduct?.id === product.id}
              onSelect={() => onSelect(product)}
            />
          ))}
        </div>
      )}

      {/* Selected Info & Next */}
      <div className="sticky bottom-0 pt-4 border-t border-gray-100 bg-white">
        {selectedProduct && (
          <div className="flex items-center gap-3 mb-3 p-3 bg-[#7CB342]/5 rounded-lg">
            <img
              src={selectedProduct.image_url}
              alt={selectedProduct.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{selectedProduct.name}</p>
              <p className="text-[#7CB342] font-bold">
                {(selectedProduct.sale_price || selectedProduct.price)?.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>
        )}
        <Button
          onClick={onNext}
          disabled={!selectedProduct}
          className="w-full bg-[#7CB342] hover:bg-[#689F38]"
        >
          Tiếp tục
          <Icon.ChevronRight size={18} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}

function ProductCard({ product, isSelected, onSelect }) {
  const price = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative p-2 rounded-xl border-2 transition-all text-left ${
        isSelected
          ? 'border-[#7CB342] bg-[#7CB342]/5 shadow-md'
          : 'border-gray-200 hover:border-[#7CB342]/50 hover:shadow-sm'
      }`}
    >
      {/* Selected Check */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-[#7CB342] rounded-full flex items-center justify-center z-10">
          <Icon.Check size={14} className="text-white" />
        </div>
      )}

      {/* Image */}
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-2">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      </div>

      {/* Info */}
      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
        {product.name}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-[#7CB342] font-bold text-sm">
          {price?.toLocaleString('vi-VN')}đ
        </span>
        {hasDiscount && (
          <span className="text-xs text-gray-400 line-through">
            {product.price?.toLocaleString('vi-VN')}đ
          </span>
        )}
      </div>
    </button>
  );
}

function getCategoryLabel(key) {
  const map = {
    vegetables: 'Rau củ',
    fruits: 'Trái cây',
    rice: 'Gạo',
    processed: 'Chế biến',
    combo: 'Combo'
  };
  return map[key] || key;
}
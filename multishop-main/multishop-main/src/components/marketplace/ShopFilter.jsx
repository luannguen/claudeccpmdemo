/**
 * ShopFilter.jsx
 * Filter component for marketplace shop browsing
 * 
 * Phase 5 - Task 5.3 of SaaS Upgrade Plan
 * Created: 2025-01-19
 */

import React from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// ========== CONSTANTS ==========

const BUSINESS_TYPES = [
  { value: 'all', label: 'Tất cả loại hình' },
  { value: 'farm', label: 'Nông trại' },
  { value: 'store', label: 'Cửa hàng' },
  { value: 'cooperative', label: 'Hợp tác xã' },
  { value: 'distributor', label: 'Nhà phân phối' }
];

const INDUSTRIES = [
  { value: 'all', label: 'Tất cả ngành' },
  { value: 'vegetables', label: 'Rau củ' },
  { value: 'fruits', label: 'Trái cây' },
  { value: 'meat', label: 'Thịt' },
  { value: 'seafood', label: 'Hải sản' },
  { value: 'dairy', label: 'Sữa' },
  { value: 'grains', label: 'Ngũ cốc' },
  { value: 'organic', label: 'Hữu cơ' }
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'products', label: 'Nhiều sản phẩm nhất' },
  { value: 'newest', label: 'Mới nhất' }
];

// ========== COMPONENT ==========

export default function ShopFilter({ 
  filters, 
  onFilterChange, 
  onReset,
  totalResults = 0,
  variant = 'default' 
}) {
  const hasFilters = filters.search || (filters.category && filters.category !== 'all') || (filters.industry && filters.industry !== 'all');

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm shop..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={filters.sortBy} onValueChange={(v) => onFilterChange('sortBy', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Tìm kiếm shop, sản phẩm..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="pl-12 h-12 text-base rounded-xl"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange('search', '')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <Button variant="outline" className="h-12 gap-2 rounded-xl">
          <SlidersHorizontal className="w-4 h-4" />
          Lọc nâng cao
        </Button>
      </div>
      
      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filters.category} onValueChange={(v) => onFilterChange('category', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Loại hình" />
          </SelectTrigger>
          <SelectContent>
            {BUSINESS_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filters.industry} onValueChange={(v) => onFilterChange('industry', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ngành hàng" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRIES.map(ind => (
              <SelectItem key={ind.value} value={ind.value}>{ind.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filters.sortBy} onValueChange={(v) => onFilterChange('sortBy', v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Results count & Reset */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm text-gray-500">
            {totalResults} shop
          </span>
          
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-[#7CB342] hover:text-[#558B2F] gap-1"
            >
              <X className="w-4 h-4" />
              Xóa lọc
            </Button>
          )}
        </div>
      </div>
      
      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Tìm: "{filters.search}"
              <button onClick={() => onFilterChange('search', '')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.category && filters.category !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {BUSINESS_TYPES.find(t => t.value === filters.category)?.label}
              <button onClick={() => onFilterChange('category', 'all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {filters.industry && filters.industry !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {INDUSTRIES.find(i => i.value === filters.industry)?.label}
              <button onClick={() => onFilterChange('industry', 'all')}>
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
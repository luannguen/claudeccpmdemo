/**
 * SaaS Module - Shop Filter Component
 * 
 * Filter controls for marketplace shop browsing.
 * 
 * @module features/saas/ui/marketplace
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BUSINESS_TYPES, INDUSTRIES } from '../../types';

// ========== FILTER OPTIONS ==========

const BUSINESS_TYPE_OPTIONS = [
  { value: '', label: 'Tất cả loại hình' },
  { value: BUSINESS_TYPES.FARM, label: 'Nông trại' },
  { value: BUSINESS_TYPES.COOPERATIVE, label: 'Hợp tác xã' },
  { value: BUSINESS_TYPES.DISTRIBUTOR, label: 'Nhà phân phối' },
  { value: BUSINESS_TYPES.RETAILER, label: 'Nhà bán lẻ' },
  { value: BUSINESS_TYPES.RESTAURANT, label: 'Nhà hàng' }
];

const INDUSTRY_OPTIONS = [
  { value: '', label: 'Tất cả ngành' },
  { value: INDUSTRIES.VEGETABLES, label: 'Rau củ' },
  { value: INDUSTRIES.FRUITS, label: 'Trái cây' },
  { value: INDUSTRIES.LIVESTOCK, label: 'Chăn nuôi' },
  { value: INDUSTRIES.SEAFOOD, label: 'Hải sản' },
  { value: INDUSTRIES.MIXED, label: 'Tổng hợp' }
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
  const hasFilters = filters.search || filters.category || filters.industry;

  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Icon.Search className="absolute left-3 top-1/2 -translate-y-1/2" />
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
          <Icon.Search className="absolute left-4 top-1/2 -translate-y-1/2" />
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
              <Icon.X />
            </button>
          )}
        </div>
        
        <Button variant="outline" className="h-12 rounded-xl">
          <Icon.Filter />
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
            {BUSINESS_TYPE_OPTIONS.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filters.industry} onValueChange={(v) => onFilterChange('industry', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Ngành hàng" />
          </SelectTrigger>
          <SelectContent>
            {INDUSTRY_OPTIONS.map(ind => (
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
              className="text-[#7CB342] hover:text-[#558B2F]"
            >
              <Icon.X />
              Xóa lọc
            </Button>
          )}
        </div>
      </div>
      
      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary">
              Tìm: "{filters.search}"
              <button onClick={() => onFilterChange('search', '')}>
                <Icon.X />
              </button>
            </Badge>
          )}
          {filters.category && (
            <Badge variant="secondary">
              {BUSINESS_TYPE_OPTIONS.find(t => t.value === filters.category)?.label}
              <button onClick={() => onFilterChange('category', '')}>
                <Icon.X />
              </button>
            </Badge>
          )}
          {filters.industry && (
            <Badge variant="secondary">
              {INDUSTRY_OPTIONS.find(i => i.value === filters.industry)?.label}
              <button onClick={() => onFilterChange('industry', '')}>
                <Icon.X />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
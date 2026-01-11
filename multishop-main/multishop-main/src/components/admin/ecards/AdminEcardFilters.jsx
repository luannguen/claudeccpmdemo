/**
 * AdminEcardFilters - Advanced filtering for admin
 * UI Layer - Presentation only
 * 
 * @module admin/ecards
 */

import React from 'react';
import { Icon } from '@/components/ui/AnimatedIcon';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DEFAULT_FILTERS = {
  search: '',
  status: 'all',
  verified: 'all',
  dateRange: 'all',
  sort: '-created_date'
};

export default function AdminEcardFilters({ filters, onChange, onReset, viewMode, onViewModeChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Icon.Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm theo tên, email, công ty..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status Filter */}
        <Select 
          value={filters.status} 
          onValueChange={(v) => handleChange('status', v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="public">Công khai</SelectItem>
            <SelectItem value="private">Riêng tư</SelectItem>
          </SelectContent>
        </Select>

        {/* Verification Filter */}
        <Select 
          value={filters.verified} 
          onValueChange={(v) => handleChange('verified', v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Xác thực" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="verified">Đã xác thực</SelectItem>
            <SelectItem value="unverified">Chưa xác thực</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range */}
        <Select 
          value={filters.dateRange} 
          onValueChange={(v) => handleChange('dateRange', v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="today">Hôm nay</SelectItem>
            <SelectItem value="7d">7 ngày</SelectItem>
            <SelectItem value="30d">30 ngày</SelectItem>
            <SelectItem value="90d">90 ngày</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select 
          value={filters.sort} 
          onValueChange={(v) => handleChange('sort', v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-created_date">Mới nhất</SelectItem>
            <SelectItem value="created_date">Cũ nhất</SelectItem>
            <SelectItem value="-view_count">Nhiều lượt xem</SelectItem>
            <SelectItem value="display_name">Tên A-Z</SelectItem>
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon.Grid size={18} />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-[#7CB342] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Icon.List size={18} />
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={() => onReset(DEFAULT_FILTERS)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          title="Đặt lại bộ lọc"
        >
          <Icon.RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
}

export { DEFAULT_FILTERS };
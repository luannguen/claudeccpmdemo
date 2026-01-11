/**
 * FeatureSpecFilters - Bộ lọc cho Feature Registry
 * UI Layer only
 */

import React from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_CONFIG, PRIORITY_CONFIG, TYPE_CONFIG } from './FeatureSpecCard';

const MODULE_OPTIONS = [
  { value: 'ecard', label: 'E-Card' },
  { value: 'community', label: 'Community' },
  { value: 'shop', label: 'Shop' },
  { value: 'admin', label: 'Admin' },
  { value: 'core', label: 'Core' },
  { value: 'notification', label: 'Notification' },
  { value: 'referral', label: 'Referral' },
  { value: 'checkout', label: 'Checkout' },
  { value: 'preorder', label: 'Pre-Order' },
  { value: 'saas', label: 'SaaS' },
  { value: 'gift', label: 'Gift' },
  { value: 'other', label: 'Khác' }
];

const DEFAULT_FILTERS = {
  search: '',
  status: 'all',
  priority: 'all',
  module: 'all',
  type: 'all'
};

export default function FeatureSpecFilters({ filters, onChange, stats }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onChange(DEFAULT_FILTERS);
  };

  const activeFiltersCount = Object.entries(filters).filter(
    ([key, value]) => key !== 'search' && value !== 'all'
  ).length;

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Tìm kiếm theo FCode, tên, mô tả..."
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status */}
        <Select value={filters.status} onValueChange={(v) => handleChange('status', v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>
                {cfg.icon} {cfg.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority */}
        <Select value={filters.priority} onValueChange={(v) => handleChange('priority', v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Ưu tiên" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả ưu tiên</SelectItem>
            {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Module */}
        <Select value={filters.module} onValueChange={(v) => handleChange('module', v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả module</SelectItem>
            {MODULE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type */}
        <Select value={filters.type} onValueChange={(v) => handleChange('type', v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Loại" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại</SelectItem>
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset */}
        {(filters.search || activeFiltersCount > 0) && (
          <Button variant="ghost" onClick={handleReset} className="text-gray-500">
            <X className="w-4 h-4 mr-1" /> Xóa bộ lọc
          </Button>
        )}

        {/* Active filters count */}
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="bg-violet-100 text-violet-700">
            <Filter className="w-3 h-3 mr-1" />
            {activeFiltersCount} bộ lọc
          </Badge>
        )}
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="flex flex-wrap gap-3 pt-3 border-t text-sm">
          <span className="text-gray-500">Tổng: <strong>{stats.total}</strong></span>
          <span className="text-yellow-600">Đang làm: <strong>{stats.inProgress}</strong></span>
          <span className="text-cyan-600">Testing: <strong>{stats.testing}</strong></span>
          <span className="text-green-600">Released: <strong>{stats.released}</strong></span>
        </div>
      )}
    </div>
  );
}

export { DEFAULT_FILTERS, MODULE_OPTIONS };
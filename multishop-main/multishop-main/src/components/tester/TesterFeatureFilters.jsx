/**
 * TesterFeatureFilters - Bộ lọc và tìm kiếm cho tính năng/test case
 */

import React from "react";
import {
  Search, Filter, SlidersHorizontal, X, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function TesterFeatureFilters({
  filters,
  onFilterChange,
  onClearFilters,
  stats = {}
}) {
  const hasActiveFilters = filters.search || 
    filters.status !== 'all' || 
    filters.category !== 'all' || 
    filters.priority !== 'all';

  const activeFilterCount = [
    filters.search,
    filters.status !== 'all',
    filters.category !== 'all',
    filters.priority !== 'all'
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            placeholder="Tìm kiếm tính năng, test case..."
            className="pl-10"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 relative">
              <SlidersHorizontal className="w-4 h-4" />
              Lọc
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-violet-600 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Bộ lọc</h4>
                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onClearFilters}
                    className="text-xs text-violet-600"
                  >
                    Xóa tất cả
                  </Button>
                )}
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Trạng thái test
                </label>
                <Select 
                  value={filters.status || 'all'}
                  onValueChange={(v) => onFilterChange({ ...filters, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả ({stats.total || 0})</SelectItem>
                    <SelectItem value="pending">⏳ Chờ test ({stats.pending || 0})</SelectItem>
                    <SelectItem value="ready_for_retest">🔄 Cần test lại ({stats.ready_for_retest || 0})</SelectItem>
                    <SelectItem value="passed">✅ Passed ({stats.passed || 0})</SelectItem>
                    <SelectItem value="failed">❌ Failed ({stats.failed || 0})</SelectItem>
                    <SelectItem value="blocked">🚫 Blocked ({stats.blocked || 0})</SelectItem>
                    <SelectItem value="skipped">⏭️ Skipped ({stats.skipped || 0})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Danh mục
                </label>
                <Select 
                  value={filters.category || 'all'}
                  onValueChange={(v) => onFilterChange({ ...filters, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    <SelectItem value="core">Core System</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="payment">Thanh toán</SelectItem>
                    <SelectItem value="order">Đơn hàng</SelectItem>
                    <SelectItem value="product">Sản phẩm</SelectItem>
                    <SelectItem value="customer">Khách hàng</SelectItem>
                    <SelectItem value="referral">Giới thiệu</SelectItem>
                    <SelectItem value="notification">Thông báo</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Độ ưu tiên
                </label>
                <Select 
                  value={filters.priority || 'all'}
                  onValueChange={(v) => onFilterChange({ ...filters, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả độ ưu tiên" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="critical">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Critical
                      </span>
                    </SelectItem>
                    <SelectItem value="high">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        High
                      </span>
                    </SelectItem>
                    <SelectItem value="medium">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        Medium
                      </span>
                    </SelectItem>
                    <SelectItem value="low">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                        Low
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Tìm: "{filters.search}"
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFilterChange({ ...filters, search: '' })}
              />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Trạng thái: {filters.status}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFilterChange({ ...filters, status: 'all' })}
              />
            </Badge>
          )}
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Danh mục: {filters.category}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFilterChange({ ...filters, category: 'all' })}
              />
            </Badge>
          )}
          {filters.priority !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Ưu tiên: {filters.priority}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onFilterChange({ ...filters, priority: 'all' })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
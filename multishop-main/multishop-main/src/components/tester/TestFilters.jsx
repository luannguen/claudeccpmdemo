/**
 * TestFilters - Advanced filters cho test cases (UI Layer)
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, User, X, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TestFilters({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  testStats = {}
}) {
  const hasActiveFilters = filters.search || 
    filters.status !== 'all' || 
    filters.assigned !== 'all' ||
    filters.severity !== 'all';

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={filters.search || ''}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                placeholder="Tìm test case..."
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <Select 
            value={filters.status || 'all'} 
            onValueChange={(v) => onFilterChange({ ...filters, status: v })}
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ({testStats.total || 0})</SelectItem>
              <SelectItem value="ready_for_retest">🔄 Test lại ({testStats.ready_for_retest || 0})</SelectItem>
              <SelectItem value="pending">⏳ Chờ ({testStats.pending || 0})</SelectItem>
              <SelectItem value="passed">✅ Passed ({testStats.passed || 0})</SelectItem>
              <SelectItem value="failed">❌ Failed ({testStats.failed || 0})</SelectItem>
              <SelectItem value="blocked">🚫 Blocked ({testStats.blocked || 0})</SelectItem>
              <SelectItem value="skipped">⏭️ Skipped ({testStats.skipped || 0})</SelectItem>
            </SelectContent>
          </Select>

          {/* Assigned Filter */}
          <Select 
            value={filters.assigned || 'all'} 
            onValueChange={(v) => onFilterChange({ ...filters, assigned: v })}
          >
            <SelectTrigger className="w-[180px]">
              <User className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Phân công" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="mine">Của tôi</SelectItem>
              <SelectItem value="unassigned">Chưa gán</SelectItem>
            </SelectContent>
          </Select>

          {/* Severity Filter (for failed tests) */}
          <Select 
            value={filters.severity || 'all'} 
            onValueChange={(v) => onFilterChange({ ...filters, severity: v })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Mức độ lỗi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả mức</SelectItem>
              <SelectItem value="blocker">🔴 Blocker</SelectItem>
              <SelectItem value="critical">🟠 Critical</SelectItem>
              <SelectItem value="major">🟡 Major</SelectItem>
              <SelectItem value="minor">🟢 Minor</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClearFilters}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Xóa bộ lọc
            </Button>
          )}

          {/* Active Filters Badge */}
          {hasActiveFilters && (
            <Badge variant="outline" className="ml-auto">
              {Object.values(filters).filter(v => v && v !== 'all').length} bộ lọc
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
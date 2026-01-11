import React, { useState } from "react";
import { 
  Trash2, RotateCcw, EyeOff, CheckCircle, XCircle, 
  Star, StarOff, FolderInput, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductBulkActions({
  selectedCount,
  hasDeletedSelected,
  onBulkSoftDelete,
  onBulkRestore,
  onBulkDelete,
  onBulkUpdateStatus,
  onBulkUpdateCategory,
  onBulkToggleFeatured,
  onClearSelection,
  categories = [],
  isLoading = false
}) {
  const [categoryValue, setCategoryValue] = useState("");

  if (selectedCount === 0) return null;

  const handleCategoryChange = (value) => {
    setCategoryValue(value);
    if (value && value !== "none") {
      onBulkUpdateCategory(value);
      setCategoryValue("");
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#7CB342]/10 to-[#8BC34A]/10 border border-[#7CB342]/30 rounded-2xl p-4 mb-6 animate-in slide-in-from-top-2 duration-300">
      <div className="flex flex-wrap items-center gap-3">
        {/* Selection info */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#7CB342] text-white rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          <span>{selectedCount} đã chọn</span>
          <button 
            onClick={onClearSelection}
            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        <div className="h-6 w-px bg-gray-300" />

        {/* Quick Actions */}
        {hasDeletedSelected ? (
          // Actions for deleted products
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkRestore}
              disabled={isLoading}
              className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50"
            >
              <RotateCcw className="w-4 h-4" />
              Khôi phục
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkDelete}
              disabled={isLoading}
              className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Xóa vĩnh viễn
            </Button>
          </>
        ) : (
          // Actions for active products
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onBulkSoftDelete}
              disabled={isLoading}
              className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <EyeOff className="w-4 h-4" />
              Ẩn
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkUpdateStatus('active')}
              disabled={isLoading}
              className="gap-1.5 text-green-600 border-green-200 hover:bg-green-50"
            >
              <CheckCircle className="w-4 h-4" />
              Kích hoạt
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkUpdateStatus('inactive')}
              disabled={isLoading}
              className="gap-1.5 text-gray-600 border-gray-200 hover:bg-gray-50"
            >
              <XCircle className="w-4 h-4" />
              Ngừng bán
            </Button>

            <div className="h-6 w-px bg-gray-300" />

            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkToggleFeatured(true)}
              disabled={isLoading}
              className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
            >
              <Star className="w-4 h-4" />
              Nổi bật
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkToggleFeatured(false)}
              disabled={isLoading}
              className="gap-1.5 text-gray-500 border-gray-200 hover:bg-gray-50"
            >
              <StarOff className="w-4 h-4" />
              Bỏ nổi bật
            </Button>

            <div className="h-6 w-px bg-gray-300" />

            {/* Category dropdown */}
            <div className="flex items-center gap-2">
              <FolderInput className="w-4 h-4 text-gray-500" />
              <Select value={categoryValue} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[160px] h-8 text-sm">
                  <SelectValue placeholder="Chuyển danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.value !== 'all').map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
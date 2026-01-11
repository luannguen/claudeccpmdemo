import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductListView({ 
  products, 
  onEdit, 
  onSoftDelete,
  onRestore,
  onClone,
  onPermanentDelete,
  selectedIds = new Set(),
  onToggleSelect,
  onSelectAll
}) {
  const allSelected = products.length > 0 && selectedIds.size === products.length;

  return (
    <div className="space-y-4">
      {/* Select All header */}
      {onSelectAll && products.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
          <Checkbox 
            checked={allSelected}
            onCheckedChange={onSelectAll}
            className="data-[state=checked]:bg-[#7CB342] data-[state=checked]:border-[#7CB342]"
          />
          <span className="text-sm text-gray-600">
            {allSelected ? 'Bỏ chọn tất cả' : `Chọn tất cả (${products.length})`}
          </span>
        </div>
      )}
      
      {products.map((product) => {
        const isSelected = selectedIds.has(product.id);
        return (
        <motion.div 
          key={product.id} 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }}
          className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all flex gap-6 ${
            product.is_deleted ? 'opacity-60 border-2 border-dashed border-gray-300' : ''
          } ${isSelected ? 'ring-2 ring-[#7CB342] ring-offset-2' : ''}`}
        >
          {/* Checkbox */}
          {onToggleSelect && (
            <div className="flex items-center">
              <Checkbox 
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(product.id)}
                className="data-[state=checked]:bg-[#7CB342] data-[state=checked]:border-[#7CB342]"
              />
            </div>
          )}
          
          <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon.Package className="w-12 h-12 text-gray-300" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-serif text-xl font-bold">{product.name}</h3>
              <div className="flex gap-2 flex-wrap">
                {product.is_deleted && (
                  <Badge variant="destructive">Đã Xóa</Badge>
                )}
                {product.featured && (
                  <Badge className="bg-[#FF9800] text-white">Nổi bật</Badge>
                )}
                {product.cloned_from_id && (
                  <Badge variant="outline">Bản sao</Badge>
                )}
                <Badge className={`${
                  product.status === 'active' ? 'bg-green-100 text-green-600' : 
                  product.status === 'out_of_stock' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {product.status === 'active' ? 'Hoạt động' : 
                   product.status === 'out_of_stock' ? 'Hết hàng' : 'Tạm Ngưng'}
                </Badge>
              </div>
            </div>
            <p className="text-gray-600 mb-3 line-clamp-2">{product.description || 'Chưa có mô tả'}</p>
            <div className="flex items-center gap-6 mb-3">
              <span className="text-2xl font-bold text-[#7CB342]">{(product.price || 0).toLocaleString('vi-VN')}đ</span>
              <span className="text-gray-500">/{product.unit}</span>
              <span className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</span>
              <span className="text-sm text-gray-500">Tồn: {product.stock_quantity || 0}</span>
            </div>
            {product.is_deleted ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => onRestore(product)}
                  className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-100 flex items-center gap-2"
                >
                  <Icon.CornerDownLeft className="w-4 h-4" />Khôi Phục
                </button>
                <button 
                  onClick={() => onPermanentDelete(product)}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 flex items-center gap-2"
                >
                  <Icon.Trash className="w-4 h-4" />Xóa Vĩnh Viễn
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => onEdit(product)}
                  className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-2"
                >
                  <Icon.Edit className="w-4 h-4" />Sửa
                </button>
                <button 
                  onClick={() => onClone(product)}
                  className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-100 flex items-center gap-2"
                >
                  <Icon.Copy className="w-4 h-4" />Sao Chép
                </button>
                <button 
                  onClick={() => onSoftDelete(product)}
                  className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-100 flex items-center gap-2"
                >
                  <Icon.Ban className="w-4 h-4" />Ẩn
                </button>
              </div>
            )}
          </div>
        </motion.div>
      );
      })}
    </div>
  );
}
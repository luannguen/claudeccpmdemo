import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductGridView({ 
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
    <div>
      {/* Select All header */}
      {onSelectAll && products.length > 0 && (
        <div className="flex items-center gap-3 mb-4 px-2">
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
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => {
        const isSelected = selectedIds.has(product.id);
        return (
        <motion.div 
          key={product.id} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all relative ${
            product.is_deleted ? 'opacity-60' : ''
          } ${isSelected ? 'ring-2 ring-[#7CB342] ring-offset-2' : ''}`}
        >
          {/* Selection checkbox */}
          {onToggleSelect && (
            <div className="absolute top-3 left-3 z-10">
              <Checkbox 
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(product.id)}
                className="bg-white/90 backdrop-blur-sm data-[state=checked]:bg-[#7CB342] data-[state=checked]:border-[#7CB342]"
              />
            </div>
          )}
          <div className="relative h-48 bg-gray-100">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon.Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
            {product.video_url && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-red-600 text-white text-xs flex items-center gap-1">
                  <Icon.Camera className="w-3 h-3" />Video
                </Badge>
              </div>
            )}
            <div className="absolute top-3 right-3 flex gap-2 flex-wrap">
              {product.is_deleted && (
                <Badge variant="destructive" className="text-xs">Đã Xóa</Badge>
              )}
              {product.featured && (
                <Badge className="bg-[#FF9800] text-white text-xs">Nổi bật</Badge>
              )}
              {product.cloned_from_id && (
                <Badge variant="outline" className="text-xs">Bản sao</Badge>
              )}
              <Badge className={`text-xs ${
                product.status === 'active' ? 'bg-green-100 text-green-600' :
                product.status === 'out_of_stock' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {product.status === 'active' ? 'Hoạt động' :
                 product.status === 'out_of_stock' ? 'Hết hàng' : 'Tạm Ngưng'}
              </Badge>
            </div>
          </div>
          <div className="p-6">
            <h3 className="font-serif text-lg font-bold mb-2">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description || 'Chưa có mô tả'}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold text-[#7CB342]">{(product.price || 0).toLocaleString('vi-VN')}đ</span>
              <span className="text-sm text-gray-500">/{product.unit}</span>
            </div>
            {product.is_deleted ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => onRestore(product)}
                  className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg font-medium hover:bg-green-100 flex items-center justify-center gap-2"
                >
                  <Icon.CornerDownLeft className="w-4 h-4" />Khôi Phục
                </button>
                <button 
                  onClick={() => onPermanentDelete(product)}
                  className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-medium hover:bg-red-100 flex items-center justify-center gap-2"
                >
                  <Icon.Trash className="w-4 h-4" />Xóa Vĩnh Viễn
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => onEdit(product)}
                  className="bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 flex items-center justify-center gap-1 text-sm"
                >
                  <Icon.Edit className="w-4 h-4" />Sửa
                </button>
                <button 
                  onClick={() => onClone(product)}
                  className="bg-purple-50 text-purple-600 py-2 rounded-lg font-medium hover:bg-purple-100 flex items-center justify-center gap-1 text-sm"
                >
                  <Icon.Copy className="w-4 h-4" />Sao
                </button>
                <button 
                  onClick={() => onSoftDelete(product)}
                  className="bg-orange-50 text-orange-600 py-2 rounded-lg font-medium hover:bg-orange-100 flex items-center justify-center gap-1 text-sm"
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
    </div>
  );
}
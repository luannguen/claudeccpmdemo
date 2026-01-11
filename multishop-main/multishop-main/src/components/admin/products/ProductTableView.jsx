import React from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export default function ProductTableView({ 
  products, 
  categories, 
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {onSelectAll && (
                <th className="p-4 w-12">
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                    className="data-[state=checked]:bg-[#7CB342] data-[state=checked]:border-[#7CB342]"
                  />
                </th>
              )}
              <th className="text-left p-4 text-sm font-medium text-gray-600">Hình</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Tên</th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">Danh mục</th>
              <th className="text-right p-4 text-sm font-medium text-gray-600">Giá</th>
              <th className="text-center p-4 text-sm font-medium text-gray-600">Tồn kho</th>
              <th className="text-center p-4 text-sm font-medium text-gray-600">Trạng thái</th>
              <th className="text-center p-4 text-sm font-medium text-gray-600">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const isSelected = selectedIds.has(product.id);
              return (
              <tr 
                key={product.id} 
                className={`border-b hover:bg-gray-50 ${
                  product.is_deleted ? 'bg-gray-100/50 opacity-60' : ''
                } ${isSelected ? 'bg-[#7CB342]/10' : ''}`}
              >
                {onToggleSelect && (
                  <td className="p-4 w-12">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(product.id)}
                      className="data-[state=checked]:bg-[#7CB342] data-[state=checked]:border-[#7CB342]"
                    />
                  </td>
                )}
                <td className="p-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Icon.Package className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sku || 'N/A'}</p>
                    </div>
                    {product.cloned_from_id && (
                      <Badge variant="outline" className="text-xs">Copy</Badge>
                    )}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {categories.find(c => c.value === product.category)?.label || product.category}
                </td>
                <td className="p-4 text-right">
                  <p className="font-bold text-[#7CB342]">{(product.price || 0).toLocaleString('vi-VN')}đ</p>
                  <p className="text-xs text-gray-500">/{product.unit}</p>
                </td>
                <td className="p-4 text-center">{product.stock_quantity || 0}</td>
                <td className="p-4 text-center">
                  <div className="flex gap-1 justify-center flex-wrap">
                    {product.is_deleted && (
                      <Badge variant="destructive" className="text-xs">Đã Xóa</Badge>
                    )}
                    <Badge className={`text-xs ${
                      product.status === 'active' ? 'bg-green-100 text-green-600' : 
                      product.status === 'out_of_stock' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {product.status === 'active' ? 'Hoạt động' : 
                       product.status === 'out_of_stock' ? 'Hết hàng' : 'Tạm Ngưng'}
                    </Badge>
                  </div>
                </td>
                <td className="p-4">
                  {product.is_deleted ? (
                    <div className="flex gap-1 justify-center">
                      <button 
                        onClick={() => onRestore(product)}
                        className="bg-green-50 text-green-600 p-2 rounded-lg hover:bg-green-100"
                        title="Khôi phục"
                      >
                        <Icon.CornerDownLeft className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onPermanentDelete(product)}
                        className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"
                        title="Xóa vĩnh viễn"
                      >
                        <Icon.Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-1 justify-center">
                      <button 
                        onClick={() => onEdit(product)}
                        className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100"
                        title="Sửa"
                      >
                        <Icon.Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onClone(product)}
                        className="bg-purple-50 text-purple-600 p-2 rounded-lg hover:bg-purple-100"
                        title="Sao chép"
                      >
                        <Icon.Copy className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onSoftDelete(product)}
                        className="bg-orange-50 text-orange-600 p-2 rounded-lg hover:bg-orange-100"
                        title="Ẩn"
                      >
                        <Icon.Ban className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { Star, Eye, Plus, ChevronUp, ChevronDown } from "lucide-react";

export default function ProductTable({ products }) {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedProducts = React.useMemo(() => {
    if (!sortColumn) return products;
    
    return [...products].sort((a, b) => {
      let aVal, bVal;
      
      switch(sortColumn) {
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'price':
          aVal = a.sale_price || a.price || 0;
          bVal = b.sale_price || b.price || 0;
          break;
        case 'rating':
          aVal = a.rating_average || 0;
          bVal = b.rating_average || 0;
          break;
        default:
          return 0;
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [products, sortColumn, sortDirection]);

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    window.dispatchEvent(new CustomEvent('add-to-cart', { 
      detail: { 
        id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        unit: product.unit,
        image_url: product.image_url,
        quantity: 1
      } 
    }));
  };

  const handleQuickView = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('quick-view-product', { detail: { product } }));
  };

  const SortIcon = ({ column }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3 h-3" /> 
      : <ChevronDown className="w-3 h-3" />;
  };

  return (
    <div className="overflow-x-auto">
      {/* Desktop Table */}
      <table className="w-full hidden md:table">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            <th className="text-left p-4 text-sm font-bold text-gray-700">Sản phẩm</th>
            <th 
              onClick={() => handleSort('price')}
              className="text-right p-4 text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-end gap-1">
                Giá <SortIcon column="price" />
              </div>
            </th>
            <th 
              onClick={() => handleSort('rating')}
              className="text-center p-4 text-sm font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-center gap-1">
                Đánh giá <SortIcon column="rating" />
              </div>
            </th>
            <th className="text-center p-4 text-sm font-bold text-gray-700">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map((product) => {
            const displayPrice = product.sale_price || product.price;
            const hasDiscount = product.sale_price && product.sale_price < product.price;

            return (
              <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-gray-900 line-clamp-2">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{product.unit}</span>
                        {product.featured && (
                          <span className="px-1.5 py-0.5 bg-[#FF9800] text-white rounded text-[10px] font-bold">
                            NỔI BẬT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex flex-col items-end">
                    <span className="text-base font-bold text-[#7CB342]">
                      {displayPrice?.toLocaleString('vi-VN')}đ
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        {product.price?.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-sm">{product.rating_average || 5}</span>
                    <span className="text-gray-400 text-xs">({product.rating_count || 0})</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => handleQuickView(e, product)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Xem nhanh"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="p-2 bg-[#7CB342] text-white rounded-lg hover:bg-[#FF9800] transition-colors"
                      title="Thêm vào giỏ"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile Card List */}
      <div className="md:hidden divide-y divide-gray-100">
        {/* Mobile Sort Bar */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
          <span className="text-xs text-gray-500">Sắp xếp:</span>
          <button
            onClick={() => handleSort('name')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              sortColumn === 'name' ? 'bg-[#7CB342] text-white' : 'bg-white text-gray-600 border'
            }`}
          >
            Tên <SortIcon column="name" />
          </button>
          <button
            onClick={() => handleSort('price')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              sortColumn === 'price' ? 'bg-[#7CB342] text-white' : 'bg-white text-gray-600 border'
            }`}
          >
            Giá <SortIcon column="price" />
          </button>
          <button
            onClick={() => handleSort('rating')}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              sortColumn === 'rating' ? 'bg-[#7CB342] text-white' : 'bg-white text-gray-600 border'
            }`}
          >
            Rating <SortIcon column="rating" />
          </button>
        </div>

        {/* Mobile Product Items */}
        {sortedProducts.map((product) => {
          const displayPrice = product.sale_price || product.price;
          const hasDiscount = product.sale_price && product.sale_price < product.price;

          return (
            <div 
              key={product.id} 
              className="flex items-center gap-3 p-3 bg-white active:bg-gray-50"
              onClick={(e) => handleQuickView(e, product)}
            >
              {/* Image */}
              <div className="relative flex-shrink-0">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                {product.featured && (
                  <span className="absolute -top-1 -left-1 px-1 py-0.5 bg-[#FF9800] text-white rounded text-[8px] font-bold shadow-sm">
                    HOT
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight mb-1">
                  {product.name}
                </p>
                
                <div className="flex items-center gap-2 mb-1.5">
                  {/* Price */}
                  <span className="text-sm font-bold text-[#7CB342]">
                    {displayPrice?.toLocaleString('vi-VN')}đ
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] text-gray-400 line-through">
                      {product.price?.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>

                {/* Rating + Unit */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium text-gray-700">{product.rating_average || 5}</span>
                    <span>({product.rating_count || 0})</span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <span>{product.unit}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickView(e, product);
                  }}
                  className="p-2 bg-blue-50 text-blue-600 rounded-lg active:bg-blue-100 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(e, product);
                  }}
                  className="p-2 bg-[#7CB342] text-white rounded-lg active:bg-[#689F38] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
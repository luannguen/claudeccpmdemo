import React, { memo, useCallback } from "react";
import { Star, Plus } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

function ProductCompactCard({ product, index }) {
  const handleAddToCart = useCallback((e) => {
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
  }, [product]);

  const displayPrice = product.sale_price || product.price;
  const hasDiscount = product.sale_price && product.sale_price < product.price;

  return (
    <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
        <div className="relative aspect-square bg-gray-100 overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-green-50 to-green-100">
              <Star className="w-6 h-6" />
            </div>
          )}
          
          {hasDiscount && (
            <span className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-[9px] font-bold">
              -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
            </span>
          )}

          <button
            onClick={handleAddToCart}
            className="absolute bottom-1 right-1 w-6 h-6 bg-[#7CB342] text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="p-1.5 sm:p-2">
          <h3 className="font-medium text-[11px] sm:text-xs text-gray-900 line-clamp-2 group-hover:text-[#7CB342] transition-colors min-h-[28px] sm:min-h-[32px]">
            {product.name}
          </h3>

          <div className="flex items-center gap-0.5 mb-0.5">
            <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
            <span className="text-[10px] text-gray-500">{product.rating_average || 5}</span>
          </div>

          <span className="text-xs sm:text-sm font-bold text-[#7CB342] block">
            {displayPrice.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>
    </Link>
  );
}

export default memo(ProductCompactCard);
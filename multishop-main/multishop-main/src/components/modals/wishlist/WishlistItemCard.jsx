import React from 'react';
import { ShoppingCart, Trash2, Package, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function WishlistItemCard({ item, onAddToCart, onRemove, onClose }) {
  const detailUrl = item.type === 'lot' 
    ? createPageUrl(`ProductDetail?id=${item.product_id}`)
    : createPageUrl(`ProductDetail?id=${item.id}`);

  return (
    <div className="flex gap-3 bg-gray-50 rounded-xl p-3 relative">
      {item.type === 'lot' && (
        <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
          BÁN TRƯỚC
        </div>
      )}
      
      <Link to={detailUrl} onClick={onClose} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={detailUrl} onClick={onClose}>
          <h3 className="font-medium text-sm line-clamp-1 hover:text-[#7CB342]">{item.name}</h3>
        </Link>
        
        {item.type === 'lot' && item.estimated_harvest_date && (
          <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3" />
            {new Date(item.estimated_harvest_date).toLocaleDateString('vi-VN')}
          </p>
        )}
        
        <p className="text-[#7CB342] font-bold text-sm mt-1">
          {(item.price || 0).toLocaleString('vi-VN')}đ
        </p>
      </div>

      <div className="flex flex-col gap-1">
        <button 
          onClick={() => onAddToCart(item)}
          className="w-8 h-8 bg-[#7CB342] text-white rounded-full flex items-center justify-center hover:bg-[#FF9800] transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onRemove(item)}
          className="w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
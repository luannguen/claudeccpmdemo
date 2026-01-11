import React from 'react';
import { Plus, Minus, Trash2, Package } from 'lucide-react';

export default function CartItemCard({ item, onUpdateQuantity, onRemove }) {
  const isMinQuantity = item.is_preorder && item.moq && item.quantity <= item.moq;

  return (
    <div className="flex gap-3 bg-gray-50 rounded-xl p-3">
      {/* Image - Always show placeholder if no image */}
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`w-full h-full flex items-center justify-center ${item.image_url ? 'hidden' : ''}`}>
          <Package className="w-6 h-6 text-gray-400" />
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
        
        {item.is_preorder && (
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              BÁN TRƯỚC
            </span>
            {item.estimated_harvest_date && (
              <span className="text-xs text-gray-500">
                • Giao {new Date(item.estimated_harvest_date).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
        )}
        
        {item.unit && (
          <p className="text-xs text-gray-500 mb-1">{item.unit}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onUpdateQuantity(item.id, item.shop_id, item.quantity - 1)}
              disabled={isMinQuantity}
              className={`w-6 h-6 rounded-full ${
                isMinQuantity ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-gray-200 hover:bg-gray-300'
              }`}>
              <Minus className="w-3 h-3 mx-auto" />
            </button>
            <span className="font-bold">{item.quantity}</span>
            <button onClick={() => onUpdateQuantity(item.id, item.shop_id, item.quantity + 1)}
              className="w-6 h-6 rounded-full bg-[#7CB342] hover:bg-[#FF9800] text-white">
              <Plus className="w-3 h-3 mx-auto" />
            </button>
          </div>
          <button onClick={() => onRemove(item.id, item.shop_id)} className="text-red-500 hover:text-red-700">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {item.is_preorder && item.moq > 1 && (
          <p className="text-xs text-orange-600 mt-1">MOQ: Tối thiểu {item.moq} sản phẩm</p>
        )}
      </div>
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-[#7CB342] text-sm">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
        {item.quantity > 1 && (
          <p className="text-[10px] text-gray-400">{item.price?.toLocaleString('vi-VN')}đ x {item.quantity}</p>
        )}
      </div>
    </div>
  );
}
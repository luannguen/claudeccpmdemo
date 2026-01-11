import React from 'react';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';

export default function CheckoutCartSection({ 
  cartItems, 
  subtotal, 
  shippingFee, 
  discount, 
  total,
  onUpdateQuantity,
  onRemoveItem 
}) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50/30 rounded-xl p-4 border border-[#7CB342]/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-[#7CB342]" />
          Giỏ Hàng ({cartItems.length})
        </h3>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {cartItems.map(item => (
          <CartItem 
            key={`${item.id}-${item.shop_id}`} 
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
          />
        ))}
      </div>
      
      <OrderSummary 
        subtotal={subtotal} 
        shippingFee={shippingFee} 
        discount={discount} 
        total={total} 
      />
    </div>
  );
}

function CartItem({ item, onUpdateQuantity, onRemove }) {
  const isMinQuantity = item.is_preorder && item.moq && item.quantity <= item.moq;

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        <img src={item.image_url} alt={item.name} 
          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm mb-1 line-clamp-2">{item.name}</p>
          {item.is_preorder && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                BÁN TRƯỚC
              </span>
              {item.estimated_harvest_date && (
                <span className="text-xs text-gray-500">
                  • {new Date(item.estimated_harvest_date).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>
          )}
          <p className="text-xs text-gray-600 mb-2">{item.price.toLocaleString('vi-VN')}đ/{item.unit}</p>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={isMinQuantity}
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isMinQuantity ? 'bg-gray-50 cursor-not-allowed opacity-50' : 'bg-gray-100 hover:bg-gray-200'
              }`}>
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-bold text-sm w-8 text-center">{item.quantity}</span>
            <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 bg-[#7CB342] hover:bg-[#FF9800] text-white rounded-lg flex items-center justify-center">
              <Plus className="w-3 h-3" />
            </button>
            <button onClick={() => onRemove(item.id)}
              className="ml-auto w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          {item.is_preorder && item.moq > 1 && (
            <p className="text-xs text-orange-600 mt-1">MOQ: Tối thiểu {item.moq} sản phẩm</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-[#7CB342]">{(item.quantity * item.price).toLocaleString('vi-VN')}đ</p>
        </div>
      </div>
    </div>
  );
}

function OrderSummary({ subtotal, shippingFee, discount, total }) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Tạm tính:</span>
        <span className="font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Phí ship:</span>
        <span className="font-medium">{shippingFee > 0 ? `${shippingFee.toLocaleString('vi-VN')}đ` : 'Miễn phí ✨'}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>Giảm giá:</span>
          <span className="font-medium">-{discount.toLocaleString('vi-VN')}đ</span>
        </div>
      )}
      <div className="flex justify-between pt-2 border-t text-lg font-bold">
        <span>Tổng cộng:</span>
        <span className="text-[#7CB342]">{total.toLocaleString('vi-VN')}đ</span>
      </div>
    </div>
  );
}
import React from "react";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";

/**
 * ShopCheckoutOrderSummary - Tóm tắt đơn hàng
 */
export default function ShopCheckoutOrderSummary({ 
  cart, 
  subtotal, 
  shippingFee, 
  total, 
  freeShipping,
  updateQuantity, 
  removeFromCart, 
  primaryColor 
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5" style={{ color: primaryColor }} />
        Đơn Hàng ({cart.length} sản phẩm)
      </h2>

      {/* Cart Items */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {cart.map(item => (
          <CartItem 
            key={item.id} 
            item={item} 
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            primaryColor={primaryColor}
          />
        ))}
      </div>

      {/* Totals */}
      <OrderTotals 
        subtotal={subtotal}
        shippingFee={shippingFee}
        total={total}
        freeShipping={freeShipping}
        primaryColor={primaryColor}
      />
    </div>
  );
}

function CartItem({ item, updateQuantity, removeFromCart, primaryColor }) {
  return (
    <div className="flex gap-3 pb-4 border-b border-gray-200">
      {item.image_url && (
        <img
          src={item.image_url}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-lg"
        />
      )}
      <div className="flex-1">
        <h3 className="font-medium text-sm mb-1 line-clamp-2">{item.name}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {item.price.toLocaleString('vi-VN')}đ x {item.quantity}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-bold">{item.quantity}</span>
          <button
            type="button"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => removeFromCart(item.id)}
            className="ml-auto text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderTotals({ subtotal, shippingFee, total, freeShipping, primaryColor }) {
  return (
    <div className="space-y-3 pt-4 border-t border-gray-200">
      <div className="flex justify-between text-sm">
        <span>Tạm tính</span>
        <span>{subtotal.toLocaleString('vi-VN')}đ</span>
      </div>
      <div className="flex justify-between text-sm">
        <span>Phí vận chuyển</span>
        <span>{shippingFee === 0 ? 'Miễn phí' : `${shippingFee.toLocaleString('vi-VN')}đ`}</span>
      </div>
      {freeShipping && (
        <p className="text-xs text-green-600">🎉 Miễn phí vận chuyển cho đơn từ 200.000đ</p>
      )}
      <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
        <span>Tổng cộng</span>
        <span style={{ color: primaryColor }}>{total.toLocaleString('vi-VN')}đ</span>
      </div>
    </div>
  );
}
import React from "react";
import { Plus, Minus } from "lucide-react";

/**
 * QuickViewQuantity - Chọn số lượng sản phẩm
 * 
 * Props:
 * - quantity: number
 * - setQuantity: function
 * - displayPrice: number
 */
export default function QuickViewQuantity({ quantity, setQuantity, displayPrice }) {
  const handleDecrease = () => setQuantity(Math.max(1, quantity - 1));
  const handleIncrease = () => setQuantity(quantity + 1);
  const handleInputChange = (e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1));

  return (
    <div className="mb-3 sm:mb-4">
      <label className="block text-sm font-bold mb-2 text-gray-700">Số lượng:</label>
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Decrease Button */}
        <QuantityButton onClick={handleDecrease} variant="decrease">
          <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
        </QuantityButton>

        {/* Input */}
        <input 
          type="number" 
          value={quantity}
          onChange={handleInputChange}
          className="w-16 sm:w-20 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] py-1 sm:py-2"
          min="1" 
        />

        {/* Increase Button */}
        <QuantityButton onClick={handleIncrease} variant="increase">
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
        </QuantityButton>

        {/* Total */}
        <TotalDisplay price={displayPrice} quantity={quantity} />
      </div>
    </div>
  );
}

function QuantityButton({ onClick, variant, children }) {
  const baseClass = "w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors flex items-center justify-center touch-manipulation";
  const variantClass = variant === 'increase' 
    ? "bg-[#7CB342] hover:bg-[#FF9800] text-white" 
    : "bg-gray-100 hover:bg-gray-200";

  return (
    <button onClick={onClick} className={`${baseClass} ${variantClass}`}>
      {children}
    </button>
  );
}

function TotalDisplay({ price, quantity }) {
  return (
    <div className="flex-1 text-right">
      <p className="text-xs text-gray-600">Tổng</p>
      <p className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#7CB342] to-[#5a8f31] bg-clip-text text-transparent">
        {(price * quantity).toLocaleString('vi-VN')}đ
      </p>
    </div>
  );
}
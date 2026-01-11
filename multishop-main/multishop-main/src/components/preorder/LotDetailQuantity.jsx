/**
 * LotDetailQuantity - Simplified quantity selector
 * Clean, compact design
 */

import React from "react";
import { Minus, Plus, Info } from "lucide-react";

export default function LotDetailQuantity({ lot, quantity, setQuantity }) {
  const moq = lot?.moq || 1;
  const maxQty = lot?.available_quantity || 0;
  const unitPrice = lot?.current_price || 0;
  const totalPrice = unitPrice * quantity;
  const depositPercent = lot?.deposit_percentage || 100;
  const depositAmount = Math.round(totalPrice * depositPercent / 100);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-700">Số lượng (kg)</label>
        {moq > 1 && (
          <span className="text-xs text-orange-600 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Tối thiểu {moq}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {/* Quantity controls */}
        <div className="flex items-center bg-gray-100 rounded-xl">
          <button 
            onClick={() => setQuantity(Math.max(moq, quantity - 1))}
            disabled={quantity <= moq}
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <input 
            type="number" 
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || moq;
              setQuantity(Math.min(maxQty, Math.max(moq, val)));
            }}
            min={moq}
            max={maxQty}
            className="w-16 text-center text-lg font-bold bg-transparent border-none focus:outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          
          <button 
            onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
            disabled={quantity >= maxQty}
            className="w-10 h-10 flex items-center justify-center text-[#7CB342] hover:text-[#558B2F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Price summary */}
        <div className="flex-1 text-right">
          <p className="text-xl font-bold text-[#7CB342]">
            {totalPrice.toLocaleString('vi-VN')}đ
          </p>
          {depositPercent < 100 && (
            <p className="text-xs text-gray-500">
              Cọc: {depositAmount.toLocaleString('vi-VN')}đ
            </p>
          )}
        </div>
      </div>

      {/* Stock info - compact */}
      <div className="mt-3 pt-3 border-t flex justify-between text-xs text-gray-500">
        <span>Còn: {maxQty} kg</span>
        <span>Đã bán: {lot?.sold_quantity || 0} kg</span>
      </div>
    </div>
  );
}
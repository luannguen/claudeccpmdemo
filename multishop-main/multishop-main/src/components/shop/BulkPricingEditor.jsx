import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, TrendingDown, Package } from "lucide-react";

export default function BulkPricingEditor({ 
  basePrice, 
  unit = "kg",
  onSave,
  initialTiers = []
}) {
  const [tiers, setTiers] = useState(initialTiers.length > 0 ? initialTiers : [
    { min_quantity: 1, max_quantity: 10, price: basePrice },
    { min_quantity: 11, max_quantity: 50, price: Math.round(basePrice * 0.95) },
    { min_quantity: 51, max_quantity: null, price: Math.round(basePrice * 0.90) }
  ]);

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier.max_quantity ? lastTier.max_quantity + 1 : lastTier.min_quantity + 10;
    
    setTiers([
      ...tiers.slice(0, -1),
      { ...lastTier, max_quantity: newMin - 1 },
      { min_quantity: newMin, max_quantity: null, price: Math.round(basePrice * 0.85) }
    ]);
  };

  const removeTier = (index) => {
    if (tiers.length <= 1) return;
    
    const newTiers = tiers.filter((_, i) => i !== index);
    // Update last tier to have no max
    newTiers[newTiers.length - 1].max_quantity = null;
    
    setTiers(newTiers);
  };

  const updateTier = (index, field, value) => {
    const newTiers = [...tiers];
    newTiers[index][field] = value;
    setTiers(newTiers);
  };

  const calculateDiscount = (tierPrice) => {
    const discount = ((basePrice - tierPrice) / basePrice) * 100;
    return discount.toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Giá Theo Số Lượng (Bulk Pricing)</h3>
          <p className="text-sm text-gray-600">Khuyến khích khách mua nhiều hơn</p>
        </div>
        <button
          onClick={addTier}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Thêm Tier
        </button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-[#7CB342] transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>

                <div className="flex-1 grid md:grid-cols-3 gap-4">
                  {/* Min Quantity */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Từ ({unit})
                    </label>
                    <input
                      type="number"
                      value={tier.min_quantity}
                      onChange={(e) => updateTier(index, 'min_quantity', Number(e.target.value))}
                      disabled={index > 0}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] disabled:bg-gray-50"
                      min="1"
                    />
                  </div>

                  {/* Max Quantity */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Đến ({unit})
                    </label>
                    <input
                      type="number"
                      value={tier.max_quantity || ''}
                      onChange={(e) => updateTier(index, 'max_quantity', e.target.value ? Number(e.target.value) : null)}
                      disabled={index === tiers.length - 1}
                      placeholder="∞"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] disabled:bg-gray-50"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Giá (VNĐ/{unit})
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => updateTier(index, 'price', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#7CB342] pr-16"
                        min="0"
                        step="1000"
                      />
                      {tier.price < basePrice && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-green-600">
                          -{calculateDiscount(tier.price)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {tiers.length > 1 && (
                  <button
                    onClick={() => removeTier(index)}
                    className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Preview */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-4 text-sm">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  Mua <strong>{tier.min_quantity}{tier.max_quantity ? `-${tier.max_quantity}` : '+'} {unit}</strong>
                  {' '}→{' '}
                  <strong className="text-[#7CB342]">{tier.price.toLocaleString('vi-VN')}đ/{unit}</strong>
                  {tier.price < basePrice && (
                    <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Giảm {calculateDiscount(tier.price)}%
                    </span>
                  )}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Example Calculation */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <TrendingDown className="w-5 h-5" />
          Ví Dụ Giá:
        </h4>
        <div className="space-y-2 text-sm text-blue-800">
          {tiers.map((tier, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span>
                {tier.min_quantity}{tier.max_quantity ? `-${tier.max_quantity}` : '+'} {unit}:
              </span>
              <span className="font-bold">
                {tier.price.toLocaleString('vi-VN')}đ/{unit}
                {tier.price < basePrice && (
                  <span className="ml-2 text-green-600">(-{calculateDiscount(tier.price)}%)</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {onSave && (
        <button
          onClick={() => onSave(tiers)}
          className="w-full bg-[#7CB342] text-white py-3 rounded-xl font-medium hover:bg-[#FF9800] transition-colors"
        >
          Lưu Bulk Pricing
        </button>
      )}
    </div>
  );
}
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, TrendingUp, DollarSign, AlertCircle, CheckCircle, Lock, Unlock } from "lucide-react";

export default function PricingCalculator({ 
  platformProduct, 
  onPriceSet,
  initialPrice = null 
}) {
  const [proposedPrice, setProposedPrice] = useState(initialPrice || platformProduct.price);
  const [quantity, setQuantity] = useState(1);

  const platformPrice = platformProduct.price || 0;
  const minPrice = platformProduct.min_price || 0;
  const isFixedPrice = platformProduct.is_fixed_price || false;
  const commissionRate = platformProduct.commission_rate || 3;

  // Validation & Calculations
  const validation = useMemo(() => {
    if (isFixedPrice) {
      return {
        isValid: proposedPrice === platformPrice,
        error: proposedPrice !== platformPrice ? `Sản phẩm này có giá cố định: ${platformPrice.toLocaleString('vi-VN')}đ` : null
      };
    }

    if (minPrice > 0 && proposedPrice < minPrice) {
      return {
        isValid: false,
        error: `Giá không được thấp hơn ${minPrice.toLocaleString('vi-VN')}đ`
      };
    }

    return { isValid: true, error: null };
  }, [proposedPrice, platformPrice, minPrice, isFixedPrice]);

  const calculations = useMemo(() => {
    const commissionAmount = (proposedPrice * commissionRate) / 100;
    const shopRevenue = proposedPrice - commissionAmount;
    const profitMargin = ((shopRevenue - platformPrice) / platformPrice) * 100;
    const totalRevenue = shopRevenue * quantity;
    const totalCommission = commissionAmount * quantity;

    return {
      commissionAmount,
      shopRevenue,
      profitMargin,
      totalRevenue,
      totalCommission,
      isProfit: shopRevenue > platformPrice
    };
  }, [proposedPrice, platformPrice, commissionRate, quantity]);

  const handlePriceChange = (value) => {
    const price = Number(value);
    if (isFixedPrice) {
      setProposedPrice(platformPrice);
    } else {
      setProposedPrice(price);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
        <Calculator className="w-6 h-6 text-[#7CB342]" />
        <div>
          <h3 className="text-lg font-bold text-gray-900">Công Cụ Tính Giá</h3>
          <p className="text-sm text-gray-600">Tính toán lợi nhuận & hoa hồng</p>
        </div>
      </div>

      {/* Platform Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-blue-700 mb-1">Giá Platform</p>
            <p className="text-xl font-bold text-blue-900">{platformPrice.toLocaleString('vi-VN')}đ</p>
          </div>
          <div>
            <p className="text-xs text-blue-700 mb-1">Hoa Hồng</p>
            <p className="text-xl font-bold text-blue-900">{commissionRate}%</p>
          </div>
        </div>
        
        {isFixedPrice && (
          <div className="flex items-center gap-2 text-sm text-blue-800 bg-blue-100 rounded-lg p-3">
            <Lock className="w-4 h-4" />
            <span className="font-medium">Giá cố định - Bạn chỉ nhận commission</span>
          </div>
        )}

        {minPrice > 0 && !isFixedPrice && (
          <div className="flex items-center gap-2 text-sm text-orange-800 bg-orange-100 rounded-lg p-3">
            <AlertCircle className="w-4 h-4" />
            <span>Giá tối thiểu: <strong>{minPrice.toLocaleString('vi-VN')}đ</strong></span>
          </div>
        )}
      </div>

      {/* Price Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Giá Bán Của Bạn (VNĐ/{platformProduct.unit})
        </label>
        <div className="relative">
          <input
            type="number"
            value={proposedPrice}
            onChange={(e) => handlePriceChange(e.target.value)}
            disabled={isFixedPrice}
            className={`w-full px-4 py-3 pr-12 text-lg font-bold border-2 rounded-xl focus:outline-none transition-colors ${
              validation.isValid 
                ? 'border-green-500 focus:border-green-600 bg-green-50' 
                : 'border-red-500 focus:border-red-600 bg-red-50'
            } ${isFixedPrice ? 'opacity-60 cursor-not-allowed' : ''}`}
            min={minPrice || 0}
            step="1000"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">đ</span>
        </div>

        {validation.error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            {validation.error}
          </motion.p>
        )}

        {validation.isValid && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-green-600 flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Giá hợp lệ!
          </motion.p>
        )}
      </div>

      {/* Quick Price Suggestions (nếu không fixed) */}
      {!isFixedPrice && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Đề Xuất Giá:</p>
          <div className="flex gap-2 flex-wrap">
            {[
              { label: 'Platform', value: platformPrice },
              { label: '+5%', value: Math.round(platformPrice * 1.05) },
              { label: '+10%', value: Math.round(platformPrice * 1.10) },
              { label: '+15%', value: Math.round(platformPrice * 1.15) },
              { label: '+20%', value: Math.round(platformPrice * 1.20) }
            ].filter(s => !minPrice || s.value >= minPrice).map((suggestion) => (
              <button
                key={suggestion.label}
                onClick={() => setProposedPrice(suggestion.value)}
                className="px-4 py-2 bg-gray-100 hover:bg-[#7CB342] hover:text-white rounded-lg text-sm font-medium transition-colors"
              >
                {suggestion.label}: {suggestion.value.toLocaleString('vi-VN')}đ
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Volume Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số Lượng (để tính tổng)
        </label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#7CB342]"
          min="1"
        />
      </div>

      {/* Calculations Breakdown */}
      {validation.isValid && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white rounded-2xl p-6 space-y-4"
        >
          <h4 className="font-bold text-lg border-b border-white/20 pb-2">💰 Tính Toán Chi Tiết</h4>
          
          <div className="space-y-3">
            {/* Per Unit */}
            <div className="bg-white/10 rounded-xl p-4 space-y-2">
              <p className="text-sm opacity-80">Mỗi {platformProduct.unit}:</p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="opacity-80">Giá bán:</p>
                  <p className="text-lg font-bold">{proposedPrice.toLocaleString('vi-VN')}đ</p>
                </div>
                <div>
                  <p className="opacity-80">Hoa hồng:</p>
                  <p className="text-lg font-bold">-{calculations.commissionAmount.toLocaleString('vi-VN')}đ</p>
                </div>
                <div>
                  <p className="opacity-80">Bạn nhận:</p>
                  <p className="text-xl font-bold">{calculations.shopRevenue.toLocaleString('vi-VN')}đ</p>
                </div>
                <div>
                  <p className="opacity-80">Lợi nhuận:</p>
                  <p className={`text-xl font-bold ${calculations.isProfit ? 'text-yellow-300' : 'text-red-300'}`}>
                    {calculations.profitMargin >= 0 ? '+' : ''}{calculations.profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-sm opacity-80 mb-2">Tổng ({quantity} {platformProduct.unit}):</p>
              <div className="flex items-center justify-between mb-2">
                <span>Doanh thu bạn nhận:</span>
                <span className="text-2xl font-bold">{calculations.totalRevenue.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex items-center justify-between text-sm opacity-80">
                <span>Hoa hồng Platform:</span>
                <span>-{calculations.totalCommission.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>

          {/* Warning/Success */}
          {!calculations.isProfit && (
            <div className="bg-red-500/20 border border-red-300 rounded-lg p-3 flex items-start gap-2 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Cảnh báo: Lợi nhuận âm!</p>
                <p className="opacity-90">Bạn đang bán thấp hơn giá platform. Cân nhắc tăng giá.</p>
              </div>
            </div>
          )}

          {calculations.isProfit && calculations.profitMargin > 20 && (
            <div className="bg-yellow-500/20 border border-yellow-300 rounded-lg p-3 flex items-start gap-2 text-sm">
              <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Lợi nhuận cao!</p>
                <p className="opacity-90">Giá của bạn cạnh tranh tốt với {calculations.profitMargin.toFixed(0)}% lợi nhuận.</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Action Button */}
      {onPriceSet && (
        <button
          onClick={() => onPriceSet(proposedPrice)}
          disabled={!validation.isValid}
          className="w-full bg-[#7CB342] text-white py-4 rounded-xl font-bold hover:bg-[#FF9800] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          {isFixedPrice ? 'Xác Nhận Giá Cố Định' : 'Xác Nhận Giá Này'}
        </button>
      )}
    </div>
  );
}
import React from "react";
import { Star, TrendingUp, Shield, Clock } from "lucide-react";

// Components
import QuickViewPriceCard from "./QuickViewPriceCard";
import QuickViewQuantity from "./QuickViewQuantity";
import QuickViewActions from "./QuickViewActions";

/**
 * QuickViewInfo - Thông tin sản phẩm (bên phải modal)
 * 
 * Props:
 * - product: object
 * - avgRating: number
 * - displayPrice: number
 * - hasDiscount: boolean
 * - shopCount: number
 * - quantity: number
 * - setQuantity: function
 * - onAddToCart: function
 * - onBuyNow: function
 * - onViewDetail: function
 */
export default function QuickViewInfo({
  product,
  avgRating,
  displayPrice,
  hasDiscount,
  shopCount,
  quantity,
  setQuantity,
  onAddToCart,
  onBuyNow,
  onViewDetail
}) {
  return (
    <div className="flex flex-col max-h-[70vh] overflow-y-auto pr-2">
      {/* Product Name */}
      <ProductTitle name={product.name} />

      {/* Rating & Stats */}
      <ProductStats 
        avgRating={avgRating} 
        ratingCount={product.rating_count} 
        totalSold={product.total_sold} 
      />

      {/* Description */}
      {product.short_description && (
        <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">
          {product.short_description}
        </p>
      )}

      {/* Price Card */}
      <QuickViewPriceCard
        displayPrice={displayPrice}
        originalPrice={product.price}
        unit={product.unit}
        hasDiscount={hasDiscount}
        shopCount={shopCount}
      />

      {/* Features */}
      <ProductFeatures />

      {/* Quantity Selector */}
      <QuickViewQuantity
        quantity={quantity}
        setQuantity={setQuantity}
        displayPrice={displayPrice}
      />

      {/* Action Buttons */}
      <QuickViewActions
        onAddToCart={onAddToCart}
        onBuyNow={onBuyNow}
        onViewDetail={onViewDetail}
      />
    </div>
  );
}

// ========== SUB-COMPONENTS ==========

function ProductTitle({ name }) {
  return (
    <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold mb-3 sm:mb-4 bg-gradient-to-r from-[#0F0F0F] to-[#3d3d3d] bg-clip-text text-transparent">
      {name}
    </h2>
  );
}

function ProductStats({ avgRating, ratingCount = 0, totalSold = 0 }) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
      {/* Rating */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < Math.floor(avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
            />
          ))}
        </div>
        <span className="font-bold">{avgRating}</span>
        <span className="text-gray-500 text-sm">({ratingCount})</span>
      </div>

      {/* Sold Count */}
      <div className="flex items-center gap-1 text-gray-600 text-sm">
        <TrendingUp className="w-4 h-4 text-green-600" />
        <span>{totalSold} đã bán</span>
      </div>
    </div>
  );
}

function ProductFeatures() {
  const features = [
    { icon: Shield, title: "100% Organic", subtitle: "Chứng nhận", bgColor: "bg-green-100", iconColor: "text-green-600" },
    { icon: Clock, title: "Giao 24h", subtitle: "Tươi ngon", bgColor: "bg-blue-100", iconColor: "text-blue-600" }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mb-3 sm:mb-4">
      {features.map((feature, idx) => (
        <FeatureCard key={idx} {...feature} />
      ))}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, subtitle, bgColor, iconColor }) {
  return (
    <div className="flex items-center gap-2 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
      <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="font-bold text-xs">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}
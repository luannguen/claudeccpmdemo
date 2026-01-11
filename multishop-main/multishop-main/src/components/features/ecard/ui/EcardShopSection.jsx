/**
 * EcardShopSection - Public View
 * Hiển thị gian hàng trong E-Card public view
 * Mua nhanh 1-2 bước, referral tracking tự động
 * 
 * ECARD-F17: Micro Social Proof - Trust badges
 * ECARD-F20: Referral Transparency Tooltip
 */

import React, { useState } from "react";
import { Icon } from "@/components/ui/AnimatedIcon";
import { useEcardShopPublic } from "../hooks/useEcardShop";
import { useSocialProof } from "../hooks/useSocialProof";
import QuickBuyModal from "./QuickBuyModal";
import { ReferralBadgeWithTooltip } from "./ReferralTooltip";
import { SocialProofBadges } from "./SocialProofBadges";

export default function EcardShopSection({ profile, themeColor = '#7CB342' }) {
  const { products, isLoading, shopEnabled, hasProducts } = useEcardShopPublic(profile);
  const { badges, hasSocialProof } = useSocialProof(profile);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickBuy, setShowQuickBuy] = useState(false);

  // Không hiển thị nếu:
  // - shop_enabled = false (explicitly disabled)
  // - shop_enabled = undefined/null AND không có products (chưa setup)
  const shouldHide = shopEnabled === false || (!shopEnabled && !hasProducts);
  if (shouldHide) return null;

  const handleQuickBuy = (product) => {
    setSelectedProduct(product);
    setShowQuickBuy(true);
  };

  if (isLoading) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 mb-4">
          <Icon.Store size={20} style={{ color: themeColor }} />
          <h3 className="font-semibold text-gray-900">Gian hàng</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-xl p-3 animate-pulse">
              <div className="w-full h-24 bg-gray-200 rounded-lg mb-2" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${themeColor}15` }}
          >
            <Icon.Store size={18} style={{ color: themeColor }} />
          </div>
          <h3 className="font-semibold text-gray-900">Gian hàng</h3>
        </div>
        <span className="text-sm text-gray-500">{products.length} sản phẩm</span>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            themeColor={themeColor}
            onQuickBuy={() => handleQuickBuy(product)}
          />
        ))}
      </div>

      {/* ECARD-F17: Social Proof Badges - Trust Moment */}
      {hasSocialProof && (
        <div className="mt-4">
          <SocialProofBadges 
            badges={badges}
            themeColor={themeColor}
            variant="subtle"
            maxBadges={2}
            layout="wrap"
          />
        </div>
      )}

      {/* ECARD-F20: Referral Transparency Tooltip */}
      {profile?.display_name && (
        <div className="mt-3 flex justify-center">
          <ReferralBadgeWithTooltip
            referrerName={profile.display_name}
            themeColor={themeColor}
            variant="subtle"
          />
        </div>
      )}

      {/* Quick Buy Modal */}
      {showQuickBuy && selectedProduct && (
        <QuickBuyModal
          product={selectedProduct}
          referrerProfile={profile}
          themeColor={themeColor}
          onClose={() => {
            setShowQuickBuy(false);
            setSelectedProduct(null);
          }}
        />
      )}
    </div>
  );
}

function ProductCard({ product, themeColor, onQuickBuy }) {
  const hasDiscount = product.sale_price && product.sale_price < product.price;
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {product.image_url ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon.Package size={32} className="text-gray-300" />
          </div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            -{Math.round((1 - product.sale_price / product.price) * 100)}%
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
          {product.name}
        </h4>
        
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-bold" style={{ color: themeColor }}>
            {(hasDiscount ? product.sale_price : product.price).toLocaleString('vi-VN')}đ
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">
              {product.price.toLocaleString('vi-VN')}đ
            </span>
          )}
        </div>

        {/* Quick Buy Button */}
        <button
          onClick={onQuickBuy}
          className="w-full py-2 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
          style={{ backgroundColor: themeColor }}
        >
          <Icon.ShoppingBag size={14} />
          Mua ngay
        </button>
      </div>
    </div>
  );
}

export { ProductCard };
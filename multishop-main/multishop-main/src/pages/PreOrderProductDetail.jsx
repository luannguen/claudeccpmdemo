/**
 * PreOrderProductDetail - Redesigned with Progressive Disclosure
 * PC-first, then Mobile optimized
 * 
 * Design principles:
 * - Không nhồi nhét - dùng tabs để phân nhóm thông tin
 * - PC: 2-column layout, gallery sticky
 * - Mobile: Sticky bottom CTA bar
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, ArrowLeft, Share2, Facebook, Twitter, 
  Link as LinkIcon, Heart, ShoppingCart
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/NotificationToast";
import { Button } from "@/components/ui/button";

// Hooks - from module
import {
  useLotDetail,
  useRelatedLots,
  useWishlist,
  useAddToCart,
  getDaysUntilHarvest,
  getPriceIncreasePercentage,
  getDiscountPercent,
  getLotGallery
} from "@/components/features/preorder";

// Components
import LotDetailGallery from "@/components/preorder/LotDetailGallery";
import LotDetailQuantity from "@/components/preorder/LotDetailQuantity";
import LotDetailActions from "@/components/preorder/LotDetailActions";
import LotDetailRelated from "@/components/preorder/LotDetailRelated";
import LotDetailCertifications from "@/components/preorder/LotDetailCertifications";

// New redesigned components
import { 
  PreOrderInfoTabs, 
  PreOrderPriceCard, 
  PreOrderMobileBar 
} from "@/components/preorder/detail";

export default function PreOrderProductDetail() {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [searchParams] = useSearchParams();
  const { addToast } = useToast();
  
  const lotId = searchParams.get('lotId');
  
  // Data hooks
  const { data: allData, isLoading, error } = useLotDetail(lotId);
  const lot = allData?.lot;
  const preOrder = allData?.preOrder;
  const product = allData?.product;

  const { data: relatedLots = [] } = useRelatedLots(lot, lotId);
  const { isInWishlist, checkWishlist, toggleWishlist } = useWishlist(lotId);
  const addToCart = useAddToCart(
    (msg) => addToast(msg, 'success'),
    (msg) => addToast(msg, 'error')
  );

  // Computed values
  const displayImage = lot?.product_image || product?.image_url || preOrder?.product_image || "";
  const displayName = lot?.product_name || product?.name || preOrder?.product_name || lot?.lot_name || "";
  const gallery = useMemo(() => getLotGallery(lot, product, preOrder), [lot, product, preOrder]);
  
  const daysUntilHarvest = lot ? getDaysUntilHarvest(lot.estimated_harvest_date) : 0;
  const priceIncrease = lot ? getPriceIncreasePercentage(lot) : 0;
  const discountPercent = lot ? getDiscountPercent(lot) : 0;

  // Video embed
  const getVideoEmbedUrl = useCallback((url) => {
    if (!url) return null;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1`;
    
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1`;
    
    return url;
  }, []);

  const videoEmbedUrl = product?.video_url ? getVideoEmbedUrl(product.video_url) : null;

  useEffect(() => {
    if (lot) {
      setQuantity(lot.moq || 1);
      checkWishlist();
    }
  }, [lot, checkWishlist]);

  // Handlers
  const handleAddToCart = useCallback(() => {
    if (lot) {
      addToCart(lot, displayName, displayImage || gallery[0], quantity);
    }
  }, [lot, displayName, displayImage, gallery, quantity, addToCart]);

  const handleBuyNow = useCallback(() => {
    if (lot && lot.available_quantity >= quantity) {
      handleAddToCart();
      setTimeout(() => {
        const cart = JSON.parse(localStorage.getItem('zerofarm-cart') || '[]');
        window.dispatchEvent(new CustomEvent('open-checkout-modal', { 
          detail: { cartItems: [...cart] }
        }));
      }, 300);
    }
  }, [lot, quantity, handleAddToCart]);

  const handleShare = useCallback((platform) => {
    const url = window.location.href;
    const text = `Đặt trước ${lot?.product_name} - ${lot?.lot_name}`;
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      addToast('Đã copy link sản phẩm!', 'success');
    }
    setShowShareMenu(false);
  }, [lot, addToast]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="w-12 h-12 border-3 border-[#7CB342] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (!lot) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <div className="text-center px-4">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Không tìm thấy sản phẩm bán trước</p>
          <Link to={createPageUrl('PreOrderLots')} className="text-[#7CB342] hover:underline">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 lg:pb-8 pt-24 lg:pt-28">
      {/* Header bar - simplified */}
      <div className="bg-white border-b shadow-sm sticky top-16 lg:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between">
          <Link 
            to={createPageUrl('PreOrderLots')} 
            className="text-[#7CB342] hover:underline flex items-center gap-2 text-sm lg:text-base"
          >
            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>

          {/* Product title - visible on mobile */}
          <h1 className="flex-1 text-center text-sm font-medium text-gray-800 truncate mx-4 lg:hidden">
            {displayName}
          </h1>

          {/* Share menu */}
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 bg-white rounded-xl shadow-xl border p-1 min-w-[160px] z-50"
                >
                  <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm">
                    <Facebook className="w-4 h-4 text-blue-600" /><span>Facebook</span>
                  </button>
                  <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm">
                    <Twitter className="w-4 h-4 text-blue-400" /><span>Twitter</span>
                  </button>
                  <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm">
                    <LinkIcon className="w-4 h-4 text-gray-600" /><span>Copy Link</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* LEFT COLUMN - Gallery (sticky on PC) */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-36">
              <LotDetailGallery
                gallery={gallery}
                displayName={displayName}
                videoEmbedUrl={videoEmbedUrl}
                daysUntilHarvest={daysUntilHarvest}
                priceIncrease={priceIncrease}
                discountPercent={discountPercent}
              />
            </div>
          </div>

          {/* RIGHT COLUMN - Info */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Product title - PC only */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                  BÁN TRƯỚC
                </span>
                {preOrder?.preorder_name && (
                  <span className="text-sm text-gray-500">{preOrder.preorder_name}</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{displayName}</h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Package className="w-4 h-4" />
                {lot.lot_name} {lot.lot_code && `• ${lot.lot_code}`}
              </p>
            </div>

            {/* Price Card */}
            <PreOrderPriceCard 
              lot={lot}
              priceIncrease={priceIncrease}
              discountPercent={discountPercent}
            />

            {/* Quantity selector */}
            <LotDetailQuantity
              lot={lot}
              quantity={quantity}
              setQuantity={setQuantity}
            />

            {/* Action buttons - PC only */}
            <div className="hidden lg:block">
              <LotDetailActions
                lot={lot}
                isInWishlist={isInWishlist}
                onToggleWishlist={toggleWishlist}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
              />
            </div>

            {/* Info tabs - Progressive disclosure */}
            <PreOrderInfoTabs 
              lot={lot}
              preOrder={preOrder}
              product={product}
              displayName={displayName}
              daysUntilHarvest={daysUntilHarvest}
              priceIncrease={priceIncrease}
            />
          </div>
        </div>

        {/* Bottom sections */}
        <div className="mt-8 space-y-6">
          <LotDetailCertifications />
          <LotDetailRelated relatedLots={relatedLots} />
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <PreOrderMobileBar
        lot={lot}
        quantity={quantity}
        isInWishlist={isInWishlist}
        onToggleWishlist={toggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </div>
  );
}
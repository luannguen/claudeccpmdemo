import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Package, Calendar, Heart, ShoppingCart, Eye } from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import LotDetailModal from "@/components/preorder/LotDetailModal";
import CountdownTimer from "@/components/preorder/CountdownTimer";
import SoldProgressBar from "@/components/preorder/SoldProgressBar";
import { UrgencyBadgeStack } from "@/components/preorder/UrgencyBadge";

export default function PreOrderLotCard({ lot, index = 0 }) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  // ✅ Fallback image chain: lot -> product -> preOrder
  const displayImage = lot.product_image || lot.product?.image_url || lot.preOrder?.product_image || "";
  const displayName = lot.product_name || lot.product?.name || lot.preOrder?.product_name || lot.lot_name;
  


  useEffect(() => {
    const wishlistKey = `lot:${lot.id}`;
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    setIsInWishlist(wishlist.includes(wishlistKey));
  }, [lot.id]);

  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [displayImage]);

  const daysUntilHarvest = Math.ceil((new Date(lot.estimated_harvest_date) - new Date()) / (1000 * 60 * 60 * 24));
  const priceIncrease = lot.initial_price && lot.current_price 
    ? ((lot.current_price - lot.initial_price) / lot.initial_price * 100).toFixed(0)
    : 0;
  const availablePercentage = ((lot.available_quantity / lot.total_yield) * 100).toFixed(0);
  const hasDiscount = lot.current_price < lot.max_price;
  const discountPercent = hasDiscount 
    ? Math.round(((lot.max_price - lot.current_price) / lot.max_price) * 100)
    : 0;

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wishlistKey = `lot:${lot.id}`;
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    
    if (isInWishlist) {
      const updated = wishlist.filter(id => id !== wishlistKey);
      localStorage.setItem('zerofarm-wishlist', JSON.stringify(updated));
      setIsInWishlist(false);
    } else {
      if (!wishlist.includes(wishlistKey)) {
        wishlist.push(wishlistKey);
        localStorage.setItem('zerofarm-wishlist', JSON.stringify(wishlist));
        setIsInWishlist(true);
      }
    }
    
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const quantity = lot.moq || 1;

    if (lot.available_quantity < quantity) {
      // Dispatch toast event
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Không đủ hàng! Chỉ còn ${lot.available_quantity} sản phẩm.`, type: 'error' } 
      }));
      return;
    }

    // Calculate deposit info
    const depositPct = lot.deposit_percentage || 100;
    const itemTotal = lot.current_price * quantity;
    const depositAmt = Math.round(itemTotal * depositPct / 100);

    window.dispatchEvent(new CustomEvent('add-to-cart', {
      detail: {
        id: lot.id,
        name: `${displayName} - ${lot.lot_name}`,
        price: lot.current_price,
        image_url: displayImage,
        quantity: quantity,
        unit: 'kg',
        is_preorder: true,
        lot_id: lot.id,
        estimated_harvest_date: lot.estimated_harvest_date,
        moq: lot.moq,
        product_id: lot.product_id || lot.preOrder?.product_id,
        available_quantity: lot.available_quantity,
        deposit_percentage: depositPct,
        deposit_amount: depositAmt
      }
    }));

    // Use toast event instead of DOM manipulation
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Đã thêm ${quantity} sản phẩm vào giỏ!`, type: 'success' } 
    }));
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) {
      return;
    }
    // ✅ Ensure lot.id is passed correctly
    const targetUrl = createPageUrl(`PreOrderProductDetail`) + `?lotId=${lot.id}`;
    console.log('[PreOrderLotCard] Navigating to:', targetUrl, 'lot.id:', lot.id);
    navigate(targetUrl);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <div 
          onClick={handleCardClick}
          className="block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
        >
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-green-50 to-green-100">
            {displayImage && !imageError ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
                    <Package className="w-16 h-16 text-green-300 animate-pulse" />
                  </div>
                )}
                <img
                  src={displayImage}
                  alt={displayName}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-green-50 to-green-100">
                <Package className="w-16 h-16 text-green-300" />
                <p className="text-sm font-medium text-green-600">{displayName?.slice(0,15) || 'Sản phẩm'}</p>
                {imageError && (
                  <p className="text-xs text-gray-400">Ảnh đang cập nhật</p>
                )}
              </div>
            )}

            {/* Urgency Badges */}
            <UrgencyBadgeStack lot={lot} className="absolute top-3 left-3" maxBadges={3} />

            <div className="absolute top-3 right-3">
              <span className="bg-white/95 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                Còn {availablePercentage}%
              </span>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleToggleWishlist}
              className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-all backdrop-blur-md ${
                isInWishlist 
                  ? 'bg-red-500 text-white scale-110' 
                  : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </motion.button>
          </div>

          <div className="p-5">
            <h3 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-[#7CB342] transition-colors">
              {displayName}
            </h3>

            <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
              <Package className="w-3 h-3" />
              {lot.lot_name}
            </p>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Giá hiện tại</span>
                <span className="text-2xl font-bold text-[#7CB342]">
                  {lot.current_price?.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Giá trần</span>
                <span className="font-medium text-gray-400 line-through">
                  {lot.max_price?.toLocaleString('vi-VN')}đ
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Thu hoạch
                </span>
                <span className="font-medium">
                  {new Date(lot.estimated_harvest_date).toLocaleDateString('vi-VN')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Còn lại</span>
                <span className="font-medium">
                  {lot.available_quantity}/{lot.total_yield}
                </span>
              </div>

              {lot.moq > 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Đặt tối thiểu</span>
                  <span className="font-bold text-orange-600">
                    {lot.moq} {lot.moq === lot.total_yield ? 'lô' : 'sản phẩm'}
                  </span>
                </div>
              )}
            </div>

            {/* Sold Progress */}
            <div className="mb-4">
              <SoldProgressBar 
                soldQuantity={lot.sold_quantity || 0}
                totalQuantity={lot.total_yield}
                availableQuantity={lot.available_quantity}
                variant="compact"
                showSocialProof={false}
              />
            </div>

            {/* Countdown Timer (if < 14 days) */}
            {daysUntilHarvest > 0 && daysUntilHarvest <= 14 && (
              <div className="mb-4">
                <CountdownTimer 
                  targetDate={lot.estimated_harvest_date} 
                  variant="compact" 
                  showUrgency={daysUntilHarvest <= 7}
                />
              </div>
            )}

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDetailModal(true);
                }}
                className="px-4 py-3 rounded-xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Chi tiết
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={lot.available_quantity <= 0}
                className={`flex-1 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  lot.available_quantity > 0
                    ? 'bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white hover:shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                Đặt trước
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      <LotDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        lot={lot}
      />

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </>
  );
}
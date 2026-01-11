import React from "react";
import EnhancedModal from "@/components/EnhancedModal";

// Hooks
import {
  useQuickViewState,
  useQuickViewUser,
  useShopListings,
  useProductCalculations,
  useQuickViewActions,
  getVideoEmbedUrl
} from '@/components/hooks/useQuickView';

// UI Components
import QuickViewGallery from "./quickview/QuickViewGallery";
import QuickViewInfo from "./quickview/QuickViewInfo";

/**
 * QuickViewModalEnhanced - Modal xem nhanh sản phẩm
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - product: object
 */
export default function QuickViewModalEnhanced({ isOpen, onClose, product }) {
  // State
  const state = useQuickViewState(product, isOpen);

  // Data
  const { data: user } = useQuickViewUser();
  const { data: shopListings = [] } = useShopListings(product?.id, isOpen);
  
  // Calculations
  const calculations = useProductCalculations(product, shopListings);

  // Actions
  const actions = useQuickViewActions(
    product, 
    shopListings, 
    state.quantity, 
    state.setQuantity, 
    state.isInWishlist, 
    state.setIsInWishlist, 
    onClose
  );

  if (!product) return null;

  const videoEmbedUrl = getVideoEmbedUrl(product.video_url);

  return (
    <EnhancedModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="5xl"
      showControls={true}
      persistPosition={false}
      mobileFixed={true}
      enableDrag={false}
    >
      <div className="p-4 sm:p-6">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          {/* LEFT: Gallery */}
          <QuickViewGallery
            gallery={calculations.gallery}
            selectedImage={state.selectedImage}
            setSelectedImage={state.setSelectedImage}
            showVideo={state.showVideo}
            setShowVideo={state.setShowVideo}
            videoEmbedUrl={videoEmbedUrl}
            productName={product.name}
            isFeatured={product.featured}
            isInWishlist={state.isInWishlist}
            onToggleWishlist={actions.toggleWishlist}
            hasDiscount={calculations.hasDiscount}
            discountPercent={calculations.discountPercent}
          />

          {/* RIGHT: Info */}
          <QuickViewInfo
            product={product}
            avgRating={calculations.avgRating}
            displayPrice={calculations.displayPrice}
            hasDiscount={calculations.hasDiscount}
            shopCount={calculations.sortedListings?.length || 0}
            quantity={state.quantity}
            setQuantity={state.setQuantity}
            onAddToCart={actions.handleAddToCart}
            onBuyNow={actions.handleBuyNow}
            onViewDetail={actions.goToProductDetail}
          />
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </EnhancedModal>
  );
}
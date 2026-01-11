import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { X, Leaf, AlertCircle, Loader2, Package } from "lucide-react";
import ProductCarouselWithCategories from "@/components/community/ProductCarouselWithCategories";
import QuickViewModalEnhanced from "@/components/modals/QuickViewModalEnhanced";
import UndoToast from "@/components/community/UndoToast";
import GestureOnboarding from "@/components/community/GestureOnboarding";
export default function FlipMode() {
  const navigate = useNavigate();
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [undoState, setUndoState] = useState({ visible: false, message: '', action: null });

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['flip-mode-products'],
    queryFn: () => base44.entities.Product.filter({ status: 'active' }, '-created_date', 500),
    staleTime: 5 * 60 * 1000
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['flip-mode-categories'],
    queryFn: () => base44.entities.Category.filter({ status: 'active' }, 'display_order', 100),
    staleTime: 5 * 60 * 1000
  });

  // Group products by category
  const flipCategories = useMemo(() => {
    if (!products.length || !categories.length) return [];

    return categories
      .map(cat => {
        const categoryProducts = products
          .filter(p => p.category === cat.key)
          .slice(0, 20)
          .map(p => ({
            product_id: p.id,
            product_name: p.name,
            product_price: p.price,
            product_image: p.image_url,
            product_video: p.video_url
          }));

        return categoryProducts.length > 0
          ? { category_name: cat.name, category_icon: cat.icon, products: categoryProducts }
          : null;
      })
      .filter(Boolean);
  }, [products, categories]);

  // Handlers
  const handleProductClick = (product) => {
    setQuickViewProduct(products.find(p => p.id === product.product_id));
  };

  const handleAddToCart = (e, product) => {
    const cartKey = 'zerofarm-cart';
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    
    const existing = cart.find(item => item.id === product.product_id);
    if (existing) {
      existing.quantity += 1;
    } else {
      const fullProduct = products.find(p => p.id === product.product_id);
      cart.push({
        id: fullProduct.id,
        name: fullProduct.name,
        price: fullProduct.price,
        image_url: fullProduct.image_url,
        quantity: 1
      });
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart-updated'));
    
    setUndoState({
      visible: true,
      message: `Đã thêm ${product.product_name} vào giỏ`,
      action: () => {
        const updatedCart = cart.filter(item => item.id !== product.product_id);
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        window.dispatchEvent(new CustomEvent('cart-updated'));
      }
    });
  };

  const handleAddToWishlist = (product) => {
    const wishlistKey = 'zerofarm-wishlist';
    const wishlist = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
    
    if (!wishlist.includes(product.product_id)) {
      wishlist.push(product.product_id);
      localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
      
      setUndoState({
        visible: true,
        message: `Đã thêm ${product.product_name} vào yêu thích`,
        action: () => {
          const updatedWishlist = wishlist.filter(id => id !== product.product_id);
          localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
          window.dispatchEvent(new CustomEvent('wishlist-updated'));
        }
      });
    }
  };

  const handleExit = () => {
    navigate(-1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#7CB342] animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={handleExit}
            className="bg-[#7CB342] text-white px-6 py-3 rounded-full font-medium hover:bg-[#FF9800] transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // No products
  if (flipCategories.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có sản phẩm</h2>
          <p className="text-gray-600 mb-6">Không tìm thấy sản phẩm nào để hiển thị</p>
          <button
            onClick={handleExit}
            className="bg-[#7CB342] text-white px-6 py-3 rounded-full font-medium hover:bg-[#FF9800] transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F9F3] to-white relative overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-[#7CB342]" />
            <span className="font-bold text-sm sm:text-base lg:text-lg text-gray-900">FARMER SMART</span>
            <span className="hidden sm:inline text-xs text-gray-500 ml-2">Flip Mode</span>
          </div>

          {/* Exit Button */}
          <button
            onClick={handleExit}
            className="bg-white hover:bg-gray-50 text-gray-900 px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 group border border-gray-200"
            aria-label="Thoát Flip Mode"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform" />
            <span className="text-sm sm:text-base">Thoát</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 sm:pt-20 pb-safe">
        <div className="h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] flex items-center justify-center px-2 sm:px-4 lg:px-8">
          <div className="w-full max-w-screen-2xl">
            <ProductCarouselWithCategories
              categories={flipCategories}
              initialCategoryIndex={0}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              swipeThreshold={50}
              showCategoryIndicator={true}
              width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 32, 1400) : 1400}
              height={typeof window !== 'undefined' ? Math.min(window.innerHeight * 0.65, 650) : 650}
              autoplay={false}
              interval={3500}
            />
          </div>
        </div>
      </main>

      {/* Modals & Overlays */}
      <QuickViewModalEnhanced
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
      />

      <UndoToast
        isVisible={undoState.visible}
        message={undoState.message}
        onUndo={undoState.action}
        onDismiss={() => setUndoState(prev => ({ ...prev, visible: false }))}
        duration={5000}
      />

      <GestureOnboarding />

      {/* Background Decorations */}
      <div className="fixed top-20 left-10 w-32 h-32 bg-[#7CB342]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-10 w-40 h-40 bg-[#FF9800]/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
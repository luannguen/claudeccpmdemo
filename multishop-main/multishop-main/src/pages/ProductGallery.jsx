import React, { useState } from "react";
import { motion } from "framer-motion";
import { Package, Leaf, Apple, ShoppingBag, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ProductCarouselWithCategories from "@/components/community/ProductCarouselWithCategories";
import QuickViewModalEnhanced from "@/components/modals/QuickViewModalEnhanced";
import UndoToast from "@/components/community/UndoToast";
import GestureOnboarding from "@/components/community/GestureOnboarding";

/**
 * ProductGallery - Trang demo cho ProductCarouselWithCategories với vuốt dọc
 * Showcase các sản phẩm theo danh mục với khả năng vuốt dọc để chuyển đổi
 */
export default function ProductGallery() {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [undoState, setUndoState] = useState({ visible: false, message: '', action: null });
  const [lastAction, setLastAction] = useState(null);

  // Fetch products from database
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products-gallery'],
    queryFn: async () => {
      const result = await base44.entities.Product.list('-created_date', 100);
      return result.filter(p => p.status === 'active');
    },
    staleTime: 5 * 60 * 1000
  });

  // Fetch current user
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-gallery'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
    retry: false
  });

  // Group products by category
  const categories = React.useMemo(() => {
    if (!products || products.length === 0) return [];

    const categoryGroups = {
      vegetables: { id: 'vegetables', name: 'Rau Củ Tươi', icon: '🥬', products: [] },
      fruits: { id: 'fruits', name: 'Trái Cây Organic', icon: '🍎', products: [] },
      rice: { id: 'rice', name: 'Gạo & Ngũ Cốc', icon: '🌾', products: [] },
      processed: { id: 'processed', name: 'Thực Phẩm Chế Biến', icon: '🥫', products: [] },
      combo: { id: 'combo', name: 'Combo Tiết Kiệm', icon: '🎁', products: [] }
    };

    products.forEach(product => {
      const category = product.category || 'vegetables';
      if (categoryGroups[category]) {
        categoryGroups[category].products.push({
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_url,
          product_video: product.video_url,
          product_price: product.price
        });
      }
    });

    // Filter out empty categories
    return Object.values(categoryGroups).filter(cat => cat.products.length > 0);
  }, [products]);

  const handleProductClick = (productLink) => {
    console.log('🔍 Quick View:', productLink);
    setQuickViewProduct({
      id: productLink.product_id,
      name: productLink.product_name,
      image_url: productLink.product_image,
      video_url: productLink.product_video,
      price: productLink.product_price,
      unit: 'kg',
      short_description: 'Sản phẩm organic chất lượng cao',
      rating_average: 5,
      rating_count: 0,
      total_sold: 0
    });
  };

  const handleAddToCart = (e, productLink) => {
    e.stopPropagation();
    console.log('🛒 Add to cart:', productLink);
    
    const cartItem = {
      id: productLink.product_id,
      name: productLink.product_name,
      price: productLink.product_price,
      unit: 'kg',
      image_url: productLink.product_image,
      quantity: 1
    };
    
    window.dispatchEvent(new CustomEvent('add-to-cart', { detail: cartItem }));
    
    // Store last action for undo
    setLastAction({
      type: 'cart',
      data: cartItem
    });
    
    // Show undo toast
    setUndoState({
      visible: true,
      message: `Đã thêm "${productLink.product_name}" vào giỏ`,
      action: () => {
        window.dispatchEvent(new CustomEvent('remove-from-cart', { detail: { id: productLink.product_id } }));
        setUndoState(prev => ({ ...prev, visible: false }));
      }
    });
  };

  const handleAddToWishlist = (productLink) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để thêm vào yêu thích');
      return;
    }

    console.log('❤️ Add to wishlist:', productLink);
    
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    
    if (!wishlist.includes(productLink.product_id)) {
      wishlist.push(productLink.product_id);
      localStorage.setItem('zerofarm-wishlist', JSON.stringify(wishlist));
      window.dispatchEvent(new Event('wishlist-updated'));
      
      // Store last action for undo
      setLastAction({
        type: 'wishlist',
        data: productLink.product_id
      });
      
      // Show undo toast
      setUndoState({
        visible: true,
        message: `Đã thêm "${productLink.product_name}" vào yêu thích`,
        action: () => {
          const newWishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
          const filtered = newWishlist.filter(id => id !== productLink.product_id);
          localStorage.setItem('zerofarm-wishlist', JSON.stringify(filtered));
          window.dispatchEvent(new Event('wishlist-updated'));
          setUndoState(prev => ({ ...prev, visible: false }));
        }
      });
    }
  };

  return (
    <div className="pt-32 pb-24 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7CB342]/10 to-[#FF9800]/10 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-[#7CB342]" />
            <span className="text-sm font-medium text-gray-700">Khám Phá Sản Phẩm</span>
          </div>
          
          <h1 className="font-serif font-medium text-4xl md:text-5xl text-[#0F0F0F] mb-4 leading-tight">
            Bộ Sưu Tập Organic
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            Vuốt dọc để khám phá các danh mục sản phẩm khác nhau
          </p>

          {/* Feature Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Leaf className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">100% Organic</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700">Giao Hàng Nhanh</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700">Giá Tốt Nhất</span>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Đang tải sản phẩm...</p>
          </div>
        )}

        {/* Product Carousel with Categories */}
        {!isLoading && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ProductCarouselWithCategories
              categories={categories}
              initialCategoryIndex={0}
              onProductClick={handleProductClick}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              swipeThreshold={50}
              showCategoryIndicator={true}
              width={900}
              height={340}
              autoplay={false}
              interval={3500}
            />
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && categories.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Chưa Có Sản Phẩm
            </h3>
            <p className="text-gray-600">
              Hệ thống đang cập nhật sản phẩm mới. Vui lòng quay lại sau.
            </p>
          </div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100"
        >
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Hướng Dẫn Sử Dụng
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">👆</span>
              <span><strong>Chạm:</strong> Xem chi tiết sản phẩm</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 font-bold">🖱️</span>
              <span><strong>Giữ lâu:</strong> Thêm vào giỏ hàng</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-600 font-bold">❤️</span>
              <span><strong>Giữ + Vuốt lên:</strong> Thêm vào yêu thích</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">↕️</span>
              <span><strong>Vuốt dọc:</strong> Chuyển danh mục sản phẩm</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">↔️</span>
              <span><strong>Vuốt ngang:</strong> Xem sản phẩm tiếp theo</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModalEnhanced
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          product={quickViewProduct}
        />
      )}

      {/* Undo Toast */}
      <UndoToast
        isVisible={undoState.visible}
        message={undoState.message}
        onUndo={undoState.action}
        onDismiss={() => setUndoState(prev => ({ ...prev, visible: false }))}
        duration={5000}
      />

      {/* Gesture Onboarding */}
      <GestureOnboarding />

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}
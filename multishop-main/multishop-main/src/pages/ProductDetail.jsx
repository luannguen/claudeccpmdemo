import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/AnimatedIcon";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { useToast } from "@/components/NotificationToast";
import { useConfirmDialog } from "@/components/hooks/useConfirmDialog";
import ProductCard from "@/components/ProductCard";
import QuickViewModalEnhanced from "@/components/modals/QuickViewModalEnhanced";
import ReviewsList from "@/components/reviews/ReviewsList";
import ProductReviewModal from "@/components/ProductReviewModal";
import BottomNavBar from "@/components/BottomNavBar";

export default function ProductDetail() {
  const [activeTab, setActiveTab] = React.useState('description');
  const [quantity, setQuantity] = React.useState(1);
  const [showStickyBar, setShowStickyBar] = React.useState(false);
  const [selectedImage, setSelectedImage] = React.useState(0);
  const [isImageZoomed, setIsImageZoomed] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [isInWishlist, setIsInWishlist] = React.useState(false);
  const [gallery, setGallery] = React.useState([]);
  const [showVideo, setShowVideo] = React.useState(false);
  const [quickViewProduct, setQuickViewProduct] = React.useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
  
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { showConfirm } = useConfirmDialog();

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product-detail', productId],
    queryFn: async () => {
      if (!productId) return null;
      const products = await base44.entities.Product.list('-created_date', 500);
      return products.find(p => p.id === productId);
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000  // ✅ Cache 10 minutes
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['product-reviews', productId],
    queryFn: async () => {
      if (!productId) return [];
      const allReviews = await base44.entities.Review.list('-created_date', 100);
      return allReviews.filter(r => r.product_id === productId && r.status === 'approved');
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000  // ✅ Cache 5 minutes
  });

  const { data: shopListings = [] } = useQuery({
    queryKey: ['product-shop-listings', productId],
    queryFn: async () => {
      if (!productId) return [];
      const listings = await base44.entities.ShopProduct.list('-created_date', 500);
      return listings.filter(sp => sp.platform_product_id === productId && sp.is_active && sp.status === 'active');
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000  // ✅ Cache 10 minutes
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: async () => {
      if (!product) return [];
      const productData = product?.data || product;
      const all = await base44.entities.Product.list('-created_date', 500);
      return all.filter(p => p.id !== productId && (p?.data || p)?.category === productData?.category).slice(0, 4);
    },
    enabled: !!product,
    staleTime: 10 * 60 * 1000  // ✅ Cache 10 minutes
  });

  const { data: recentlyViewed = [] } = useQuery({
    queryKey: ['recently-viewed-products'],
    queryFn: async () => {
      const recent = JSON.parse(localStorage.getItem('recently-viewed') || '[]');
      if (recent.length === 0) return [];
      const all = await base44.entities.Product.list('-created_date', 500);
      return all.filter(p => recent.includes(p.id) && p.id !== productId).slice(0, 4);
    },
    staleTime: 10 * 60 * 1000  // ✅ Cache 10 minutes
  });

  const { data: user } = useQuery({
    queryKey: ['current-user-product-detail'],
    queryFn: async () => {
      try { return await base44.auth.me(); } catch { return null; }
    },
    retry: false,
    staleTime: 10 * 60 * 1000  // ✅ Cache 10 minutes
  });

  // ✅ Scroll to top when product changes - IMMEDIATE
  useEffect(() => {
    if (productId) {
      // Immediate scroll to top
      window.scrollTo(0, 0);
      // Also use requestAnimationFrame for reliability
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      });

      const recent = JSON.parse(localStorage.getItem('recently-viewed') || '[]');
      const updated = [productId, ...recent.filter(id => id !== productId)].slice(0, 10);
      localStorage.setItem('recently-viewed', JSON.stringify(updated));
      // Reset states
      setSelectedImage(0);
      setQuantity(1);
      setShowVideo(false);
      setActiveTab('description');
    }
  }, [productId]);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    setIsInWishlist(wishlist.includes(productId));
  }, [productId]);

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 600);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isImageZoomed) {
        setIsImageZoomed(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isImageZoomed]);

  useEffect(() => {
    if (product) {
      const productData = product?.data || product;
      const images = [productData?.image_url, ...(productData?.gallery || [])].filter(Boolean);
      setGallery(images);
    }
  }, [product]);

  // ✅ Quick View Event Listener
  useEffect(() => {
    const handleQuickView = (e) => {
      console.log('🎯 Quick View Event Received:', e.detail.product);
      setQuickViewProduct(e.detail.product);
    };
    
    window.addEventListener('quick-view-product', handleQuickView);
    
    return () => {
      window.removeEventListener('quick-view-product', handleQuickView);
    };
  }, []);

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    if (isInWishlist) {
      const updated = wishlist.filter(id => id !== productId);
      localStorage.setItem('zerofarm-wishlist', JSON.stringify(updated));
      setIsInWishlist(false);
    } else {
      wishlist.push(productId);
      localStorage.setItem('zerofarm-wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
    }
    window.dispatchEvent(new Event('wishlist-updated'));
  };

  const handleBuyNow = () => {
    console.log('🛒 === BUY NOW CLICKED - DETAILED DEBUG ===');
    
    if (!product) {
      console.error('❌ CRITICAL: No product data');
      addToast('Không tìm thấy sản phẩm', 'error');
      return;
    }

    const productData = product?.data || product;
    const shopListing = sortedListings && sortedListings.length > 0 ? sortedListings[0] : null;
    const price = shopListing?.shop_price || productData?.price || 0;
    
    console.log('📦 Product Info:', {
      id: product.id,
      name: productData?.name,
      price: price,
      quantity: quantity,
      shop: shopListing?.shop_name || 'Platform'
    });
    
    // Create cart item
    const cartItem = {
      id: product.id,
      name: productData?.name,
      price: price,
      unit: productData?.unit,
      image_url: productData?.image_url,
      shop_id: shopListing?.shop_id || null,
      shop_name: shopListing?.shop_name || 'Platform',
      quantity: quantity
    };
    
    console.log('🎯 Cart Item to Add:', cartItem);
    
    // Get current cart
    let currentCart = [];
    try {
      const stored = localStorage.getItem('zerofarm-cart');
      currentCart = stored ? JSON.parse(stored) : [];
      console.log('📋 Current Cart Items:', currentCart.length);
    } catch (error) {
      console.error('❌ Error reading cart:', error);
      currentCart = [];
    }
    
    // Check if item exists
    const existingIndex = currentCart.findIndex(item => 
      item.id === cartItem.id && item.shop_id === cartItem.shop_id
    );
    
    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity;
      console.log('✅ Updated existing item, new quantity:', currentCart[existingIndex].quantity);
    } else {
      currentCart.push(cartItem);
      console.log('✅ Added new item to cart');
    }
    
    // Save to localStorage
    try {
      localStorage.setItem('zerofarm-cart', JSON.stringify(currentCart));
      console.log('💾 Cart saved successfully');
      console.log('📦 Total items in cart:', currentCart.length);
    } catch (error) {
      console.error('❌ Error saving cart:', error);
      addToast('Không thể lưu giỏ hàng. Vui lòng thử lại.', 'error');
      return;
    }
    
    // Dispatch cart-updated event
    window.dispatchEvent(new Event('cart-updated'));
    console.log('📢 cart-updated event dispatched');
    
    // Open checkout modal with delay
    setTimeout(() => {
      console.log('🚀 Opening checkout modal with items:', currentCart);
      window.dispatchEvent(new CustomEvent('open-checkout-modal', { 
        detail: { cartItems: [...currentCart] }
      }));
      console.log('✅ open-checkout-modal event dispatched');
    }, 150);
    
    // Show success toast
    addToast(`Đã thêm ${quantity} ${productData?.unit} "${productData?.name}" vào giỏ hàng`, 'success');
    
    // Reset quantity
    setQuantity(1);
    console.log('🛒 === BUY NOW COMPLETED ===');
  };

  const handleAddToCart = () => {
    console.log('➕ ADD TO CART CLICKED');
    
    if (!product) {
      addToast('Không tìm thấy sản phẩm', 'error');
      return;
    }
    
    const productData = product?.data || product;
    const shopListing = sortedListings && sortedListings.length > 0 ? sortedListings[0] : null;
    const price = shopListing?.shop_price || productData?.price || 0;
    
    window.dispatchEvent(new CustomEvent('add-to-cart', { 
      detail: { 
        id: product.id,
        name: productData?.name,
        price: price,
        unit: productData?.unit,
        image_url: productData?.image_url,
        shop_id: shopListing?.shop_id || null,
        shop_name: shopListing?.shop_name || 'Platform',
        quantity: quantity
      } 
    }));
    
    addToast(`Đã thêm ${quantity} ${productData?.unit} "${productData?.name}" vào giỏ hàng`, 'success');
    setQuantity(1);
  };

  // ✅ Removed - Now using ReviewForm component

  const handleShare = (platform) => {
    const productData = product?.data || product;
    const url = window.location.href;
    const text = `Xem ${productData?.name} trên Zero Farm`;
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      addToast('Đã sao chép link sản phẩm', 'success');
    }
    setShowShareMenu(false);
  };

  const sortedListings = useMemo(() => {
    return [...shopListings].sort((a, b) => a.shop_price - b.shop_price);
  }, [shopListings]);

  const bestPrice = sortedListings.length > 0 ? sortedListings[0].shop_price : (product?.data || product)?.price || 0;
  const avgPrice = sortedListings.length > 0 
    ? sortedListings.reduce((sum, l) => sum + l.shop_price, 0) / shopListings.length
    : (product?.data || product)?.price || 0;

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 5;

  const priceChartData = useMemo(() => {
    return sortedListings.map((listing, index) => ({
      name: listing.shop_name,
      price: listing.shop_price,
      index: index + 1
    }));
  }, [sortedListings]);

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1`;
    }
    
    // Vimeo
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&muted=1`;
    }
    
    // Direct video URL
    return url;
  };

  if (!productId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon.Package size={40} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-sm text-gray-500 mb-6">Sản phẩm không tồn tại hoặc đã bị xóa</p>
          <Link to={createPageUrl('Services')} className="text-[#7CB342] hover:underline flex items-center gap-2 justify-center">
            <Icon.ArrowLeft size={16} /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  if (loadingProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Icon.Spinner size={48} className="text-[#7CB342]" />
        <p className="text-gray-500 text-sm mt-4">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon.Package size={40} className="text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
          <p className="text-sm text-gray-500 mb-6">Vui lòng thử lại sau</p>
          <Link to={createPageUrl('Services')} className="inline-flex items-center gap-2 text-[#7CB342] hover:underline">
            <Icon.ArrowLeft size={16} /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const productData = product?.data || product;
  const stockLevel = productData?.stock_quantity || 0;
  const isLowStock = stockLevel > 0 && stockLevel <= 10;
  const videoEmbedUrl = getVideoEmbedUrl(productData?.video_url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-4 pt-24">
      {/* ✅ Add top spacing for nav */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('Services')} className="text-[#7CB342] hover:underline flex items-center gap-2 font-medium">
            <Icon.ArrowLeft size={20} />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>

          <div className="relative">
            <button onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium">
              <Icon.Share size={20} />
              <span className="hidden sm:inline">Chia sẻ</span>
            </button>

            <AnimatePresence>
              {showShareMenu && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 bg-white rounded-xl shadow-2xl border p-2 min-w-[200px] z-50">
                  <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-2xl">📘</span><span>Facebook</span>
                  </button>
                  <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-2xl">🐦</span><span>Twitter</span>
                  </button>
                  <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-4 py-3 min-h-[44px] hover:bg-gray-50 rounded-lg transition-colors">
                    <Icon.Link size={20} className="text-gray-600" /><span>Copy Link</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* STICKY BAR */}
      <AnimatePresence>
        {showStickyBar && (
          <motion.div initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
            className="fixed top-20 left-0 right-0 bg-white border-b shadow-lg z-30">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img src={productData?.image_url} alt={productData?.name} className="w-12 h-12 object-cover rounded-lg" />
                <div>
                  <h3 className="font-bold text-sm">{productData?.name}</h3>
                  <p className="text-xl font-bold text-[#7CB342]">{bestPrice.toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 min-h-[44px] min-w-[44px] bg-gray-200 rounded-full hover:bg-gray-300 transition-colors flex items-center justify-center">
                    <Icon.Minus size={18} />
                  </button>
                  <span className="font-bold min-w-[32px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 min-h-[44px] min-w-[44px] bg-[#7CB342] text-white rounded-full hover:bg-[#FF9800] transition-colors flex items-center justify-center">
                    <Icon.Plus size={18} />
                  </button>
                </div>
                <button 
                  onClick={handleBuyNow}
                  className="bg-[#7CB342] text-white px-6 py-3 min-h-[44px] rounded-xl font-bold hover:bg-[#FF9800] transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Icon.ShoppingCart size={20} />Mua
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden mb-6 sm:mb-8">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-4 md:p-6 lg:p-8">
            {/* ✅ Gallery - Mobile Optimized */}
            <div className="relative lg:sticky lg:top-24 lg:self-start">
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl overflow-hidden mb-3 sm:mb-4 relative group shadow-lg">
                {showVideo && videoEmbedUrl ? (
                  <div className="w-full h-full">
                    <iframe
                      src={videoEmbedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : gallery.length > 0 ? (
                  <>
                    <img src={gallery[selectedImage]} alt={productData.name} 
                      className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-110" 
                      onClick={() => setIsImageZoomed(true)} />
                    <button onClick={() => setIsImageZoomed(true)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg transition-opacity">
                      <Icon.ZoomIn size={20} />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon.Package size={80} className="text-gray-300" />
                  </div>
                )}

                {videoEmbedUrl && !showVideo && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute bottom-4 left-4 bg-red-600 text-white px-4 py-2.5 min-h-[44px] rounded-full flex items-center gap-2 shadow-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Icon.Play size={20} />
                    Xem Video
                  </button>
                )}

                {gallery.length > 1 && !showVideo && (
                  <>
                    <button onClick={() => setSelectedImage((selectedImage - 1 + gallery.length) % gallery.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 min-h-[44px] min-w-[44px] bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors flex items-center justify-center">
                      <Icon.ChevronLeft size={24} />
                    </button>
                    <button onClick={() => setSelectedImage((selectedImage + 1) % gallery.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 min-h-[44px] min-w-[44px] bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors flex items-center justify-center">
                      <Icon.ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails with Video - Mobile Optimized */}
              <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                {videoEmbedUrl && (
                  <button
                    onClick={() => {
                      setShowVideo(!showVideo);
                      setSelectedImage(0);
                    }}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 min-h-[44px] min-w-[44px] rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center ${
                      showVideo ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-100 hover:border-red-300'
                    }`}
                  >
                    <Icon.Play size={32} className={showVideo ? 'text-red-600' : 'text-gray-400'} />
                  </button>
                )}
                
                {gallery.map((img, idx) => (
                  <button key={idx} onClick={() => { setSelectedImage(idx); setShowVideo(false); }}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === selectedImage && !showVideo ? 'border-[#7CB342] scale-105 sm:scale-110' : 'border-gray-200 opacity-60 hover:opacity-100'
                    }`}>
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {productData?.featured && (
                  <span className="bg-[#FF9800] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    <Icon.Zap size={16} /> HOT
                  </span>
                )}
                {isLowStock && (
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse flex items-center gap-1">
                    <Icon.AlertTriangle size={16} />Còn {stockLevel}!
                  </span>
                )}
              </div>

              <button onClick={toggleWishlist}
                className={`absolute top-4 right-4 w-12 h-12 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center shadow-lg transition-all ${
                  isInWishlist ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                }`}>
                <Icon.Heart size={24} className={isInWishlist ? 'fill-current' : ''} />
              </button>
            </div>

            {/* ✅ Info Section - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">{productData?.name}</h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-gray-200">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Icon.Star key={i} size={20} className={i < Math.floor(avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                  ))}
                  <span className="font-bold ml-1 sm:ml-2 text-sm sm:text-base">{avgRating}</span>
                  <span className="text-gray-500 text-xs sm:text-sm">({reviews.length})</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Icon.TrendingUp size={18} />
                  <span className="text-xs sm:text-sm">{productData?.total_sold || 0} đã bán</span>
                </div>
              </div>

              {productData?.short_description && (
                <p className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 border-[#7CB342]">
                  {productData.short_description}
                </p>
              )}

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-3 sm:p-4 border border-[#7CB342]/10">
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Giá tốt nhất</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#7CB342]">
                      {bestPrice.toLocaleString('vi-VN')}đ
                      <span className="text-xs sm:text-sm text-gray-500 font-normal">/{productData?.unit}</span>
                    </p>
                  </div>
                  {sortedListings.length > 1 && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">TB</p>
                      <p className="text-sm sm:text-base font-medium">{Math.round(avgPrice).toLocaleString('vi-VN')}đ</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Icon.Store size={14} />
                  {sortedListings.length > 0 ? `${sortedListings.length} shops` : 'Platform'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2.5 min-h-[44px] bg-green-50/50 rounded-lg border border-green-100">
                  <Icon.ShieldCheck size={18} className="text-green-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-green-700">100% Organic</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 min-h-[44px] bg-blue-50/50 rounded-lg border border-blue-100">
                  <Icon.Clock size={18} className="text-blue-600 flex-shrink-0" />
                  <span className="text-xs font-medium text-blue-700">Giao 24h</span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-2.5 sm:p-3 shadow-sm">
                <label className="block text-xs font-medium mb-1.5 text-gray-600">Số lượng:</label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 min-h-[44px] min-w-[44px] bg-gray-100 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0 flex items-center justify-center">
                    <Icon.Minus size={18} />
                  </button>
                  <input type="number" value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 sm:w-14 text-center text-base sm:text-lg font-bold border rounded-md focus:outline-none focus:border-[#7CB342] py-1 min-h-[44px]"
                    min="1" />
                  <button onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 min-h-[44px] min-w-[44px] bg-[#7CB342] hover:bg-[#5a8f31] text-white rounded-full transition-colors flex-shrink-0 flex items-center justify-center">
                    <Icon.Plus size={18} />
                  </button>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] text-gray-500">Tổng</p>
                    <p className="text-sm sm:text-base font-bold text-[#7CB342]">{(bestPrice * quantity).toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleAddToCart}
                  className="flex-1 bg-white text-[#7CB342] py-3 min-h-[44px] rounded-xl font-semibold text-sm hover:bg-[#7CB342] hover:text-white transition-all flex items-center justify-center gap-2 border-2 border-[#7CB342] active:scale-[0.98] shadow-sm">
                  <Icon.Plus size={18} />
                  <span className="hidden sm:inline">Thêm vào giỏ</span>
                  <span className="sm:hidden">Giỏ</span>
                </button>
                <button onClick={handleBuyNow}
                  className="flex-1 bg-[#7CB342] text-white py-3 min-h-[44px] rounded-xl font-semibold text-sm hover:bg-[#5a8f31] transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98]">
                  <Icon.ShoppingCart size={18} />
                  Mua Ngay
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1">✅ Organic</span>
                <span>•</span>
                <span className="flex items-center gap-1">🚚 Free 200k+</span>
                <span>•</span>
                <span className="flex items-center gap-1">💰 Hoàn tiền</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-3 sm:p-4 md:p-6 lg:p-8 mb-6 sm:mb-8">
          <div className="flex gap-2 sm:gap-4 border-b mb-4 sm:mb-6 overflow-x-auto scrollbar-hide -mx-1 px-1">
            {['description', 'shops', 'reviews', 'price-chart', 'map'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 font-medium whitespace-nowrap transition-colors text-sm sm:text-base ${
                  activeTab === tab ? 'text-[#7CB342] border-b-2 border-[#7CB342]' : 'text-gray-600 hover:text-[#7CB342]'
                }`}>
                {tab === 'description' && 'Mô Tả'}
                {tab === 'shops' && `Shops (${sortedListings.length})`}
                {tab === 'reviews' && `Đánh Giá (${reviews.length})`}
                {tab === 'price-chart' && '📊 So Sánh'}
                {tab === 'map' && '🗺️ Bản Đồ'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div key="desc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{productData?.description || 'Sản phẩm chất lượng'}</p>
              </motion.div>
            )}

            {activeTab === 'shops' && (
              <motion.div key="shops" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {sortedListings.length > 0 ? (
                  <div className="space-y-4">
                    {sortedListings.map((listing, index) => {
                      const isBestPrice = index === 0;
                      return (
                        <div key={listing.id} className={`p-6 rounded-2xl border-2 transition-all ${
                          isBestPrice ? 'border-[#7CB342] bg-green-50' : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                             <div className={`w-12 h-12 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center font-bold ${
                               isBestPrice ? 'bg-[#7CB342] text-white' : 'bg-gray-200 text-gray-600'
                             }`}>#{index + 1}</div>
                             <div>
                               <h3 className="font-bold text-lg">{listing.shop_name}</h3>
                               <div className="text-sm text-gray-600 flex gap-3">
                                 <span className="flex items-center gap-1"><Icon.TrendingUp size={16} /> {listing.total_sold || 0}</span>
                                 <span className="flex items-center gap-1"><Icon.Star size={16} className="text-yellow-500 fill-yellow-500" /> {listing.rating_average || 5}/5</span>
                               </div>
                             </div>
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto">
                              <div className="text-right flex-1 md:flex-none">
                                <p className="text-3xl font-bold text-[#7CB342]">{listing.shop_price.toLocaleString('vi-VN')}đ</p>
                                {isBestPrice && <p className="text-xs text-green-700 font-medium mt-1 flex items-center gap-1">
                                  <Icon.CheckCircle size={14} />TỐT NHẤT</p>}
                              </div>
                              <button 
                                onClick={handleBuyNow}
                                className={`px-6 py-3 min-h-[44px] rounded-xl font-semibold transition-colors whitespace-nowrap flex items-center gap-2 ${
                                  isBestPrice ? 'bg-[#7CB342] text-white hover:bg-[#FF9800]' : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}>
                                <Icon.ShoppingCart size={20} />Mua
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon.Store size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có shop nào bán</h3>
                    <p className="text-sm text-gray-500">Sản phẩm hiện chỉ có trên Platform</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* ✅ Write Review Button */}
                <div className="mb-6">
                  <button
                    onClick={async () => {
                      if (!user) {
                        const confirmed = await showConfirm({
                          title: 'Yêu cầu đăng nhập',
                          message: 'Bạn cần đăng nhập để viết đánh giá sản phẩm',
                          confirmText: 'Đăng nhập',
                          cancelText: 'Để sau'
                        });
                        if (confirmed) {
                          base44.auth.redirectToLogin(window.location.href);
                        }
                        return;
                      }
                      setIsReviewModalOpen(true);
                    }}
                    className="w-full bg-gradient-to-r from-[#7CB342] to-[#5a8f31] text-white py-4 rounded-xl font-bold hover:from-[#FF9800] hover:to-[#ff6b00] transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Icon.Send size={20} />
                    Viết Đánh Giá (+10-25 điểm)
                  </button>
                </div>

                {/* ✅ NEW Review Module */}
                <ReviewsList
                  productId={productId}
                  currentUser={user}
                  onLoginRequired={(action) => {
                    if (confirm(`Vui lòng đăng nhập để ${action}`)) {
                      base44.auth.redirectToLogin(window.location.href);
                    }
                  }}
                  showSummary={true}
                />
              </motion.div>
            )}

            {activeTab === 'price-chart' && (
              <motion.div key="chart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {priceChartData.length > 0 ? (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')}đ`} />
                        <Line type="monotone" dataKey="price" stroke="#7CB342" strokeWidth={3} name="Giá (VNĐ)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon.BarChart size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không đủ dữ liệu</h3>
                    <p className="text-sm text-gray-500">Cần ít nhất 2 shops để so sánh giá</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div key="map" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-gray-100 rounded-2xl p-12 text-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon.Map size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Bản đồ đang phát triển</h3>
                  <p className="text-sm text-gray-500">Tính năng này sẽ sớm ra mắt</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {relatedProducts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-green-50/30 rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 mb-8 border border-[#7CB342]/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 min-h-[44px] min-w-[44px] bg-gradient-to-br from-[#7CB342] to-[#5a8f31] rounded-xl flex items-center justify-center">
                  <Icon.Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F0F0F]">Sản Phẩm Tương Tự</h2>
                  <p className="text-sm text-gray-600">Khám phá thêm sản phẩm cùng danh mục</p>
                </div>
              </div>
              <Link 
                to={createPageUrl('Services')}
                className="text-[#7CB342] hover:text-[#FF9800] font-medium text-sm flex items-center gap-1 transition-colors"
              >
                Xem Tất Cả →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {relatedProducts.map((rp) => (
                <ProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </motion.div>
        )}

        {recentlyViewed.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-blue-50/30 rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border border-blue-200/20"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 min-h-[44px] min-w-[44px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Icon.Clock size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#0F0F0F]">Đã Xem Gần Đây</h2>
                  <p className="text-sm text-gray-600">Sản phẩm bạn đã xem trước đó</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {recentlyViewed.map((rv) => (
                <ProductCard key={rv.id} product={rv} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Image Zoom */}
      <AnimatePresence>
        {isImageZoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsImageZoomed(false)}
            className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4 cursor-zoom-out">
            <motion.img initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              src={gallery[selectedImage]} alt={productData.name}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()} />
            <button onClick={(e) => { e.stopPropagation(); setIsImageZoomed(false); }}
              className="absolute top-6 right-6 w-14 h-14 min-h-[44px] min-w-[44px] bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors">
              <Icon.X size={28} className="text-white" />
            </button>
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm">
              Nhấn ESC hoặc click để đóng
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModalEnhanced
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          product={quickViewProduct}
        />
      )}

      {/* ✅ Review Modal */}
      {isReviewModalOpen && (
        <ProductReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          product={product}
          currentUser={user}
        />
      )}

      {/* Bottom Navigation Bar */}
      <BottomNavBar />

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
        
        /* Hide scrollbar but keep functionality */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Mobile tap highlight removal */
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </div>
  );
}
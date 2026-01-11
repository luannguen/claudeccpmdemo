import React, { useEffect, useRef, useState } from "react";
import { ShoppingCart, Eye, Package, Heart } from "lucide-react";
import Flip3DCarousel from "@/components/Flip3DCarousel";
import useLongPress from "../useLongPress";

/**
 * 🎠 ProductCarousel3D - 3D Coverflow carousel for community post products
 * Now using Flip3DCarousel base component
 * 
 * Usage: <ProductCarousel3D products={productLinks} onProductClick={fn} onAddToCart={fn} />
 */

export default function ProductCarousel3D({ 
  products = [], 
  onProductClick,
  onAddToCart,
  onAddToWishlist,
  width = 900, 
  height = 340, 
  autoplay = false, 
  interval = 3500 
}) {
  const [longPressProductId, setLongPressProductId] = useState(null);
  const [centerProductId, setCenterProductId] = useState(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [shouldPlayVideo, setShouldPlayVideo] = useState({});
  const autoplayVideoTimeout = useRef(null);
  const mountedRef = useRef(false);
  const rootId = useRef(`product-carousel-${Math.random().toString(36).slice(2, 9)}`);

  // Helper: Convert YouTube URL to embeddable format with autoplay
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    
    if (match && match[1]) {
      const videoId = match[1];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&modestbranding=1&rel=0`;
    }
    
    return null;
  };

  // Helper: Check if URL is YouTube
  const isYouTubeVideo = (url) => {
    if (!url) return false;
    return /(?:youtube\.com|youtu\.be)/.test(url);
  };

  // Inject product-specific CSS
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const css = `
      /* ProductCarousel3D Product Card Styles */
      .${rootId.current} {
        position: relative;
      }

      .${rootId.current} .header {
        position: absolute;
        top: -50px;
        left: 0;
        right: 0;
        text-align: center;
        z-index: 100;
      }
      .${rootId.current} .header h3 {
        font-size: 18px;
        font-weight: 700;
        color: #0F0F0F;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      /* Product Card Structure */
      .${rootId.current} .product-card {
        height: 100%;
        display: flex;
        flex-direction: column;
        background: white;
        border-radius: 16px;
        overflow: visible;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }

      /* Image Container - 65% height */
      .${rootId.current} .image-container { 
        height: 65%;
        position: relative; 
        background: linear-gradient(135deg, #f5f9f3 0%, #e8f5e0 100%); 
        overflow: hidden;
        border-radius: 16px 16px 0 0;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }
      
      .${rootId.current} .image-container img { 
        width: 100%; 
        height: 100%; 
        object-fit: cover; 
        display: block; 
        transition: transform 0.4s ease;
        pointer-events: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }

      /* Hover effect only on center slide */
      .${rootId.current} .center-slide .image-container img:hover {
        transform: scale(1.05);
      }

      /* Product Info Section - Always Visible */
      .${rootId.current} .product-info {
        flex: 1;
        padding: 12px 16px 16px;
        background: white;
        display: flex;
        flex-direction: column;
        gap: 8px;
        min-height: 35%;
        overflow: visible;
        position: relative;
        border-radius: 0 0 16px 16px;
      }

      .${rootId.current} .product-name {
        font-size: 15px;
        font-weight: 700;
        color: #0F0F0F;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        line-height: 1.3;
        height: 39px;
        max-height: 39px;
        flex-shrink: 0;
      }

      .${rootId.current} .product-price {
        font-size: 20px;
        font-weight: 800;
        color: #7CB342;
        margin-top: auto;
        flex-shrink: 0;
        white-space: nowrap;
      }

      /* Action Buttons */
      .${rootId.current} .product-actions {
        display: flex;
        gap: 6px;
        margin-top: 8px;
        flex-shrink: 0;
        opacity: 1;
        pointer-events: auto;
        transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
      }

      /* Desktop: Show on hover or center slide */
      @media (hover: hover) and (pointer: fine) {
        .${rootId.current} .product-actions {
          opacity: 0;
          pointer-events: none;
          transform: translateY(10px);
        }

        /* Hover on ANY slide's product-card */
        .${rootId.current} .slide:hover .product-actions {
          opacity: 1 !important;
          pointer-events: auto !important;
          transform: translateY(0);
        }

        /* Always show on center slide */
        .${rootId.current} .slide.center .product-actions {
          opacity: 1 !important;
          pointer-events: auto !important;
          transform: translateY(0);
        }
      }

      .${rootId.current} .btn-product {
        flex: 1;
        min-height: 38px;
        max-height: 38px;
        padding: 9px 12px;
        border-radius: 8px;
        border: none;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: all 0.2s;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .${rootId.current} .btn-view {
        background: #f5f5f5;
        color: #0F0F0F;
      }

      .${rootId.current} .btn-view:hover {
        background: #e0e0e0;
        transform: translateY(-1px);
      }

      .${rootId.current} .btn-add {
        background: #7CB342;
        color: white;
      }

      .${rootId.current} .btn-add:hover {
        background: #FF9800;
        transform: translateY(-1px);
      }

      .${rootId.current} .btn-wishlist {
        background: #FFE5E5;
        color: #FF4444;
      }

      .${rootId.current} .btn-wishlist:hover {
        background: #FF4444;
        color: white;
        transform: translateY(-1px);
      }

      .${rootId.current} .btn-product:active {
        transform: translateY(0);
      }

      /* Icon sizing */
      .${rootId.current} .btn-icon {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }

      /* Long Press Feedback */
      .${rootId.current} .long-press-overlay {
        position: absolute;
        inset: 0;
        background: rgba(124, 179, 66, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        z-index: 50;
        pointer-events: none;
        border-radius: 16px;
      }

      .${rootId.current} .progress-ring {
        width: 80px;
        height: 80px;
        transform: rotate(-90deg);
      }

      .${rootId.current} .progress-ring-bg {
        fill: none;
        stroke: rgba(255, 255, 255, 0.2);
        stroke-width: 6;
      }

      .${rootId.current} .progress-ring-fill {
        fill: none;
        stroke: white;
        stroke-width: 6;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.05s linear;
      }

      .${rootId.current} .long-press-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: pulse 1s infinite;
      }

      .${rootId.current} .long-press-hint {
        color: white;
        font-size: 13px;
        font-weight: 600;
        text-align: center;
        padding: 0 20px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }

      @keyframes pulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.1); }
      }

      @keyframes heartFloat {
        0% { transform: translateY(0) scale(0.5); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
      }

      .${rootId.current} .heart-float {
        position: absolute;
        color: #FF9800;
        animation: heartFloat 1s ease-out forwards;
        pointer-events: none;
        z-index: 100;
      }

      /* Placeholder for missing image */
      .${rootId.current} .image-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #7CB342;
      }

      /* Responsive adjustments */
      @media (max-width: 640px) {
        .${rootId.current} .header h3 { 
          font-size: 15px; 
        }
        
        .${rootId.current} .product-name { 
          font-size: 13px; 
          height: 34px;
          max-height: 34px;
          line-height: 1.2;
        }
        
        .${rootId.current} .product-price { 
          font-size: 17px; 
        }

        /* Mobile: Always show buttons */
        .${rootId.current} .product-actions {
          opacity: 1 !important;
          pointer-events: auto !important;
          transform: translateY(0) !important;
        }
        
        .${rootId.current} .btn-product { 
          font-size: 11px; 
          padding: 8px 6px;
          min-height: 36px;
          max-height: 36px;
          gap: 3px;
        }

        .${rootId.current} .btn-icon {
          width: 14px;
          height: 14px;
        }

        .${rootId.current} .btn-text {
          display: inline;
        }
      }

      @media (max-width: 375px) {
        .${rootId.current} .product-name { 
          font-size: 12px; 
          height: 31px;
          max-height: 31px;
        }
        
        .${rootId.current} .product-price { 
          font-size: 16px; 
        }
        
        .${rootId.current} .btn-product {
          font-size: 10px;
          padding: 6px 4px;
        }

        .${rootId.current} .btn-icon {
          width: 12px;
          height: 12px;
        }
      }
    `;

    const style = document.createElement("style");
    style.setAttribute("data-product-carousel", rootId.current);
    style.innerHTML = css;
    document.head.appendChild(style);

    return () => {
      const el = document.querySelector(`style[data-product-carousel="${rootId.current}"]`);
      if (el) el.remove();
    };
  }, []);

  // Handle slide change for video autoplay
  const handleSlideChange = (newIndex) => {
    const product = products[newIndex];
    const productId = product?.product_id;
    
    console.log('🎬 Slide changed to:', product?.product_name, 'Has video:', !!product?.product_video);
    
    setCenterProductId(productId);
    setIsUserInteracting(false);
    
    // Reset video play state for all products
    setShouldPlayVideo({});

    // Clear previous timeout
    if (autoplayVideoTimeout.current) {
      clearTimeout(autoplayVideoTimeout.current);
      autoplayVideoTimeout.current = null;
    }

    // Start video after 3s of being in center
    if (product?.product_video) {
      console.log('⏱️ Setting 3s timer for video autoplay:', product.product_name);
      
      autoplayVideoTimeout.current = setTimeout(() => {
        console.log('▶️ Triggering video play for:', product.product_name);
        setShouldPlayVideo({ [productId]: true });
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (autoplayVideoTimeout.current) {
        clearTimeout(autoplayVideoTimeout.current);
      }
    };
  }, []);

  // Render function for each product card
  const renderProductCard = (product, isCenter, index) => {
    const longPress = useLongPress({
      onLongPress: () => {
        console.log('🛒 Long press: Add to cart', product.product_name);
        setLongPressProductId(null);
        setIsUserInteracting(true);
        onAddToCart?.(new Event('longpress'), product);
        
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 right-6 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] animate-slide-up';
        toast.innerHTML = `
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="font-medium">✅ Đã thêm vào giỏ!</span>
          </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      },
      onLongPressSwipeUp: () => {
        console.log('❤️ Long press + swipe up: Add to wishlist', product.product_name);
        setLongPressProductId(null);
        setIsUserInteracting(true);
        onAddToWishlist?.(product);
        
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-24 right-6 bg-pink-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] animate-slide-up';
        toast.innerHTML = `
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
            </svg>
            <span class="font-medium">💖 Đã thêm vào yêu thích!</span>
          </div>
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      },
      onClick: () => {
        console.log('👆 Click: Quick view', product.product_name);
        setIsUserInteracting(true);
        onProductClick?.(product);
      },
      threshold: 20,
      longPressDuration: 700
    });

    // Update long press state
    React.useEffect(() => {
      if (longPress.isLongPressing) {
        setLongPressProductId(product.product_id);
      } else {
        setLongPressProductId(null);
      }
    }, [longPress.isLongPressing, product.product_id]);

    const circumference = 2 * Math.PI * 34; // radius = 34
    const offset = circumference - (longPress.progress / 100) * circumference;

    return (
      <div 
        className={`product-card ${isCenter ? 'center-slide' : ''}`}
        data-product-id={product.product_id}
        {...longPress.handlers}
        style={{ position: 'relative', touchAction: 'none' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Long Press Visual Feedback */}
        {longPress.isLongPressing && longPressProductId === product.product_id && (
          <div className="long-press-overlay">
            <svg className="progress-ring">
              <circle className="progress-ring-bg" cx="40" cy="40" r="34" />
              <circle 
                className="progress-ring-fill" 
                cx="40" 
                cy="40" 
                r="34"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="long-press-icon">
              {longPress.progress < 50 ? (
                <ShoppingCart style={{ width: '32px', height: '32px', color: 'white' }} />
              ) : (
                <Heart style={{ width: '32px', height: '32px', color: 'white' }} />
              )}
            </div>
            <div className="long-press-hint">
              {longPress.progress < 50 ? 'Giữ để thêm giỏ' : 'Vuốt lên để yêu thích'}
            </div>
          </div>
        )}

        {/* Original card content */}
        {/* Image/Video Container */}
        <div 
          className="image-container"
          onContextMenu={(e) => e.preventDefault()}
        >
          {isCenter && product.product_video && centerProductId === product.product_id && shouldPlayVideo[product.product_id] ? (
            isYouTubeVideo(product.product_video) ? (
              <iframe
                key={`youtube-${product.product_id}`}
                src={getYouTubeEmbedUrl(product.product_video)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none', objectFit: 'cover' }}
                onLoad={() => console.log('✅ YouTube iframe loaded and autoplaying:', product.product_name)}
              />
            ) : (
              <video
                data-video-id={product.product_id}
                src={product.product_video}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
                onPlay={() => console.log('✅ Video playing:', product.product_name)}
              />
            )
          ) : product.product_image ? (
            <img 
              src={product.product_image} 
              alt={product.product_name || 'Product'}
              draggable={false}
              loading={isCenter ? "eager" : "lazy"}
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <div className="image-placeholder">
              <Package style={{ width: '80px', height: '80px', opacity: 0.3 }} />
            </div>
          )}
        </div>
        
        {/* Product Info - Always Visible */}
        <div className="product-info">
          <div className="product-name">
            {product.product_name || 'Sản phẩm'}
          </div>
          
          <div className="product-price">
            {(product.product_price || 0).toLocaleString('vi-VN')}đ
          </div>
          
          {/* Action Buttons */}
          <div className="product-actions">
            <button 
              className="btn-product btn-view"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!longPress.isLongPressing) {
                  onProductClick?.(product);
                }
              }}
              aria-label="Xem nhanh"
              title="Xem chi tiết sản phẩm"
            >
              <Eye className="btn-icon" />
              <span className="btn-text">Xem</span>
            </button>
            
            <button 
              className="btn-product btn-add"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!longPress.isLongPressing) {
                  onAddToCart?.(e, product);
                }
              }}
              aria-label="Thêm giỏ"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart className="btn-icon" />
              <span className="btn-text">Mua</span>
            </button>

            <button 
              className="btn-product btn-wishlist"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (!longPress.isLongPressing) {
                  onAddToWishlist?.(product);
                }
              }}
              aria-label="Yêu thích"
              title="Thêm vào danh sách yêu thích"
            >
              <Heart className="btn-icon" />
              <span className="btn-text">Thích</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!products || products.length === 0) return null;

  return (
    <div className={rootId.current}>
      {/* Header */}
      <div className="header">
        <h3>
          <Package className="w-5 h-5 text-[#7CB342]" />
          {products.length} Sản Phẩm Được Đề Xuất
        </h3>
      </div>

      {/* Use Flip3DCarousel base component */}
      <Flip3DCarousel
        data={products}
        renderItem={renderProductCard}
        width={width}
        height={height}
        autoplay={autoplay}
        interval={interval}
        onSlideChange={handleSlideChange}
      />
    </div>
  );
}
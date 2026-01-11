import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { triggerAIEvent, AIEvents } from '@/components/ai/AIPersonalizationEngine';

// ========== QUICK VIEW STATE ==========

export function useQuickViewState(product, isOpen) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (product?.id) {
      const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
      setIsInWishlist(wishlist.includes(product.id));
    }
  }, [product?.id]);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedImage(0);
      setShowVideo(false);
    }
  }, [isOpen]);

  return { 
    quantity, setQuantity, 
    selectedImage, setSelectedImage, 
    isInWishlist, setIsInWishlist,
    showVideo, setShowVideo
  };
}

// ========== DATA HOOKS ==========

export function useQuickViewUser() {
  return useQuery({
    queryKey: ['current-user-quickview'],
    queryFn: async () => {
      try { return await base44.auth.me(); } catch { return null; }
    },
    retry: false,
    staleTime: 5 * 60 * 1000
  });
}

export function useShopListings(productId, isOpen) {
  return useQuery({
    queryKey: ['product-shop-listings-quickview', productId],
    queryFn: async () => {
      if (!productId) return [];
      const listings = await base44.entities.ShopProduct.list('-created_date', 500);
      return listings.filter(sp => sp.platform_product_id === productId && sp.is_active && sp.status === 'active');
    },
    enabled: !!productId && isOpen
  });
}

// ========== PRODUCT CALCULATIONS ==========

export function useProductCalculations(product, shopListings = []) {
  return useMemo(() => {
    if (!product) return {};
    
    const gallery = [product.image_url, ...(product.gallery || [])].filter(Boolean);
    const sortedListings = [...shopListings].sort((a, b) => a.shop_price - b.shop_price);
    const bestPrice = sortedListings.length > 0 ? sortedListings[0].shop_price : product.price;
    const avgRating = product.rating_average || 5;
    const displayPrice = product.sale_price || bestPrice;
    const hasDiscount = product.sale_price && product.sale_price < product.price;
    const discountPercent = hasDiscount ? Math.round(((product.price - product.sale_price) / product.price) * 100) : 0;

    return {
      gallery,
      sortedListings,
      bestPrice,
      avgRating,
      displayPrice,
      hasDiscount,
      discountPercent
    };
  }, [product, shopListings]);
}

// ========== ACTIONS ==========

export function useQuickViewActions(product, shopListings, quantity, setQuantity, isInWishlist, setIsInWishlist, onClose) {
  const navigate = useNavigate();
  const sortedListings = useMemo(() => shopListings?.sort((a, b) => a.shop_price - b.shop_price) || [], [shopListings]);

  const toggleWishlist = useCallback(() => {
    const wishlist = JSON.parse(localStorage.getItem('zerofarm-wishlist') || '[]');
    
    if (isInWishlist) {
      const updated = wishlist.filter(id => id !== product.id);
      localStorage.setItem('zerofarm-wishlist', JSON.stringify(updated));
      setIsInWishlist(false);
    } else {
      if (!wishlist.includes(product.id)) {
        wishlist.push(product.id);
        localStorage.setItem('zerofarm-wishlist', JSON.stringify(wishlist));
        setIsInWishlist(true);
      }
    }
    window.dispatchEvent(new Event('wishlist-updated'));
    showToast(isInWishlist ? '💔 Đã xóa khỏi yêu thích' : '❤️ Đã thêm vào yêu thích!', 'red');
  }, [product, isInWishlist, setIsInWishlist]);

  // Track product view when quick view opens
  useEffect(() => {
    if (product?.id) {
      // AI Engine sẽ tự động track qua event 'quick-view-product'
    }
  }, [product?.id]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    
    const shopListing = sortedListings[0];
    const price = shopListing?.shop_price || product.price;
    
    window.dispatchEvent(new CustomEvent('add-to-cart', { 
      detail: { 
        id: product.id,
        name: product.name,
        price,
        unit: product.unit,
        image_url: product.image_url,
        shop_id: shopListing?.shop_id || null,
        shop_name: shopListing?.shop_name || 'Platform',
        quantity
      } 
    }));
    
    showToast(`✅ Đã thêm ${quantity} ${product.unit} vào giỏ!`, 'green');
    setQuantity(1);
  }, [product, sortedListings, quantity, setQuantity]);

  const handleBuyNow = useCallback(() => {
    if (!product) return;
    
    const shopListing = sortedListings[0];
    const price = shopListing?.shop_price || product.price;
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price,
      unit: product.unit,
      image_url: product.image_url,
      shop_id: shopListing?.shop_id || null,
      shop_name: shopListing?.shop_name || 'Platform',
      quantity
    };
    
    let currentCart = JSON.parse(localStorage.getItem('zerofarm-cart') || '[]');
    const existingIndex = currentCart.findIndex(item => item.id === cartItem.id && item.shop_id === cartItem.shop_id);
    
    if (existingIndex > -1) {
      currentCart[existingIndex].quantity += quantity;
    } else {
      currentCart.push(cartItem);
    }
    
    localStorage.setItem('zerofarm-cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cart-updated'));
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-checkout-modal', { detail: { cartItems: [...currentCart] } }));
      onClose();
    }, 150);
  }, [product, sortedListings, quantity, onClose]);

  const goToProductDetail = useCallback(() => {
    onClose();
    window.scrollTo(0, 0);
    navigate(createPageUrl('ProductDetail') + `?id=${product.id}`);
  }, [product, onClose, navigate]);

  return { toggleWishlist, handleAddToCart, handleBuyNow, goToProductDetail };
}

// ========== UTILITIES ==========

function showToast(message, color) {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-24 right-6 bg-${color}-600 text-white px-6 py-4 rounded-2xl shadow-2xl z-[200] animate-slide-up`;
  toast.innerHTML = `<span class="font-medium">${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

export function getVideoEmbedUrl(url) {
  if (!url) return null;
  
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0`;
  
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0`;
  
  return url;
}
/**
 * Chatbot Action Buttons
 * 
 * E-commerce action buttons that integrate with existing modals
 * Quick access to: Cart, Orders, Wishlist, Profile
 * 
 * Architecture: UI Layer (AI-CODING-RULES compliant)
 */

import React, { memo, useCallback } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Heart, 
  Search,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * Single action button
 */
function ActionButton({ icon: Icon, label, onClick, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    primary: 'bg-[#7CB342] text-white hover:bg-[#5a8f31]',
    outline: 'border border-gray-300 text-gray-700 hover:border-[#7CB342] hover:text-[#7CB342]'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${variants[variant]}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}

/**
 * Quick action button with arrow
 */
function QuickNavButton({ label, href, onClick }) {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  }, [onClick, href, navigate]);

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-between w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:border-[#7CB342] hover:bg-green-50 transition-all group"
    >
      <span className="text-gray-700 group-hover:text-[#7CB342]">{label}</span>
      <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#7CB342] group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}

/**
 * E-commerce action buttons row
 */
function ChatbotEcommerceActions() {
  const navigate = useNavigate();

  const openCart = useCallback(() => {
    window.dispatchEvent(new Event('open-cart-widget'));
  }, []);

  const openWishlist = useCallback(() => {
    window.dispatchEvent(new Event('open-wishlist-modal'));
  }, []);

  const viewOrders = useCallback(() => {
    navigate(createPageUrl('MyOrders'));
  }, [navigate]);

  const viewProducts = useCallback(() => {
    navigate(createPageUrl('Services'));
  }, [navigate]);

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <ActionButton 
        icon={ShoppingCart} 
        label="Giỏ hàng" 
        onClick={openCart}
        variant="primary"
      />
      <ActionButton 
        icon={Package} 
        label="Đơn hàng" 
        onClick={viewOrders}
        variant="outline"
      />
      <ActionButton 
        icon={Heart} 
        label="Yêu thích" 
        onClick={openWishlist}
        variant="outline"
      />
      <ActionButton 
        icon={Search} 
        label="Sản phẩm" 
        onClick={viewProducts}
        variant="outline"
      />
    </div>
  );
}

/**
 * Navigation suggestions
 */
function ChatbotNavSuggestions({ suggestions = [] }) {
  const navigate = useNavigate();

  const defaultSuggestions = [
    { label: '🛒 Xem tất cả sản phẩm', href: createPageUrl('Services') },
    { label: '📦 Đơn hàng của tôi', href: createPageUrl('MyOrders') },
    { label: '🌿 Đặt trước theo mùa', href: createPageUrl('PreOrderLots') },
    { label: '💬 Cộng đồng', href: createPageUrl('Community') }
  ];

  const items = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <div className="space-y-1.5 pt-2">
      {items.map((item, index) => (
        <QuickNavButton 
          key={index}
          label={item.label}
          href={item.href}
          onClick={item.onClick}
        />
      ))}
    </div>
  );
}

/**
 * Inline product action (for within message)
 */
function InlineProductAction({ productId, productName, actionType = 'view' }) {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    if (actionType === 'view') {
      navigate(createPageUrl('ProductDetail') + `?id=${productId}`);
    } else if (actionType === 'quickview') {
      window.dispatchEvent(new CustomEvent('quick-view-product', {
        detail: { product: { id: productId, name: productName } }
      }));
    }
  }, [productId, productName, actionType, navigate]);

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 text-[#7CB342] hover:text-[#5a8f31] text-xs font-medium underline"
    >
      {productName}
      <ExternalLink className="w-3 h-3" />
    </button>
  );
}

export { 
  ChatbotEcommerceActions, 
  ChatbotNavSuggestions, 
  ActionButton,
  QuickNavButton,
  InlineProductAction
};

export default memo(ChatbotEcommerceActions);
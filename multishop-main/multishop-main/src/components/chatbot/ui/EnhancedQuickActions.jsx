/**
 * Enhanced Quick Actions
 * 
 * Large, clear buttons for elderly users
 * Contextual based on user state
 * 
 * Architecture: UI Layer
 */

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, Package, Search, MessageCircle,
  Leaf, Heart, CreditCard, HelpCircle, Phone,
  Home, Truck, Star, Gift
} from 'lucide-react';

// ========== ACTION DEFINITIONS ==========

const QUICK_ACTIONS = {
  // Shopping actions
  search: {
    id: 'search',
    emoji: '🔍',
    icon: Search,
    label: 'Tìm hàng',
    prompt: 'Tôi muốn tìm sản phẩm',
    color: 'bg-blue-500',
    priority: 1
  },
  vegetables: {
    id: 'vegetables',
    emoji: '🥬',
    icon: Leaf,
    label: 'Rau củ',
    prompt: 'Tìm rau củ tươi',
    color: 'bg-green-500',
    priority: 2
  },
  rice: {
    id: 'rice',
    emoji: '🍚',
    icon: null,
    label: 'Gạo',
    prompt: 'Tìm gạo ngon',
    color: 'bg-amber-500',
    priority: 3
  },
  fruits: {
    id: 'fruits',
    emoji: '🍎',
    icon: null,
    label: 'Trái cây',
    prompt: 'Tìm trái cây',
    color: 'bg-red-400',
    priority: 4
  },
  
  // Cart actions
  cart: {
    id: 'cart',
    emoji: '🛒',
    icon: ShoppingCart,
    label: 'Giỏ hàng',
    prompt: 'Xem giỏ hàng của tôi',
    color: 'bg-[#7CB342]',
    priority: 1
  },
  checkout: {
    id: 'checkout',
    emoji: '💳',
    icon: CreditCard,
    label: 'Thanh toán',
    prompt: 'Tôi muốn thanh toán',
    color: 'bg-purple-500',
    priority: 0
  },
  
  // Order actions
  orders: {
    id: 'orders',
    emoji: '📦',
    icon: Package,
    label: 'Đơn hàng',
    prompt: 'Xem đơn hàng của tôi',
    color: 'bg-indigo-500',
    priority: 2
  },
  tracking: {
    id: 'tracking',
    emoji: '🚚',
    icon: Truck,
    label: 'Giao hàng',
    prompt: 'Đơn hàng tôi đến đâu rồi',
    color: 'bg-cyan-500',
    priority: 3
  },
  
  // Support actions
  help: {
    id: 'help',
    emoji: '❓',
    icon: HelpCircle,
    label: 'Hỏi đáp',
    prompt: 'Tôi cần giúp đỡ',
    color: 'bg-gray-500',
    priority: 5
  },
  hotline: {
    id: 'hotline',
    emoji: '📞',
    icon: Phone,
    label: 'Gọi điện',
    prompt: 'Cho tôi số hotline',
    color: 'bg-orange-500',
    priority: 6
  },
  
  // Extras
  wishlist: {
    id: 'wishlist',
    emoji: '❤️',
    icon: Heart,
    label: 'Yêu thích',
    prompt: 'Xem sản phẩm yêu thích',
    color: 'bg-pink-500',
    priority: 4
  },
  deals: {
    id: 'deals',
    emoji: '🎁',
    icon: Gift,
    label: 'Khuyến mãi',
    prompt: 'Có khuyến mãi gì không',
    color: 'bg-yellow-500',
    priority: 3
  }
};

// ========== COMPONENT ==========

function EnhancedQuickActions({
  onAction,
  userContext = {},
  variant = 'grid', // 'grid' | 'row' | 'compact'
  maxActions = 6
}) {
  // Select actions based on context
  const actions = useMemo(() => {
    const selected = [];
    
    // Always include search
    selected.push(QUICK_ACTIONS.search);
    
    // If has cart, prioritize checkout
    if (userContext?.hasCart && userContext.cartCount > 0) {
      selected.push({
        ...QUICK_ACTIONS.checkout,
        label: `Thanh toán (${userContext.cartCount})`,
        priority: -1
      });
      selected.push(QUICK_ACTIONS.cart);
    } else {
      selected.push(QUICK_ACTIONS.vegetables);
      selected.push(QUICK_ACTIONS.rice);
    }
    
    // If has orders, show orders
    if (userContext?.hasOrders) {
      selected.push(QUICK_ACTIONS.orders);
    } else {
      selected.push(QUICK_ACTIONS.fruits);
    }
    
    // Add help
    selected.push(QUICK_ACTIONS.help);
    selected.push(QUICK_ACTIONS.hotline);
    
    // Sort by priority and limit
    return selected
      .sort((a, b) => a.priority - b.priority)
      .slice(0, maxActions);
  }, [userContext, maxActions]);

  const handleClick = (action) => {
    onAction?.({
      type: 'send_prompt',
      prompt: action.prompt,
      actionId: action.id
    });
  };

  // Variant styles
  const containerClass = {
    grid: 'grid grid-cols-3 gap-2',
    row: 'flex flex-wrap gap-2',
    compact: 'flex flex-wrap gap-1.5'
  }[variant];

  const buttonClass = {
    grid: 'flex-col py-3 px-2',
    row: 'flex-row py-2 px-3',
    compact: 'flex-row py-1.5 px-2.5'
  }[variant];

  const textSize = {
    grid: 'text-xs',
    row: 'text-xs',
    compact: 'text-[10px]'
  }[variant];

  const emojiSize = {
    grid: 'text-2xl mb-1',
    row: 'text-lg mr-1.5',
    compact: 'text-sm mr-1'
  }[variant];

  return (
    <div className={containerClass}>
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleClick(action)}
          className={`
            ${buttonClass}
            flex items-center justify-center
            bg-white border border-gray-200 rounded-xl
            hover:border-[#7CB342] hover:bg-green-50
            transition-all duration-200
            shadow-sm hover:shadow-md
            cursor-pointer
          `}
        >
          <span className={emojiSize}>{action.emoji}</span>
          <span className={`${textSize} font-medium text-gray-700`}>
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// ========== INLINE ACTIONS ==========

/**
 * Inline action buttons for specific contexts
 */
export function InlineActions({ actions, onAction, size = 'sm' }) {
  const sizeClass = {
    xs: 'text-[10px] py-1 px-2',
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4'
  }[size];

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {actions.map((action, i) => (
        <motion.button
          key={i}
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => onAction?.({ type: 'send_prompt', prompt: action })}
          className={`
            ${sizeClass}
            bg-gray-100 text-gray-700 rounded-full
            hover:bg-[#7CB342] hover:text-white
            transition-colors cursor-pointer
          `}
        >
          {action}
        </motion.button>
      ))}
    </div>
  );
}

// ========== CATEGORY QUICK BUTTONS ==========

export function CategoryQuickButtons({ onSelect }) {
  const categories = [
    { emoji: '🥬', label: 'Rau', value: 'vegetables' },
    { emoji: '🍎', label: 'Trái cây', value: 'fruits' },
    { emoji: '🍚', label: 'Gạo', value: 'rice' },
    { emoji: '🥫', label: 'Chế biến', value: 'processed' },
    { emoji: '📦', label: 'Combo', value: 'combo' }
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {categories.map(cat => (
        <button
          key={cat.value}
          type="button"
          onClick={() => onSelect?.(cat.value)}
          className="flex-shrink-0 flex items-center gap-1 py-2 px-3 
                     bg-white border border-gray-200 rounded-full
                     hover:border-[#7CB342] hover:bg-green-50
                     text-xs font-medium transition-colors cursor-pointer"
        >
          <span>{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}

export default memo(EnhancedQuickActions);
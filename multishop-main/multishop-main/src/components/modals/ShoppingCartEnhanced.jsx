import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import EnhancedModal from '../EnhancedModal';

// Hooks
import {
  useCartState,
  useLotsValidation,
  useCartActions,
  useCartCalculations,
  useCartEventListeners
} from '@/components/hooks/useShoppingCart';

// Components
import CartItemCard from './cart/CartItemCard';
import CartEmptyState from './cart/CartEmptyState';
import CartFooter from './cart/CartFooter';

export default function ShoppingCartEnhanced() {
  const navigate = useNavigate();
  const { cart, setCart, isOpen, setIsOpen, isValidating, setIsValidating } = useCartState();
  const { data: lotsData } = useLotsValidation(cart);
  const { updateQuantity, removeFromCart, addToCart, handleCheckout } = useCartActions(
    cart, setCart, lotsData, setIsValidating, setIsOpen
  );
  const { getTotalItems, getTotalPrice } = useCartCalculations(cart);

  // Event listeners
  useCartEventListeners(setCart, setIsOpen, addToCart);

  const handleContinueShopping = () => {
    setIsOpen(false);
    navigate(createPageUrl('Services'));
  };

  return (
    <>
      {/* Floating Button - Hidden on mobile when BottomNav is present (all pages except Home) */}
      {getTotalItems() > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-6 w-11 h-11 bg-[#7CB342] text-white rounded-full shadow-md hover:bg-[#FF9800] transition-all hover:scale-105 items-center justify-center z-40 hidden lg:flex"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center">
            {getTotalItems()}
          </span>
        </button>
      )}

      {/* Modal */}
      <EnhancedModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Giỏ Hàng (${getTotalItems()} sản phẩm)`}
        maxWidth="md"
        persistPosition={false}
        positionKey="shopping-cart"
        zIndex={90}
        mobileFixed={true}
        enableDrag={false}
      >
        <div className="p-6 space-y-4">
          {cart.length === 0 ? (
            <CartEmptyState onContinueShopping={handleContinueShopping} />
          ) : (
            <>
              {cart.map(item => (
                <CartItemCard
                  key={`${item.id}-${item.shop_id || 'platform'}`}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
              <CartFooter 
                total={getTotalPrice()} 
                isValidating={isValidating} 
                onCheckout={handleCheckout} 
              />
            </>
          )}
        </div>
      </EnhancedModal>
    </>
  );
}